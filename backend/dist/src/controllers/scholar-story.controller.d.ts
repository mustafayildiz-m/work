import { ScholarStoryService } from '../services/scholar-story.service';
import { UploadService } from '../upload/upload.service';
export declare class ScholarStoryController {
    private readonly scholarStoryService;
    private readonly uploadService;
    constructor(scholarStoryService: ScholarStoryService, uploadService: UploadService);
    create(body: any, file?: Express.Multer.File): Promise<import("../entities/scholar-story.entity").ScholarStory>;
    findAll(page: number, limit: number, language?: string, isActive?: string, search?: string): Promise<any>;
    testEndpoint(): {
        page: number;
        limit: number;
        test: string;
    };
    getFeaturedStories(limit: number): Promise<import("../entities/scholar-story.entity").ScholarStory[]>;
    searchStories(query: string, page: number, limit: number): Promise<{
        stories: import("../entities/scholar-story.entity").ScholarStory[];
        total: number;
        totalPages: number;
    }> | {
        stories: never[];
        total: number;
        totalPages: number;
    };
    findByScholarId(scholarId: number, page: number, limit: number): Promise<{
        stories: import("../entities/scholar-story.entity").ScholarStory[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<import("../entities/scholar-story.entity").ScholarStory>;
    update(id: number, body: any, file?: Express.Multer.File): Promise<import("../entities/scholar-story.entity").ScholarStory>;
    remove(id: number): Promise<void>;
    likeStory(id: number, req: any): Promise<void>;
    incrementView(id: number, req: any): Promise<void>;
}
