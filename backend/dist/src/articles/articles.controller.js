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
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const articles_service_1 = require("./articles.service");
const create_article_dto_1 = require("./dto/create-article.dto");
const update_article_dto_1 = require("./dto/update-article.dto");
const upload_service_1 = require("../upload/upload.service");
const passport_1 = require("@nestjs/passport");
let ArticlesController = class ArticlesController {
    constructor(articlesService, uploadService) {
        this.articlesService = articlesService;
        this.uploadService = uploadService;
    }
    findOnePublic(id, lang) {
        return this.articlesService.findOne(id);
    }
    async create(createArticleDto, files) {
        const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
        if (coverImageFile) {
            const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
            createArticleDto.coverImage = coverImageUrl;
        }
        if (createArticleDto.translations && Array.isArray(createArticleDto.translations)) {
            createArticleDto.translations = await Promise.all(createArticleDto.translations.map(async (trans, idx) => {
                const pdfFile = files.find((f) => f.fieldname === `translations[${idx}][pdfFile]`);
                if (pdfFile) {
                    return {
                        ...trans,
                        pdfUrl: await this.uploadService.uploadPdf(pdfFile),
                    };
                }
                return trans;
            }));
        }
        return this.articlesService.create(createArticleDto);
    }
    findAllByBook(bookId, languageId, search, page, limit) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.articlesService.findAllByBook(bookId, languageId, search, pageNumber, limitNumber);
    }
    findAll(languageId, search, bookIds, page, limit) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.articlesService.findAll(languageId, search, bookIds, pageNumber, limitNumber);
    }
    findOne(id) {
        return this.articlesService.findOne(id);
    }
    async update(id, updateArticleDto, files) {
        console.log('📝 Article Update - ID:', id);
        console.log('📦 Translations:', JSON.stringify(updateArticleDto.translations, null, 2));
        const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
        if (coverImageFile) {
            const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
            updateArticleDto.coverImage = coverImageUrl;
        }
        if (updateArticleDto.translations && Array.isArray(updateArticleDto.translations)) {
            updateArticleDto.translations = await Promise.all(updateArticleDto.translations.map(async (trans, idx) => {
                const pdfFile = files.find((f) => f.fieldname === `translations[${idx}][pdfFile]`);
                if (pdfFile) {
                    console.log(`✅ Translation [${idx}]: Yeni PDF yüklendi`);
                    return {
                        ...trans,
                        pdfUrl: await this.uploadService.uploadPdf(pdfFile),
                    };
                }
                console.log(`📄 Translation [${idx}]: PDF yok, mevcut data:`, { id: trans.id, pdfUrl: trans.pdfUrl });
                return trans;
            }));
        }
        return this.articlesService.update(id, updateArticleDto);
    }
    async remove(id) {
        await this.articlesService.remove(id);
        return {
            message: 'Makale ve ilişkili dosyalar başarıyla silindi.',
        };
    }
    async reorder(bookId, body) {
        await this.articlesService.reorderArticles(bookId, body.articles);
        return {
            message: 'Makaleler başarıyla sıralandı.',
        };
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_article_dto_1.CreateArticleDto, Array]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('book/:bookId'),
    __param(0, (0, common_1.Param)('bookId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('languageId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAllByBook", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('languageId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('bookIds')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_article_dto_1.UpdateArticleDto, Array]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('book/:bookId/reorder'),
    __param(0, (0, common_1.Param)('bookId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "reorder", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService,
        upload_service_1.UploadService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map