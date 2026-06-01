/**
 * Kitapçık toplu import — teslim/ klasöründen Excel + PDF
 *
 * Kullanım (backend dizininden):
 *   npm run import:kitapciklar -- --dry-run
 *   npm run import:kitapciklar -- --limit 5
 *   npm run import:kitapciklar -- --ignore-pdf-errors
 *   npm run import:kitapciklar -- --skip 5 --limit 10
 *   npm run import:kitapciklar -- --backfill-covers
 */

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { AppModule } from '../src/app.module';
import { Book } from '../src/books/entities/book.entity';
import { Language } from '../src/languages/entities/language.entity';
import { ArticlesService } from '../src/articles/articles.service';
import { UploadService } from '../src/upload/upload.service';
import { CreateArticleDto } from '../src/articles/dto/create-article.dto';
import { createSlug } from '../src/utils/slug.utils';

// Excel'deki kısa ad → sistemdeki tam kitap adı
const BOOK_ALIASES: Record<string, string> = {
  'GESTÄNDNISSE EINES BRITISCHEN SPIONS':
    'GESTÄNDNISSE EINES BRITISCHEN SPIONS und die Islamfeindlichkeit der Briten',
};

interface ExcelRow {
  kitapAdi: string;
  dilKodu: string;
  baslik: string;
  icerik: string;
  ozet: string;
  yazar: string;
  yayinTarihi: string;
  siraNo: string;
  pdfDosyaAdi: string;
  kapakDosyaAdi: string;
}

interface ImportResult {
  index: number;
  baslik: string;
  kitapAdi: string;
  status: 'ok' | 'skipped' | 'error';
  articleId?: number;
  message?: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const ignorePdfErrors = args.includes('--ignore-pdf-errors');
  const backfillCovers = args.includes('--backfill-covers');
  const limitIdx = args.indexOf('--limit');
  const skipIdx = args.indexOf('--skip');
  const limit =
    limitIdx >= 0 && args[limitIdx + 1]
      ? parseInt(args[limitIdx + 1], 10)
      : Infinity;
  const skip =
    skipIdx >= 0 && args[skipIdx + 1] ? parseInt(args[skipIdx + 1], 10) : 0;
  return { isDryRun, ignorePdfErrors, backfillCovers, limit, skip };
}

function getTeslimDir(): string {
  return process.env.TESLIM_DIR
    ? path.resolve(process.env.TESLIM_DIR)
    : path.resolve(__dirname, '../../teslim');
}

function parseOrderIndex(title: string, explicitSira?: string): number {
  if (explicitSira && explicitSira.trim()) {
    const n = parseInt(explicitSira.trim(), 10);
    if (!Number.isNaN(n)) return n;
  }
  const m = title.match(/^(\d+)(?:\.(\d+))?/);
  if (!m) return 0;
  const major = parseInt(m[1], 10);
  const minor = m[2] ? parseInt(m[2], 10) : 0;
  return major * 100 + minor;
}

