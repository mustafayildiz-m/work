import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageController } from '../controllers/language.controller';
import { LanguageService } from '../services/language.service';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { ArticleTranslation } from '../articles/entities/article-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, BookTranslation, ArticleTranslation]),
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
