import { Book } from './book.entity';
import { Language } from '../../languages/entities/language.entity';
export declare class BookTranslation {
    id: number;
    bookId: number;
    languageId: number;
    title: string;
    description: string;
    summary: string;
    pdfUrl: string;
    book: Book;
    language: Language;
}
