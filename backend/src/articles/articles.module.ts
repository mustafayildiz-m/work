import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { ArticlePage } from './entities/article-page.entity';
import { ArticlePageTranslation } from './entities/article-page-translation.entity';
import { UploadModule } from '../upload/upload.module';
import { TranslationModule } from '../modules/translation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleTranslation,
      ArticlePage,
      ArticlePageTranslation,
    ]),
    UploadModule,
    TranslationModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule { }
