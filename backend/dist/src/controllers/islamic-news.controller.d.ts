import { Response } from 'express';
import { IslamicNewsService } from '../services/islamic-news.service';
import { CreateIslamicNewsDto } from '../dto/islamic-news/create-islamic-news.dto';
import { UpdateIslamicNewsDto } from '../dto/islamic-news/update-islamic-news.dto';
export declare class IslamicNewsController {
    private readonly islamicNewsService;
    constructor(islamicNewsService: IslamicNewsService);
    fetchLatestNews(): Promise<any>;
    fetchArchiveNews(fromDate: string, toDate: string): Promise<any>;
    findAll(limit?: string, offset?: string, language?: string, country?: string, category?: string, isArchived?: string, res?: Response): Promise<{
        news: import("../entities/islamic-news.entity").IslamicNews[];
        totalCount: number;
        hasMore: boolean;
        pagination: {
            limit: number;
            offset: number;
            total: number;
        };
    }>;
    findOne(id: number): Promise<import("../entities/islamic-news.entity").IslamicNews>;
    searchNews(query: string, limit?: string, offset?: string): Promise<{
        news: import("../entities/islamic-news.entity").IslamicNews[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
        pagination: {
            limit: number;
            offset: number;
            total: number;
        };
    }>;
    create(createIslamicNewsDto: CreateIslamicNewsDto): Promise<import("../entities/islamic-news.entity").IslamicNews>;
    update(id: number, updateIslamicNewsDto: UpdateIslamicNewsDto): Promise<import("../entities/islamic-news.entity").IslamicNews>;
    remove(id: number): Promise<{
        message: string;
    }>;
    cleanOldNews(): Promise<{
        message: string;
        deletedCount: number;
    }>;
    getNewsStats(): Promise<{
        totalNews: number;
        archivedNews: number;
        latestNews: number;
        languageDistribution: {};
        countryDistribution: {};
        categoryDistribution: {};
    }>;
}
