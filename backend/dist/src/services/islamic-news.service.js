"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var IslamicNewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IslamicNewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const islamic_news_entity_1 = require("../entities/islamic-news.entity");
const axios_1 = __importDefault(require("axios"));
const cache_service_1 = require("./cache.service");
let IslamicNewsService = IslamicNewsService_1 = class IslamicNewsService {
    constructor(islamicNewsRepository, cacheService) {
        this.islamicNewsRepository = islamicNewsRepository;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(IslamicNewsService_1.name);
        this.API_KEY = 'pub_943a763dbf314a169878a7ab68dcafd3';
        this.BASE_URL = 'https://newsdata.io/api/1';
    }
    async create(createIslamicNewsDto) {
        const news = this.islamicNewsRepository.create(createIslamicNewsDto);
        return this.islamicNewsRepository.save(news);
    }
    async findAll(limit = 20, offset = 0) {
        return this.islamicNewsRepository.findAndCount({
            order: { pub_date: 'DESC' },
            skip: offset,
            take: limit,
        });
    }
    async findOne(id) {
        return this.islamicNewsRepository.findOneBy({ id });
    }
    async update(id, updateIslamicNewsDto) {
        await this.islamicNewsRepository.update(id, updateIslamicNewsDto);
        await this.invalidateNewsCache();
        return this.findOne(id);
    }
    async remove(id) {
        await this.islamicNewsRepository.delete(id);
        await this.invalidateNewsCache();
    }
    async cleanOldNews() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const result = await this.islamicNewsRepository
                .createQueryBuilder()
                .delete()
                .where('created_at < :yesterday', { yesterday })
                .execute();
            this.logger.log(`${result.affected} eski haber silindi`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error('Eski haberleri temizlerken hata:', error.message);
            return 0;
        }
    }
    async fetchLatestNews() {
        try {
            this.logger.log('Fetching latest Islamic news from external API...');
            const response = await axios_1.default.get(`${this.BASE_URL}/latest`, {
                params: {
                    apikey: this.API_KEY,
                    q: 'Islam OR Muslim OR Islamic OR Quran OR İslam OR Müslüman',
                    language: 'tr',
                    category: 'world,politics',
                    country: 'tr',
                    size: 10,
                },
            });
            const newsData = response.data;
            if (newsData.status === 'success' && newsData.results) {
                const savedNews = await this.saveNewsToDatabase(newsData.results);
                this.logger.log(`Successfully fetched and saved ${savedNews.length} news articles`);
                return {
                    status: 'success',
                    message: `Fetched and saved ${savedNews.length} news articles`,
                    totalResults: newsData.totalResults,
                    savedCount: savedNews.length,
                    results: savedNews,
                };
            }
            else {
                this.logger.error('API response indicates failure:', newsData);
                return {
                    status: 'error',
                    message: 'Failed to fetch news from external API',
                    error: newsData.message || 'Unknown error',
                };
            }
        }
        catch (error) {
            this.logger.error('Error fetching latest news:', error.message);
            throw new Error(`Failed to fetch latest news: ${error.message}`);
        }
    }
    async fetchArchiveNews(fromDate, toDate) {
        try {
            this.logger.log(`Fetching archive news from ${fromDate} to ${toDate}...`);
            const response = await axios_1.default.get(`${this.BASE_URL}/archive`, {
                params: {
                    apikey: this.API_KEY,
                    q: 'Islam OR Muslim OR İslam OR Müslüman',
                    from_date: fromDate,
                    to_date: toDate,
                    language: 'tr',
                },
            });
            const newsData = response.data;
            if (newsData.status === 'success' && newsData.results) {
                const savedNews = await this.saveArchiveNewsToDatabase(newsData.results);
                this.logger.log(`Successfully fetched and saved ${savedNews.length} archive news articles`);
                return {
                    status: 'success',
                    message: `Fetched and saved ${savedNews.length} archive news articles`,
                    totalResults: newsData.totalResults,
                    savedCount: savedNews.length,
                    results: savedNews,
                };
            }
            else {
                this.logger.error('API response indicates failure:', newsData);
                return {
                    status: 'error',
                    message: 'Failed to fetch archive news from external API',
                    error: newsData.message || 'Unknown error',
                };
            }
        }
        catch (error) {
            this.logger.error('Error fetching archive news:', error.message);
            throw new Error(`Failed to fetch archive news: ${error.message}`);
        }
    }
    async saveNewsToDatabase(newsArray) {
        const savedNews = [];
        for (const news of newsArray) {
            try {
                const existingNews = await this.islamicNewsRepository.findOne({
                    where: { link: news.link },
                });
                if (!existingNews) {
                    const newsDto = {
                        title: news.title,
                        description: news.description,
                        content: news.content,
                        link: news.link,
                        image_url: news.image_url,
                        source_id: news.source_id,
                        source_name: news.source_name,
                        source_url: news.source_url,
                        language: news.language,
                        country: Array.isArray(news.country)
                            ? news.country.join(', ')
                            : news.country,
                        category: Array.isArray(news.category)
                            ? news.category.join(', ')
                            : news.category,
                        keywords: Array.isArray(news.keywords)
                            ? news.keywords.join(', ')
                            : news.keywords,
                        pub_date: news.pubDate ? new Date(news.pubDate) : new Date(),
                        video_url: news.video_url,
                        is_archived: false,
                    };
                    const savedNewsItem = await this.create(newsDto);
                    savedNews.push(savedNewsItem);
                }
            }
            catch (error) {
                this.logger.error(`Error saving news item: ${error.message}`, error);
            }
        }
        return savedNews;
    }
    async saveArchiveNewsToDatabase(newsArray) {
        const savedNews = [];
        for (const news of newsArray) {
            try {
                const existingNews = await this.islamicNewsRepository.findOne({
                    where: { link: news.link },
                });
                if (!existingNews) {
                    const newsDto = {
                        title: news.title,
                        description: news.description,
                        content: news.content,
                        link: news.link,
                        image_url: news.image_url,
                        source_id: news.source_id,
                        source_name: news.source_name,
                        source_url: news.source_url,
                        language: news.language,
                        country: Array.isArray(news.country)
                            ? news.country.join(', ')
                            : news.country,
                        category: Array.isArray(news.category)
                            ? news.category.join(', ')
                            : news.category,
                        keywords: Array.isArray(news.keywords)
                            ? news.keywords.join(', ')
                            : news.keywords,
                        pub_date: news.pubDate ? new Date(news.pubDate) : new Date(),
                        video_url: news.video_url,
                        is_archived: true,
                        archive_date: new Date(),
                    };
                    const savedNewsItem = await this.create(newsDto);
                    savedNews.push(savedNewsItem);
                }
            }
            catch (error) {
                this.logger.error(`Error saving archive news item: ${error.message}`, error);
            }
        }
        return savedNews;
    }
    async getNewsFromDatabase(limit = 20, offset = 0, language, country, category, isArchived) {
        const cacheKey = `news:${limit}:${offset}:${language || 'all'}:${country || 'all'}:${category || 'all'}:${isArchived || 'all'}`;
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            this.logger.debug(`Cache hit for key: ${cacheKey}`);
            return cachedResult;
        }
        this.logger.debug(`Cache miss for key: ${cacheKey}, fetching from database`);
        const queryBuilder = this.islamicNewsRepository
            .createQueryBuilder('news')
            .orderBy('news.pub_date', 'DESC')
            .skip(offset)
            .take(limit);
        if (language) {
            queryBuilder.andWhere('news.language = :language', { language });
        }
        if (country) {
            queryBuilder.andWhere('news.country = :country', { country });
        }
        if (category) {
            queryBuilder.andWhere('news.category = :category', { category });
        }
        if (isArchived !== undefined) {
            queryBuilder.andWhere('news.is_archived = :isArchived', { isArchived });
        }
        const [news, totalCount] = await queryBuilder.getManyAndCount();
        await this.cacheService.set(cacheKey, [news, totalCount], 300);
        return [news, totalCount];
    }
    async searchNews(query, limit = 20, offset = 0) {
        return this.islamicNewsRepository
            .createQueryBuilder('news')
            .where('(news.title LIKE :query OR news.description LIKE :query OR news.content LIKE :query OR news.keywords LIKE :query)', { query: `%${query}%` })
            .orderBy('news.pub_date', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();
    }
    async invalidateNewsCache() {
        try {
            await this.cacheService.delPattern('news:*');
            this.logger.debug('News cache invalidated');
        }
        catch (error) {
            this.logger.error('Cache invalidation error:', error.message);
        }
    }
};
exports.IslamicNewsService = IslamicNewsService;
exports.IslamicNewsService = IslamicNewsService = IslamicNewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(islamic_news_entity_1.IslamicNews)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService])
], IslamicNewsService);
//# sourceMappingURL=islamic-news.service.js.map