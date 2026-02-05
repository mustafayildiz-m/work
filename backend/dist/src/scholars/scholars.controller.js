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
exports.ScholarsController = void 0;
const common_1 = require("@nestjs/common");
const scholars_service_1 = require("./scholars.service");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("../upload/upload.service");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
let ScholarsController = class ScholarsController {
    constructor(scholarsService, uploadService, userScholarFollowService) {
        this.scholarsService = scholarsService;
        this.uploadService = uploadService;
        this.userScholarFollowService = userScholarFollowService;
    }
    async create(createScholarDto, files, req) {
        const photoFile = files.find(f => f.fieldname === 'photo');
        if (photoFile) {
            createScholarDto.photoUrl = await this.uploadService.uploadFile(photoFile);
        }
        else {
            createScholarDto.photoUrl = 'uploads/coverImage/coverImage.jpg';
        }
        const coverImageFile = files.find(f => f.fieldname === 'coverImage');
        if (coverImageFile) {
            createScholarDto.coverImage = await this.uploadService.uploadFile(coverImageFile);
        }
        else {
            createScholarDto.coverImage = 'uploads/coverImage/coverImage.jpg';
        }
        if (createScholarDto.ownBooks && Array.isArray(createScholarDto.ownBooks)) {
            createScholarDto.ownBooks = await Promise.all(createScholarDto.ownBooks.map(async (book, idx) => {
                const coverFile = files.find(f => f.fieldname === `ownBooks[${idx}][cover]`);
                const pdfFile = files.find(f => f.fieldname === `ownBooks[${idx}][pdf]`);
                let processedBook = { ...book };
                if (coverFile) {
                    processedBook.coverUrl = await this.uploadService.uploadFile(coverFile);
                }
                else {
                    processedBook.coverUrl = book.coverUrl || '/uploads/coverImage/coverImage.jpg';
                }
                if (pdfFile) {
                    processedBook.pdfUrl = await this.uploadService.uploadFile(pdfFile);
                }
                return processedBook;
            }));
        }
        const userId = req.user?.id;
        return this.scholarsService.create(createScholarDto, userId);
    }
    async findAll(page, limit, search, req) {
        const userId = req?.user?.id;
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const [scholars, totalCount] = await Promise.all([
            this.scholarsService.findAll(userId, pageNumber, limitNumber, search),
            this.scholarsService.getTotalCount(search)
        ]);
        return {
            scholars,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            hasMore: (pageNumber * limitNumber) < totalCount
        };
    }
    findOne(id, queryUserId, req) {
        const userId = queryUserId ? +queryUserId : req.user?.id;
        return this.scholarsService.findOne(+id, userId);
    }
    async update(id, updateScholarDto, files, req) {
        const photoFile = files.find(f => f.fieldname === 'photo');
        if (photoFile) {
            updateScholarDto.photoUrl = await this.uploadService.uploadFile(photoFile);
        }
        else if (!updateScholarDto.photoUrl) {
            updateScholarDto.photoUrl = 'uploads/coverImage/coverImage.jpg';
        }
        const coverImageFile = files.find(f => f.fieldname === 'coverImage');
        if (coverImageFile) {
            updateScholarDto.coverImage = await this.uploadService.uploadFile(coverImageFile);
        }
        else if (!updateScholarDto.coverImage) {
            updateScholarDto.coverImage = 'uploads/coverImage/coverImage.jpg';
        }
        if (updateScholarDto.ownBooks && Array.isArray(updateScholarDto.ownBooks)) {
            updateScholarDto.ownBooks = await Promise.all(updateScholarDto.ownBooks.map(async (book, idx) => {
                const coverFile = files.find(f => f.fieldname === `ownBooks[${idx}][cover]`);
                const pdfFile = files.find(f => f.fieldname === `ownBooks[${idx}][pdf]`);
                let processedBook = { ...book };
                if (coverFile) {
                    processedBook.coverUrl = await this.uploadService.uploadFile(coverFile);
                }
                else if (!book.coverUrl) {
                    processedBook.coverUrl = 'uploads/coverImage/coverImage.jpg';
                }
                if (pdfFile) {
                    processedBook.pdfUrl = await this.uploadService.uploadFile(pdfFile);
                }
                return processedBook;
            }));
        }
        const userId = req.user?.id;
        return this.scholarsService.update(+id, updateScholarDto, userId);
    }
    async updateCoverImage(id, files, req) {
        const coverImageFile = files.find(f => f.fieldname === 'coverImage');
        if (!coverImageFile) {
            throw new common_1.BadRequestException('Cover image file is required');
        }
        const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
        const userId = req.user?.id;
        return this.scholarsService.updateCoverImage(+id, coverImageUrl, userId);
    }
    remove(id) {
        return this.scholarsService.remove(+id);
    }
    async getScholarFollowers(id, limit, offset) {
        const scholarId = +id;
        const limitNumber = limit ? parseInt(limit, 10) : 20;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        const [users, totalCount] = await Promise.all([
            this.userScholarFollowService.getScholarFollowers(scholarId, limitNumber, offsetNumber),
            this.userScholarFollowService.getScholarFollowersCount(scholarId)
        ]);
        return {
            users,
            totalCount,
            hasMore: (offsetNumber + limitNumber) < totalCount
        };
    }
    async getScholarFollowStats(id) {
        const scholarId = +id;
        const followersCount = await this.userScholarFollowService.getScholarFollowersCount(scholarId);
        return { followersCount };
    }
};
exports.ScholarsController = ScholarsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ScholarsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array, Object]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cover-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "updateCoverImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScholarsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/followers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "getScholarFollowers", null);
__decorate([
    (0, common_1.Get)(':id/follow-stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScholarsController.prototype, "getScholarFollowStats", null);
exports.ScholarsController = ScholarsController = __decorate([
    (0, common_1.Controller)('scholars'),
    __metadata("design:paramtypes", [scholars_service_1.ScholarsService,
        upload_service_1.UploadService,
        user_scholar_follow_service_1.UserScholarFollowService])
], ScholarsController);
//# sourceMappingURL=scholars.controller.js.map