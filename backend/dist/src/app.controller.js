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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_entity_1 = require("./scholars/entities/scholar.entity");
const book_entity_1 = require("./books/entities/book.entity");
const scholar_post_entity_1 = require("./scholars/entities/scholar-post.entity");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const language_entity_1 = require("./languages/entities/language.entity");
const user_entity_1 = require("./users/entities/user.entity");
let AppController = class AppController {
    constructor(scholarRepository, bookRepository, scholarPostRepository, languageRepository, userRepository) {
        this.scholarRepository = scholarRepository;
        this.bookRepository = bookRepository;
        this.scholarPostRepository = scholarPostRepository;
        this.languageRepository = languageRepository;
        this.userRepository = userRepository;
    }
    async getCounts() {
        const scholars = await this.scholarRepository.count();
        const books = await this.bookRepository.count();
        const posts = await this.scholarPostRepository.count();
        const languages = await this.languageRepository.count();
        return { scholars, books, posts, languages };
    }
    async getMonthlyStats() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthNames = [
            'Ocak',
            'Şubat',
            'Mart',
            'Nisan',
            'Mayıs',
            'Haziran',
            'Temmuz',
            'Ağustos',
            'Eylül',
            'Ekim',
            'Kasım',
            'Aralık',
        ];
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const month = now.getMonth() - i;
            const year = month < 0 ? currentYear - 1 : currentYear;
            const adjustedMonth = month < 0 ? 12 + month : month;
            const startDate = new Date(year, adjustedMonth, 1);
            const endDate = new Date(year, adjustedMonth + 1, 0, 23, 59, 59);
            const [booksCount, scholarsCount, usersCount] = await Promise.all([
                this.bookRepository.count({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startDate, endDate),
                    },
                }),
                this.scholarRepository.count({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startDate, endDate),
                    },
                }),
                this.userRepository.count({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startDate, endDate),
                    },
                }),
            ]);
            monthlyData.push({
                name: monthNames[adjustedMonth],
                kitaplar: booksCount,
                alimler: scholarsCount,
                kullanicilar: usersCount,
            });
        }
        return monthlyData;
    }
    async getRecentActivities() {
        try {
            const activities = [];
            try {
                const recentBooks = await this.bookRepository.find({
                    order: { createdAt: 'DESC' },
                    take: 3,
                    relations: ['translations'],
                });
                recentBooks.forEach((book) => {
                    const bookTitle = book.translations?.[0]?.title || 'İsimsiz Kitap';
                    activities.push({
                        type: 'book',
                        title: 'Yeni kitap eklendi',
                        description: bookTitle,
                        createdAt: book.createdAt,
                        icon: 'BookOpen',
                        color: 'bg-blue-500',
                    });
                });
            }
            catch (error) {
                console.error('Error fetching recent books:', error);
            }
            try {
                const recentScholars = await this.scholarRepository.find({
                    order: { createdAt: 'DESC' },
                    take: 3,
                });
                recentScholars.forEach((scholar) => {
                    activities.push({
                        type: 'scholar',
                        title: 'Yeni âlim eklendi',
                        description: scholar.fullName,
                        createdAt: scholar.createdAt,
                        icon: 'Users',
                        color: 'bg-emerald-500',
                    });
                });
            }
            catch (error) {
                console.error('Error fetching recent scholars:', error);
            }
            try {
                const recentPosts = await this.scholarPostRepository.find({
                    order: { createdAt: 'DESC' },
                    take: 2,
                    relations: ['scholar'],
                });
                recentPosts.forEach((post) => {
                    const description = post.scholar?.fullName
                        ? `${post.scholar.fullName} - Yeni gönderi`
                        : 'Yeni gönderi';
                    activities.push({
                        type: 'post',
                        title: 'Yeni gönderi',
                        description: description,
                        createdAt: post.createdAt,
                        icon: 'FileText',
                        color: 'bg-purple-500',
                    });
                });
            }
            catch (error) {
                console.error('Error fetching recent posts:', error);
            }
            activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return activities.slice(0, 10);
        }
        catch (error) {
            console.error('Error in getRecentActivities:', error);
            return [];
        }
    }
    getHello() {
        return 'hello';
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('statistics/counts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCounts", null);
__decorate([
    (0, common_1.Get)('statistics/monthly'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getMonthlyStats", null);
__decorate([
    (0, common_1.Get)('statistics/recent-activities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRecentActivities", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(1, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(2, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __param(3, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppController);
//# sourceMappingURL=app.controller.js.map