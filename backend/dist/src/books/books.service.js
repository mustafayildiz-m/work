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
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const book_entity_1 = require("./entities/book.entity");
const book_translation_entity_1 = require("./entities/book-translation.entity");
const book_category_entity_1 = require("./entities/book-category.entity");
const upload_service_1 = require("../upload/upload.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let BooksService = class BooksService {
    constructor(bookRepository, bookTranslationRepository, bookCategoryRepository, uploadService) {
        this.bookRepository = bookRepository;
        this.bookTranslationRepository = bookTranslationRepository;
        this.bookCategoryRepository = bookCategoryRepository;
        this.uploadService = uploadService;
    }
    async create(createBookDto) {
        const { translations, category, ...bookData } = createBookDto;
        const book = this.bookRepository.create(bookData);
        const savedBook = await this.bookRepository.save(book);
        if (category && Array.isArray(category)) {
            const bookCategories = category.map((catName) => this.bookCategoryRepository.create({
                bookId: savedBook.id,
                categoryName: catName,
            }));
            await this.bookCategoryRepository.save(bookCategories);
        }
        if (translations && Array.isArray(translations)) {
            const translationEntities = translations.map((trans) => this.bookTranslationRepository.create({
                ...trans,
                book: savedBook,
                bookId: savedBook.id,
                languageId: trans.languageId,
            }));
            await this.bookTranslationRepository.save(translationEntities);
            savedBook.translations = translationEntities;
        }
        return this.findOne(savedBook.id);
    }
    async findAll(languageId, search, category, page = 1, limit = 12) {
        let subQuery = this.bookRepository
            .createQueryBuilder('book')
            .select('DISTINCT book.id', 'book_id')
            .leftJoin('book.translations', 'bookTranslations')
            .leftJoin('bookTranslations.language', 'language');
        if (languageId) {
            subQuery = subQuery.andWhere('language.id = :languageId', {
                languageId: parseInt(languageId),
            });
        }
        if (search && search.trim()) {
            const searchTerm = `%${search.trim().toLowerCase()}%`;
            subQuery = subQuery.andWhere('(LOWER(bookTranslations.title) LIKE :search OR LOWER(book.author) LIKE :search OR LOWER(bookTranslations.description) LIKE :search OR LOWER(bookTranslations.summary) LIKE :search)', { search: searchTerm });
        }
        if (category && category.trim()) {
            subQuery = subQuery
                .leftJoin('book_categories', 'bookCategories', 'bookCategories.bookId = book.id')
                .andWhere('bookCategories.categoryName = :category', {
                category: category.trim(),
            });
        }
        subQuery = subQuery.orderBy('book.id', 'DESC');
        const bookIds = await subQuery.getRawMany();
        let ids = bookIds.map((item) => item.book_id || item.id || item.bookId);
        if (ids.some((id) => id === undefined)) {
            if (languageId) {
                const directQuery = await this.bookRepository
                    .createQueryBuilder('book')
                    .select('book.id')
                    .leftJoin('book.translations', 'bookTranslations')
                    .leftJoin('bookTranslations.language', 'language')
                    .where('language.id = :languageId', {
                    languageId: parseInt(languageId),
                })
                    .orderBy('book.id', 'DESC')
                    .getMany();
                ids = directQuery.map((book) => book.id);
            }
        }
        ids = ids.sort((a, b) => b - a);
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
        const books = await this.bookRepository
            .createQueryBuilder('book')
            .leftJoinAndSelect('book.translations', 'bookTranslations')
            .leftJoinAndSelect('bookTranslations.language', 'language')
            .whereInIds(paginatedIds)
            .orderBy('book.id', 'DESC')
            .getMany();
        await Promise.all(books.map(async (book) => {
            const bookCategories = await this.bookCategoryRepository.find({
                where: { bookId: book.id },
            });
            book.categories = bookCategories.map((bc) => bc.categoryName);
        }));
        return {
            data: books,
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
    async getCategories(languageId) {
        if (languageId) {
            const query = `
        SELECT DISTINCT bc.categoryName 
        FROM book_categories bc
        INNER JOIN books b ON b.id = bc.bookId
        INNER JOIN book_translations bt ON bt.bookId = b.id
        INNER JOIN languages l ON l.id = bt.languageId
        WHERE l.id = ?
      `;
            const results = await this.bookCategoryRepository.query(query, [
                parseInt(languageId),
            ]);
            return results.map((r) => r.categoryName).filter(Boolean);
        }
        else {
            const results = await this.bookCategoryRepository
                .createQueryBuilder('bookCategory')
                .select('DISTINCT bookCategory.categoryName', 'categoryName')
                .getRawMany();
            return results.map((r) => r.categoryName).filter(Boolean);
        }
    }
    async findOne(id) {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['translations', 'translations.language'],
        });
        if (!book)
            return null;
        const bookCategories = await this.bookCategoryRepository.find({
            where: { bookId: book.id },
        });
        book.categories = bookCategories.map((bc) => bc.categoryName);
        return book;
    }
    async findOnePublic(id, lang) {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['translations', 'translations.language'],
            select: ['id', 'author', 'coverUrl', 'coverImage', 'createdAt'],
        });
        if (!book) {
            return null;
        }
        let selectedTranslation = null;
        if (lang && book.translations) {
            const langMap = {
                tr: 1,
                en: 2,
                ar: 3,
                de: 4,
                fr: 5,
                ja: 6,
            };
            const targetLangId = langMap[lang];
            selectedTranslation = book.translations.find((t) => t.languageId === targetLangId);
        }
        if (!selectedTranslation && book.translations?.length > 0) {
            selectedTranslation = book.translations[0];
        }
        return {
            id: book.id,
            title: selectedTranslation?.title || 'Untitled',
            author: book.author,
            description: selectedTranslation?.description || '',
            coverUrl: book.coverUrl || book.coverImage,
            pdfUrl: selectedTranslation?.pdfUrl,
            createdAt: book.createdAt,
        };
    }
    async update(id, updateBookDto) {
        const existingBook = await this.bookRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!existingBook)
            return null;
        const { translations, category, ...bookData } = updateBookDto;
        this.bookRepository.merge(existingBook, bookData);
        const updatedBook = await this.bookRepository.save(existingBook);
        if (category && Array.isArray(category)) {
            await this.bookCategoryRepository.delete({ bookId: id });
            const newCategories = category.map((catName) => this.bookCategoryRepository.create({
                bookId: id,
                categoryName: catName,
            }));
            await this.bookCategoryRepository.save(newCategories);
        }
        if (translations && Array.isArray(translations)) {
            const existingTranslations = existingBook.translations || [];
            const updatedTranslations = [];
            for (const trans of translations) {
                if (trans.id) {
                    const existing = existingTranslations.find((t) => t.id === trans.id);
                    if (existing) {
                        const pdfUrl = trans.pdfUrl || existing.pdfUrl;
                        this.bookTranslationRepository.merge(existing, {
                            ...trans,
                            pdfUrl,
                            bookId: id,
                            languageId: trans.languageId,
                        });
                        const saved = await this.bookTranslationRepository.save(existing);
                        updatedTranslations.push(saved);
                    }
                }
                else {
                    const newTrans = this.bookTranslationRepository.create({
                        ...trans,
                        bookId: id,
                        book: updatedBook,
                        languageId: trans.languageId,
                    });
                    const saved = await this.bookTranslationRepository.save(newTrans);
                    updatedTranslations.push(saved);
                }
            }
            const sentIds = translations.filter((t) => t.id).map((t) => t.id);
            const toDelete = existingTranslations.filter((t) => !sentIds.includes(t.id));
            for (const trans of toDelete) {
                await this.bookTranslationRepository.delete(trans.id);
            }
            updatedBook.translations = updatedTranslations;
        }
        return this.findOne(id);
    }
    async remove(id) {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!book)
            return;
        if (book.coverImage) {
            const coverPath = path.join(process.cwd(), book.coverImage);
            if (fs.existsSync(coverPath)) {
                try {
                    fs.unlinkSync(coverPath);
                }
                catch (e) {
                }
            }
        }
        if (book.translations && Array.isArray(book.translations)) {
            for (const trans of book.translations) {
                if (trans.pdfUrl) {
                    const pdfPath = path.join(process.cwd(), trans.pdfUrl);
                    if (fs.existsSync(pdfPath)) {
                        try {
                            fs.unlinkSync(pdfPath);
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        await this.bookCategoryRepository.delete({ bookId: id });
        await this.bookTranslationRepository.delete({ bookId: id });
        await this.bookRepository.delete(id);
    }
    async getBooksWithArticles(languageId) {
        const query = `
      SELECT DISTINCT 
        b.id,
        bt.title,
        COUNT(DISTINCT a.id) as articleCount
      FROM books b
      INNER JOIN articles a ON a.bookId = b.id
      INNER JOIN article_translations at ON at.articleId = a.id
      INNER JOIN book_translations bt ON bt.bookId = b.id
      WHERE bt.languageId = at.languageId
      ${languageId ? 'AND bt.languageId = ?' : ''}
      GROUP BY b.id, bt.title
      HAVING COUNT(DISTINCT a.id) > 0
      ORDER BY bt.title ASC
    `;
        const params = languageId ? [parseInt(languageId)] : [];
        const results = await this.bookRepository.query(query, params);
        return results.map((result) => ({
            id: result.id,
            title: result.title,
            articleCount: parseInt(result.articleCount) || 0,
        }));
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(1, (0, typeorm_1.InjectRepository)(book_translation_entity_1.BookTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(book_category_entity_1.BookCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService])
], BooksService);
//# sourceMappingURL=books.service.js.map