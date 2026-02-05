import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UploadService } from '../upload/upload.service';
export declare class BooksController {
    private readonly booksService;
    private readonly uploadService;
    constructor(booksService: BooksService, uploadService: UploadService);
    findOnePublic(id: number, lang?: string): Promise<any>;
    getBooksWithArticles(languageId?: string): Promise<any[]>;
    getCategories(languageId?: string): Promise<string[]>;
    findAll(languageId?: string, search?: string, category?: string, page?: string, limit?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(createBookDto: CreateBookDto, files: Express.Multer.File[]): Promise<import("./entities/book.entity").Book>;
    update(id: number, updateBookDto: any, files: Express.Multer.File[]): Promise<import("./entities/book.entity").Book | null>;
    remove(id: number): Promise<{
        message: string;
        deletedBook: any;
    }>;
}
