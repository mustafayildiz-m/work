import { Repository } from 'typeorm';
import { ScholarPost } from './entities/scholar-post.entity';
import { ScholarPostTranslation } from './entities/scholar-post-translation.entity';
import { CreateScholarPostDto } from './dto/create-scholar-post.dto';
import { UpdateTranslationDto } from './dto/update-scholar-post.dto';
import { Scholar } from './entities/scholar.entity';
import { CacheService } from '../services/cache.service';
export declare class ScholarPostsService {
    private scholarPostRepository;
    private translationRepository;
    private scholarRepository;
    private readonly cacheService;
    constructor(scholarPostRepository: Repository<ScholarPost>, translationRepository: Repository<ScholarPostTranslation>, scholarRepository: Repository<Scholar>, cacheService: CacheService);
    create(createScholarPostDto: CreateScholarPostDto): Promise<ScholarPost>;
    private clearTimelineCacheForScholar;
    findAll(scholarId: number, language?: string): Promise<ScholarPost[]>;
    findOne(id: string, language?: string): Promise<ScholarPost>;
    remove(id: string): Promise<void>;
    update(id: string, updateDto: UpdateTranslationDto): Promise<ScholarPost>;
    addOrUpdateTranslation(postId: string, language: string, translationData: UpdateTranslationDto): Promise<ScholarPostTranslation>;
    deleteTranslation(postId: string, language: string): Promise<void>;
}
