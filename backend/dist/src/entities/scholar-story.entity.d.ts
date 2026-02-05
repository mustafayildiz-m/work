import { Scholar } from '../scholars/entities/scholar.entity';
export declare class ScholarStory {
    id: number;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    language: string;
    is_active: boolean;
    is_featured: boolean;
    view_count: number;
    like_count: number;
    scholar_id: number;
    scholar: Scholar;
    created_at: Date;
    updated_at: Date;
}
