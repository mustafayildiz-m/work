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
exports.UserPostShareService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_post_share_entity_1 = require("../entities/user-post-share.entity");
const user_post_entity_1 = require("../entities/user-post.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
let UserPostShareService = class UserPostShareService {
    constructor(userPostShareRepository, userPostRepository, scholarPostRepository) {
        this.userPostShareRepository = userPostShareRepository;
        this.userPostRepository = userPostRepository;
        this.scholarPostRepository = scholarPostRepository;
    }
    async sharePost(userId, postId, postType = 'user') {
        let postExists = false;
        if (postType === 'user') {
            const post = await this.userPostRepository.findOne({
                where: { id: parseInt(postId) }
            });
            postExists = !!post;
        }
        else if (postType === 'scholar') {
            const post = await this.scholarPostRepository.findOne({
                where: { id: postId }
            });
            postExists = !!post;
        }
        if (!postExists) {
            throw new Error('Gönderi bulunamadı');
        }
        const existingShare = await this.userPostShareRepository.findOne({
            where: { user_id: userId, post_id: postId, post_type: postType }
        });
        if (existingShare) {
            throw new Error('Bu gönderiyi zaten paylaştınız');
        }
        const share = this.userPostShareRepository.create({
            user_id: userId,
            post_id: postId,
            post_type: postType
        });
        const savedShare = await this.userPostShareRepository.save(share);
        return { success: true, message: 'Gönderi başarıyla paylaşıldı', share: savedShare };
    }
    async unsharePost(userId, postId, postType = 'user') {
        const share = await this.userPostShareRepository.findOne({
            where: { user_id: userId, post_id: postId, post_type: postType }
        });
        if (!share) {
            throw new Error('Bu gönderiyi paylaşmamışsınız');
        }
        await this.userPostShareRepository.remove(share);
        return { success: true, message: 'Paylaşım kaldırıldı' };
    }
    async getUserShares(userId, limit = 20, offset = 0) {
        const [shares, total] = await this.userPostShareRepository.findAndCount({
            where: { user_id: userId },
            relations: ['post', 'post.user'],
            take: limit,
            skip: offset,
            order: { created_at: 'DESC' }
        });
        return {
            shares,
            total,
            hasMore: (offset + limit) < total
        };
    }
    async getPostShareCount(postId, postType = 'user') {
        return await this.userPostShareRepository.count({
            where: { post_id: postId, post_type: postType }
        });
    }
    async isPostSharedByUser(userId, postId, postType = 'user') {
        const share = await this.userPostShareRepository.findOne({
            where: { user_id: userId, post_id: postId, post_type: postType }
        });
        return !!share;
    }
};
exports.UserPostShareService = UserPostShareService;
exports.UserPostShareService = UserPostShareService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_post_share_entity_1.UserPostShare)),
    __param(1, (0, typeorm_1.InjectRepository)(user_post_entity_1.UserPost)),
    __param(2, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserPostShareService);
//# sourceMappingURL=user-post-share.service.js.map