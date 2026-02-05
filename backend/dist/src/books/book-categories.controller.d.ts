import { BooksService } from './books.service';
export declare class BookCategoriesController {
    private readonly booksService;
    constructor(booksService: BooksService);
    getCategories(languageId?: string): Promise<string[]>;
}
