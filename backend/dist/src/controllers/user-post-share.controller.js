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
exports.UserPostShareController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_post_share_service_1 = require("../services/user-post-share.service");
let UserPostShareController = class UserPostShareController {
    constructor(userPostShareService) {
        this.userPostShareService = userPostShareService;
    }
    async sharePost(body, req) {
        const userId = req.user.id;
        let postType = 'user';
        if (body.post_type === 1 || body.post_type === '1') {
            postType = 'scholar';
        }
        else if (body.post_type === 2 || body.post_type === '2' || body.post_type === 'user') {
            postType = 'user';
        }
        return await this.userPostShareService.sharePost(userId, body.post_id, postType);
    }
    async unsharePost(postId, postTypeParam = 'user', req) {
        const userId = req.user.id;
        const postType = postTypeParam === '1' ? 'scholar' : 'user';
        return await this.userPostShareService.unsharePost(userId, postId, postType);
    }
    async getMyShares(limit, offset, req) {
        const userId = req.user.id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        return await this.userPostShareService.getUserShares(userId, limitNumber, offsetNumber);
    }
    async getPostShareCount(postId, postTypeParam = 'user') {
        const postType = postTypeParam === '1' ? 'scholar' : 'user';
        const count = await this.userPostShareService.getPostShareCount(postId, postType);
        return { count };
    }
    async isPostSharedByUser(postId, postTypeParam = 'user', req) {
        const userId = req.user.id;
        const postType = postTypeParam === '1' ? 'scholar' : 'user';
        const isShared = await this.userPostShareService.isPostSharedByUser(userId, postId, postType);
        return { isShared };
    }
};
exports.UserPostShareController = UserPostShareController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserPostShareController.prototype, "sharePost", null);
__decorate([
    (0, common_1.Delete)(':postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('post_type')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserPostShareController.prototype, "unsharePost", null);
__decorate([
    (0, common_1.Get)('my-shares'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserPostShareController.prototype, "getMyShares", null);
__decorate([
    (0, common_1.Get)('post/:postId/count'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('post_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserPostShareController.prototype, "getPostShareCount", null);
__decorate([
    (0, common_1.Get)('check/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('post_type')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserPostShareController.prototype, "isPostSharedByUser", null);
exports.UserPostShareController = UserPostShareController = __decorate([
    (0, common_1.Controller)('user-post-shares'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_post_share_service_1.UserPostShareService])
], UserPostShareController);
//# sourceMappingURL=user-post-share.controller.js.map