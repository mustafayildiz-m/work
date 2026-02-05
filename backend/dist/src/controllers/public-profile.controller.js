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
exports.PublicProfileController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const scholars_service_1 = require("../scholars/scholars.service");
const books_service_1 = require("../books/books.service");
let PublicProfileController = class PublicProfileController {
    constructor(usersService, scholarsService, booksService) {
        this.usersService = usersService;
        this.scholarsService = scholarsService;
        this.booksService = booksService;
    }
    async getPublicUser(id) {
        try {
            const user = await this.usersService.findOnePublic(parseInt(id));
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                photoUrl: user.photoUrl,
                biography: user.biography,
                createdAt: user.createdAt,
                joinDate: user.createdAt,
                type: 'user'
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async getPublicScholar(id) {
        try {
            const scholar = await this.scholarsService.findOnePublic(parseInt(id));
            if (!scholar) {
                throw new common_1.NotFoundException('Scholar not found');
            }
            return {
                id: scholar.id,
                fullName: scholar.fullName,
                photoUrl: scholar.photoUrl,
                biography: scholar.biography,
                birthDate: scholar.birthDate,
                deathDate: scholar.deathDate,
                locationName: scholar.locationName,
                createdAt: scholar.createdAt,
                type: 'scholar'
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Scholar not found');
        }
    }
    async getPublicBook(id, lang) {
        try {
            const book = await this.booksService.findOnePublic(parseInt(id), lang);
            if (!book) {
                throw new common_1.NotFoundException('Book not found');
            }
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                coverUrl: book.coverUrl,
                pdfUrl: book.pdfUrl,
                category: book.category?.name || null,
                categoryName: book.category?.name || null,
                publishDate: book.createdAt,
                createdAt: book.createdAt,
                type: 'book'
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Book not found');
        }
    }
};
exports.PublicProfileController = PublicProfileController;
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProfileController.prototype, "getPublicUser", null);
__decorate([
    (0, common_1.Get)('scholars/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProfileController.prototype, "getPublicScholar", null);
__decorate([
    (0, common_1.Get)('books/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicProfileController.prototype, "getPublicBook", null);
exports.PublicProfileController = PublicProfileController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        scholars_service_1.ScholarsService,
        books_service_1.BooksService])
], PublicProfileController);
//# sourceMappingURL=public-profile.controller.js.map