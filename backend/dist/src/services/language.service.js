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
exports.LanguageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const language_entity_1 = require("../languages/entities/language.entity");
const book_translation_entity_1 = require("../books/entities/book-translation.entity");
const article_translation_entity_1 = require("../articles/entities/article-translation.entity");
const typeorm_3 = require("typeorm");
let LanguageService = class LanguageService {
    constructor(languageRepository, bookTranslationRepository, articleTranslationRepository) {
        this.languageRepository = languageRepository;
        this.bookTranslationRepository = bookTranslationRepository;
        this.articleTranslationRepository = articleTranslationRepository;
    }
    async create(createLanguageDto) {
        try {
            const language = this.languageRepository.create(createLanguageDto);
            return await this.languageRepository.save(language);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new common_1.ConflictException('Bu dil adı veya kodu zaten mevcut.');
            }
            throw error;
        }
    }
    async findAll() {
        return await this.languageRepository.find();
    }
    async getBookCounts() {
        const result = await this.languageRepository
            .createQueryBuilder('language')
            .leftJoin('language.bookTranslations', 'bookTranslation')
            .select([
            'language.id as languageId',
            'language.name as languageName',
            'language.code as languageCode',
            'COUNT(DISTINCT bookTranslation.bookId) as bookCount',
        ])
            .groupBy('language.id')
            .orderBy('language.name', 'ASC')
            .getRawMany();
        return result.map((item) => ({
            languageId: parseInt(item.languageId),
            languageName: item.languageName,
            languageCode: item.languageCode,
            bookCount: parseInt(item.bookCount),
        }));
    }
    async getArticleCounts() {
        const result = await this.languageRepository
            .createQueryBuilder('language')
            .leftJoin('language.articleTranslations', 'articleTranslation')
            .select([
            'language.id as languageId',
            'language.name as languageName',
            'language.code as languageCode',
            'COUNT(DISTINCT articleTranslation.articleId) as articleCount',
        ])
            .groupBy('language.id')
            .orderBy('language.name', 'ASC')
            .getRawMany();
        return result.map((item) => ({
            languageId: parseInt(item.languageId),
            languageName: item.languageName,
            languageCode: item.languageCode,
            articleCount: parseInt(item.articleCount),
        }));
    }
    async findOne(id) {
        const language = await this.languageRepository.findOne({ where: { id } });
        if (!language) {
            throw new common_1.NotFoundException(`Language with ID ${id} not found`);
        }
        return language;
    }
    async update(id, updateLanguageDto) {
        try {
            const existingLanguage = await this.findOne(id);
            if (updateLanguageDto.name) {
                const duplicateName = await this.languageRepository.findOne({
                    where: { name: updateLanguageDto.name, id: (0, typeorm_3.Not)(id) },
                });
                if (duplicateName) {
                    throw new common_1.ConflictException('Bu dil adı başka bir dilde kullanılıyor.');
                }
            }
            if (updateLanguageDto.code) {
                const duplicateCode = await this.languageRepository.findOne({
                    where: { code: updateLanguageDto.code, id: (0, typeorm_3.Not)(id) },
                });
                if (duplicateCode) {
                    throw new common_1.ConflictException('Bu dil kodu başka bir dilde kullanılıyor.');
                }
            }
            await this.languageRepository.update(id, updateLanguageDto);
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            if (error.code === 'ER_DUP_ENTRY') {
                throw new common_1.ConflictException('Bu dil adı veya kodu zaten mevcut.');
            }
            throw error;
        }
    }
    async remove(id) {
        const language = await this.findOne(id);
        const result = await this.languageRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Language with ID ${id} not found`);
        }
        return { message: `${language.name} dili başarıyla silindi.` };
    }
};
exports.LanguageService = LanguageService;
exports.LanguageService = LanguageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __param(1, (0, typeorm_1.InjectRepository)(book_translation_entity_1.BookTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(article_translation_entity_1.ArticleTranslation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LanguageService);
//# sourceMappingURL=language.service.js.map