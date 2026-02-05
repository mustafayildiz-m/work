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
exports.UserPostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_post_entity_1 = require("../entities/user-post.entity");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_post_comment_entity_1 = require("../entities/user-post-comment.entity");
const user_post_share_entity_1 = require("../entities/user-post-share.entity");
const cache_service_1 = require("./cache.service");
let UserPostsService = class UserPostsService {
    constructor(userPostRepository, userFollowRepository, userScholarFollowRepository, scholarPostRepository, userRepository, scholarRepository, userPostCommentRepository, userPostShareRepository, cacheService) {
        this.userPostRepository = userPostRepository;
        this.userFollowRepository = userFollowRepository;
        this.userScholarFollowRepository = userScholarFollowRepository;
        this.scholarPostRepository = scholarPostRepository;
        this.userRepository = userRepository;
        this.scholarRepository = scholarRepository;
        this.userPostCommentRepository = userPostCommentRepository;
        this.userPostShareRepository = userPostShareRepository;
        this.cacheService = cacheService;
    }
    async create(createUserPostDto) {
        const post = this.userPostRepository.create({
            ...createUserPostDto,
            status: user_post_entity_1.PostStatus.PENDING,
        });
        const savedPost = await this.userPostRepository.save(post);
        await this.clearTimelineCacheForUser(savedPost.user_id);
        return savedPost;
    }
    findAll() {
        return this.userPostRepository.find();
    }
    findOne(id) {
        return this.userPostRepository.findOneBy({ id });
    }
    async update(id, updateUserPostDto) {
        const post = await this.userPostRepository.findOneBy({ id });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const { status, approved_by, ...updateData } = updateUserPostDto;
        await this.userPostRepository.update(id, {
            ...updateData,
            status: user_post_entity_1.PostStatus.PENDING,
            approved_by: null,
        });
        const updatedPost = await this.userPostRepository.findOneBy({ id });
        if (!updatedPost)
            throw new common_1.NotFoundException('Post not found after update');
        await this.clearTimelineCacheForUser(updatedPost.user_id);
        return updatedPost;
    }
    async remove(id) {
        const post = await this.userPostRepository.findOneBy({ id });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const userId = post.user_id;
        await this.userPostRepository.remove(post);
        await this.clearTimelineCacheForUser(userId);
        return { deleted: true };
    }
    async getTimeline(userId, language = 'tr') {
        const cacheKey = `user-posts:timeline:${userId}:${language}:v4`;
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const following = await this.userFollowRepository.find({
            where: { follower_id: userId },
            select: ['following_id'],
        });
        const followingIds = following.map((f) => f.following_id);
        const scholarFollowing = await this.userScholarFollowRepository.find({
            where: { user_id: userId },
            select: ['scholar_id'],
        });
        const scholarIds = scholarFollowing.map((f) => f.scholar_id);
        const allUserIds = [userId, ...followingIds];
        let allUserPosts = [];
        if (allUserIds.length > 0) {
            allUserPosts = await this.userPostRepository.find({
                where: {
                    user_id: (0, typeorm_2.In)(allUserIds),
                    status: user_post_entity_1.PostStatus.APPROVED,
                },
                order: { created_at: 'DESC' },
                take: 100,
            });
        }
        allUserPosts.sort((a, b) => {
            const aDate = a.shared_at
                ? new Date(a.shared_at)
                : new Date(a.created_at);
            const bDate = b.shared_at
                ? new Date(b.shared_at)
                : new Date(b.created_at);
            return bDate.getTime() - aDate.getTime();
        });
        const scholarPosts = scholarIds.length > 0
            ? await this.scholarPostRepository.find({
                where: { scholarId: (0, typeorm_2.In)(scholarIds) },
                relations: ['scholar', 'translations'],
                order: { createdAt: 'DESC' },
                take: 50,
            })
            : [];
        const sharedPosts = await this.userPostShareRepository.find({
            where: { user_id: (0, typeorm_2.In)(allUserIds) },
            relations: ['user'],
            order: { created_at: 'DESC' },
            take: 50,
        });
        const sharedUserPosts = [];
        const sharedScholarPosts = [];
        const sharedUserPostIds = sharedPosts
            .filter((share) => share.post_type === 'user')
            .map((share) => Number(share.post_id));
        const sharedScholarPostIds = sharedPosts
            .filter((share) => share.post_type === 'scholar')
            .map((share) => share.post_id);
        let originalUserPosts = [];
        if (sharedUserPostIds.length > 0) {
            originalUserPosts = await this.userPostRepository.find({
                where: {
                    id: (0, typeorm_2.In)(sharedUserPostIds),
                    status: user_post_entity_1.PostStatus.APPROVED,
                },
                relations: ['user'],
            });
        }
        let originalScholarPosts = [];
        if (sharedScholarPostIds.length > 0) {
            originalScholarPosts = await this.scholarPostRepository.find({
                where: { id: (0, typeorm_2.In)(sharedScholarPostIds) },
                relations: ['scholar', 'translations'],
            });
        }
        for (const share of sharedPosts) {
            if (share.post_type === 'user') {
                const originalPost = originalUserPosts.find((p) => p.id === Number(share.post_id));
                if (originalPost) {
                    sharedUserPosts.push({
                        ...originalPost,
                        isShared: true,
                        shared_at: share.created_at,
                        shared_by_user: share.user,
                        original_user: originalPost.user,
                    });
                }
            }
            else if (share.post_type === 'scholar') {
                const originalPost = originalScholarPosts.find((p) => p.id === share.post_id);
                if (originalPost) {
                    sharedScholarPosts.push({
                        ...originalPost,
                        isShared: true,
                        shared_at: share.created_at,
                        shared_by_user: share.user,
                        original_scholar: originalPost.scholar,
                    });
                }
            }
        }
        allUserPosts.push(...sharedUserPosts);
        scholarPosts.push(...sharedScholarPosts);
        scholarPosts.sort((a, b) => {
            const aDate = a.shared_at
                ? new Date(a.shared_at)
                : new Date(a.createdAt);
            const bDate = b.shared_at
                ? new Date(b.shared_at)
                : new Date(b.createdAt);
            return bDate.getTime() - aDate.getTime();
        });
        const userIds = [...new Set(allUserPosts.map((p) => p.user_id))];
        const users = userIds.length > 0
            ? await this.userRepository.find({
                where: { id: (0, typeorm_2.In)(userIds) },
                select: ['id', 'firstName', 'lastName', 'photoUrl', 'username', 'role'],
            })
            : [];
        const userMap = new Map(users.map((u) => [u.id, u]));
        const scholarIdsForPosts = [
            ...new Set(scholarPosts.map((p) => p.scholarId)),
        ];
        const scholars = scholarIdsForPosts.length > 0
            ? await this.scholarRepository.find({
                where: { id: (0, typeorm_2.In)(scholarIdsForPosts) },
                select: ['id', 'fullName', 'photoUrl'],
            })
            : [];
        const scholarMap = new Map(scholars.map((s) => [s.id, s]));
        const userPostIds = allUserPosts.map((p) => p.id);
        let commentCounts = new Map();
        if (userPostIds.length > 0) {
            const commentCountResults = await this.userPostCommentRepository
                .createQueryBuilder('comment')
                .select('comment.post_id', 'post_id')
                .addSelect('COUNT(comment.id)', 'count')
                .where('comment.post_id IN (:...postIds)', { postIds: userPostIds })
                .groupBy('comment.post_id')
                .getRawMany();
            commentCounts = new Map(commentCountResults.map((r) => [r.post_id, parseInt(r.count)]));
        }
        const getTimeAgo = (date) => {
            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            if (diffInMinutes < 1)
                return 'Az önce';
            if (diffInMinutes < 60)
                return `${diffInMinutes} dakika önce`;
            if (diffInHours < 24)
                return `${diffInHours} saat önce`;
            if (diffInDays < 7)
                return `${diffInDays} gün önce`;
            if (diffInDays < 30)
                return `${Math.floor(diffInDays / 7)} hafta önce`;
            if (diffInDays < 365)
                return `${Math.floor(diffInDays / 30)} ay önce`;
            return `${Math.floor(diffInDays / 365)} yıl önce`;
        };
        const normalizedUserPosts = allUserPosts.map((p) => {
            const user = userMap.get(p.user_id);
            const commentCount = commentCounts.get(p.id) || 0;
            return {
                type: p.type || 'user',
                id: p.id,
                user_id: p.user_id,
                scholar_id: null,
                content: p.content,
                title: p.title,
                image_url: p.image_url,
                video_url: p.video_url,
                created_at: p.created_at,
                updated_at: p.updated_at,
                timeAgo: getTimeAgo(p.created_at),
                user_name: user ? `${user.firstName} ${user.lastName}` : null,
                user_username: user ? user.username : null,
                user_photo_url: user ? user.photoUrl : null,
                user_role: user ? user.role : null,
                ownPost: p.user_id === userId,
                comment_count: commentCount,
                isShared: p.isShared || false,
                shared_at: p.shared_at || null,
                shared_by_user: p.shared_by_user || null,
                original_user: p.original_user || null,
                shared_profile_type: p.shared_profile_type || null,
                shared_profile_id: p.shared_profile_id || null,
                shared_book_id: p.shared_book_id || null,
                shared_article_id: p.shared_article_id || null,
            };
        });
        const normalizedScholarPosts = scholarPosts.map((p) => {
            const scholar = p.scholar || scholarMap.get(p.scholarId);
            const translation = p.translations?.find((t) => t.language === language) ||
                p.translations?.find((t) => t.language === 'tr') ||
                p.translations?.[0];
            return {
                type: 'scholar',
                id: p.id,
                user_id: null,
                scholar_id: p.scholarId,
                content: translation?.content || '',
                title: null,
                image_url: null,
                video_url: null,
                mediaUrls: translation?.mediaUrls || [],
                fileUrls: translation?.fileUrls || [],
                created_at: p.createdAt,
                updated_at: p.updatedAt,
                timeAgo: getTimeAgo(p.createdAt),
                scholar_name: scholar ? scholar.fullName : `Scholar ${p.scholarId}`,
                scholar_photo_url: scholar ? scholar.photoUrl : null,
                ownPost: false,
                isShared: p.isShared || false,
                shared_at: p.shared_at || null,
                shared_by_user: p.shared_by_user || null,
                original_scholar: p.original_scholar || null,
                translations: p.translations || [],
            };
        });
        const allPosts = [...normalizedUserPosts, ...normalizedScholarPosts];
        allPosts.sort((a, b) => {
            const aDate = a.shared_at
                ? new Date(a.shared_at)
                : new Date(a.created_at);
            const bDate = b.shared_at
                ? new Date(b.shared_at)
                : new Date(b.created_at);
            return bDate.getTime() - aDate.getTime();
        });
        await this.cacheService.set(cacheKey, allPosts, 600);
        return allPosts;
    }
    async getUserPosts(userId, includePending = false) {
        const whereCondition = { user_id: userId };
        if (includePending) {
            whereCondition.status = (0, typeorm_2.In)([user_post_entity_1.PostStatus.APPROVED, user_post_entity_1.PostStatus.PENDING]);
        }
        else {
            whereCondition.status = user_post_entity_1.PostStatus.APPROVED;
        }
        const posts = await this.userPostRepository.find({
            where: whereCondition,
            order: { created_at: 'DESC' },
        });
        const shares = await this.userPostShareRepository.find({
            where: { user_id: userId },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
        const sharedUserPostIds = shares
            .filter((share) => share.post_type === 'user')
            .map((share) => Number(share.post_id));
        let originalSharedPosts = [];
        if (sharedUserPostIds.length > 0) {
            originalSharedPosts = await this.userPostRepository.find({
                where: {
                    id: (0, typeorm_2.In)(sharedUserPostIds),
                    status: user_post_entity_1.PostStatus.APPROVED,
                },
                relations: ['user'],
            });
        }
        const sharedPostsMapped = shares
            .map((share) => {
            if (share.post_type === 'user') {
                const original = originalSharedPosts.find((p) => p.id === Number(share.post_id));
                if (original) {
                    return {
                        ...original,
                        isShared: true,
                        shared_at: share.created_at,
                        shared_by_user: share.user,
                        original_user: original.user,
                        created_at: original.created_at,
                    };
                }
            }
            return null;
        })
            .filter((post) => post !== null);
        const allPosts = [...posts, ...sharedPostsMapped];
        allPosts.sort((a, b) => {
            const dateA = a.shared_at
                ? new Date(a.shared_at)
                : new Date(a.created_at);
            const dateB = b.shared_at
                ? new Date(b.shared_at)
                : new Date(b.created_at);
            return dateB.getTime() - dateA.getTime();
        });
        const profileUser = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'firstName', 'lastName', 'photoUrl', 'username', 'role'],
        });
        const getTimeAgo = (date) => {
            const now = new Date();
            if (!date)
                return '';
            const diffInMs = now.getTime() - new Date(date).getTime();
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            if (diffInMinutes < 1)
                return 'Az önce';
            if (diffInMinutes < 60)
                return `${diffInMinutes} dakika önce`;
            if (diffInHours < 24)
                return `${diffInHours} saat önce`;
            if (diffInDays < 7)
                return `${diffInDays} gün önce`;
            if (diffInDays < 30)
                return `${Math.floor(diffInDays / 7)} hafta önce`;
            if (diffInDays < 365)
                return `${Math.floor(diffInDays / 30)} ay önce`;
            return `${Math.floor(diffInDays / 365)} yıl önce`;
        };
        return allPosts.map((post) => {
            const isShared = post.isShared;
            const author = isShared ? post.original_user : profileUser;
            const displayDate = isShared ? post.shared_at : post.created_at;
            return {
                id: post.id,
                user_id: post.user_id,
                type: post.type || null,
                content: post.content,
                title: post.title,
                image_url: post.image_url,
                video_url: post.video_url,
                created_at: post.created_at,
                updated_at: post.updated_at,
                timeAgo: getTimeAgo(displayDate),
                status: post.status,
                user_name: author ? `${author.firstName} ${author.lastName}` : null,
                user_username: author ? author.username : null,
                user_photo_url: author ? author.photoUrl : null,
                user_role: author ? author.role : null,
                ownPost: !isShared,
                isShared: isShared || false,
                shared_at: post.shared_at || null,
                shared_by_user: post.shared_by_user
                    ? {
                        name: `${post.shared_by_user.firstName} ${post.shared_by_user.lastName}`,
                        photoUrl: post.shared_by_user.photoUrl,
                    }
                    : null,
                original_user: post.original_user || null,
                shared_profile_type: post.shared_profile_type || null,
                shared_profile_id: post.shared_profile_id || null,
                shared_book_id: post.shared_book_id || null,
                shared_article_id: post.shared_article_id || null,
            };
        });
    }
    async getSharedProfileData(profileType, profileId) {
        if (profileType === 'user') {
            const user = await this.userRepository.findOne({
                where: { id: profileId },
                select: [
                    'id',
                    'firstName',
                    'lastName',
                    'photoUrl',
                    'username',
                    'biography',
                ],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return {
                type: 'user',
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                username: user.username,
                photoUrl: user.photoUrl,
                biography: user.biography,
            };
        }
        else if (profileType === 'scholar') {
            const scholar = await this.scholarRepository.findOne({
                where: { id: profileId },
                select: [
                    'id',
                    'fullName',
                    'photoUrl',
                    'biography',
                    'birthDate',
                    'deathDate',
                ],
            });
            if (!scholar) {
                throw new common_1.NotFoundException('Scholar not found');
            }
            return {
                type: 'scholar',
                id: scholar.id,
                name: scholar.fullName,
                photoUrl: scholar.photoUrl,
                biography: scholar.biography,
                birthDate: scholar.birthDate,
                deathDate: scholar.deathDate,
            };
        }
        throw new common_1.NotFoundException('Invalid profile type');
    }
    async approvePost(postId, adminUserId) {
        const post = await this.userPostRepository.findOneBy({ id: postId });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        post.status = user_post_entity_1.PostStatus.APPROVED;
        post.approved_by = adminUserId;
        const updatedPost = await this.userPostRepository.save(post);
        await this.clearTimelineCacheForUser(updatedPost.user_id);
        return updatedPost;
    }
    async rejectPost(postId, adminUserId) {
        const post = await this.userPostRepository.findOneBy({ id: postId });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        post.status = user_post_entity_1.PostStatus.REJECTED;
        post.approved_by = adminUserId;
        const updatedPost = await this.userPostRepository.save(post);
        await this.clearTimelineCacheForUser(updatedPost.user_id);
        return updatedPost;
    }
    async getPendingPosts() {
        return this.userPostRepository.find({
            where: { status: user_post_entity_1.PostStatus.PENDING },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }
    async clearTimelineCacheForUser(userId) {
        const languages = ['tr', 'en', 'ar'];
        for (const lang of languages) {
            const cacheKey = `user-posts:timeline:${userId}:${lang}:v4`;
            await this.cacheService.del(cacheKey);
        }
        const followers = await this.userFollowRepository.find({
            where: { following_id: userId },
            select: ['follower_id'],
        });
        for (const follower of followers) {
            for (const lang of languages) {
                const cacheKey = `user-posts:timeline:${follower.follower_id}:${lang}:v4`;
                await this.cacheService.del(cacheKey);
            }
        }
    }
};
exports.UserPostsService = UserPostsService;
exports.UserPostsService = UserPostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_post_entity_1.UserPost)),
    __param(1, (0, typeorm_1.InjectRepository)(user_follow_entity_1.UserFollow)),
    __param(2, (0, typeorm_1.InjectRepository)(user_scholar_follow_entity_1.UserScholarFollow)),
    __param(3, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(6, (0, typeorm_1.InjectRepository)(user_post_comment_entity_1.UserPostComment)),
    __param(7, (0, typeorm_1.InjectRepository)(user_post_share_entity_1.UserPostShare)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cache_service_1.CacheService])
], UserPostsService);
//# sourceMappingURL=user-posts.service.js.map