/**
 * Eşleşen ve eşleşmeyen kitap kapaklarının raporunu oluşturur.
 * Çalıştırma: npm run report:book-covers
 * Çıktı: backend/reports/book-covers-report.json ve .md
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../src/books/entities/book.entity';
import * as fs from 'fs';
import * as path from 'path';

async function runReport() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookRepo = app.get<Repository<Book>>(getRepositoryToken(Book));

  const booksDir = path.join(process.cwd(), 'uploads', 'books');
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  // 1. Veritabanında coverImage = /uploads/books/ ile başlayan kitaplar (eşleşen)
  const matchedBooks = await bookRepo
    .createQueryBuilder('book')
    .leftJoinAndSelect('book.translations', 't')
    .leftJoinAndSelect('t.language', 'lang')
    .where("book.coverImage LIKE '/uploads/books/%'")
    .orderBy('book.id', 'ASC')
    .getMany();

  const matchedList = matchedBooks.map((b) => {
    const mainTitle = b.translations?.[0]?.title || b.author || '-';
    const languages = b.translations?.map((t) => t.language?.name || t.language?.code).filter(Boolean) || [];
    return {
      id: b.id,
      title: mainTitle,
      author: b.author,
      coverImage: b.coverImage,
      languages: [...new Set(languages)],
    };
  });

  // 2. uploads/books/ içindeki tüm resim dosyaları
  const allImageFiles = fs.existsSync(booksDir)
    ? fs.readdirSync(booksDir).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f) && fs.statSync(path.join(booksDir, f)).isFile())
    : [];

  // 3. Eşleşen dosya adları (coverImage'dan çıkar)
  const matchedFilenames = new Set(matchedBooks.map((b) => path.basename(b.coverImage || '')).filter(Boolean));

  // 4. Eşleşmeyen dosyalar
  const unmatchedFiles = allImageFiles.filter((f) => !matchedFilenames.has(f));

  const report = {
    generatedAt: new Date().toISOString(),
    tablesUpdated: ['books'],
    columnsUpdated: ['coverImage', 'coverUrl'],
    summary: {
      totalImageFiles: allImageFiles.length,
      matchedCount: matchedList.length,
      unmatchedCount: unmatchedFiles.length,
    },
    matched: matchedList,
    unmatched: unmatchedFiles.sort(),
  };

  const jsonPath = path.join(reportDir, 'book-covers-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  // Markdown rapor
  let md = `# Kitap Kapak Eşleştirme Raporu\n`;
  md += `Oluşturulma: ${report.generatedAt}\n\n`;
  md += `## Güncellenen Tablolar\n`;
  md += `- **books** tablosu: \`coverImage\`, \`coverUrl\` sütunları\n\n`;
  md += `## Özet\n`;
  md += `| Metrik | Sayı |\n|--------|------|\n`;
  md += `| Toplam resim dosyası | ${report.summary.totalImageFiles} |\n`;
  md += `| Eşleşen kitap | ${report.summary.matchedCount} |\n`;
  md += `| Eşleşmeyen dosya | ${report.summary.unmatchedCount} |\n\n`;

  md += `## Eşleşen Kitaplar (${matchedList.length})\n\n`;
  md += `| ID | Başlık | Yazar | Kapak Dosyası |\n`;
  md += `|----|--------|-------|---------------|\n`;
  for (const b of matchedList) {
    md += `| ${b.id} | ${(b.title || '').replace(/\|/g, '\\|').substring(0, 50)} | ${(b.author || '-').replace(/\|/g, '\\|').substring(0, 30)} | ${path.basename(b.coverImage || '')} |\n`;
  }

  md += `\n## Eşleşmeyen Dosyalar (${unmatchedFiles.length})\n\n`;
  for (const f of unmatchedFiles) {
    md += `- ${f}\n`;
  }

  const mdPath = path.join(reportDir, 'book-covers-report.md');
  fs.writeFileSync(mdPath, md, 'utf-8');

  console.log('📊 Rapor oluşturuldu:');
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   MD:   ${mdPath}`);
  console.log(`\n   Eşleşen: ${matchedList.length} kitap`);
  console.log(`   Eşleşmeyen: ${unmatchedFiles.length} dosya`);

  await app.close();
}

runReport().catch((e) => {
  console.error(e);
  process.exit(1);
});
