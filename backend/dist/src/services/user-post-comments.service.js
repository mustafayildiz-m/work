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
exports.UserPostCommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_post_comment_entity_1 = require("../entities/user-post-comment.entity");
const user_entity_1 = require("../users/entities/user.entity");
let UserPostCommentsService = class UserPostCommentsService {
    constructor(userPostCommentRepository, userRepository) {
        this.userPostCommentRepository = userPostCommentRepository;
        this.userRepository = userRepository;
    }
    async create(createUserPostCommentDto, userId) {
        const commentData = {
            post_id: createUserPostCommentDto.post_id,
            content: createUserPostCommentDto.content,
            user_id: userId,
        };
        const comment = this.userPostCommentRepository.create(commentData);
        const savedComment = await this.userPostCommentRepository.save(comment);
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
        });
        return {
            ...savedComment,
            user_name: user ? `${user.firstName} ${user.lastName}` : null,
            user_username: user ? user.username : null,
            user_photo_url: user ? user.photoUrl : null,
        };
    }
    async findByPostId(postId) {
        const comments = await this.userPostCommentRepository.find({
            where: { post_id: postId },
            order: { created_at: 'ASC' },
        });
        const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
            const user = await this.userRepository.findOne({
                where: { id: comment.user_id },
                select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
            });
            return {
                ...comment,
                user_name: user ? `${user.firstName} ${user.lastName}` : null,
                user_username: user ? user.username : null,
                user_photo_url: user ? user.photoUrl : null,
            };
        }));
        return commentsWithUserInfo;
    }
    async findOne(id) {
        const comment = await this.userPostCommentRepository.findOneBy({ id });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        return comment;
    }
    async update(id, updateUserPostCommentDto, userId) {
        const comment = await this.findOne(id);
        if (comment.user_id !== userId) {
            throw new common_1.ForbiddenException('You can only update your own comments');
        }
        Object.assign(comment, updateUserPostCommentDto);
        const updatedComment = await this.userPostCommentRepository.save(comment);
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
        });
        return {
            ...updatedComment,
            user_name: user ? `${user.firstName} ${user.lastName}` : null,
            user_username: user ? user.username : null,
            user_photo_url: user ? user.photoUrl : null,
        };
    }
    async remove(id, userId) {
        const comment = await this.findOne(id);
        if (comment.user_id !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.userPostCommentRepository.remove(comment);
        return { deleted: true };
    }
    async getCommentCount(postId) {
        return await this.userPostCommentRepository.count({
            where: { post_id: postId },
        });
    }
};
exports.UserPostCommentsService = UserPostCommentsService;
exports.UserPostCommentsService = UserPostCommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_post_comment_entity_1.UserPostComment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserPostCommentsService);
//# sourceMappingURL=user-post-comments.service.js.map