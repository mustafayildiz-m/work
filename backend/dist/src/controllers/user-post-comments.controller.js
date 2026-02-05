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
exports.UserPostCommentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_post_comments_service_1 = require("../services/user-post-comments.service");
const create_user_post_comment_dto_1 = require("../dto/user-post-comments/create-user-post-comment.dto");
const update_user_post_comment_dto_1 = require("../dto/user-post-comments/update-user-post-comment.dto");
let UserPostCommentsController = class UserPostCommentsController {
    constructor(userPostCommentsService) {
        this.userPostCommentsService = userPostCommentsService;
    }
    create(createUserPostCommentDto, req) {
        const userId = req.user.id;
        return this.userPostCommentsService.create(createUserPostCommentDto, userId);
    }
    findByPostId(postId) {
        return this.userPostCommentsService.findByPostId(postId);
    }
    findOne(id) {
        return this.userPostCommentsService.findOne(id);
    }
    update(id, updateUserPostCommentDto, req) {
        const userId = req.user.id;
        return this.userPostCommentsService.update(id, updateUserPostCommentDto, userId);
    }
    remove(id, req) {
        const userId = req.user.id;
        return this.userPostCommentsService.remove(id, userId);
    }
    getCommentCount(postId) {
        return this.userPostCommentsService.getCommentCount(postId);
    }
};
exports.UserPostCommentsController = UserPostCommentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_post_comment_dto_1.CreateUserPostCommentDto, Object]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('post/:postId'),
    __param(0, (0, common_1.Param)('postId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "findByPostId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_post_comment_dto_1.UpdateUserPostCommentDto, Object]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('count/:postId'),
    __param(0, (0, common_1.Param)('postId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPostCommentsController.prototype, "getCommentCount", null);
exports.UserPostCommentsController = UserPostCommentsController = __decorate([
    (0, common_1.Controller)('user-post-comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_post_comments_service_1.UserPostCommentsService])
], UserPostCommentsController);
//# sourceMappingURL=user-post-comments.controller.js.map