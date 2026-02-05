"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const books_module_1 = require("./books/books.module");
const upload_module_1 = require("./upload/upload.module");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const scholars_module_1 = require("./scholars/scholars.module");
const language_module_1 = require("./modules/language.module");
const articles_module_1 = require("./articles/articles.module");
const scholar_entity_1 = require("./scholars/entities/scholar.entity");
const book_entity_1 = require("./books/entities/book.entity");
const book_translation_entity_1 = require("./books/entities/book-translation.entity");
const book_category_entity_1 = require("./books/entities/book-category.entity");
const article_entity_1 = require("./articles/entities/article.entity");
const article_translation_entity_1 = require("./articles/entities/article-translation.entity");
const scholar_post_entity_1 = require("./scholars/entities/scholar-post.entity");
const language_entity_1 = require("./languages/entities/language.entity");
const islamic_news_entity_1 = require("./entities/islamic-news.entity");
const user_entity_1 = require("./users/entities/user.entity");
const scholar_story_entity_1 = require("./entities/scholar-story.entity");
const story_view_entity_1 = require("./entities/story-view.entity");
const story_like_entity_1 = require("./entities/story-like.entity");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const stocks_module_1 = require("./stocks/stocks.module");
const stock_transfers_module_1 = require("./stock-transfers/stock-transfers.module");
const user_posts_module_1 = require("./modules/user-posts.module");
const event_details_module_1 = require("./modules/event-details.module");
const user_follow_module_1 = require("./modules/user-follow.module");
const user_scholar_follow_module_1 = require("./modules/user-scholar-follow.module");
const who_to_follow_module_1 = require("./modules/who-to-follow.module");
const user_post_comments_module_1 = require("./modules/user-post-comments.module");
const following_module_1 = require("./modules/following.module");
const search_module_1 = require("./modules/search.module");
const islamic_news_module_1 = require("./modules/islamic-news.module");
const scholar_stories_module_1 = require("./scholar-stories/scholar-stories.module");
const chat_module_1 = require("./chat/chat.module");
const cron_service_1 = require("./services/cron.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_config_1 = require("./config/cache.config");
const languages_seeder_1 = require("./seeders/languages-seeder");
const regional_books_seeder_1 = require("./seeders/regional-books-seeder");
const religious_books_seeder_1 = require("./seeders/religious-books-seeder");
const multilanguage_books_seeder_1 = require("./seeders/multilanguage-books-seeder");
const multilanguage_articles_seeder_1 = require("./seeders/multilanguage-articles-seeder");
const public_profile_module_1 = require("./modules/public-profile.module");
const podcast_module_1 = require("./modules/podcast.module");
const admin_users_module_1 = require("./modules/admin-users.module");
const translation_module_1 = require("./modules/translation.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            cache_manager_1.CacheModule.register(cache_config_1.cacheConfig),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'islamic_windows',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/migrations/*{.ts,.js}'],
                migrationsRun: false,
                synchronize: false,
            }),
            typeorm_1.TypeOrmModule.forFeature([scholar_entity_1.Scholar, book_entity_1.Book, scholar_post_entity_1.ScholarPost, language_entity_1.Language, islamic_news_entity_1.IslamicNews, scholar_story_entity_1.ScholarStory, story_view_entity_1.StoryView, story_like_entity_1.StoryLike, book_translation_entity_1.BookTranslation, book_category_entity_1.BookCategory, article_entity_1.Article, article_translation_entity_1.ArticleTranslation, user_entity_1.User]),
            books_module_1.BooksModule,
            articles_module_1.ArticlesModule,
            upload_module_1.UploadModule,
            auth_module_1.AuthModule,
            scholars_module_1.ScholarsModule,
            language_module_1.LanguageModule,
            warehouses_module_1.WarehousesModule,
            stocks_module_1.StocksModule,
            stock_transfers_module_1.StockTransfersModule,
            user_posts_module_1.UserPostsModule,
            event_details_module_1.EventDetailsModule,
            user_follow_module_1.UserFollowModule,
            user_scholar_follow_module_1.UserScholarFollowModule,
            who_to_follow_module_1.WhoToFollowModule,
            user_post_comments_module_1.UserPostCommentsModule,
            following_module_1.FollowingModule,
            search_module_1.SearchModule,
            islamic_news_module_1.IslamicNewsModule,
            scholar_stories_module_1.ScholarStoriesModule,
            chat_module_1.ChatModule,
            public_profile_module_1.PublicProfileModule,
            podcast_module_1.PodcastModule,
            admin_users_module_1.AdminUsersModule,
            translation_module_1.TranslationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [cron_service_1.CronService, languages_seeder_1.LanguagesSeeder, regional_books_seeder_1.RegionalBooksSeeder, religious_books_seeder_1.ReligiousBooksSeeder, multilanguage_books_seeder_1.MultiLanguageBooksSeeder, multilanguage_articles_seeder_1.MultiLanguageArticlesSeeder],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map