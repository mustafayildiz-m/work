import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Language } from '../languages/entities/language.entity';
export declare class IslamicBooksSeeder {
    private readonly bookRepository;
    private readonly bookTranslationRepository;
    private readonly languageRepository;
    constructor(bookRepository: Repository<Book>, bookTranslationRepository: Repository<BookTranslation>, languageRepository: Repository<Language>);
    seed(): Promise<void>;
}
