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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("./entities/article.entity");
const article_translation_entity_1 = require("./entities/article-translation.entity");
const upload_service_1 = require("../upload/upload.service");
const slug_utils_1 = require("../utils/slug.utils");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ArticlesService = class ArticlesService {
    constructor(articleRepository, articleTranslationRepository, uploadService) {
        this.articleRepository = articleRepository;
        this.articleTranslationRepository = articleTranslationRepository;
        this.uploadService = uploadService;
    }
    async getExistingSlugs() {
        const translations = await this.articleTranslationRepository
            .createQueryBuilder('translation')
            .select('translation.slug')
            .where('translation.slug IS NOT NULL')
            .getMany();
        return translations.map((t) => t.slug);
    }
    async create(createArticleDto) {
        const { translations, ...articleData } = createArticleDto;
        const article = this.articleRepository.create(articleData);
        const savedArticle = await this.articleRepository.save(article);
        if (translations && Array.isArray(translations)) {
            const existingSlugs = await this.getExistingSlugs();
            const translationEntities = translations.map((trans) => {
                let slug = trans.slug;
                if (!slug && trans.title) {
                    slug = (0, slug_utils_1.createUniqueSlug)(trans.title, existingSlugs);
                }
                return this.articleTranslationRepository.create({
                    ...trans,
                    slug,
                    article: savedArticle,
                    articleId: savedArticle.id,
                    languageId: trans.languageId,
                });
            });
            await this.articleTranslationRepository.save(translationEntities);
            savedArticle.translations = translationEntities;
        }
        return this.findOne(savedArticle.id);
    }
    async findAllByBook(bookId, languageId, search, page = 1, limit = 10) {
        let subQuery = this.articleRepository
            .createQueryBuilder('article')
            .select('DISTINCT article.id', 'article_id')
            .leftJoin('article.translations', 'articleTranslations')
            .leftJoin('articleTranslations.language', 'language')
            .where('article.bookId = :bookId', { bookId });
        if (languageId) {
            subQuery = subQuery.andWhere('language.id = :languageId', {
                languageId: parseInt(languageId),
            });
        }
        if (search && search.trim()) {
            const searchTerm = `%${search.trim().toLowerCase()}%`;
            subQuery = subQuery.andWhere('LOWER(articleTranslations.title) LIKE :search', { search: searchTerm });
        }
        const articleIds = await subQuery.getRawMany();
        const ids = articleIds.map((item) => item.article_id || item.id || item.articleId);
        if (ids.length === 0) {
            return {
                data: [],
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalCount: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };
        }
        const totalCount = ids.length;
        const skip = (page - 1) * limit;
        const paginatedIds = ids.slice(skip, skip + limit);
        const articles = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.translations', 'articleTranslations')
            .leftJoinAndSelect('articleTranslations.language', 'language')
            .leftJoinAndSelect('article.book', 'book')
            .leftJoinAndSelect('book.translations', 'bookTranslations')
            .whereInIds(paginatedIds)
            .orderBy('article.orderIndex', 'ASC')
            .addOrderBy('article.id', 'DESC')
            .getMany();
        return {
            data: articles,
            pagination: {
                currentPage: page,
                limit: limit,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async findAll(languageId, search, bookIds, page = 1, limit = 10) {
        let query = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.translations', 'articleTranslations')
            .leftJoinAndSelect('articleTranslations.language', 'language')
            .leftJoinAndSelect('article.book', 'book')
            .leftJoinAndSelect('book.translations', 'bookTranslations');
        if (languageId) {
            query = query.andWhere('language.id = :languageId', {
                languageId: parseInt(languageId),
            });
        }
        if (bookIds && bookIds.trim()) {
            const bookIdArray = bookIds
                .split(',')
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id));
            if (bookIdArray.length > 0) {
                query = query.andWhere('article.bookId IN (:...bookIds)', {
                    bookIds: bookIdArray,
                });
            }
        }
        if (search && search.trim()) {
            const searchTerm = `%${search.trim().toLowerCase()}%`;
            query = query.andWhere('LOWER(articleTranslations.title) LIKE :search', {
                search: searchTerm,
            });
        }
        const totalCount = await query.getCount();
        const skip = (page - 1) * limit;
        const articles = await query
            .orderBy('article.orderIndex', 'ASC')
            .addOrderBy('article.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
        return {
            data: articles,
            pagination: {
                currentPage: page,
                limit: limit,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: [
                'translations',
                'translations.language',
                'book',
                'book.translations',
            ],
        });
        if (!article) {
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }
    async update(id, updateArticleDto) {
        const existingArticle = await this.articleRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!existingArticle) {
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        const { translations, ...articleData } = updateArticleDto;
        this.articleRepository.merge(existingArticle, articleData);
        const updatedArticle = await this.articleRepository.save(existingArticle);
        if (translations && Array.isArray(translations)) {
            const existingTranslations = existingArticle.translations || [];
            const existingSlugs = await this.getExistingSlugs();
            const updatedTranslations = [];
            for (const trans of translations) {
                const transId = trans.id
                    ? parseInt(trans.id.toString(), 10)
                    : undefined;
                console.log(`🔍 Translation ID: ${trans.id} → ${transId}`);
                console.log(`📋 Existing IDs: [${existingTranslations.map((t) => t.id).join(', ')}]`);
                if (transId) {
                    const existing = existingTranslations.find((t) => t.id === transId);
                    console.log(`${existing ? '✅ FOUND' : '❌ NOT FOUND'} - Translation ${transId}`);
                    if (existing) {
                        const pdfUrl = trans.pdfUrl || existing.pdfUrl;
                        let slug = trans.slug;
                        if (!slug && trans.title) {
                            slug = (0, slug_utils_1.createUniqueSlug)(trans.title, existingSlugs);
                        }
                        existing.title = trans.title;
                        existing.content = trans.content;
                        existing.summary = trans.summary || '';
                        existing.slug = slug || '';
                        existing.pdfUrl = pdfUrl;
                        existing.languageId = trans.languageId;
                        existing.articleId = id;
                        const saved = await this.articleTranslationRepository.save(existing);
                        updatedTranslations.push(saved);
                    }
                }
                else {
                    let slug = trans.slug;
                    if (!slug && trans.title) {
                        slug = (0, slug_utils_1.createUniqueSlug)(trans.title, existingSlugs);
                    }
                    const newTrans = this.articleTranslationRepository.create({
                        ...trans,
                        slug,
                        articleId: id,
                        article: updatedArticle,
                        languageId: trans.languageId,
                    });
                    const saved = await this.articleTranslationRepository.save(newTrans);
                    updatedTranslations.push(saved);
                }
            }
            const sentIds = translations
                .filter((t) => t.id)
                .map((t) => parseInt(t.id.toString(), 10));
            const toDelete = existingTranslations.filter((t) => !sentIds.includes(t.id));
            for (const trans of toDelete) {
                if (trans.pdfUrl) {
                    const pdfPath = path.join(process.cwd(), trans.pdfUrl);
                    if (fs.existsSync(pdfPath)) {
                        try {
                            fs.unlinkSync(pdfPath);
                        }
                        catch (e) {
                            console.error('PDF dosyası silinemedi:', e.message);
                        }
                    }
                }
                await this.articleTranslationRepository.delete(trans.id);
            }
            updatedArticle.translations = updatedTranslations;
        }
        return this.findOne(id);
    }
    async remove(id) {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!article) {
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        if (article.coverImage) {
            const coverPath = path.join(process.cwd(), article.coverImage);
            if (fs.existsSync(coverPath)) {
                try {
                    fs.unlinkSync(coverPath);
                }
                catch (e) {
                    console.error('Cover image silinemedi:', e.message);
                }
            }
        }
        if (article.translations && Array.isArray(article.translations)) {
            for (const trans of article.translations) {
                if (trans.pdfUrl) {
                    const pdfPath = path.join(process.cwd(), trans.pdfUrl);
                    if (fs.existsSync(pdfPath)) {
                        try {
                            fs.unlinkSync(pdfPath);
                        }
                        catch (e) {
                            console.error('PDF dosyası silinemedi:', e.message);
                        }
                    }
                }
            }
        }
        await this.articleRepository.delete(id);
    }
    async reorderArticles(bookId, articleOrders) {
        for (const order of articleOrders) {
            await this.articleRepository.update({ id: order.id, bookId }, { orderIndex: order.orderIndex });
        }
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, typeorm_1.InjectRepository)(article_translation_entity_1.ArticleTranslation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map