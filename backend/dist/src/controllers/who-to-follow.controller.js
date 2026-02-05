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
exports.WhoToFollowController = void 0;
const common_1 = require("@nestjs/common");
const who_to_follow_service_1 = require("../services/who-to-follow.service");
const passport_1 = require("@nestjs/passport");
let WhoToFollowController = class WhoToFollowController {
    constructor(whoToFollowService) {
        this.whoToFollowService = whoToFollowService;
    }
    async getWhoToFollow(page, limit, type, req) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const userId = req?.user?.id;
        const searchType = type || 'all';
        if (!page) {
            const results = await this.whoToFollowService.getWhoToFollow(limitNumber, searchType, userId);
            return results;
        }
        const [users, totalCount] = await Promise.all([
            this.whoToFollowService.getWhoToFollowUsers(userId, pageNumber, limitNumber),
            this.whoToFollowService.getUsersCount(userId)
        ]);
        return {
            users,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            hasMore: (pageNumber * limitNumber) < totalCount
        };
    }
    async searchWhoToFollow(searchQuery, page, limit, req) {
        if (!searchQuery || searchQuery.trim() === '') {
            return { users: [], totalCount: 0, totalPages: 0, currentPage: 1, hasMore: false };
        }
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const userId = req?.user?.id;
        const [users, totalCount] = await Promise.all([
            this.whoToFollowService.searchUsers(searchQuery.trim(), userId, pageNumber, limitNumber),
            this.whoToFollowService.searchUsersCount(searchQuery.trim(), userId)
        ]);
        return {
            users,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            hasMore: (pageNumber * limitNumber) < totalCount,
            searchQuery: searchQuery.trim()
        };
    }
};
exports.WhoToFollowController = WhoToFollowController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WhoToFollowController.prototype, "getWhoToFollow", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WhoToFollowController.prototype, "searchWhoToFollow", null);
exports.WhoToFollowController = WhoToFollowController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('who-to-follow'),
    __metadata("design:paramtypes", [who_to_follow_service_1.WhoToFollowService])
], WhoToFollowController);
//# sourceMappingURL=who-to-follow.controller.js.map