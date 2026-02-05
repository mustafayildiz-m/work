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
exports.BooksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const books_service_1 = require("./books.service");
const create_book_dto_1 = require("./dto/create-book.dto");
const upload_service_1 = require("../upload/upload.service");
const passport_1 = require("@nestjs/passport");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let BooksController = class BooksController {
    constructor(booksService, uploadService) {
        this.booksService = booksService;
        this.uploadService = uploadService;
    }
    findOnePublic(id, lang) {
        return this.booksService.findOne(id);
    }
    getBooksWithArticles(languageId) {
        return this.booksService.getBooksWithArticles(languageId);
    }
    getCategories(languageId) {
        return this.booksService.getCategories(languageId);
    }
    findAll(languageId, search, category, page, limit) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 12;
        return this.booksService.findAll(languageId, search, category, pageNumber, limitNumber);
    }
    findOne(id) {
        return this.booksService.findOne(id);
    }
    async create(createBookDto, files) {
        const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
        if (coverImageFile) {
            const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
            createBookDto.coverImage = coverImageUrl;
        }
        if (createBookDto.translations &&
            Array.isArray(createBookDto.translations)) {
            createBookDto.translations = await Promise.all(createBookDto.translations.map(async (trans, idx) => {
                const transData = {
                    ...trans,
                    languageId: parseInt(trans.languageId),
                };
                const pdfFile = files.find((f) => f.fieldname === `translations[${idx}][pdfFile]`);
                if (pdfFile) {
                    transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);
                }
                return transData;
            }));
        }
        if (createBookDto.category && !Array.isArray(createBookDto.category)) {
            if (typeof createBookDto.category === 'object') {
                createBookDto.category = Object.values(createBookDto.category);
            }
            else {
                createBookDto.category = [createBookDto.category];
            }
        }
        return this.booksService.create(createBookDto);
    }
    async update(id, updateBookDto, files) {
        const book = await this.booksService.findOne(id);
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
        if (coverImageFile) {
            if (book.coverImage) {
                const oldPath = path.join(process.cwd(), book.coverImage);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    }
                    catch (err) {
                        console.error(`Eski kapak silinemedi: ${err.message}`);
                    }
                }
            }
            updateBookDto.coverImage =
                await this.uploadService.uploadFile(coverImageFile);
        }
        if (updateBookDto.translations &&
            Array.isArray(updateBookDto.translations)) {
            updateBookDto.translations = await Promise.all(updateBookDto.translations.map(async (trans, idx) => {
                const transData = {
                    ...trans,
                    id: trans.id ? parseInt(trans.id) : undefined,
                    languageId: parseInt(trans.languageId),
                };
                const pdfFile = files.find((f) => f.fieldname === `translations[${idx}][pdfFile]`);
                if (pdfFile) {
                    transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);
                }
                return transData;
            }));
        }
        if (updateBookDto.category && !Array.isArray(updateBookDto.category)) {
            if (typeof updateBookDto.category === 'object') {
                updateBookDto.category = Object.values(updateBookDto.category);
            }
            else {
                updateBookDto.category = [updateBookDto.category];
            }
        }
        return this.booksService.update(id, updateBookDto);
    }
    async remove(id) {
        const deletedBook = await this.booksService.findOne(id);
        await this.booksService.remove(id);
        return {
            message: 'Kitap ve ilişkili dosyalar başarıyla silindi.',
            deletedBook,
        };
    }
};
exports.BooksController = BooksController;
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('with-articles'),
    __param(0, (0, common_1.Query)('languageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "getBooksWithArticles", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('languageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "getCategories", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('languageId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_book_dto_1.CreateBookDto, Array]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Array]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "remove", null);
exports.BooksController = BooksController = __decorate([
    (0, common_1.Controller)('books'),
    __metadata("design:paramtypes", [books_service_1.BooksService,
        upload_service_1.UploadService])
], BooksController);
//# sourceMappingURL=books.controller.js.map