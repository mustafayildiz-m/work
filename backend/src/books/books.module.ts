import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BookCategoriesController } from './book-categories.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookTranslation } from './entities/book-translation.entity';
import { UploadModule } from '../upload/upload.module';
import { BookCategory } from './entities/book-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookTranslation, BookCategory]),
    UploadModule,
  ],
  controllers: [BooksController, BookCategoriesController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
