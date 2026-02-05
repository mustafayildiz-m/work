import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './books/books.module';
import { UploadModule } from './upload/upload.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ScholarsModule } from './scholars/scholars.module';
import { LanguageModule } from './modules/language.module';
import { ArticlesModule } from './articles/articles.module';
import { Scholar } from './scholars/entities/scholar.entity';
import { Book } from './books/entities/book.entity';
import { BookTranslation } from './books/entities/book-translation.entity';
import { BookCategory } from './books/entities/book-category.entity';
import { Article } from './articles/entities/article.entity';
import { ArticleTranslation } from './articles/entities/article-translation.entity';
import { ScholarPost } from './scholars/entities/scholar-post.entity';
import { Language } from './languages/entities/language.entity';
import { IslamicNews } from './entities/islamic-news.entity';
import { User } from './users/entities/user.entity';
import { ScholarStory } from './entities/scholar-story.entity';
import { StoryView } from './entities/story-view.entity';
import { StoryLike } from './entities/story-like.entity';
import { WarehousesModule } from './warehouses/warehouses.module';
import { StocksModule } from './stocks/stocks.module';
import { StockTransfersModule } from './stock-transfers/stock-transfers.module';
import { UserPostsModule } from './modules/user-posts.module';
import { EventDetailsModule } from './modules/event-details.module';
import { UserFollowModule } from './modules/user-follow.module';
import { UserScholarFollowModule } from './modules/user-scholar-follow.module';
import { WhoToFollowModule } from './modules/who-to-follow.module';
import { UserPostCommentsModule } from './modules/user-post-comments.module';
import { FollowingModule } from './modules/following.module';
import { SearchModule } from './modules/search.module';
import { IslamicNewsModule } from './modules/islamic-news.module';
import { ScholarStoriesModule } from './scholar-stories/scholar-stories.module';
import { ChatModule } from './chat/chat.module';
import { CronService } from './services/cron.service';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfig } from './config/cache.config';
import { LanguagesSeeder } from './seeders/languages-seeder';
import { RegionalBooksSeeder } from './seeders/regional-books-seeder';
import { ReligiousBooksSeeder } from './seeders/religious-books-seeder';
import { MultiLanguageBooksSeeder } from './seeders/multilanguage-books-seeder';
import { MultiLanguageArticlesSeeder } from './seeders/multilanguage-articles-seeder';
import { PublicProfileModule } from './modules/public-profile.module';
import { PodcastModule } from './modules/podcast.module';
import { AdminUsersModule } from './modules/admin-users.module';
import { TranslationModule } from './modules/translation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register(cacheConfig),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'islamic_windows',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: false, // Docker'da migration'lar manuel çalıştırılacak
      synchronize: false,
    }),
    TypeOrmModule.forFeature([
      Scholar,
      Book,
      ScholarPost,
      Language,
      IslamicNews,
      ScholarStory,
      StoryView,
      StoryLike,
      BookTranslation,
      BookCategory,
      Article,
      ArticleTranslation,
      User,
    ]),
    BooksModule,
    ArticlesModule,
    UploadModule,
    AuthModule,
    ScholarsModule,
    LanguageModule,
    WarehousesModule,
    StocksModule,
    StockTransfersModule,
    UserPostsModule,
    EventDetailsModule,
    UserFollowModule,
    UserScholarFollowModule,
    WhoToFollowModule,
    UserPostCommentsModule,
    FollowingModule,
    SearchModule,
    IslamicNewsModule,
    ScholarStoriesModule,
    ChatModule,
    PublicProfileModule,
    PodcastModule,
    AdminUsersModule,
    TranslationModule,
  ],
  controllers: [AppController],
  providers: [
    CronService,
    LanguagesSeeder,
    RegionalBooksSeeder,
    ReligiousBooksSeeder,
    MultiLanguageBooksSeeder,
    MultiLanguageArticlesSeeder,
  ],
})
export class AppModule { }
