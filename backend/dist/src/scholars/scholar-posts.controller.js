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
exports.ScholarPostsController = void 0;
const common_1 = require("@nestjs/common");
const scholar_posts_service_1 = require("./scholar-posts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = __importStar(require("fs"));
let ScholarPostsController = class ScholarPostsController {
    constructor(scholarPostsService) {
        this.scholarPostsService = scholarPostsService;
    }
    findOnePublic(id, language) {
        return this.scholarPostsService.findOne(id, language);
    }
    async create(files, body) {
        const fileUrls = files?.map(file => `/uploads/posts/${file.filename}`) || [];
        const translation = {
            language: body.language || 'tr',
            content: body.content,
            mediaUrls: body.mediaUrls ? JSON.parse(body.mediaUrls) : [],
            fileUrls,
            status: body.status || undefined,
        };
        return this.scholarPostsService.create({
            scholarId: Number(body.scholarId),
            translations: [translation],
        });
    }
    findAll(scholarId, language) {
        return this.scholarPostsService.findAll(Number(scholarId), language);
    }
    findOne(id, language) {
        return this.scholarPostsService.findOne(id, language);
    }
    remove(id) {
        return this.scholarPostsService.remove(id);
    }
    async addOrUpdateTranslation(postId, language, files, body) {
        const fileUrls = files?.map(file => `/uploads/posts/${file.filename}`) || [];
        let allFileUrls = fileUrls;
        if (body.fileUrls) {
            const existingFiles = typeof body.fileUrls === 'string' ? JSON.parse(body.fileUrls) : body.fileUrls;
            allFileUrls = [...existingFiles, ...fileUrls];
        }
        let mediaUrls = [];
        if (body.mediaUrls) {
            mediaUrls = typeof body.mediaUrls === 'string' ? JSON.parse(body.mediaUrls) : body.mediaUrls;
        }
        const translationData = {
            content: body.content,
            mediaUrls,
            fileUrls: allFileUrls,
            status: body.status,
            translatedBy: body.translatedBy ? Number(body.translatedBy) : undefined,
            approvedBy: body.approvedBy ? Number(body.approvedBy) : undefined,
        };
        return this.scholarPostsService.addOrUpdateTranslation(postId, language, translationData);
    }
    removeTranslation(postId, language) {
        return this.scholarPostsService.deleteTranslation(postId, language);
    }
};
exports.ScholarPostsController = ScholarPostsController;
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScholarPostsController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = 'uploads/posts';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ScholarPostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('scholar/:scholarId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('scholarId')),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScholarPostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScholarPostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScholarPostsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':postId/translations/:language'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = 'uploads/posts';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
    })),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('language')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], ScholarPostsController.prototype, "addOrUpdateTranslation", null);
__decorate([
    (0, common_1.Delete)(':postId/translations/:language'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScholarPostsController.prototype, "removeTranslation", null);
exports.ScholarPostsController = ScholarPostsController = __decorate([
    (0, common_1.Controller)('scholar-posts'),
    __metadata("design:paramtypes", [scholar_posts_service_1.ScholarPostsService])
], ScholarPostsController);
//# sourceMappingURL=scholar-posts.controller.js.map