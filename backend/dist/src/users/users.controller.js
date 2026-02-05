"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const user_follow_service_1 = require("../services/user-follow.service");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
const passport_1 = require("@nestjs/passport");
let UsersController = class UsersController {
    constructor(usersService, userFollowService, userScholarFollowService) {
        this.usersService = usersService;
        this.userFollowService = userFollowService;
        this.userScholarFollowService = userScholarFollowService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    async getMyProfile(req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        return this.usersService.findOne(userId);
    }
    async findOnePublic(id) {
        return this.usersService.findOne(id);
    }
    async findOne(id, req) {
        const requesterId = req?.user?.id;
        const user = await this.usersService.findOne(id);
        if (!user)
            return null;
        if (requesterId) {
            try {
                const followRecord = await this.userFollowService.findFollow(requesterId, id);
                user.isFollowing = !!followRecord;
            }
            catch (error) {
                user.isFollowing = false;
            }
        }
        else {
            user.isFollowing = false;
        }
        return user;
    }
    async updateMyProfile(req, updateUserDto) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        return this.usersService.updateProfile(userId, updateUserDto);
    }
    async changePassword(req, changePasswordDto) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        await this.usersService.changePassword(userId, changePasswordDto);
        return { message: 'Password changed successfully' };
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    async updateProfilePhoto(id, photo, req) {
        if (req.user.id !== id) {
            throw new Error('Bu profil resmini güncelleme yetkiniz yok');
        }
        const photoUrl = `/uploads/profile_photos/${photo.filename}`;
        return this.usersService.update(id, { photoUrl });
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    async getFollowingUsersOfUser(id, limit, offset) {
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userFollowService.getFollowingUsers(id, limitNumber, offsetNumber),
            this.userFollowService.getFollowingCount(id),
        ]);
        return {
            users,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
        };
    }
    async getFollowersOfUser(id, limit, offset) {
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userFollowService.getFollowers(id, limitNumber, offsetNumber),
            this.userFollowService.getFollowersCount(id),
        ]);
        return {
            users,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
        };
    }
    async getFollowStatsOfUser(id) {
        const [followingCount, followersCount] = await Promise.all([
            this.userFollowService.getFollowingCount(id),
            this.userFollowService.getFollowersCount(id),
        ]);
        return {
            followingUsersCount: followingCount,
            followersCount,
        };
    }
    async getFollowingScholarsOfUser(id, limit, offset) {
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [scholars, totalCount] = await Promise.all([
            this.userScholarFollowService.getFollowingScholars(id, limitNumber, offsetNumber),
            this.userScholarFollowService.getFollowingScholarsCount(id),
        ]);
        return {
            scholars,
            totalCount,
            hasMore: offsetNumber + limitNumber < totalCount,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me/profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me/change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/photo'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = 'uploads/profile_photos';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `user-${req.params.id}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            if (allowedTypes.includes(ext)) {
                cb(null, true);
            }
            else {
                cb(new Error('Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP)'), false);
            }
        },
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfilePhoto", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/following'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFollowingUsersOfUser", null);
__decorate([
    (0, common_1.Get)(':id/followers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFollowersOfUser", null);
__decorate([
    (0, common_1.Get)(':id/follow-stats'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFollowStatsOfUser", null);
__decorate([
    (0, common_1.Get)(':id/following-scholars'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFollowingScholarsOfUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_follow_service_1.UserFollowService,
        user_scholar_follow_service_1.UserScholarFollowService])
], UsersController);
//# sourceMappingURL=users.controller.js.map