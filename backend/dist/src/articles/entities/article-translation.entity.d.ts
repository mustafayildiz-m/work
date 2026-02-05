import { Article } from './article.entity';
import { Language } from '../../languages/entities/language.entity';
export declare class ArticleTranslation {
    id: number;
    articleId: number;
    languageId: number;
    title: string;
    content: string;
    summary: string;
    slug: string;
    pdfUrl: string;
    article: Article;
    language: Language;
}
