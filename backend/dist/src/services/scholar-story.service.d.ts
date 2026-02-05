import { Repository } from 'typeorm';
import { ScholarStory } from '../entities/scholar-story.entity';
import { StoryView } from '../entities/story-view.entity';
import { StoryLike } from '../entities/story-like.entity';
import { CreateScholarStoryDto } from '../dto/scholar-story/create-scholar-story.dto';
import { UpdateScholarStoryDto } from '../dto/scholar-story/update-scholar-story.dto';
export declare class ScholarStoryService {
    private scholarStoryRepository;
    private storyViewRepository;
    private storyLikeRepository;
    private readonly logger;
    constructor(scholarStoryRepository: Repository<ScholarStory>, storyViewRepository: Repository<StoryView>, storyLikeRepository: Repository<StoryLike>);
    create(createScholarStoryDto: CreateScholarStoryDto): Promise<ScholarStory>;
    findAll(page?: number, limit?: number, language?: string, isActive?: boolean, search?: string): Promise<any>;
    findOne(id: number): Promise<ScholarStory>;
    findByScholarId(scholarId: number, page?: number, limit?: number): Promise<{
        stories: ScholarStory[];
        total: number;
        totalPages: number;
    }>;
    update(id: number, updateScholarStoryDto: UpdateScholarStoryDto): Promise<ScholarStory>;
    remove(id: number): Promise<void>;
    incrementViewCount(id: number, userId: number): Promise<void>;
    incrementLikeCount(id: number, userId: number): Promise<void>;
    getFeaturedStories(limit?: number): Promise<ScholarStory[]>;
    searchStories(query: string, page?: number, limit?: number): Promise<{
        stories: ScholarStory[];
        total: number;
        totalPages: number;
    }>;
}
