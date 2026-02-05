import { ScholarPost } from './scholar-post.entity';
export declare enum TranslationStatus {
    DRAFT = "draft",
    PENDING = "pending",
    APPROVED = "approved"
}
export declare class ScholarPostTranslation {
    id: string;
    post: ScholarPost;
    postId: string;
    language: string;
    content: string;
    mediaUrls: string[];
    fileUrls: string[];
    status?: TranslationStatus;
    translatedBy: number;
    approvedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
