import { BookLanguage } from './book-language.entity';
export declare class Book {
    id: number;
    title: string;
    description: string;
    bookLanguages: BookLanguage[];
}
