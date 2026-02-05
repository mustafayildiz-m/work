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
exports.WhoToFollowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_follow_service_1 = require("./user-follow.service");
const user_scholar_follow_service_1 = require("./user-scholar-follow.service");
const cache_service_1 = require("./cache.service");
let WhoToFollowService = class WhoToFollowService {
    constructor(userRepository, scholarRepository, userFollowService, userScholarFollowService, cacheService) {
        this.userRepository = userRepository;
        this.scholarRepository = scholarRepository;
        this.userFollowService = userFollowService;
        this.userScholarFollowService = userScholarFollowService;
        this.cacheService = cacheService;
    }
    async getWhoToFollow(limit = 10, type = 'all', userId) {
        const cacheKey = `who-to-follow:${type}:${userId || 'guest'}:${limit}`;
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const result = [];
        if (type === 'all' || type === 'users') {
            const userLimit = type === 'users' ? limit : Math.ceil(limit / 2);
            const userQuery = await this.userRepository
                .createQueryBuilder('user')
                .select([
                'user.id',
                'user.firstName',
                'user.lastName',
                'user.username',
                'user.photoUrl',
                'user.role',
            ])
                .where('user.isActive = :isActive', { isActive: true });
            if (userId) {
                userQuery.andWhere('user.id != :userId', { userId });
            }
            const users = await userQuery
                .orderBy('RAND()')
                .limit(userLimit)
                .getMany();
            const userItems = await Promise.all(users.map(async (user) => {
                let isFollowing = false;
                if (userId) {
                    try {
                        const followRecord = await this.userFollowService.findFollow(userId, user.id);
                        isFollowing = !!followRecord;
                    }
                    catch (error) {
                        isFollowing = false;
                    }
                }
                return {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    description: user.biography,
                    photoUrl: user.photoUrl,
                    type: 'user',
                    username: user.username,
                    role: user.role,
                    isFollowing,
                };
            }));
            result.push(...userItems);
        }
        if (type === 'all' || type === 'scholars') {
            const scholarLimit = type === 'scholars' ? limit : Math.ceil(limit / 2);
            const scholars = await this.scholarRepository
                .createQueryBuilder('scholar')
                .select([
                'scholar.id',
                'scholar.fullName',
                'scholar.photoUrl',
                'scholar.biography',
            ])
                .orderBy('RAND()')
                .limit(scholarLimit)
                .getMany();
            const scholarItems = await Promise.all(scholars.map(async (scholar) => {
                let isFollowing = false;
                if (userId) {
                    try {
                        const followRecord = await this.userScholarFollowService.findFollow(userId, scholar.id);
                        isFollowing = !!followRecord;
                    }
                    catch (error) {
                        isFollowing = false;
                    }
                }
                return {
                    id: scholar.id,
                    name: scholar.fullName,
                    description: this.getScholarDescription(scholar.biography),
                    photoUrl: scholar.photoUrl,
                    type: 'scholar',
                    fullName: scholar.fullName,
                    isFollowing,
                };
            }));
            result.push(...scholarItems);
        }
        if (result.length < limit) {
            const remainingLimit = limit - result.length;
            if (type === 'all') {
                const userCount = result.filter((item) => item.type === 'user').length;
                const scholarCount = result.filter((item) => item.type === 'scholar').length;
                if (userCount < scholarCount) {
                    const additionalUsers = await this.getAdditionalUsers(remainingLimit, userId, result.map((item) => item.id));
                    result.push(...additionalUsers);
                }
                else {
                    const additionalScholars = await this.getAdditionalScholars(remainingLimit, userId, result.map((item) => item.id));
                    result.push(...additionalScholars);
                }
            }
            else if (type === 'users') {
                const additionalUsers = await this.getAdditionalUsers(remainingLimit, userId, result.map((item) => item.id));
                result.push(...additionalUsers);
            }
            else if (type === 'scholars') {
                const additionalScholars = await this.getAdditionalScholars(remainingLimit, userId, result.map((item) => item.id));
                result.push(...additionalScholars);
            }
        }
        const finalResult = this.shuffleArray(result).slice(0, limit);
        await this.cacheService.set(cacheKey, finalResult, 300);
        return finalResult;
    }
    getUserDescription(role) {
        switch (role) {
            case 'admin':
                return 'Sistem Yöneticisi';
            case 'moderator':
                return 'Moderatör';
            default:
                return 'Kullanıcı';
        }
    }
    getScholarDescription(biography) {
        if (biography.length > 50) {
            return biography.substring(0, 50) + '...';
        }
        return biography;
    }
    async getAdditionalUsers(limit, userId, excludeIds = []) {
        const userQuery = this.userRepository
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
        ])
            .where('user.isActive = :isActive', { isActive: true });
        if (userId) {
            userQuery.andWhere('user.id != :userId', { userId });
        }
        if (excludeIds.length > 0) {
            userQuery.andWhere('user.id NOT IN (:...excludeIds)', { excludeIds });
        }
        const users = await userQuery.orderBy('RAND()').limit(limit).getMany();
        return Promise.all(users.map(async (user) => {
            let isFollowing = false;
            if (userId) {
                try {
                    const followRecord = await this.userFollowService.findFollow(userId, user.id);
                    isFollowing = !!followRecord;
                }
                catch (error) {
                    isFollowing = false;
                }
            }
            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                description: user.biography,
                photoUrl: user.photoUrl,
                type: 'user',
                username: user.username,
                role: user.role,
                isFollowing,
            };
        }));
    }
    async getAdditionalScholars(limit, userId, excludeIds = []) {
        const scholarQuery = this.scholarRepository
            .createQueryBuilder('scholar')
            .select([
            'scholar.id',
            'scholar.fullName',
            'scholar.photoUrl',
            'scholar.biography',
        ]);
        if (excludeIds.length > 0) {
            scholarQuery.where('scholar.id NOT IN (:...excludeIds)', { excludeIds });
        }
        const scholars = await scholarQuery
            .orderBy('RAND()')
            .limit(limit)
            .getMany();
        return Promise.all(scholars.map(async (scholar) => {
            let isFollowing = false;
            if (userId) {
                try {
                    const followRecord = await this.userScholarFollowService.findFollow(userId, scholar.id);
                    isFollowing = !!followRecord;
                }
                catch (error) {
                    isFollowing = false;
                }
            }
            return {
                id: scholar.id,
                name: scholar.fullName,
                description: this.getScholarDescription(scholar.biography),
                photoUrl: scholar.photoUrl,
                type: 'scholar',
                fullName: scholar.fullName,
                isFollowing,
            };
        }));
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    async getWhoToFollowUsers(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const userQuery = this.userRepository
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
            'user.biography',
        ])
            .where('user.isActive = :isActive', { isActive: true });
        if (userId) {
            userQuery.andWhere('user.id != :userId', { userId });
        }
        const users = await userQuery
            .orderBy('user.id', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
        const userItems = await Promise.all(users.map(async (user) => {
            let isFollowing = false;
            if (userId) {
                try {
                    const followRecord = await this.userFollowService.findFollow(userId, user.id);
                    isFollowing = !!followRecord;
                }
                catch (error) {
                    isFollowing = false;
                }
            }
            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.biography,
                photoUrl: user.photoUrl,
                type: 'user',
                username: user.username,
                role: user.role,
                isFollowing,
            };
        }));
        return userItems;
    }
    async getUsersCount(userId) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.isActive = :isActive', { isActive: true });
        if (userId) {
            query.andWhere('user.id != :userId', { userId });
        }
        return query.getCount();
    }
    async searchUsers(searchQuery, userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const userQuery = this.userRepository
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.username',
            'user.photoUrl',
            'user.role',
            'user.biography',
        ])
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('(user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery OR user.username LIKE :searchQuery OR user.biography LIKE :searchQuery)', { searchQuery: `%${searchQuery}%` });
        if (userId) {
            userQuery.andWhere('user.id != :userId', { userId });
        }
        const users = await userQuery
            .orderBy('user.firstName', 'ASC')
            .skip(skip)
            .take(limit)
            .getMany();
        const userItems = await Promise.all(users.map(async (user) => {
            let isFollowing = false;
            if (userId) {
                try {
                    const followRecord = await this.userFollowService.findFollow(userId, user.id);
                    isFollowing = !!followRecord;
                }
                catch (error) {
                    isFollowing = false;
                }
            }
            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.biography,
                photoUrl: user.photoUrl,
                type: 'user',
                username: user.username,
                role: user.role,
                isFollowing,
            };
        }));
        return userItems;
    }
    async searchUsersCount(searchQuery, userId) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('(user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery OR user.username LIKE :searchQuery OR user.biography LIKE :searchQuery)', { searchQuery: `%${searchQuery}%` });
        if (userId) {
            query.andWhere('user.id != :userId', { userId });
        }
        return query.getCount();
    }
};
exports.WhoToFollowService = WhoToFollowService;
exports.WhoToFollowService = WhoToFollowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_follow_service_1.UserFollowService,
        user_scholar_follow_service_1.UserScholarFollowService,
        cache_service_1.CacheService])
], WhoToFollowService);
//# sourceMappingURL=who-to-follow.service.js.map