import { BookTranslation } from '../../books/entities/book-translation.entity';
import { ArticleTranslation } from '../../articles/entities/article-translation.entity';
export declare class Language {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    bookTranslations: BookTranslation[];
    articleTranslations: ArticleTranslation[];
    createdAt: Date;
    updatedAt: Date;
}
