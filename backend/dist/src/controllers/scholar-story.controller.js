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
exports.ScholarStoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const scholar_story_service_1 = require("../services/scholar-story.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const upload_service_1 = require("../upload/upload.service");
let ScholarStoryController = class ScholarStoryController {
    constructor(scholarStoryService, uploadService) {
        this.scholarStoryService = scholarStoryService;
        this.uploadService = uploadService;
    }
    async create(body, file) {
        try {
            const createScholarStoryDto = {
                title: body.title,
                description: body.description,
                language: body.language,
                scholar_id: parseInt(body.scholar_id, 10),
                is_active: body.is_active === 'true' || body.is_active === true,
                is_featured: body.is_featured === 'true' || body.is_featured === true,
                video_url: body.video_url || undefined,
                duration: body.duration ? parseInt(body.duration, 10) : undefined,
                thumbnail_url: body.thumbnail_url || undefined,
            };
            if (file) {
                const thumbnailUrl = await this.uploadService.uploadFile(file);
                createScholarStoryDto.thumbnail_url = thumbnailUrl;
            }
            return this.scholarStoryService.create(createScholarStoryDto);
        }
        catch (error) {
            console.error('❌ Error creating scholar story:', error);
            throw error;
        }
    }
    async findAll(page, limit, language, isActive, search) {
        let isActiveBool;
        if (isActive === 'all') {
            isActiveBool = undefined;
        }
        else if (isActive === 'true') {
            isActiveBool = true;
        }
        else if (isActive === 'false') {
            isActiveBool = false;
        }
        else {
            isActiveBool = true;
        }
        const result = await this.scholarStoryService.findAll(page, limit, language, isActiveBool, search);
        return result;
    }
    testEndpoint() {
        return { page: 2, limit: 12, test: 'working' };
    }
    getFeaturedStories(limit) {
        return this.scholarStoryService.getFeaturedStories(limit);
    }
    searchStories(query, page, limit) {
        if (!query) {
            return { stories: [], total: 0, totalPages: 0 };
        }
        return this.scholarStoryService.searchStories(query, page, limit);
    }
    findByScholarId(scholarId, page, limit) {
        return this.scholarStoryService.findByScholarId(scholarId, page, limit);
    }
    findOne(id) {
        return this.scholarStoryService.findOne(id);
    }
    async update(id, body, file) {
        try {
            console.log('Update Body:', body);
            const updateScholarStoryDto = {
                title: body.title,
                description: body.description,
                language: body.language,
                scholar_id: body.scholar_id ? parseInt(body.scholar_id, 10) : undefined,
                is_active: body.is_active === 'true' || body.is_active === true,
                is_featured: body.is_featured === 'true' || body.is_featured === true,
                video_url: body.video_url || undefined,
                duration: body.duration ? parseInt(body.duration, 10) : undefined,
                thumbnail_url: body.thumbnail_url || undefined,
            };
            if (file) {
                const thumbnailUrl = await this.uploadService.uploadFile(file);
                updateScholarStoryDto.thumbnail_url = thumbnailUrl;
            }
            console.log('Update DTO:', updateScholarStoryDto);
            return this.scholarStoryService.update(id, updateScholarStoryDto);
        }
        catch (error) {
            console.error('❌ Error updating scholar story:', error);
            throw error;
        }
    }
    remove(id) {
        return this.scholarStoryService.remove(id);
    }
    likeStory(id, req) {
        return this.scholarStoryService.incrementLikeCount(id, req.user.id);
    }
    incrementView(id, req) {
        return this.scholarStoryService.incrementViewCount(id, req.user.id);
    }
};
exports.ScholarStoryController = ScholarStoryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('thumbnail')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScholarStoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ScholarStoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Get)('featured'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(5), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "getFeaturedStories", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "searchStories", null);
__decorate([
    (0, common_1.Get)('scholar/:scholarId'),
    __param(0, (0, common_1.Param)('scholarId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "findByScholarId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('thumbnail')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ScholarStoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "likeStory", null);
__decorate([
    (0, common_1.Post)(':id/view'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ScholarStoryController.prototype, "incrementView", null);
exports.ScholarStoryController = ScholarStoryController = __decorate([
    (0, common_1.Controller)('scholar-stories'),
    __metadata("design:paramtypes", [scholar_story_service_1.ScholarStoryService,
        upload_service_1.UploadService])
], ScholarStoryController);
//# sourceMappingURL=scholar-story.controller.js.map