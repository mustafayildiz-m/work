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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
let SearchService = class SearchService {
    constructor(userRepository, scholarRepository, userFollowRepository, userScholarFollowRepository) {
        this.userRepository = userRepository;
        this.scholarRepository = scholarRepository;
        this.userFollowRepository = userFollowRepository;
        this.userScholarFollowRepository = userScholarFollowRepository;
    }
    async searchUsers(searchQuery, limit = 20, offset = 0, currentUserId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
            'user.isActive'
        ])
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` })
            .orderBy('user.firstName', 'ASC')
            .limit(limit)
            .offset(offset);
        if (currentUserId) {
            queryBuilder.andWhere('user.id != :currentUserId', { currentUserId });
        }
        const users = await queryBuilder.getMany();
        return users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            role: user.role,
            fullName: `${user.firstName} ${user.lastName}`
        }));
    }
    async getSearchUsersCount(searchQuery, currentUserId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` });
        if (currentUserId) {
            queryBuilder.andWhere('user.id != :currentUserId', { currentUserId });
        }
        return queryBuilder.getCount();
    }
    async searchFollowers(searchQuery, limit = 20, offset = 0, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
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
            'user.isActive'
        ])
            .where('follow.following_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return followers.map(follow => ({
            id: follow.follower.id,
            firstName: follow.follower.firstName,
            lastName: follow.follower.lastName,
            username: follow.follower.username,
            photoUrl: follow.follower.photoUrl,
            role: follow.follower.role,
            followId: follow.id,
            followedAt: follow.id,
            fullName: `${follow.follower.firstName} ${follow.follower.lastName}`
        }));
    }
    async getSearchFollowersCount(searchQuery, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        return this.userFollowRepository
            .createQueryBuilder('follow')
            .leftJoin('follow.follower', 'user')
            .where('follow.following_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` })
            .getCount();
    }
    async searchFollowing(searchQuery, limit = 20, offset = 0, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
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
            'user.isActive'
        ])
            .where('follow.follower_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return following.map(follow => ({
            id: follow.following.id,
            firstName: follow.following.firstName,
            lastName: follow.following.lastName,
            username: follow.following.username,
            photoUrl: follow.following.photoUrl,
            role: follow.following.role,
            followId: follow.id,
            followedAt: follow.id,
            fullName: `${follow.following.firstName} ${follow.following.lastName}`
        }));
    }
    async getSearchFollowingCount(searchQuery, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        return this.userFollowRepository
            .createQueryBuilder('follow')
            .leftJoin('follow.following', 'user')
            .where('follow.follower_id = :userId', { userId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .andWhere('(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)', { searchQuery: `%${searchTerm}%` })
            .getCount();
    }
    async searchScholars(searchQuery, limit = 20, offset = 0, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        console.log('🔍 Scholar Search - Original Query:', searchQuery);
        console.log('🔍 Scholar Search - Search Term (uppercase):', searchTerm);
        console.log('🔍 Scholar Search - Pattern:', `%${searchTerm}%`);
        const queryBuilder = this.scholarRepository
            .createQueryBuilder('scholar')
            .select([
            'scholar.id',
            'scholar.fullName',
            'scholar.photoUrl',
            'scholar.birthDate',
            'scholar.deathDate',
            'scholar.locationName',
            'scholar.biography'
        ])
            .where('UPPER(scholar.fullName) LIKE :searchQuery', { searchQuery: `%${searchTerm}%` })
            .orderBy('scholar.fullName', 'ASC')
            .limit(limit)
            .offset(offset);
        const scholars = await queryBuilder.getMany();
        console.log('🔍 Scholar Search - Found scholars:', scholars.length);
        if (scholars.length > 0) {
            console.log('🔍 First scholar:', scholars[0].fullName);
        }
        if (userId) {
            const scholarIds = scholars.map(s => s.id);
            if (scholarIds.length === 0) {
                return scholars.map(scholar => ({
                    ...scholar,
                    isFollowed: false
                }));
            }
            const followedScholars = await this.userScholarFollowRepository
                .createQueryBuilder('follow')
                .select(['follow.scholar_id'])
                .where('follow.user_id = :userId', { userId })
                .andWhere('follow.scholar_id IN (:...scholarIds)', { scholarIds })
                .getMany();
            const followedScholarIds = followedScholars.map(f => f.scholar_id);
            return scholars.map(scholar => ({
                ...scholar,
                isFollowed: followedScholarIds.includes(scholar.id)
            }));
        }
        return scholars;
    }
    async getSearchScholarsCount(searchQuery, userId) {
        const searchTerm = searchQuery.trim().toUpperCase();
        return this.scholarRepository
            .createQueryBuilder('scholar')
            .where('UPPER(scholar.fullName) LIKE :searchQuery', { searchQuery: `%${searchTerm}%` })
            .getCount();
    }
    async generalSearch(searchQuery, type, limit = 20, offset = 0, userId) {
        const results = [];
        let totalCount = 0;
        if (type === 'all' || type === 'users') {
            const [users, userCount] = await Promise.all([
                this.searchUsers(searchQuery, Math.ceil(limit / 2), offset, userId),
                this.getSearchUsersCount(searchQuery, userId)
            ]);
            const userResults = users.map(user => ({
                ...user,
                type: 'user'
            }));
            results.push(...userResults);
            totalCount += userCount;
        }
        if (type === 'all' || type === 'scholars') {
            const [scholars, scholarCount] = await Promise.all([
                this.searchScholars(searchQuery, Math.ceil(limit / 2), offset, userId),
                this.getSearchScholarsCount(searchQuery, userId)
            ]);
            const scholarResults = scholars.map(scholar => ({
                ...scholar,
                type: 'scholar'
            }));
            results.push(...scholarResults);
            totalCount += scholarCount;
        }
        const shuffledResults = results.sort(() => Math.random() - 0.5);
        const finalResults = shuffledResults.slice(0, limit);
        return {
            results: finalResults,
            totalCount,
            hasMore: (offset + limit) < totalCount,
            searchQuery
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(2, (0, typeorm_1.InjectRepository)(user_follow_entity_1.UserFollow)),
    __param(3, (0, typeorm_1.InjectRepository)(user_scholar_follow_entity_1.UserScholarFollow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map