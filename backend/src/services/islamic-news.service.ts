import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IslamicNews } from '../entities/islamic-news.entity';
import { CreateIslamicNewsDto } from '../dto/islamic-news/create-islamic-news.dto';
import { UpdateIslamicNewsDto } from '../dto/islamic-news/update-islamic-news.dto';
import axios from 'axios';
import { CacheService } from './cache.service'; // Added import for CacheService

@Injectable()
export class IslamicNewsService {
  private readonly logger = new Logger(IslamicNewsService.name);
  private readonly API_KEY = 'pub_943a763dbf314a169878a7ab68dcafd3';
  private readonly BASE_URL = 'https://newsdata.io/api/1';

  constructor(
    @InjectRepository(IslamicNews)
    private islamicNewsRepository: Repository<IslamicNews>,
    private readonly cacheService: CacheService, // Added CacheService injection
  ) {}

  // Yeni haber oluştur
  async create(
    createIslamicNewsDto: CreateIslamicNewsDto,
  ): Promise<IslamicNews> {
    const news = this.islamicNewsRepository.create(createIslamicNewsDto);
    return this.islamicNewsRepository.save(news);
  }

  // Tüm haberleri getir
  async findAll(
    limit: number = 20,
    offset: number = 0,
  ): Promise<[IslamicNews[], number]> {
    return this.islamicNewsRepository.findAndCount({
      order: { pub_date: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  // ID'ye göre haber getir
  async findOne(id: number): Promise<IslamicNews | null> {
    return this.islamicNewsRepository.findOneBy({ id });
  }

  // Haber güncelle
  async update(
    id: number,
    updateIslamicNewsDto: UpdateIslamicNewsDto,
  ): Promise<IslamicNews | null> {
    await this.islamicNewsRepository.update(id, updateIslamicNewsDto);

    // Cache'i temizle
    await this.invalidateNewsCache();

    return this.findOne(id);
  }

  // Haber sil
  async remove(id: number): Promise<void> {
    await this.islamicNewsRepository.delete(id);

    // Cache'i temizle
    await this.invalidateNewsCache();
  }

  // Eski haberleri temizle (24 saatten eski)
  async cleanOldNews(): Promise<number> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await this.islamicNewsRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :yesterday', { yesterday })
        .execute();

      this.logger.log(`${result.affected} eski haber silindi`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Eski haberleri temizlerken hata:', error.message);
      return 0;
    }
  }

  // Dış API'den güncel haberleri getir ve veritabanına kaydet
  async fetchLatestNews(): Promise<any> {
    try {
      this.logger.log('Fetching latest Islamic news from external API...');

      const response = await axios.get(`${this.BASE_URL}/latest`, {
        params: {
          apikey: this.API_KEY,
          q: 'Islam OR Muslim OR Islamic OR Quran OR İslam OR Müslüman',
          language: 'tr',
          category: 'world,politics',
          country: 'tr',
          size: 10,
        },
      });

      const newsData = response.data;

      if (newsData.status === 'success' && newsData.results) {
        // Haberleri veritabanına kaydet
        const savedNews = await this.saveNewsToDatabase(newsData.results);

        this.logger.log(
          `Successfully fetched and saved ${savedNews.length} news articles`,
        );

        return {
          status: 'success',
          message: `Fetched and saved ${savedNews.length} news articles`,
          totalResults: newsData.totalResults,
          savedCount: savedNews.length,
          results: savedNews,
        };
      } else {
        this.logger.error('API response indicates failure:', newsData);
        return {
          status: 'error',
          message: 'Failed to fetch news from external API',
          error: newsData.message || 'Unknown error',
        };
      }
    } catch (error) {
      this.logger.error('Error fetching latest news:', error.message);
      throw new Error(`Failed to fetch latest news: ${error.message}`);
    }
  }

  // Arşiv haberleri getir
  async fetchArchiveNews(fromDate: string, toDate: string): Promise<any> {
    try {
      this.logger.log(`Fetching archive news from ${fromDate} to ${toDate}...`);

      const response = await axios.get(`${this.BASE_URL}/archive`, {
        params: {
          apikey: this.API_KEY,
          q: 'Islam OR Muslim OR İslam OR Müslüman',
          from_date: fromDate,
          to_date: toDate,
          language: 'tr',
        },
      });

      const newsData = response.data;

      if (newsData.status === 'success' && newsData.results) {
        // Arşiv haberlerini veritabanına kaydet
        const savedNews = await this.saveArchiveNewsToDatabase(
          newsData.results,
        );

        this.logger.log(
          `Successfully fetched and saved ${savedNews.length} archive news articles`,
        );

        return {
          status: 'success',
          message: `Fetched and saved ${savedNews.length} archive news articles`,
          totalResults: newsData.totalResults,
          savedCount: savedNews.length,
          results: savedNews,
        };
      } else {
        this.logger.error('API response indicates failure:', newsData);
        return {
          status: 'error',
          message: 'Failed to fetch archive news from external API',
          error: newsData.message || 'Unknown error',
        };
      }
    } catch (error) {
      this.logger.error('Error fetching archive news:', error.message);
      throw new Error(`Failed to fetch archive news: ${error.message}`);
    }
  }

  // Haberleri veritabanına kaydet
  private async saveNewsToDatabase(newsArray: any[]): Promise<IslamicNews[]> {
    const savedNews: IslamicNews[] = [];

    for (const news of newsArray) {
      try {
        // Haber zaten var mı kontrol et (link'e göre)
        const existingNews = await this.islamicNewsRepository.findOne({
          where: { link: news.link },
        });

        if (!existingNews) {
          // Yeni haber oluştur
          const newsDto: CreateIslamicNewsDto = {
            title: news.title,
            description: news.description,
            content: news.content,
            link: news.link,
            image_url: news.image_url,
            source_id: news.source_id,
            source_name: news.source_name,
            source_url: news.source_url,
            language: news.language,
            country: Array.isArray(news.country)
              ? news.country.join(', ')
              : news.country,
            category: Array.isArray(news.category)
              ? news.category.join(', ')
              : news.category,
            keywords: Array.isArray(news.keywords)
              ? news.keywords.join(', ')
              : news.keywords,
            pub_date: news.pubDate ? new Date(news.pubDate) : new Date(),
            video_url: news.video_url,
            is_archived: false,
          };

          const savedNewsItem = await this.create(newsDto);
          savedNews.push(savedNewsItem);
        }
      } catch (error) {
        this.logger.error(`Error saving news item: ${error.message}`, error);
      }
    }

    return savedNews;
  }

  // Arşiv haberleri veritabanına kaydet
  private async saveArchiveNewsToDatabase(
    newsArray: any[],
  ): Promise<IslamicNews[]> {
    const savedNews: IslamicNews[] = [];

    for (const news of newsArray) {
      try {
        // Haber zaten var mı kontrol et (link'e göre)
        const existingNews = await this.islamicNewsRepository.findOne({
          where: { link: news.link },
        });

        if (!existingNews) {
          // Yeni arşiv haber oluştur
          const newsDto: CreateIslamicNewsDto = {
            title: news.title,
            description: news.description,
            content: news.content,
            link: news.link,
            image_url: news.image_url,
            source_id: news.source_id,
            source_name: news.source_name,
            source_url: news.source_url,
            language: news.language,
            country: Array.isArray(news.country)
              ? news.country.join(', ')
              : news.country,
            category: Array.isArray(news.category)
              ? news.category.join(', ')
              : news.category,
            keywords: Array.isArray(news.keywords)
              ? news.keywords.join(', ')
              : news.keywords,
            pub_date: news.pubDate ? new Date(news.pubDate) : new Date(),
            video_url: news.video_url,
            is_archived: true,
            archive_date: new Date(),
          };

          const savedNewsItem = await this.create(newsDto);
          savedNews.push(savedNewsItem);
        }
      } catch (error) {
        this.logger.error(
          `Error saving archive news item: ${error.message}`,
          error,
        );
      }
    }

    return savedNews;
  }

  // Veritabanından haberleri getir (Cache ile)
  async getNewsFromDatabase(
    limit: number = 20,
    offset: number = 0,
    language?: string,
    country?: string,
    category?: string,
    isArchived?: boolean,
  ): Promise<[IslamicNews[], number]> {
    // Cache key oluştur
    const cacheKey = `news:${limit}:${offset}:${language || 'all'}:${country || 'all'}:${category || 'all'}:${isArchived || 'all'}`;

    // Önce cache'den kontrol et
    const cachedResult =
      await this.cacheService.get<[IslamicNews[], number]>(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // Cache'de yoksa veritabanından getir
    this.logger.debug(
      `Cache miss for key: ${cacheKey}, fetching from database`,
    );

    const queryBuilder = this.islamicNewsRepository
      .createQueryBuilder('news')
      .orderBy('news.pub_date', 'DESC')
      .skip(offset)
      .take(limit);

    if (language) {
      queryBuilder.andWhere('news.language = :language', { language });
    }
    if (country) {
      queryBuilder.andWhere('news.country = :country', { country });
    }
    if (category) {
      queryBuilder.andWhere('news.category = :category', { category });
    }
    if (isArchived !== undefined) {
      queryBuilder.andWhere('news.is_archived = :isArchived', { isArchived });
    }

    const [news, totalCount] = await queryBuilder.getManyAndCount();

    // Sonucu cache'e kaydet (5 dakika)
    await this.cacheService.set(cacheKey, [news, totalCount], 300);

    return [news, totalCount];
  }

  // Haber arama
  async searchNews(
    query: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<[IslamicNews[], number]> {
    return this.islamicNewsRepository
      .createQueryBuilder('news')
      .where(
        '(news.title LIKE :query OR news.description LIKE :query OR news.content LIKE :query OR news.keywords LIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('news.pub_date', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }

  // Cache'i temizle (yeni haber eklendiğinde)
  private async invalidateNewsCache(): Promise<void> {
    try {
      await this.cacheService.delPattern('news:*');
      this.logger.debug('News cache invalidated');
    } catch (error) {
      this.logger.error('Cache invalidation error:', error.message);
    }
  }
}