function readExcelRows(teslimDir: string): ExcelRow[] {
  const jsonPath = path.join(teslimDir, 'kitapciklar.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as ExcelRow[];
  }

  const excelPath = path.join(teslimDir, 'kitapciklar.xlsx');
  const pythonScript = `
import json, sys
from openpyxl import load_workbook

wb = load_workbook(sys.argv[1], data_only=True)
ws = wb['Kitapçık Verileri'] if 'Kitapçık Verileri' in wb.sheetnames else wb.active
rows = list(ws.iter_rows(values_only=True))
header = [str(h).strip() if h else '' for h in rows[0]]

def col(name):
    for i, h in enumerate(header):
        if name in h:
            return i
    return None

cols = {
    'kitap': col('Kitap'),
    'dil': col('Dil'),
    'baslik': col('Başlık') if col('Başlık') is not None else col('Kitapçık'),
    'icerik': col('İçerik'),
    'ozet': col('Özet'),
    'yazar': col('Yazar'),
    'tarih': col('Yayın'),
    'sira': col('Sıra'),
    'pdf': col('PDF'),
    'kapak': col('Kapak'),
}

out = []
for r in rows[1:]:
    if not any(c is not None and str(c).strip() for c in r):
        continue
    def g(key):
        idx = cols.get(key)
        if idx is None: return ''
        v = r[idx]
        return str(v).strip() if v is not None else ''
    kitap = g('kitap')
    dil = g('dil')
    if kitap.startswith('Bu kitapçık') or dil.startswith('Dil kodu'):
        continue
    out.append({
        'kitapAdi': kitap,
        'dilKodu': dil.lower(),
        'baslik': g('baslik'),
        'icerik': g('icerik'),
        'ozet': g('ozet'),
        'yazar': g('yazar'),
        'yayinTarihi': g('tarih'),
        'siraNo': g('sira'),
        'pdfDosyaAdi': g('pdf'),
        'kapakDosyaAdi': g('kapak'),
    })
wb.close()
print(json.dumps(out, ensure_ascii=False))
`;

  const tmpPy = path.join(__dirname, '.parse-excel-tmp.py');
  fs.writeFileSync(tmpPy, pythonScript);
  try {
    execSync('python3 -c "import openpyxl"', { stdio: 'pipe' });
  } catch {
    throw new Error(
      'openpyxl gerekli: pip install openpyxl (veya python3 -m venv + pip install openpyxl)',
    );
  }
  const json = execSync(`python3 "${tmpPy}" "${excelPath}"`, {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  fs.unlinkSync(tmpPy);
  return JSON.parse(json) as ExcelRow[];
}

function buildBookTitleMap(books: Book[]): Map<string, Book> {
  const map = new Map<string, Book>();
  for (const book of books) {
    for (const tr of book.translations || []) {
      const title = tr.title?.trim();
      if (title) {
        map.set(title, book);
        map.set(title.toUpperCase(), book);
      }
    }
  }
  return map;
}

function resolveBook(
  kitapAdi: string,
  bookMap: Map<string, Book>,
): Book | undefined {
  const aliased = BOOK_ALIASES[kitapAdi] || kitapAdi;
  return (
    bookMap.get(aliased) ||
    bookMap.get(aliased.toUpperCase()) ||
    bookMap.get(kitapAdi) ||
    bookMap.get(kitapAdi.toUpperCase())
  );
}

function getBookCoverImage(book: Book): string | undefined {
  const cover = book.coverImage || book.coverUrl;
  if (!cover || cover === 'null' || cover === 'undefined') return undefined;
  return cover;
}

function toImageMulterFile(filePath: string): Express.Multer.File {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimetype =
    ext === '.png'
      ? 'image/png'
      : ext === '.webp'
        ? 'image/webp'
        : ext === '.gif'
          ? 'image/gif'
          : 'image/jpeg';

  return {
    fieldname: 'coverImage',
    originalname: path.basename(filePath),
    encoding: '7bit',
    mimetype,
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: path.basename(filePath),
    path: filePath,
  };
}

async function resolveCoverImage(
  row: ExcelRow,
  book: Book,
  teslimDir: string,
  uploadService: UploadService,
): Promise<string | undefined> {
  const kapak = row.kapakDosyaAdi?.trim();
  if (kapak) {
    const candidates = [
      path.join(teslimDir, 'kapaklar', kapak),
      path.join(teslimDir, 'kapak', kapak),
      path.join(teslimDir, kapak),
    ];
    const coverPath = candidates.find((p) => fs.existsSync(p));
    if (coverPath) {
      return uploadService.uploadFile(toImageMulterFile(coverPath));
    }
  }

  return getBookCoverImage(book);
}

function toMulterFile(filePath: string, fieldname: string): Express.Multer.File {
  const buffer = fs.readFileSync(filePath);
  return {
    fieldname,
    originalname: path.basename(filePath),
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: path.basename(filePath),
    path: filePath,
  };
}

async function bootstrap() {
  const { isDryRun, ignorePdfErrors, backfillCovers, limit, skip } = parseArgs();
  const teslimDir = getTeslimDir();
  const excelPath = path.join(teslimDir, 'kitapciklar.xlsx');
  const pdfDir = path.join(teslimDir, 'pdfler');
  const logPath = path.join(teslimDir, 'import-log.json');

  console.log('═'.repeat(70));
  console.log('📚 Kitapçık Toplu Import');
  console.log('═'.repeat(70));
  console.log(`   Teslim:  ${teslimDir}`);
  console.log(`   Mod:     ${isDryRun ? 'DRY-RUN (yazılmaz)' : 'IMPORT'}`);
  console.log(`   Skip:    ${skip}`);
  console.log(`   Limit:   ${limit === Infinity ? 'tümü' : limit}`);
  console.log(`   PDF hata:${ignorePdfErrors ? ' yoksay' : ' durdur/onay'}`);
  console.log('');

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel bulunamadı: ${excelPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(pdfDir)) {
    console.error(`❌ pdfler/ bulunamadı: ${pdfDir}`);
    process.exit(1);
  }

  const allRows = readExcelRows(teslimDir);
  let rows = allRows.slice(skip);
  if (limit !== Infinity) {
    rows = rows.slice(0, limit);
  }
  console.log(`📋 Excel: ${allRows.length} satır → işlenecek: ${rows.length}\n`);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const bookRepo = app.get<Repository<Book>>(getRepositoryToken(Book));
  const langRepo = app.get<Repository<Language>>(getRepositoryToken(Language));
  const articlesService = app.get(ArticlesService);
  const uploadService = app.get(UploadService);

  if (backfillCovers) {
    console.log('🖼️  Kapaksız kitapçıklara kitap kapağı yazılıyor...\n');
    const result = await articlesService.backfillCoverImagesFromBooks();
    console.log(`✅ Güncellenen: ${result.updated}`);
    console.log(`⏭️  Atlanan: ${result.skipped}`);
    await app.close();
    process.exit(0);
  }

  const books = await bookRepo.find({ relations: ['translations'] });
  const bookMap = buildBookTitleMap(books);
  const languages = await langRepo.find();
  const langByCode = new Map(languages.map((l) => [l.code.toLowerCase(), l]));

  const results: ImportResult[] = [];
  let ok = 0;
  let err = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const globalIndex = skip + i + 1;
    const prefix = `[${globalIndex}/${allRows.length}]`;

    const book = resolveBook(row.kitapAdi, bookMap);
    const lang = langByCode.get(row.dilKodu.toLowerCase());
    const pdfName =
      row.pdfDosyaAdi || `${row.baslik}.pdf`;
    const pdfPath = path.join(pdfDir, pdfName);

    if (!book) {
      console.log(`${prefix} ❌ Kitap bulunamadı: "${row.kitapAdi}"`);
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'error',
        message: 'Kitap bulunamadı',
      });
      err++;
      continue;
    }
    if (!lang) {
      console.log(`${prefix} ❌ Dil bulunamadı: "${row.dilKodu}"`);
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'error',
        message: `Dil bulunamadı: ${row.dilKodu}`,
      });
      err++;
      continue;
    }
    if (!fs.existsSync(pdfPath)) {
      console.log(`${prefix} ❌ PDF yok: ${pdfName}`);
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'error',
        message: `PDF bulunamadı: ${pdfName}`,
      });
      err++;
      continue;
    }

    const orderIndex = parseOrderIndex(row.baslik, row.siraNo);
    const bookCover = getBookCoverImage(book);

    if (isDryRun) {
      const coverNote = row.kapakDosyaAdi?.trim()
        ? `kapak=${row.kapakDosyaAdi}`
        : bookCover
          ? 'kapak=kitap'
          : 'kapak=yok';
      console.log(
        `${prefix} ✓ ${row.baslik.slice(0, 50)} | kitap=${book.id} | dil=${lang.code} | pdf OK | sıra=${orderIndex} | ${coverNote}`,
      );
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'skipped',
        message: 'dry-run',
      });
      ok++;
      continue;
    }

    try {
      let pdfUrl: string | undefined;
      const pdfFile = toMulterFile(pdfPath, 'pdfFile');
      pdfUrl = await uploadService.uploadPdf(pdfFile);

      const pdfAbsPath = path.join(process.cwd(), pdfUrl);
      try {
        await articlesService.validatePdf(pdfAbsPath);
      } catch {
        if (ignorePdfErrors) {
          console.warn(`${prefix} ⚠️  PDF kalite uyarısı yoksayıldı: ${pdfName}`);
        } else {
          try {
            if (fs.existsSync(pdfAbsPath)) fs.unlinkSync(pdfAbsPath);
          } catch {
            /* ignore */
          }
          throw new Error(`PDF kalite kontrolü başarısız: ${pdfName} (--ignore-pdf-errors ile atla)`);
        }
      }

      const coverImage = await resolveCoverImage(row, book, teslimDir, uploadService);

      const dto: CreateArticleDto = {
        bookId: book.id,
        author: row.yazar || undefined,
        publishDate: row.yayinTarihi ? new Date(row.yayinTarihi) : undefined,
        orderIndex,
        coverImage,
        translations: [
          {
            languageId: lang.id,
            title: row.baslik,
            content: row.icerik || row.baslik,
            summary: row.ozet || undefined,
            slug: createSlug(row.baslik),
            pdfUrl,
          },
        ],
      };

      const article = await articlesService.create(dto);
      const coverInfo = coverImage
        ? row.kapakDosyaAdi?.trim()
          ? 'kapak'
          : 'kitap kapağı'
        : 'kapaksız';
      console.log(
        `${prefix} ✅ id=${article.id} | ${row.baslik.slice(0, 55)} | ${coverInfo}`,
      );
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'ok',
        articleId: article.id,
      });
      ok++;
    } catch (e: any) {
      console.log(`${prefix} ❌ ${row.baslik.slice(0, 40)} → ${e.message}`);
      results.push({
        index: globalIndex,
        baslik: row.baslik,
        kitapAdi: row.kitapAdi,
        status: 'error',
        message: e.message,
      });
      err++;
    }
  }

  fs.writeFileSync(logPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n' + '═'.repeat(70));
  console.log(`📊 Sonuç: ${ok} başarılı / ${err} hata`);
  console.log(`📝 Log: ${logPath}`);
  console.log('═'.repeat(70));

  await app.close();
  process.exit(err > 0 ? 1 : 0);
}

bootstrap().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
