import { Book } from '../../books/entities/book.entity';
import { ArticleTranslation } from './article-translation.entity';
export declare class Article {
    id: number;
    bookId: number;
    author: string;
    publishDate: Date;
    coverImage: string;
    orderIndex: number;
    book: Book;
    translations: ArticleTranslation[];
    createdAt: Date;
    updatedAt: Date;
}
