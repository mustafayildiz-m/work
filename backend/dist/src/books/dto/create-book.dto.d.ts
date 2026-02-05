declare class TranslationDto {
    id?: number;
    languageId: number;
    title: string;
    description?: string;
    summary?: string;
    pdfUrl?: string;
}
export declare class CreateBookDto {
    author?: string;
    publishDate?: Date;
    translations: TranslationDto[];
    coverImage?: string;
    category?: string[];
}
export {};
