import { Scholar } from '../../scholars/entities/scholar.entity';
import { BookTranslation } from './book-translation.entity';
import { Stock } from '../../entities/stock.entity';
export declare class Book {
    id: number;
    coverUrl: string;
    coverImage: string;
    author: string;
    publishDate: Date;
    translations: BookTranslation[];
    scholars: Scholar[];
    stocks: Stock[];
    createdAt: Date;
    updatedAt: Date;
}
