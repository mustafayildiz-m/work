import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BookCategoriesController } from './book-categories.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookTranslation } from './entities/book-translation.entity';
import { UploadModule } from '../upload/upload.module';
import { BookCategory } from './entities/book-category.entity';
import { BookPage } from './entities/book-page.entity';
import { BookPageTranslation } from './entities/book-page-translation.entity';
import { TranslationModule } from '../modules/translation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      BookTranslation,
      BookCategory,
      BookPage,
      BookPageTranslation,
    ]),
    UploadModule,
    TranslationModule,
  ],
  controllers: [BooksController, BookCategoriesController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule { }
