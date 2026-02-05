import { User } from '../users/entities/user.entity';
export declare enum PostStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class UserPost {
    id: number;
    user_id: number;
    type: string;
    title: string;
    content: string;
    image_url: string;
    video_url: string;
    shared_profile_type: string;
    shared_profile_id: number;
    shared_book_id: number;
    shared_article_id: number;
    status: PostStatus;
    approved_by: number;
    created_at: Date;
    updated_at: Date;
    user: User;
}
