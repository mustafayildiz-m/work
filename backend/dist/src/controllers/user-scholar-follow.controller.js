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
exports.UserScholarFollowController = void 0;
const common_1 = require("@nestjs/common");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
const passport_1 = require("@nestjs/passport");
let UserScholarFollowController = class UserScholarFollowController {
    constructor(userScholarFollowService) {
        this.userScholarFollowService = userScholarFollowService;
    }
    follow(body) {
        return this.userScholarFollowService.follow(body.user_id, body.scholar_id);
    }
    unfollow(body) {
        return this.userScholarFollowService.unfollow(body.user_id, body.scholar_id);
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
    async getScholarFollowStats(req) {
        const userId = req?.user?.id;
        const followingCount = await this.userScholarFollowService.getFollowingScholarsCount(userId);
        return {
            followingScholarsCount: followingCount,
        };
    }
};
exports.UserScholarFollowController = UserScholarFollowController;
__decorate([
    (0, common_1.Post)('follow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserScholarFollowController.prototype, "follow", null);
__decorate([
    (0, common_1.Delete)('unfollow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserScholarFollowController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)('following'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserScholarFollowController.prototype, "getFollowingScholars", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserScholarFollowController.prototype, "getScholarFollowStats", null);
exports.UserScholarFollowController = UserScholarFollowController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('user-scholar-follow'),
    __metadata("design:paramtypes", [user_scholar_follow_service_1.UserScholarFollowService])
], UserScholarFollowController);
//# sourceMappingURL=user-scholar-follow.controller.js.map