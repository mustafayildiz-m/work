import { ScholarPostsService } from './scholar-posts.service';
export declare class ScholarPostsController {
    private readonly scholarPostsService;
    constructor(scholarPostsService: ScholarPostsService);
    findOnePublic(id: string, language?: string): Promise<import("./entities/scholar-post.entity").ScholarPost>;
    create(files: Express.Multer.File[], body: any): Promise<import("./entities/scholar-post.entity").ScholarPost>;
    findAll(scholarId: string, language?: string): Promise<import("./entities/scholar-post.entity").ScholarPost[]>;
    findOne(id: string, language?: string): Promise<import("./entities/scholar-post.entity").ScholarPost>;
    remove(id: string): Promise<void>;
    addOrUpdateTranslation(postId: string, language: string, files: Express.Multer.File[], body: any): Promise<import("./entities/scholar-post-translation.entity").ScholarPostTranslation>;
    removeTranslation(postId: string, language: string): Promise<void>;
}
