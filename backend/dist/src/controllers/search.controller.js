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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const search_service_1 = require("../services/search.service");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async searchUsers(searchQuery, limit, offset, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { users: [], totalCount: 0, hasMore: false };
        }
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.searchService.searchUsers(searchQuery.trim(), limitNumber, offsetNumber, userId),
            this.searchService.getSearchUsersCount(searchQuery.trim(), userId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount,
            searchQuery: searchQuery.trim()
        };
    }
    async searchFollowers(searchQuery, limit, offset, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { users: [], totalCount: 0, hasMore: false };
        }
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.searchService.searchFollowers(searchQuery.trim(), limitNumber, offsetNumber, userId),
            this.searchService.getSearchFollowersCount(searchQuery.trim(), userId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount,
            searchQuery: searchQuery.trim()
        };
    }
    async searchFollowing(searchQuery, limit, offset, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { users: [], totalCount: 0, hasMore: false };
        }
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.searchService.searchFollowing(searchQuery.trim(), limitNumber, offsetNumber, userId),
            this.searchService.getSearchFollowingCount(searchQuery.trim(), userId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount,
            searchQuery: searchQuery.trim()
        };
    }
    async searchScholars(searchQuery, page, limit, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { scholars: [], totalCount: 0, totalPages: 0, currentPage: 1, hasMore: false };
        }
        const userId = req?.user?.id;
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const offsetNumber = (pageNumber - 1) * limitNumber;
        const [scholars, totalCount] = await Promise.all([
            this.searchService.searchScholars(searchQuery.trim(), limitNumber, offsetNumber, userId),
            this.searchService.getSearchScholarsCount(searchQuery.trim(), userId)
        ]);
        return {
            scholars,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            hasMore: (pageNumber * limitNumber) < totalCount,
            searchQuery: searchQuery.trim()
        };
    }
    async generalSearch(searchQuery, type, limit, offset, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { results: [], totalCount: 0, hasMore: false };
        }
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const searchType = type || 'all';
        return this.searchService.generalSearch(searchQuery.trim(), searchType, limitNumber, offsetNumber, userId);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)('followers'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchFollowers", null);
__decorate([
    (0, common_1.Get)('following'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchFollowing", null);
__decorate([
    (0, common_1.Get)('scholars'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchScholars", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "generalSearch", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map