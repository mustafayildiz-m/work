import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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
  ) { }

  @Get('statistics/counts')
  @UseGuards(JwtAuthGuard)
  async getCounts() {
    const scholars = await this.scholarRepository.count();
    const books = await this.bookRepository.count();
    const posts = await this.scholarPostRepository.count();
    const languages = await this.languageRepository.count();
    return { scholars, books, posts, languages };
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
      kitaplar: number;
      alimler: number;
      kullanicilar: number;
    }> = [];

    // Son 6 ayın verilerini al
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month < 0 ? 12 + month : month;

      const startDate = new Date(year, adjustedMonth, 1);
      const endDate = new Date(year, adjustedMonth + 1, 0, 23, 59, 59);

      const [booksCount, scholarsCount, usersCount] = await Promise.all([
        this.bookRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
          },
        }),
        this.scholarRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
          },
        }),
        this.userRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
          },
        }),
      ]);

      monthlyData.push({
        name: monthNames[adjustedMonth],
        kitaplar: booksCount,
        alimler: scholarsCount,
        kullanicilar: usersCount,
      });
    }

    return monthlyData;
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
          const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
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
          const articleTitle = article.translations?.[0]?.title || `Makale #${article.id}`;
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
          const scholarName = story.scholar?.fullName ? `${story.scholar.fullName} - ` : '';
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
