declare class ArticleTranslationDto {
    id?: number;
    languageId: number;
    title: string;
    content: string;
    summary?: string;
    slug?: string;
    pdfUrl?: string;
}
export declare class CreateArticleDto {
    bookId: number;
    author?: string;
    publishDate?: Date;
    coverImage?: string;
    orderIndex?: number;
    translations: ArticleTranslationDto[];
}
export {};
