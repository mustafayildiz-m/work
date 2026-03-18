import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as stringSimilarity from 'string-similarity';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';

/** Eşleşme için minimum skor (0-1) */
const MIN_SIMILARITY_SCORE = 0.82;

/** String normalizasyonu: Unicode NFC, trim, çoklu boşlukları tek yap */
function normalizeForCompare(s: string): string {
  if (!s || typeof s !== 'string') return '';
  return s
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[''""]/g, "'")
    .replace(/[–—]/g, '-');
}

/** HTML entity decode (örn: &amp; -> &) */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** İki string arasında en iyi skoru hesapla (birden fazla strateji) */
function computeMatchScore(filename: string, dbTitle: string): number {
  if (!dbTitle || !filename) return 0;

  const f = normalizeForCompare(decodeHtmlEntities(filename));
  const d = normalizeForCompare(decodeHtmlEntities(dbTitle));

  if (f === d) return 1;
  if (f.toLowerCase() === d.toLowerCase()) return 0.99;

  // Kısa stringlerde tam eşleşme önemli
  const similarity = stringSimilarity.compareTwoStrings(f, d);

  // "contains" bonus: dosya adı başlığı içeriyorsa veya tam tersi
  if (f.length > 3 && d.length > 3) {
    const fLower = f.toLowerCase();
    const dLower = d.toLowerCase();
    if (fLower.includes(dLower) || dLower.includes(fLower)) {
      const containScore = Math.min(f.length, d.length) / Math.max(f.length, d.length);
      return Math.max(similarity, containScore * 0.95);
    }
  }

  return similarity;
}

@Injectable()
export class BookCoversSeeder {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookTranslation)
    private readonly bookTranslationRepository: Repository<BookTranslation>,
  ) {}

  /**
   * uploads/books/ içindeki resimleri kitap adına göre eşleştirir.
   * Exact, case-insensitive, normalize ve fuzzy (skor) ile eşleştirme yapar.
   */
  async seed(): Promise<{ matched: number; unmatched: string[]; total: number }> {
    const booksDir = path.join(process.cwd(), 'uploads', 'books');

    if (!fs.existsSync(booksDir)) {
      console.log('⚠️ uploads/books klasörü bulunamadı. Oluşturuluyor...');
      fs.mkdirSync(booksDir, { recursive: true });
      return { matched: 0, unmatched: [], total: 0 };
    }

    const imageFiles = fs
      .readdirSync(booksDir)
      .filter(
        (f) =>
          /\.(jpe?g|png|webp|gif)$/i.test(f) &&
          fs.statSync(path.join(booksDir, f)).isFile(),
      );

    if (imageFiles.length === 0) {
      console.log('⚠️ uploads/books klasöründe resim bulunamadı.');
      return { matched: 0, unmatched: [], total: 0 };
    }

    // Tüm kitap çevirilerini çek (bookId ile birlikte)
    const allTranslations = await this.bookTranslationRepository.find({
      where: {},
      relations: ['book'],
      select: ['id', 'title', 'bookId'],
    });

    // bookId -> { book, titles[] } - her kitabın tüm dillerdeki title'ları
    const bookData = new Map<number, { book: Book; titles: string[] }>();
    for (const t of allTranslations) {
      if (t.title && t.book) {
        let data = bookData.get(t.bookId);
        if (!data) {
          data = { book: t.book, titles: [] };
          bookData.set(t.bookId, data);
        }
        if (!data.titles.includes(t.title)) data.titles.push(t.title);
      }
    }

    const thumbDir = path.join(booksDir, 'thumbnails');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    // Her resim için en iyi eşleşmeyi bul
    type Match = { filename: string; bookId: number; book: Book; score: number; bestTitle: string };
    const matches: Match[] = [];

    for (const filename of imageFiles) {
      const nameNoExt = path.basename(filename, path.extname(filename)).trim();
      let best: { bookId: number; book: Book; score: number; bestTitle: string } | null = null;

      for (const [bookId, { book, titles }] of bookData) {
        for (const title of titles) {
          const score = computeMatchScore(nameNoExt, title);
          if (score >= MIN_SIMILARITY_SCORE && (!best || score > best.score)) {
            best = { bookId, book, score, bestTitle: title };
          }
        }
      }

      if (best) {
        matches.push({
          filename,
          bookId: best.bookId,
          book: best.book,
          score: best.score,
          bestTitle: best.bestTitle,
        });
      }
    }

    // Skora göre sırala - yüksek skor önce (çakışmada kazanan olsun)
    matches.sort((a, b) => b.score - a.score);

    const assignedBooks = new Set<number>();
    const successFilenames = new Set<string>();
    let matched = 0;

    for (const m of matches) {
      if (assignedBooks.has(m.bookId)) continue;
      assignedBooks.add(m.bookId);
      successFilenames.add(m.filename);

      const fullPath = path.join(booksDir, m.filename);
      const coverPath = `/uploads/books/${m.filename}`;
      const nameNoExt = path.basename(m.filename, path.extname(m.filename));
      const thumbPath = path.join(thumbDir, `${nameNoExt}.jpg`);

      try {
        await sharp(fullPath)
          .resize(200, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(thumbPath);
      } catch {
        console.log(`   ⚠ Thumbnail oluşturulamadı: ${m.filename}`);
      }

      await this.bookRepository.update(m.bookId, {
        coverImage: coverPath,
        coverUrl: coverPath,
      });
      matched++;
      const scorePct = (m.score * 100).toFixed(0);
      console.log(`   ✓ "${nameNoExt}" -> Kitap #${m.bookId} (${m.bestTitle}) [skor: ${scorePct}%]`);
    }

    const unmatched = imageFiles.filter((f) => !successFilenames.has(f));
    return { matched, unmatched, total: imageFiles.length };
  }
}
