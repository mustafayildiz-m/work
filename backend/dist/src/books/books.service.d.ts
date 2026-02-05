import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BookTranslation } from './entities/book-translation.entity';
import { BookCategory } from './entities/book-category.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UploadService } from '../upload/upload.service';
export declare class BooksService {
    private bookRepository;
    private bookTranslationRepository;
    private bookCategoryRepository;
    private uploadService;
    constructor(bookRepository: Repository<Book>, bookTranslationRepository: Repository<BookTranslation>, bookCategoryRepository: Repository<BookCategory>, uploadService: UploadService);
    create(createBookDto: CreateBookDto): Promise<Book>;
    findAll(languageId?: string, search?: string, category?: string, page?: number, limit?: number): Promise<any>;
    getCategories(languageId?: string): Promise<string[]>;
    findOne(id: number): Promise<any>;
    findOnePublic(id: number, lang?: string): Promise<any>;
    update(id: number, updateBookDto: CreateBookDto): Promise<Book | null>;
    remove(id: number): Promise<void>;
    getBooksWithArticles(languageId?: string): Promise<any[]>;
}
