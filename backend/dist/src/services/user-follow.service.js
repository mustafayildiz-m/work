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
exports.UserFollowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_post_entity_1 = require("../entities/user-post.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
const cache_service_1 = require("./cache.service");
let UserFollowService = class UserFollowService {
    constructor(userFollowRepository, userRepository, userPostRepository, scholarPostRepository, userScholarFollowRepository, cacheService) {
        this.userFollowRepository = userFollowRepository;
        this.userRepository = userRepository;
        this.userPostRepository = userPostRepository;
        this.scholarPostRepository = scholarPostRepository;
        this.userScholarFollowRepository = userScholarFollowRepository;
        this.cacheService = cacheService;
    }
    async invalidateFollowingCache(userId) {
        try {
            await this.cacheService.delPattern(`following:*:${userId}:*`);
            await this.cacheService.delPattern(`following:*:${userId}`);
        }
        catch (error) {
            console.error('Following cache invalidation error:', error.message);
        }
    }
    async follow(follower_id, following_id) {
        if (follower_id === following_id)
            throw new common_1.NotFoundException('Kendini takip edemezsin.');
        const existing = await this.userFollowRepository.findOneBy({
            follower_id,
            following_id,
        });
        if (existing)
            return existing;
        const follow = this.userFollowRepository.create({
            follower_id,
            following_id,
        });
        const savedFollow = await this.userFollowRepository.save(follow);
        await this.invalidateFollowingCache(follower_id);
        await this.invalidateFollowingCache(following_id);
        return savedFollow;
    }
    async unfollow(follower_id, following_id) {
        const follow = await this.userFollowRepository.findOneBy({
            follower_id,
            following_id,
        });
        if (!follow)
            throw new common_1.NotFoundException('Takip ilişkisi bulunamadı.');
        await this.userFollowRepository.remove(follow);
        await this.invalidateFollowingCache(follower_id);
        await this.invalidateFollowingCache(following_id);
        return { unfollowed: true };
    }
    async findFollow(follower_id, following_id) {
        return this.userFollowRepository.findOneBy({ follower_id, following_id });
    }
    async getFollowingUsers(userId, limit = 20, offset = 0) {
        const following = await this.userFollowRepository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.following', 'user')
            .select([
            'follow.id',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
            'user.isActive',
        ])
            .where('follow.follower_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return following.map((follow) => ({
            id: follow.following.id,
            firstName: follow.following.firstName,
            lastName: follow.following.lastName,
            username: follow.following.username,
            photoUrl: follow.following.photoUrl,
            role: follow.following.role,
            followId: follow.id,
            followedAt: follow.id,
        }));
    }
    async getFollowers(userId, limit = 20, offset = 0) {
        const cacheKey = `following:followers:${userId}:${limit}:${offset}`;
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const followers = await this.userFollowRepository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.follower', 'user')
            .select([
            'follow.id',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
            'user.isActive',
        ])
            .where('follow.following_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        const result = followers.map((follow) => ({
            id: follow.follower.id,
            firstName: follow.follower.firstName,
            lastName: follow.follower.lastName,
            username: follow.follower.username,
            photoUrl: follow.follower.photoUrl,
            role: follow.follower.role,
            followId: follow.id,
            followedAt: follow.id,
        }));
        await this.cacheService.set(cacheKey, result, 120);
        return result;
    }
    async getFollowingCount(userId) {
        return this.userFollowRepository.count({
            where: { follower_id: userId },
        });
    }
    async getFollowersCount(userId) {
        return this.userFollowRepository.count({
            where: { following_id: userId },
        });
    }
    async getRecentPostsFromFollowing(userId, limit = 5, language = 'tr') {
        try {
            const followingUsers = await this.userFollowRepository
                .createQueryBuilder('follow')
                .select('follow.following_id')
                .where('follow.follower_id = :userId', { userId })
                .getMany();
            const followingUserIds = followingUsers.map((f) => f.following_id);
            const userPosts = await this.getUserPosts(followingUserIds, Math.ceil(limit / 2));
            const scholarPosts = await this.getScholarPosts(userId, Math.ceil(limit / 2), language);
            const allPosts = [...userPosts, ...scholarPosts];
            allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return allPosts.slice(0, limit);
        }
        catch (error) {
            console.error('❌ Error in getRecentPostsFromFollowing:', error.message);
            throw new Error(`Son post'lar getirilirken hata: ${error.message}`);
        }
    }
    async getUserPosts(userIds, limit) {
        if (userIds.length === 0)
            return [];
        const posts = await this.userPostRepository.find({
            where: { user_id: (0, typeorm_2.In)(userIds) },
            order: { created_at: 'DESC' },
            take: limit,
        });
        const postsWithUsers = await Promise.all(posts.map(async (post) => {
            const user = await this.userRepository.findOne({
                where: { id: post.user_id, isActive: true },
                select: [
                    'id',
                    'firstName',
                    'lastName',
                    'username',
                    'photoUrl',
                    'role',
                ],
            });
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
                author: {
                    id: user?.id,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    username: user?.username,
                    photoUrl: user?.photoUrl,
                    role: user?.role,
                    type: 'user',
                },
                type: 'user_post',
            };
        }));
        return postsWithUsers;
    }
    async getScholarPosts(userId, limit, language = 'tr') {
        try {
            const followingScholars = await this.userScholarFollowRepository
                .createQueryBuilder('follow')
                .select('follow.scholar_id')
                .where('follow.user_id = :userId', { userId })
                .getMany();
            const followingScholarIds = followingScholars.map((f) => f.scholar_id);
            if (followingScholarIds.length === 0)
                return [];
            const posts = await this.scholarPostRepository.find({
                where: { scholarId: (0, typeorm_2.In)(followingScholarIds) },
                relations: ['scholar', 'translations'],
                order: { createdAt: 'DESC' },
                take: limit,
            });
            return posts.map((post) => {
                const translation = post.translations?.find((t) => t.language === language) ||
                    post.translations?.find((t) => t.language === 'tr') ||
                    post.translations?.[0];
                return {
                    id: post.id,
                    content: translation?.content || '',
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    author: {
                        id: post.scholar?.id,
                        fullName: post.scholar?.fullName,
                        photoUrl: post.scholar?.photoUrl,
                        biography: post.scholar?.biography,
                        type: 'scholar',
                    },
                    type: 'scholar_post',
                };
            });
        }
        catch (error) {
            console.error("Alim post'ları getirilirken hata:", error);
            return [];
        }
    }
};
exports.UserFollowService = UserFollowService;
exports.UserFollowService = UserFollowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_follow_entity_1.UserFollow)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_post_entity_1.UserPost)),
    __param(3, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __param(4, (0, typeorm_1.InjectRepository)(user_scholar_follow_entity_1.UserScholarFollow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cache_service_1.CacheService])
], UserFollowService);
//# sourceMappingURL=user-follow.service.js.map