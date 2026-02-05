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
exports.UserPostsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const user_posts_service_1 = require("../services/user-posts.service");
const create_user_post_dto_1 = require("../dto/user-posts/create-user-post.dto");
const update_user_post_dto_1 = require("../dto/user-posts/update-user-post.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const fs = __importStar(require("fs"));
function fileFilter(req, file, cb) {
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.webm'];
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    if ([...allowedImageTypes, ...allowedVideoTypes].includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new common_1.BadRequestException('Sadece resim veya video yükleyebilirsiniz.'), false);
    }
}
function destination(req, file, cb) {
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
    let uploadPath = '';
    if (isImage) {
        uploadPath = 'uploads/user_posts_img';
    }
    else if (isVideo) {
        uploadPath = 'uploads/user_posts_videos';
    }
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
}
function filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
}
let UserPostsController = class UserPostsController {
    constructor(userPostsService) {
        this.userPostsService = userPostsService;
    }
    async create(file, body) {
        let filePath = null;
        if (file) {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
            const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
            if (isImage) {
                filePath = `/uploads/user_posts_img/${file.filename}`;
            }
            else if (isVideo) {
                filePath = `/uploads/user_posts_videos/${file.filename}`;
            }
            if (isVideo && file.size > 100 * 1024 * 1024) {
                fs.unlinkSync(file.path);
                throw new common_1.BadRequestException('Video dosyası 100MB geçemez.');
            }
        }
        const payload = { ...body };
        if (file) {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                payload.image_url = filePath;
            }
            else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
                payload.video_url = filePath;
            }
        }
        return this.userPostsService.create(payload);
    }
    findAll() {
        return this.userPostsService.findAll();
    }
    getUserPosts(userId, req) {
        const currentUserId = req.user?.id;
        const includePending = currentUserId && Number(currentUserId) === Number(userId);
        return this.userPostsService.getUserPosts(userId, includePending);
    }
    findOne(id) {
        return this.userPostsService.findOne(id);
    }
    update(id, updateUserPostDto) {
        return this.userPostsService.update(id, updateUserPostDto);
    }
    remove(id) {
        return this.userPostsService.remove(id);
    }
    getTimeline(userId, language) {
        return this.userPostsService.getTimeline(userId, language);
    }
    getSharedProfileData(profileType, profileId) {
        return this.userPostsService.getSharedProfileData(profileType, profileId);
    }
    getPendingPosts(req) {
        return this.userPostsService.getPendingPosts();
    }
    approvePost(id, req) {
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            throw new common_1.BadRequestException('Admin user ID not found');
        }
        return this.userPostsService.approvePost(id, adminUserId);
    }
    rejectPost(id, req) {
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            throw new common_1.BadRequestException('Admin user ID not found');
        }
        return this.userPostsService.rejectPost(id, adminUserId);
    }
};
exports.UserPostsController = UserPostsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({ destination, filename }),
        fileFilter,
        limits: { fileSize: 100 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_post_dto_1.CreateUserPostDto]),
    __metadata("design:returntype", Promise)
], UserPostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "getUserPosts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_post_dto_1.UpdateUserPostDto]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('timeline/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('shared-profile/:profileType/:profileId'),
    __param(0, (0, common_1.Param)('profileType')),
    __param(1, (0, common_1.Param)('profileId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "getSharedProfileData", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "getPendingPosts", null);
__decorate([
    (0, common_1.Patch)('admin/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "approvePost", null);
__decorate([
    (0, common_1.Patch)('admin/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UserPostsController.prototype, "rejectPost", null);
exports.UserPostsController = UserPostsController = __decorate([
    (0, common_1.Controller)('user-posts'),
    __metadata("design:paramtypes", [user_posts_service_1.UserPostsService])
], UserPostsController);
//# sourceMappingURL=user-posts.controller.js.map