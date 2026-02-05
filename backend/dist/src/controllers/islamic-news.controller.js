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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IslamicNewsController = void 0;
const common_1 = require("@nestjs/common");
const islamic_news_service_1 = require("../services/islamic-news.service");
const create_islamic_news_dto_1 = require("../dto/islamic-news/create-islamic-news.dto");
const update_islamic_news_dto_1 = require("../dto/islamic-news/update-islamic-news.dto");
const passport_1 = require("@nestjs/passport");
let IslamicNewsController = class IslamicNewsController {
    constructor(islamicNewsService) {
        this.islamicNewsService = islamicNewsService;
    }
    async fetchLatestNews() {
        return this.islamicNewsService.fetchLatestNews();
    }
    async fetchArchiveNews(fromDate, toDate) {
        if (!fromDate || !toDate) {
            return {
                status: 'error',
                message: 'from_date and to_date parameters are required',
            };
        }
        return this.islamicNewsService.fetchArchiveNews(fromDate, toDate);
    }
    async findAll(limit, offset, language, country, category, isArchived, res) {
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const isArchivedBoolean = isArchived ? isArchived === 'true' : undefined;
        const [news, totalCount] = await this.islamicNewsService.getNewsFromDatabase(limitNumber, offsetNumber, language, country, category, isArchivedBoolean);
        if (res) {
            res.set({
                'Cache-Control': 'public, max-age=300',
                ETag: `news-${totalCount}-${offsetNumber}`,
                'Last-Modified': new Date().toUTCString(),
            });
        }
        return {
            news,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
            pagination: {
                limit: limitNumber,
                offset: offsetNumber,
                total: totalCount,
            },
        };
    }
    async findOne(id) {
        const news = await this.islamicNewsService.findOne(id);
        if (!news) {
            throw new common_1.NotFoundException('Haber bulunamadı');
        }
        return news;
    }
    async searchNews(query, limit, offset) {
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [news, totalCount] = await this.islamicNewsService.searchNews(query, limitNumber, offsetNumber);
        return {
            news,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
            searchQuery: query,
            pagination: {
                limit: limitNumber,
                offset: offsetNumber,
                total: totalCount,
            },
        };
    }
    async create(createIslamicNewsDto) {
        return this.islamicNewsService.create(createIslamicNewsDto);
    }
    async update(id, updateIslamicNewsDto) {
        const news = await this.islamicNewsService.update(id, updateIslamicNewsDto);
        if (!news) {
            throw new common_1.NotFoundException('Haber bulunamadı');
        }
        return news;
    }
    async remove(id) {
        await this.islamicNewsService.remove(id);
        return { message: 'News article deleted successfully' };
    }
    async cleanOldNews() {
        const deletedCount = await this.islamicNewsService.cleanOldNews();
        return {
            message: 'Old news cleaned successfully',
            deletedCount,
        };
    }
    async getNewsStats() {
        const [allNews, allCount] = await this.islamicNewsService.findAll();
        const [archivedNews, archivedCount] = await this.islamicNewsService.getNewsFromDatabase(1000, 0, undefined, undefined, undefined, true);
        const [latestNews, latestCount] = await this.islamicNewsService.getNewsFromDatabase(1000, 0, undefined, undefined, undefined, false);
        const languageStats = {};
        allNews.forEach((news) => {
            if (news.language) {
                languageStats[news.language] = (languageStats[news.language] || 0) + 1;
            }
        });
        const countryStats = {};
        allNews.forEach((news) => {
            if (news.country) {
                countryStats[news.country] = (countryStats[news.country] || 0) + 1;
            }
        });
        const categoryStats = {};
        allNews.forEach((news) => {
            if (news.category) {
                categoryStats[news.category] = (categoryStats[news.category] || 0) + 1;
            }
        });
        return {
            totalNews: allCount,
            archivedNews: archivedCount,
            latestNews: latestCount,
            languageDistribution: languageStats,
            countryDistribution: countryStats,
            categoryDistribution: categoryStats,
        };
    }
};
exports.IslamicNewsController = IslamicNewsController;
__decorate([
    (0, common_1.Get)('fetch-latest'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "fetchLatestNews", null);
__decorate([
    (0, common_1.Get)('fetch-archive'),
    __param(0, (0, common_1.Query)('from_date')),
    __param(1, (0, common_1.Query)('to_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "fetchArchiveNews", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('country')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('is_archived')),
    __param(6, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('search/:query'),
    __param(0, (0, common_1.Param)('query')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "searchNews", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_islamic_news_dto_1.CreateIslamicNewsDto]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_islamic_news_dto_1.UpdateIslamicNewsDto]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('clean/old'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "cleanOldNews", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IslamicNewsController.prototype, "getNewsStats", null);
exports.IslamicNewsController = IslamicNewsController = __decorate([
    (0, common_1.Controller)('islamic-news'),
    __metadata("design:paramtypes", [islamic_news_service_1.IslamicNewsService])
], IslamicNewsController);
//# sourceMappingURL=islamic-news.controller.js.map