import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Scholar } from './scholars/entities/scholar.entity';
import { Book } from './books/entities/book.entity';
import { ScholarPost } from './scholars/entities/scholar-post.entity';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Language } from './languages/entities/language.entity';
import { User } from './users/entities/user.entity';
import { Article } from './articles/entities/article.entity';
import { ScholarStory } from './entities/scholar-story.entity';
import { Podcast } from './entities/podcast.entity';
import { IslamicNews } from './entities/islamic-news.entity';
import { Country } from './countries/entities/country.entity';
import { UserPost, PostStatus } from './entities/user-post.entity';
import { BookTranslation } from './books/entities/book-translation.entity';
import { ArticleTranslation } from './articles/entities/article-translation.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(ScholarPost)
    private readonly scholarPostRepository: Repository<ScholarPost>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ScholarStory)
    private readonly scholarStoryRepository: Repository<ScholarStory>,
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
    @InjectRepository(IslamicNews)
    private readonly islamicNewsRepository: Repository<IslamicNews>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(UserPost)
    private readonly userPostRepository: Repository<UserPost>,
    @InjectRepository(BookTranslation)
    private readonly bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(ArticleTranslation)
    private readonly articleTranslationRepository: Repository<ArticleTranslation>,
  ) {}

  @Get('statistics/counts')
  @UseGuards(JwtAuthGuard)
  async getCounts() {
    const scholars = await this.scholarRepository.count();
    const books = await this.bookRepository.count();
    const articles = await this.articleRepository.count();
    const posts = await this.scholarPostRepository.count();
    const languages = await this.languageRepository.count();
    const countries = await this.countryRepository.count();
    return { scholars, books, articles, posts, languages, countries };
  }

  @Get('statistics/monthly')
  @UseGuards(JwtAuthGuard)
  async getMonthlyStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];

    const monthlyData: Array<{
      name: string;
      alimler: number;
      kitaplar: number;
      kitapciklar: number;
      gonderiler: number;
      ulkeler: number;
      diller: number;
      kullanicilar: number;
    }> = [];

    // Son 6 ay — her ay sonu itibarıyla kümülatif toplam kayıt sayısı
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month < 0 ? 12 + month : month;

      const isCurrentMonth =
        year === now.getFullYear() && adjustedMonth === now.getMonth();
      const endDate = isCurrentMonth
        ? now
        : new Date(year, adjustedMonth + 1, 0, 23, 59, 59, 999);

      const [
        scholarsCount,
        booksCount,
        articlesCount,
        postsCount,
        countriesCount,
        languagesCount,
        usersCount,
      ] = await Promise.all([
        this.countUntil(this.scholarRepository, endDate),
        this.countUntilWithPublishDate(this.bookRepository, 'book', endDate),
        this.countUntilWithPublishDate(this.articleRepository, 'article', endDate),
        this.countUntil(this.scholarPostRepository, endDate),
        this.countUntil(this.countryRepository, endDate),
        this.countUntil(this.languageRepository, endDate),
        this.countUntil(this.userRepository, endDate),
      ]);

      monthlyData.push({
        name: monthNames[adjustedMonth],
        alimler: scholarsCount,
        kitaplar: booksCount,
        kitapciklar: articlesCount,
        gonderiler: postsCount,
        ulkeler: countriesCount,
        diller: languagesCount,
        kullanicilar: usersCount,
      });
    }

    return monthlyData;
  }

  /** Kayıt tarihine göre belirli bir ana kadar toplam sayı */
  private countUntil<T extends { createdAt: Date }>(
    repository: Repository<T>,
    endDate: Date,
  ): Promise<number> {
    return repository.count({
      where: {
        createdAt: LessThanOrEqual(endDate),
      } as never,
    });
  }

  /** Yayın tarihi varsa onu, yoksa oluşturulma tarihini baz al */
  private countUntilWithPublishDate(
    repository: Repository<Book | Article>,
    alias: string,
    endDate: Date,
  ): Promise<number> {
    return repository
      .createQueryBuilder(alias)
      .where(
        `COALESCE(${alias}.publishDate, ${alias}.createdAt) <= :endDate`,
        { endDate },
      )
      .getCount();
  }

  @Get('statistics/pending-tasks')
  @UseGuards(JwtAuthGuard)
  async getPendingTasks() {
    const [
      pendingPosts,
      articlesWithoutPdf,
      articlesWithoutCover,
      booksWithoutPdf,
      scholarsWithoutPhoto,
    ] = await Promise.all([
      this.userPostRepository.count({
        where: { status: PostStatus.PENDING },
      }),
      this.countArticlesWithoutPdf(),
      this.articleRepository
        .createQueryBuilder('article')
        .where('article.coverImage IS NULL OR article.coverImage = :empty', {
          empty: '',
        })
        .getCount(),
      this.countBooksWithoutPdf(),
      this.scholarRepository
        .createQueryBuilder('scholar')
        .where('scholar.photoUrl IS NULL OR scholar.photoUrl = :empty', {
          empty: '',
        })
        .getCount(),
    ]);

    const tasks = [
      {
        id: 'pending_posts',
        count: pendingPosts,
        path: '/kullanicilar/post-onaylama',
        priority: 'high',
      },
      {
        id: 'articles_no_pdf',
        count: articlesWithoutPdf,
        path: '/makaleler/liste',
        priority: 'medium',
      },
      {
        id: 'articles_no_cover',
        count: articlesWithoutCover,
        path: '/makaleler/liste',
        priority: 'medium',
      },
      {
        id: 'books_no_pdf',
        count: booksWithoutPdf,
        path: '/kitaplar/liste',
        priority: 'medium',
      },
      {
        id: 'scholars_no_photo',
        count: scholarsWithoutPhoto,
        path: '/alimler/liste',
        priority: 'low',
      },
    ].filter((task) => task.count > 0);

    return {
      tasks,
      total: tasks.reduce((sum, task) => sum + task.count, 0),
    };
  }

  @Get('statistics/language-distribution')
  @UseGuards(JwtAuthGuard)
  async getLanguageDistribution() {
    const bookRows = await this.bookTranslationRepository
      .createQueryBuilder('bt')
      .select('bt.languageId', 'languageId')
      .addSelect('COUNT(DISTINCT bt.bookId)', 'books')
      .groupBy('bt.languageId')
      .getRawMany<{ languageId: string; books: string }>();

    const articleRows = await this.articleTranslationRepository
      .createQueryBuilder('at')
      .select('at.languageId', 'languageId')
      .addSelect('COUNT(DISTINCT at.articleId)', 'articles')
      .groupBy('at.languageId')
      .getRawMany<{ languageId: string; articles: string }>();

    const languages = await this.languageRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const countMap = new Map<
      number,
      { books: number; articles: number }
    >();

    for (const row of bookRows) {
      const languageId = Number(row.languageId);
      const current = countMap.get(languageId) || { books: 0, articles: 0 };
      current.books = Number(row.books) || 0;
      countMap.set(languageId, current);
    }

    for (const row of articleRows) {
      const languageId = Number(row.languageId);
      const current = countMap.get(languageId) || { books: 0, articles: 0 };
      current.articles = Number(row.articles) || 0;
      countMap.set(languageId, current);
    }

    const distribution = languages
      .map((language) => {
        const counts = countMap.get(language.id) || { books: 0, articles: 0 };
        const total = counts.books + counts.articles;
        return {
          languageId: language.id,
          code: language.code,
          name: language.name,
          flagUrl: language.flagUrl,
          books: counts.books,
          articles: counts.articles,
          total,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    const grandTotal = distribution.reduce((sum, item) => sum + item.total, 0);

    return {
      items: distribution.map((item) => ({
        ...item,
        percentage:
          grandTotal > 0
            ? Math.round((item.total / grandTotal) * 1000) / 10
            : 0,
      })),
      grandTotal,
    };
  }

  private countArticlesWithoutPdf(): Promise<number> {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.translations', 'translation')
      .groupBy('article.id')
      .having(
        `SUM(CASE WHEN translation.pdfUrl IS NOT NULL AND translation.pdfUrl != '' THEN 1 ELSE 0 END) = 0`,
      )
      .getCount();
  }

  private countBooksWithoutPdf(): Promise<number> {
    return this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.translations', 'translation')
      .groupBy('book.id')
      .having(
        `SUM(CASE WHEN translation.pdfUrl IS NOT NULL AND translation.pdfUrl != '' THEN 1 ELSE 0 END) = 0`,
      )
      .getCount();
  }

  @Get('statistics/recent-activities')
  @UseGuards(JwtAuthGuard)
  async getRecentActivities() {
    try {
      const activities: Array<{
        type: string;
        entityType: string;
        entityId: number | string;
        title: string;
        description: string;
        createdAt: Date;
        icon: string;
        color: string;
      }> = [];

      // Son eklenen kitapları al
      try {
        const recentBooks = await this.bookRepository.find({
          order: { createdAt: 'DESC' },
          take: 3,
          relations: ['translations'],
        });

        recentBooks.forEach((book) => {
          const bookTitle = book.translations?.[0]?.title || 'İsimsiz Kitap';
          activities.push({
            type: 'book',
            entityType: 'book',
            entityId: book.id,
            title: 'Yeni kitap eklendi',
            description: bookTitle,
            createdAt: book.createdAt,
            icon: 'BookOpen',
            color: 'bg-blue-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent books:', error);
      }

      // Son eklenen âlimleri al
      try {
        const recentScholars = await this.scholarRepository.find({
          order: { createdAt: 'DESC' },
          take: 3,
        });

        recentScholars.forEach((scholar) => {
          activities.push({
            type: 'scholar',
            entityType: 'scholar',
            entityId: scholar.id,
            title: 'Yeni âlim eklendi',
            description: scholar.fullName,
            createdAt: scholar.createdAt,
            icon: 'Users',
            color: 'bg-emerald-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent scholars:', error);
      }

      // Son gönderileri al (translations relation'ı olmayabilir)
      try {
        const recentPosts = await this.scholarPostRepository.find({
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['scholar'],
        });

        recentPosts.forEach((post) => {
          // Translations tablosu yoksa sadece scholar bilgisini kullan
          const description = post.scholar?.fullName
            ? `${post.scholar.fullName} - Yeni gönderi`
            : 'Yeni gönderi';

          activities.push({
            type: 'post',
            entityType: 'post',
            entityId: post.id,
            title: 'Yeni gönderi',
            description: description,
            createdAt: post.createdAt,
            icon: 'FileText',
            color: 'bg-purple-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }

      // Son eklenen kullanıcıları al
      try {
        const recentUsers = await this.userRepository.find({
          order: { createdAt: 'DESC' },
          take: 3,
        });

        recentUsers.forEach((user) => {
          const fullName = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
          activities.push({
            type: 'user',
            entityType: 'user',
            entityId: user.id,
            title: 'Yeni kullanıcı eklendi',
            description: fullName || user.username || user.email,
            createdAt: user.createdAt,
            icon: 'UserPlus',
            color: 'bg-cyan-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent users:', error);
      }

      // Son eklenen makaleleri al
      try {
        const recentArticles = await this.articleRepository.find({
          order: { createdAt: 'DESC' },
          take: 3,
          relations: ['translations'],
        });

        recentArticles.forEach((article) => {
          const articleTitle =
            article.translations?.[0]?.title || `Makale #${article.id}`;
          activities.push({
            type: 'article',
            entityType: 'article',
            entityId: article.id,
            title: 'Yeni makale eklendi',
            description: articleTitle,
            createdAt: article.createdAt,
            icon: 'ScrollText',
            color: 'bg-orange-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent articles:', error);
      }

      // Son eklenen podcastleri al
      try {
        const recentPodcasts = await this.podcastRepository.find({
          order: { createdAt: 'DESC' },
          take: 3,
        });

        recentPodcasts.forEach((podcast) => {
          activities.push({
            type: 'podcast',
            entityType: 'podcast',
            entityId: podcast.id,
            title: 'Yeni podcast eklendi',
            description: podcast.title,
            createdAt: podcast.createdAt,
            icon: 'Podcast',
            color: 'bg-fuchsia-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent podcasts:', error);
      }

      // Son eklenen alim hikayelerini al
      try {
        const recentStories = await this.scholarStoryRepository.find({
          order: { created_at: 'DESC' },
          take: 3,
          relations: ['scholar'],
        });

        recentStories.forEach((story) => {
          const scholarName = story.scholar?.fullName
            ? `${story.scholar.fullName} - `
            : '';
          activities.push({
            type: 'story',
            entityType: 'story',
            entityId: story.id,
            title: 'Yeni hikaye eklendi',
            description: `${scholarName}${story.title}`,
            createdAt: story.created_at,
            icon: 'Film',
            color: 'bg-pink-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent stories:', error);
      }

      // Son eklenen haberleri al
      try {
        const recentNews = await this.islamicNewsRepository.find({
          order: { created_at: 'DESC' },
          take: 2,
        });

        recentNews.forEach((news) => {
          activities.push({
            type: 'news',
            entityType: 'news',
            entityId: news.id,
            title: 'Yeni haber eklendi',
            description: news.title,
            createdAt: news.created_at,
            icon: 'TrendingUp',
            color: 'bg-sky-500',
          });
        });
      } catch (error) {
        console.error('Error fetching recent news:', error);
      }

      // Tarihe göre sırala (en yeni en üstte)
      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // En son 10 aktiviteyi döndür
      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      // Hata durumunda boş array döndür
      return [];
    }
  }

  @Get()
  getHello(): string {
    return 'hello';
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
