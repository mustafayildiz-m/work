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
exports.UserFollowController = void 0;
const common_1 = require("@nestjs/common");
const user_follow_service_1 = require("../services/user-follow.service");
const passport_1 = require("@nestjs/passport");
let UserFollowController = class UserFollowController {
    constructor(userFollowService) {
        this.userFollowService = userFollowService;
    }
    follow(body) {
        return this.userFollowService.follow(body.follower_id, body.following_id);
    }
    unfollow(body) {
        return this.userFollowService.unfollow(body.follower_id, body.following_id);
    }
    async getFollowingUsers(limit, offset, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userFollowService.getFollowingUsers(userId, limitNumber, offsetNumber),
            this.userFollowService.getFollowingCount(userId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount
        };
    }
    async getFollowers(limit, offset, req) {
        const userId = req?.user?.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userFollowService.getFollowers(userId, limitNumber, offsetNumber),
            this.userFollowService.getFollowersCount(userId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount
        };
    }
    async getFollowStats(req) {
        const userId = req?.user?.id;
        const [followingCount, followersCount] = await Promise.all([
            this.userFollowService.getFollowingCount(userId),
            this.userFollowService.getFollowersCount(userId)
        ]);
        return {
            followingCount,
            followersCount
        };
    }
};
exports.UserFollowController = UserFollowController;
__decorate([
    (0, common_1.Post)('follow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserFollowController.prototype, "follow", null);
__decorate([
    (0, common_1.Delete)('unfollow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserFollowController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)('following'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserFollowController.prototype, "getFollowingUsers", null);
__decorate([
    (0, common_1.Get)('followers'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserFollowController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserFollowController.prototype, "getFollowStats", null);
exports.UserFollowController = UserFollowController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('user-follow'),
    __metadata("design:paramtypes", [user_follow_service_1.UserFollowService])
], UserFollowController);
//# sourceMappingURL=user-follow.controller.js.map