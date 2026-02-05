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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const users_service_1 = require("../users/users.service");
const update_user_admin_dto_1 = require("../users/dto/update-user-admin.dto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
let AdminUsersController = class AdminUsersController {
    constructor(usersService, userRepository) {
        this.usersService = usersService;
        this.userRepository = userRepository;
    }
    async getUsers(role, search, isActive, limit, offset) {
        const limitNumber = limit ? parseInt(limit) : 20;
        const offsetNumber = offset ? parseInt(offset) : 0;
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        if (isActive !== undefined) {
            const activeStatus = isActive === 'true';
            queryBuilder.andWhere('user.isActive = :isActive', { isActive: activeStatus });
        }
        if (search) {
            queryBuilder.andWhere('(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.username LIKE :search)', { search: `%${search}%` });
        }
        queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip(offsetNumber)
            .take(limitNumber);
        const [users, total] = await queryBuilder.getManyAndCount();
        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return {
            users: sanitizedUsers,
            total,
            limit: limitNumber,
            offset: offsetNumber,
            hasMore: offsetNumber + limitNumber < total,
        };
    }
    async getUser(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: [
                'id',
                'email',
                'username',
                'firstName',
                'lastName',
                'photoUrl',
                'biography',
                'phoneNo',
                'location',
                'birthDate',
                'role',
                'isActive',
                'createdAt',
                'updatedAt',
            ],
        });
        if (!user) {
            throw new common_1.BadRequestException('Kullanıcı bulunamadı');
        }
        return user;
    }
    async updateUser(id, updateUserDto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('Kullanıcı bulunamadı');
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('Bu email zaten kullanılıyor');
            }
        }
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUsername = await this.userRepository.findOne({
                where: { username: updateUserDto.username },
            });
            if (existingUsername) {
                throw new common_1.BadRequestException('Bu kullanıcı adı zaten kullanılıyor');
            }
        }
        Object.assign(user, updateUserDto);
        await this.userRepository.save(user);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async changeUserRole(id, role) {
        const validRoles = ['user', 'editor', 'admin'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException('Geçersiz rol');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('Kullanıcı bulunamadı');
        }
        user.role = role;
        await this.userRepository.save(user);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async toggleUserStatus(id, isActive) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('Kullanıcı bulunamadı');
        }
        user.isActive = isActive;
        await this.userRepository.save(user);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async deleteUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('Kullanıcı bulunamadı');
        }
        await this.userRepository.remove(user);
        return { message: 'Kullanıcı başarıyla silindi' };
    }
    async getUserStatistics() {
        const [totalUsers, adminCount, editorCount, userCount, activeUsers, inactiveUsers] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { role: 'admin' } }),
            this.userRepository.count({ where: { role: 'editor' } }),
            this.userRepository.count({ where: { role: 'user' } }),
            this.userRepository.count({ where: { isActive: true } }),
            this.userRepository.count({ where: { isActive: false } }),
        ]);
        return {
            totalUsers,
            adminCount,
            editorCount,
            userCount,
            activeUsers,
            inactiveUsers,
        };
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('isActive')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_admin_dto_1.UpdateUserAdminDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "changeUserRole", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('statistics/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserStatistics", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_2.Repository])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map