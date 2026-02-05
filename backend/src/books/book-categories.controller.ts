import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('book-categories')
export class BookCategoriesController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  getCategories(@Query('languageId') languageId?: string) {
    return this.booksService.getCategories(languageId);
  }
}
