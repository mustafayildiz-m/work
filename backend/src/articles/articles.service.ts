import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UploadService } from '../upload/upload.service';
import { createSlug, createUniqueSlug } from '../utils/slug.utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(ArticleTranslation)
    private articleTranslationRepository: Repository<ArticleTranslation>,
    private uploadService: UploadService,
  ) {}

  /**
   * Mevcut slug'ları getirir
   */
  private async getExistingSlugs(): Promise<string[]> {
    const translations = await this.articleTranslationRepository
      .createQueryBuilder('translation')
      .select('translation.slug')
      .where('translation.slug IS NOT NULL')
      .getMany();

    return translations.map((t) => t.slug);
  }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { translations, ...articleData } = createArticleDto;

    // Makaleyi oluştur
    const article = this.articleRepository.create(articleData);
    const savedArticle = await this.articleRepository.save(article);

    // Çevirileri kaydet
    if (translations && Array.isArray(translations)) {
      // Mevcut slug'ları al
      const existingSlugs = await this.getExistingSlugs();

      const translationEntities = translations.map((trans) => {
        // Eğer slug yoksa başlıktan oluştur
        let slug = trans.slug;
        if (!slug && trans.title) {
          slug = createUniqueSlug(trans.title, existingSlugs);
        }

        return this.articleTranslationRepository.create({
          ...trans,
          slug,
          article: savedArticle,
          articleId: savedArticle.id,
          languageId: trans.languageId,
        });
      });

      await this.articleTranslationRepository.save(translationEntities);
      savedArticle.translations = translationEntities;
    }

    return this.findOne(savedArticle.id);
  }

  async findAllByBook(
    bookId: number,
    languageId?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    // Subquery ile filtrelenmiş makale ID'lerini bul
    let subQuery = this.articleRepository
      .createQueryBuilder('article')
      .select('DISTINCT article.id', 'article_id')
      .leftJoin('article.translations', 'articleTranslations')
      .leftJoin('articleTranslations.language', 'language')
      .where('article.bookId = :bookId', { bookId });

    // Dil bazlı filtreleme
    if (languageId) {
      subQuery = subQuery.andWhere('language.id = :languageId', {
        languageId: parseInt(languageId),
      });
    }

    // Arama filtreleme - sadece başlıkta ara
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      subQuery = subQuery.andWhere(
        'LOWER(articleTranslations.title) LIKE :search',
        { search: searchTerm },
      );
    }

    // Filtrelenmiş makale ID'lerini al
    const articleIds = await subQuery.getRawMany();
    const ids = articleIds.map(
      (item) => item.article_id || item.id || item.articleId,
    );

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

    // Makaleleri ve tüm translation'larını getir
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'articleTranslations')
      .leftJoinAndSelect('articleTranslations.language', 'language')
      .leftJoinAndSelect('article.book', 'book')
      .leftJoinAndSelect('book.translations', 'bookTranslations')
      .whereInIds(paginatedIds)
      .orderBy('article.orderIndex', 'ASC')
      .addOrderBy('article.id', 'DESC')
      .getMany();

    // Pagination bilgilerini döndür
    return {
      data: articles,
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

  async findAll(
    languageId?: string,
    search?: string,
    bookIds?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    let query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'articleTranslations')
      .leftJoinAndSelect('articleTranslations.language', 'language')
      .leftJoinAndSelect('article.book', 'book')
      .leftJoinAndSelect('book.translations', 'bookTranslations');

    // Dil filtreleme
    if (languageId) {
      query = query.andWhere('language.id = :languageId', {
        languageId: parseInt(languageId),
      });
    }

    // Kitap filtreleme (birden fazla kitap ID'si için)
    if (bookIds && bookIds.trim()) {
      const bookIdArray = bookIds
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (bookIdArray.length > 0) {
        query = query.andWhere('article.bookId IN (:...bookIds)', {
          bookIds: bookIdArray,
        });
      }
    }

    // Arama filtreleme - sadece başlıkta ara
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query = query.andWhere('LOWER(articleTranslations.title) LIKE :search', {
        search: searchTerm,
      });
    }

    // Toplam sayı
    const totalCount = await query.getCount();

    // Pagination
    const skip = (page - 1) * limit;
    const articles = await query
      .orderBy('article.orderIndex', 'ASC')
      .addOrderBy('article.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: articles,
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

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: [
        'translations',
        'translations.language',
        'book',
        'book.translations',
      ],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const existingArticle = await this.articleRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!existingArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    const { translations, ...articleData } = updateArticleDto;

    // Makale temel bilgilerini güncelle
    this.articleRepository.merge(existingArticle, articleData);
    const updatedArticle = await this.articleRepository.save(existingArticle);

    // 🔄 Çevirileri güncelle (mevcut PDF'leri koruyarak)
    if (translations && Array.isArray(translations)) {
      const existingTranslations = existingArticle.translations || [];
      const existingSlugs = await this.getExistingSlugs();
      const updatedTranslations: ArticleTranslation[] = [];

      for (const trans of translations) {
        // ID'yi number'a çevir (FormData string olarak gönderiyor)
        const transId = trans.id
          ? parseInt(trans.id.toString(), 10)
          : undefined;

        console.log(`🔍 Translation ID: ${trans.id} → ${transId}`);
        console.log(
          `📋 Existing IDs: [${existingTranslations.map((t) => t.id).join(', ')}]`,
        );

        if (transId) {
          // Mevcut çeviri - güncelle
          const existing = existingTranslations.find((t) => t.id === transId);
          console.log(
            `${existing ? '✅ FOUND' : '❌ NOT FOUND'} - Translation ${transId}`,
          );
          if (existing) {
            // PDF'i koru: Yeni pdfUrl gelmediyse mevcut pdfUrl'i kullan
            const pdfUrl = trans.pdfUrl || existing.pdfUrl;

            // Slug kontrolü
            let slug = trans.slug;
            if (!slug && trans.title) {
              slug = createUniqueSlug(trans.title, existingSlugs);
            }

            // Field'ları doğrudan güncelle (merge ile ID problemi olmaması için)
            existing.title = trans.title;
            existing.content = trans.content;
            existing.summary = trans.summary || '';
            existing.slug = slug || '';
            existing.pdfUrl = pdfUrl;
            existing.languageId = trans.languageId;
            existing.articleId = id;

            const saved =
              await this.articleTranslationRepository.save(existing);
            updatedTranslations.push(saved);
          }
        } else {
          // Yeni çeviri - ekle
          let slug = trans.slug;
          if (!slug && trans.title) {
            slug = createUniqueSlug(trans.title, existingSlugs);
          }

          const newTrans = this.articleTranslationRepository.create({
            ...trans,
            slug,
            articleId: id,
            article: updatedArticle,
            languageId: trans.languageId,
          });
          const saved = await this.articleTranslationRepository.save(newTrans);
          updatedTranslations.push(saved);
        }
      }

      // Gönderilmeyen çevirileri sil
      const sentIds = translations
        .filter((t) => t.id)
        .map((t) => parseInt(t.id!.toString(), 10)); // String'i number'a çevir (! = null değil)
      const toDelete = existingTranslations.filter(
        (t) => !sentIds.includes(t.id),
      );
      for (const trans of toDelete) {
        // PDF dosyasını sil
        if (trans.pdfUrl) {
          const pdfPath = path.join(process.cwd(), trans.pdfUrl);
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath);
            } catch (e) {
              console.error('PDF dosyası silinemedi:', e.message);
            }
          }
        }
        await this.articleTranslationRepository.delete(trans.id);
      }

      updatedArticle.translations = updatedTranslations;
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Cover image dosyasını sil
    if (article.coverImage) {
      const coverPath = path.join(process.cwd(), article.coverImage);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
        } catch (e) {
          console.error('Cover image silinemedi:', e.message);
        }
      }
    }

    // Translation pdf dosyalarını sil
    if (article.translations && Array.isArray(article.translations)) {
      for (const trans of article.translations) {
        if (trans.pdfUrl) {
          const pdfPath = path.join(process.cwd(), trans.pdfUrl);
          if (fs.existsSync(pdfPath)) {
            try {
              fs.unlinkSync(pdfPath);
            } catch (e) {
              console.error('PDF dosyası silinemedi:', e.message);
            }
          }
        }
      }
    }

    // Veritabanından sil (cascade ile translations da silinir)
    await this.articleRepository.delete(id);
  }

  async reorderArticles(
    bookId: number,
    articleOrders: { id: number; orderIndex: number }[],
  ): Promise<void> {
    for (const order of articleOrders) {
      await this.articleRepository.update(
        { id: order.id, bookId },
        { orderIndex: order.orderIndex },
      );
    }
  }
}
