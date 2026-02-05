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
exports.FollowingController = void 0;
const common_1 = require("@nestjs/common");
const user_follow_service_1 = require("../services/user-follow.service");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
const passport_1 = require("@nestjs/passport");
let FollowingController = class FollowingController {
    constructor(userFollowService, userScholarFollowService) {
        this.userFollowService = userFollowService;
        this.userScholarFollowService = userScholarFollowService;
    }
    async getAllFollowing(limit, offset, type, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const followType = type || 'all';
        const result = [];
        if (followType === 'all' || followType === 'users') {
            const [users, userCount] = await Promise.all([
                this.userFollowService.getFollowingUsers(userId, Math.ceil(limitNumber / 2), offsetNumber),
                this.userFollowService.getFollowingCount(userId),
            ]);
            const userItems = users.map((user) => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                photoUrl: user.photoUrl,
                type: 'user',
                username: user.username,
                role: user.role,
                followId: user.followId,
                followedAt: user.followedAt,
            }));
            result.push(...userItems);
        }
        if (followType === 'all' || followType === 'scholars') {
            const [scholars, scholarCount] = await Promise.all([
                this.userScholarFollowService.getFollowingScholars(userId, Math.ceil(limitNumber / 2), offsetNumber),
                this.userScholarFollowService.getFollowingScholarsCount(userId),
            ]);
            const scholarItems = scholars.map((scholar) => ({
                id: scholar.id,
                name: scholar.fullName,
                photoUrl: scholar.photoUrl,
                type: 'scholar',
                fullName: scholar.fullName,
                biography: scholar.biography,
                followId: scholar.followId,
                followedAt: scholar.followedAt,
            }));
            result.push(...scholarItems);
        }
        result.sort((a, b) => b.followedAt - a.followedAt);
        const finalResult = result.slice(0, limitNumber);
        const [totalUserCount, totalScholarCount] = await Promise.all([
            this.userFollowService.getFollowingCount(userId),
            this.userScholarFollowService.getFollowingScholarsCount(userId),
        ]);
        const totalCount = followType === 'users'
            ? totalUserCount
            : followType === 'scholars'
                ? totalScholarCount
                : totalUserCount + totalScholarCount;
        return {
            items: finalResult,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
            stats: {
                usersCount: totalUserCount,
                scholarsCount: totalScholarCount,
                totalCount,
            },
        };
    }
    async getFollowingUsers(limit, offset, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userFollowService.getFollowingUsers(userId, limitNumber, offsetNumber),
            this.userFollowService.getFollowingCount(userId),
        ]);
        return {
            users,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
        };
    }
    async getFollowingScholars(limit, offset, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [scholars, totalCount] = await Promise.all([
            this.userScholarFollowService.getFollowingScholars(userId, limitNumber, offsetNumber),
            this.userScholarFollowService.getFollowingScholarsCount(userId),
        ]);
        return {
            scholars,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
        };
    }
    async getFollowingStats(req) {
        const userId = req?.user?.id;
        const [userFollowingCount, userFollowersCount, scholarFollowingCount] = await Promise.all([
            this.userFollowService.getFollowingCount(userId),
            this.userFollowService.getFollowersCount(userId),
            this.userScholarFollowService.getFollowingScholarsCount(userId),
        ]);
        return {
            followingUsersCount: userFollowingCount,
            followersCount: userFollowersCount,
            followingScholarsCount: scholarFollowingCount,
            totalFollowingCount: userFollowingCount + scholarFollowingCount,
        };
    }
    async getRecentPostsFromFollowing(limit, language, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 5;
        const lang = language || 'tr';
        try {
            const recentPosts = await this.userFollowService.getRecentPostsFromFollowing(userId, limitNumber, lang);
            return {
                posts: recentPosts,
                totalCount: recentPosts.length,
                message: `Takip edilen ${recentPosts.length} son post getirildi`,
            };
        }
        catch (error) {
            throw new Error(`Son post'lar getirilirken hata: ${error.message}`);
        }
    }
};
exports.FollowingController = FollowingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FollowingController.prototype, "getAllFollowing", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FollowingController.prototype, "getFollowingUsers", null);
__decorate([
    (0, common_1.Get)('scholars'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FollowingController.prototype, "getFollowingScholars", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FollowingController.prototype, "getFollowingStats", null);
__decorate([
    (0, common_1.Get)('recent-posts'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FollowingController.prototype, "getRecentPostsFromFollowing", null);
exports.FollowingController = FollowingController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('following'),
    __metadata("design:paramtypes", [user_follow_service_1.UserFollowService,
        user_scholar_follow_service_1.UserScholarFollowService])
], FollowingController);
//# sourceMappingURL=following.controller.js.map