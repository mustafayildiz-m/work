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
exports.PodcastController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const podcast_service_1 = require("../services/podcast.service");
const create_podcast_dto_1 = require("../dto/podcast/create-podcast.dto");
const update_podcast_dto_1 = require("../dto/podcast/update-podcast.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const upload_service_1 = require("../upload/upload.service");
let PodcastController = class PodcastController {
    constructor(podcastService, uploadService) {
        this.podcastService = podcastService;
        this.uploadService = uploadService;
    }
    async create(createPodcastDto, files) {
        let audioUrl;
        let coverUrl;
        if (files?.audio?.[0]) {
            audioUrl = await this.uploadService.uploadFile(files.audio[0]);
        }
        if (files?.cover?.[0]) {
            coverUrl = await this.uploadService.uploadFile(files.cover[0]);
        }
        return this.podcastService.create(createPodcastDto, audioUrl, coverUrl);
    }
    getFeaturedPodcasts(limit) {
        return this.podcastService.getFeaturedPodcasts(limit);
    }
    searchPodcasts(query, page, limit, language, category, isActive) {
        if (!query) {
            return { podcasts: [], total: 0, totalPages: 0 };
        }
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.podcastService.search(query, page, limit, language, category, isActiveBoolean);
    }
    findAll(page, limit, isActive, category, isFeatured, language) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        const isFeaturedBoolean = isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;
        return this.podcastService.findAll(page, limit, isActiveBoolean, category, isFeaturedBoolean, language);
    }
    findOne(id) {
        return this.podcastService.findOne(id);
    }
    incrementListenCount(id) {
        return this.podcastService.incrementListenCount(id);
    }
    incrementLikeCount(id) {
        return this.podcastService.incrementLikeCount(id);
    }
    async update(id, updatePodcastDto, files) {
        let audioUrl;
        let coverUrl;
        if (files?.audio?.[0]) {
            audioUrl = await this.uploadService.uploadFile(files.audio[0]);
        }
        if (files?.cover?.[0]) {
            coverUrl = await this.uploadService.uploadFile(files.cover[0]);
        }
        return this.podcastService.update(id, updatePodcastDto, audioUrl, coverUrl);
    }
    remove(id) {
        return this.podcastService.remove(id);
    }
};
exports.PodcastController = PodcastController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_podcast_dto_1.CreatePodcastDto, Object]),
    __metadata("design:returntype", Promise)
], PodcastController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('featured'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(5), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "getFeaturedPodcasts", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('language')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "searchPodcasts", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('isActive')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('isFeatured')),
    __param(5, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/listen'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "incrementListenCount", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "incrementLikeCount", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_podcast_dto_1.UpdatePodcastDto, Object]),
    __metadata("design:returntype", Promise)
], PodcastController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PodcastController.prototype, "remove", null);
exports.PodcastController = PodcastController = __decorate([
    (0, common_1.Controller)('podcasts'),
    __metadata("design:paramtypes", [podcast_service_1.PodcastService,
        upload_service_1.UploadService])
], PodcastController);
//# sourceMappingURL=podcast.controller.js.map