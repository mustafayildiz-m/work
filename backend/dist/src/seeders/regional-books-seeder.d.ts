import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { BookCategory } from '../books/entities/book-category.entity';
import { Language } from '../languages/entities/language.entity';
export declare class RegionalBooksSeeder {
    private readonly bookRepository;
    private readonly bookTranslationRepository;
    private readonly bookCategoryRepository;
    private readonly languageRepository;
    constructor(bookRepository: Repository<Book>, bookTranslationRepository: Repository<BookTranslation>, bookCategoryRepository: Repository<BookCategory>, languageRepository: Repository<Language>);
    seed(): Promise<void>;
}
