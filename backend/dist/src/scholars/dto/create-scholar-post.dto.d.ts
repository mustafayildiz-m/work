export declare enum TranslationStatus {
    DRAFT = "draft",
    PENDING = "pending",
    APPROVED = "approved"
}
export declare class CreateTranslationDto {
    language: string;
    content?: string;
    mediaUrls?: string[];
    fileUrls?: string[];
    status?: TranslationStatus | null;
    translatedBy?: number | null;
    approvedBy?: number | null;
}
export declare class CreateScholarPostDto {
    scholarId: number;
    translations: CreateTranslationDto[];
}
