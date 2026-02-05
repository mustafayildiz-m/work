import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BookTranslation } from './entities/book-translation.entity';
import { BookCategory } from './entities/book-category.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(BookTranslation)
    private bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(BookCategory)
    private bookCategoryRepository: Repository<BookCategory>,
    private uploadService: UploadService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { translations, category, ...bookData } = createBookDto;
    const book = this.bookRepository.create(bookData);
    const savedBook = await this.bookRepository.save(book);

    // Kategorileri kaydet
    if (category && Array.isArray(category)) {
      const bookCategories = category.map((catName: string) =>
        this.bookCategoryRepository.create({
          bookId: savedBook.id,
          categoryName: catName,
        }),
      );
      await this.bookCategoryRepository.save(bookCategories);
    }

    if (translations && Array.isArray(translations)) {
      const translationEntities = translations.map((trans) =>
        this.bookTranslationRepository.create({
          ...trans,
          book: savedBook,
          bookId: savedBook.id,
          languageId: trans.languageId,
        }),
      );
      await this.bookTranslationRepository.save(translationEntities);
      savedBook.translations = translationEntities;
    }
    return this.findOne(savedBook.id);
  }

  async findAll(
    languageId?: string,
    search?: string,
    category?: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<any> {
    // Subquery ile önce filtrelenmiş kitap ID'lerini bul
    let subQuery = this.bookRepository
      .createQueryBuilder('book')
      .select('DISTINCT book.id', 'book_id')
      .leftJoin('book.translations', 'bookTranslations')
      .leftJoin('bookTranslations.language', 'language');

    // Dil bazlı filtreleme
    if (languageId) {
      subQuery = subQuery.andWhere('language.id = :languageId', {
        languageId: parseInt(languageId),
      });
    }

    // Arama filtreleme - seçili dildeki translation'larda arama yap
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      subQuery = subQuery.andWhere(
        '(LOWER(bookTranslations.title) LIKE :search OR LOWER(book.author) LIKE :search OR LOWER(bookTranslations.description) LIKE :search OR LOWER(bookTranslations.summary) LIKE :search)',
        { search: searchTerm },
      );
    }

    // Kategori filtreleme
    if (category && category.trim()) {
      subQuery = subQuery
        .leftJoin(
          'book_categories',
          'bookCategories',
          'bookCategories.bookId = book.id',
        )
        .andWhere('bookCategories.categoryName = :category', {
          category: category.trim(),
        });
    }

    // Sıralama ekle - en yeni kitaplar önce gelsin
    subQuery = subQuery.orderBy('book.id', 'DESC');

    // Filtrelenmiş kitap ID'lerini al - alternatif yöntem
    const bookIds = await subQuery.getRawMany();

    // Eğer book_id undefined ise, farklı field isimlerini dene
    let ids = bookIds.map((item) => item.book_id || item.id || item.bookId);

    // Eğer hala undefined ise, direkt ID'leri al
    if (ids.some((id) => id === undefined)) {
      if (languageId) {
        const directQuery = await this.bookRepository
          .createQueryBuilder('book')
          .select('book.id')
          .leftJoin('book.translations', 'bookTranslations')
          .leftJoin('bookTranslations.language', 'language')
          .where('language.id = :languageId', {
            languageId: parseInt(languageId),
          })
          .orderBy('book.id', 'DESC')
          .getMany();

        ids = directQuery.map((book) => book.id);
      }
    }

    // IDs'leri azalan sırada sırala (en yeni en başta)
    ids = ids.sort((a, b) => b - a);

    if (ids.length === 0) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          limit: limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Toplam kayıt sayısı
    const totalCount = ids.length;

    // Pagination uygula
    const skip = (page - 1) * limit;
    const paginatedIds = ids.slice(skip, skip + limit);

    // Kitapları ve tüm translation'larını getir
    const books = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.translations', 'bookTranslations')
      .leftJoinAndSelect('bookTranslations.language', 'language')
      .whereInIds(paginatedIds)
      .orderBy('book.id', 'DESC')
      .getMany();

    // Kategorileri ekle
    await Promise.all(
      books.map(async (book) => {
        const bookCategories = await this.bookCategoryRepository.find({
          where: { bookId: book.id },
        });
        (book as any).categories = bookCategories.map((bc) => bc.categoryName);
      }),
    );

    // Pagination bilgilerini döndür
    return {
      data: books,
      pagination: {
        currentPage: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getCategories(languageId?: string): Promise<string[]> {
    if (languageId) {
      // Dil bazlı kategorileri getir
      const query = `
        SELECT DISTINCT bc.categoryName 
        FROM book_categories bc
        INNER JOIN books b ON b.id = bc.bookId
        INNER JOIN book_translations bt ON bt.bookId = b.id
        INNER JOIN languages l ON l.id = bt.languageId
        WHERE l.id = ?
      `;

      const results = await this.bookCategoryRepository.query(query, [
        parseInt(languageId),
      ]);
      return results.map((r) => r.categoryName).filter(Boolean);
    } else {
      // Tüm kategorileri getir
      const results = await this.bookCategoryRepository
        .createQueryBuilder('bookCategory')
        .select('DISTINCT bookCategory.categoryName', 'categoryName')
        .getRawMany();

      return results.map((r) => r.categoryName).filter(Boolean);
    }
  }

  async findOne(id: number): Promise<any> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!book) return null;

    const bookCategories = await this.bookCategoryRepository.find({
      where: { bookId: book.id },
    });
    (book as any).categories = bookCategories.map((bc) => bc.categoryName);
    return book;
  }

  async findOnePublic(id: number, lang?: string): Promise<any> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
      select: ['id', 'author', 'coverUrl', 'coverImage', 'createdAt'],
    });

    if (!book) {
      return null;
    }

    // Find the best translation based on language preference
    let selectedTranslation: any = null;

    if (lang && book.translations) {
      // Map language codes to language IDs (you might need to adjust these)
      const langMap = {
        tr: 1, // Turkish
        en: 2, // English
        ar: 3, // Arabic
        de: 4, // German
        fr: 5, // French
        ja: 6, // Japanese
      };

      const targetLangId = langMap[lang];

      // Try to find translation in requested language
      selectedTranslation = book.translations.find(
        (t) => t.languageId === targetLangId,
      );
    }

    // Fallback to first translation if no specific language found
    if (!selectedTranslation && book.translations?.length > 0) {
      selectedTranslation = book.translations[0];
    }

    return {
      id: book.id,
      title: selectedTranslation?.title || 'Untitled',
      author: book.author,
      description: selectedTranslation?.description || '',
      coverUrl: book.coverUrl || book.coverImage,
      pdfUrl: selectedTranslation?.pdfUrl,
      createdAt: book.createdAt,
    };
  }

  async update(id: number, updateBookDto: CreateBookDto): Promise<Book | null> {
    const existingBook = await this.bookRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!existingBook) return null;

    const { translations, category, ...bookData } = updateBookDto;

    // 📘 Kitap temel bilgilerini güncelle
    this.bookRepository.merge(existingBook, bookData);
    const updatedBook = await this.bookRepository.save(existingBook);

    // 🧹 Eski kategorileri sil ve yenilerini kaydet
    if (category && Array.isArray(category)) {
      await this.bookCategoryRepository.delete({ bookId: id });
      const newCategories = category.map((catName: string) =>
        this.bookCategoryRepository.create({
          bookId: id,
          categoryName: catName,
        }),
      );
      await this.bookCategoryRepository.save(newCategories);
    }

    // 🔄 Çevirileri güncelle (mevcut PDF'leri koruyarak)
    if (translations && Array.isArray(translations)) {
      const existingTranslations = existingBook.translations || [];
      const updatedTranslations: BookTranslation[] = [];

      for (const trans of translations) {
        if (trans.id) {
          // Mevcut çeviri - güncelle
          const existing = existingTranslations.find((t) => t.id === trans.id);
          if (existing) {
            // PDF'i koru: Yeni pdfUrl gelmediyse mevcut pdfUrl'i kullan
            const pdfUrl = trans.pdfUrl || existing.pdfUrl;

            this.bookTranslationRepository.merge(existing, {
              ...trans,
              pdfUrl,
              bookId: id,
              languageId: trans.languageId,
            });
            const saved = await this.bookTranslationRepository.save(existing);
            updatedTranslations.push(saved);
          }
        } else {
          // Yeni çeviri - ekle
          const newTrans = this.bookTranslationRepository.create({
            ...trans,
            bookId: id,
            book: updatedBook,
            languageId: trans.languageId,
          });
          const saved = await this.bookTranslationRepository.save(newTrans);
          updatedTranslations.push(saved);
        }
      }

      // Gönderilmeyen çevirileri sil
      const sentIds = translations.filter((t) => t.id).map((t) => t.id);
      const toDelete = existingTranslations.filter(
        (t) => !sentIds.includes(t.id),
      );
      for (const trans of toDelete) {
        await this.bookTranslationRepository.delete(trans.id);
      }

      updatedBook.translations = updatedTranslations;
    }

    return this.findOne(id); // ilişkili verilerle birlikte döner
  }

  async remove(id: number): Promise<void> {
    // Kitabı ve ilişkili translation'ları bul
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!book) return;

    // Cover image dosyasını sil
    if (book.coverImage) {
      const coverPath = path.join(process.cwd(), book.coverImage);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
        } catch (e) {
          /* ignore */
        }
      }
    }

    // Translation pdf dosyalarını sil
    if (book.translations && Array.isArray(book.translations)) {
      for (const trans of book.translations) {
        if (trans.pdfUrl) {
          const pdfPath = path.join(process.cwd(), trans.pdfUrl);
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath);
            } catch (e) {
              /* ignore */
            }
          }
        }
      }
    }

    // Kategorileri ve translation'ları veritabanından sil (ilişkisel olarak siliniyor olabilir ama garanti olsun)
    await this.bookCategoryRepository.delete({ bookId: id });
    await this.bookTranslationRepository.delete({ bookId: id });
    await this.bookRepository.delete(id);
  }

  /**
   * Belirli bir dilde makalesi olan kitapları döndürür
   */
  async getBooksWithArticles(languageId?: string): Promise<any[]> {
    const query = `
      SELECT DISTINCT 
        b.id,
        bt.title,
        COUNT(DISTINCT a.id) as articleCount
      FROM books b
      INNER JOIN articles a ON a.bookId = b.id
      INNER JOIN article_translations at ON at.articleId = a.id
      INNER JOIN book_translations bt ON bt.bookId = b.id
      WHERE bt.languageId = at.languageId
      ${languageId ? 'AND bt.languageId = ?' : ''}
      GROUP BY b.id, bt.title
      HAVING COUNT(DISTINCT a.id) > 0
      ORDER BY bt.title ASC
    `;

    const params = languageId ? [parseInt(languageId)] : [];
    const results = await this.bookRepository.query(query, params);

    return results.map((result) => ({
      id: result.id,
      title: result.title,
      articleCount: parseInt(result.articleCount) || 0,
    }));
  }
}
