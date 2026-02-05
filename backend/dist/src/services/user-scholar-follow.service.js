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
exports.UserScholarFollowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_entity_1 = require("../users/entities/user.entity");
let UserScholarFollowService = class UserScholarFollowService {
    constructor(userScholarFollowRepository, scholarRepository, userRepository) {
        this.userScholarFollowRepository = userScholarFollowRepository;
        this.scholarRepository = scholarRepository;
        this.userRepository = userRepository;
    }
    async follow(user_id, scholar_id) {
        const existing = await this.userScholarFollowRepository.findOneBy({ user_id, scholar_id });
        if (existing)
            return existing;
        const follow = this.userScholarFollowRepository.create({ user_id, scholar_id });
        return this.userScholarFollowRepository.save(follow);
    }
    async unfollow(user_id, scholar_id) {
        const follow = await this.userScholarFollowRepository.findOneBy({ user_id, scholar_id });
        if (!follow)
            throw new common_1.NotFoundException('Takip ilişkisi bulunamadı.');
        await this.userScholarFollowRepository.remove(follow);
        return { unfollowed: true };
    }
    async findFollow(user_id, scholar_id) {
        return this.userScholarFollowRepository.findOneBy({ user_id, scholar_id });
    }
    async getFollowingScholars(userId, limit = 20, offset = 0) {
        const following = await this.userScholarFollowRepository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.scholar', 'scholar')
            .select([
            'follow.id',
            'scholar.id',
            'scholar.fullName',
            'scholar.photoUrl',
            'scholar.biography',
            'scholar.lineage',
            'scholar.birthDate',
            'scholar.deathDate',
            'scholar.locationName'
        ])
            .where('follow.user_id = :userId', { userId })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return following.map(follow => ({
            id: follow.scholar.id,
            fullName: follow.scholar.fullName,
            photoUrl: follow.scholar.photoUrl,
            biography: follow.scholar.biography,
            lineage: follow.scholar.lineage,
            birthDate: follow.scholar.birthDate,
            deathDate: follow.scholar.deathDate,
            locationName: follow.scholar.locationName,
            followId: follow.id,
            followedAt: follow.id
        }));
    }
    async getFollowingScholarsCount(userId) {
        return this.userScholarFollowRepository.count({
            where: { user_id: userId }
        });
    }
    async getScholarFollowers(scholarId, limit = 20, offset = 0) {
        const followers = await this.userScholarFollowRepository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.user', 'user')
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
            .where('follow.scholar_id = :scholarId', { scholarId })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .orderBy('follow.id', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
        return followers.map(follow => ({
            id: follow.user.id,
            firstName: follow.user.firstName,
            lastName: follow.user.lastName,
            username: follow.user.username,
            photoUrl: follow.user.photoUrl,
            role: follow.user.role,
            followId: follow.id,
            followedAt: follow.id
        }));
    }
    async getScholarFollowersCount(scholarId) {
        return this.userScholarFollowRepository.count({
            where: { scholar_id: scholarId }
        });
    }
};
exports.UserScholarFollowService = UserScholarFollowService;
exports.UserScholarFollowService = UserScholarFollowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_scholar_follow_entity_1.UserScholarFollow)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserScholarFollowService);
//# sourceMappingURL=user-scholar-follow.service.js.map