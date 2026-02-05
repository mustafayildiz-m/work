import { Repository } from 'typeorm';
import { IslamicNews } from '../entities/islamic-news.entity';
import { CreateIslamicNewsDto } from '../dto/islamic-news/create-islamic-news.dto';
import { UpdateIslamicNewsDto } from '../dto/islamic-news/update-islamic-news.dto';
import { CacheService } from './cache.service';
export declare class IslamicNewsService {
    private islamicNewsRepository;
    private readonly cacheService;
    private readonly logger;
    private readonly API_KEY;
    private readonly BASE_URL;
    constructor(islamicNewsRepository: Repository<IslamicNews>, cacheService: CacheService);
    create(createIslamicNewsDto: CreateIslamicNewsDto): Promise<IslamicNews>;
    findAll(limit?: number, offset?: number): Promise<[IslamicNews[], number]>;
    findOne(id: number): Promise<IslamicNews | null>;
    update(id: number, updateIslamicNewsDto: UpdateIslamicNewsDto): Promise<IslamicNews | null>;
    remove(id: number): Promise<void>;
    cleanOldNews(): Promise<number>;
    fetchLatestNews(): Promise<any>;
    fetchArchiveNews(fromDate: string, toDate: string): Promise<any>;
    private saveNewsToDatabase;
    private saveArchiveNewsToDatabase;
    getNewsFromDatabase(limit?: number, offset?: number, language?: string, country?: string, category?: string, isArchived?: boolean): Promise<[IslamicNews[], number]>;
    searchNews(query: string, limit?: number, offset?: number): Promise<[IslamicNews[], number]>;
    private invalidateNewsCache;
}
