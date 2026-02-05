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
exports.ScholarsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const typeorm_3 = require("typeorm");
const scholar_entity_1 = require("./entities/scholar.entity");
const scholar_book_entity_1 = require("./entities/scholar-book.entity");
const source_entity_1 = require("../sources/entities/source.entity");
const book_entity_1 = require("../books/entities/book.entity");
const book_translation_entity_1 = require("../books/entities/book-translation.entity");
const language_entity_1 = require("../languages/entities/language.entity");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
let ScholarsService = class ScholarsService {
    constructor(scholarRepository, scholarBookRepository, sourceRepository, bookRepository, bookTranslationRepository, languageRepository, userScholarFollowService) {
        this.scholarRepository = scholarRepository;
        this.scholarBookRepository = scholarBookRepository;
        this.sourceRepository = sourceRepository;
        this.bookRepository = bookRepository;
        this.bookTranslationRepository = bookTranslationRepository;
        this.languageRepository = languageRepository;
        this.userScholarFollowService = userScholarFollowService;
    }
    async create(createScholarDto, userId) {
        if (typeof createScholarDto.birthDate === 'string' &&
            (createScholarDto.birthDate === '' ||
                createScholarDto.birthDate === 'null'))
            createScholarDto.birthDate = undefined;
        if (typeof createScholarDto.deathDate === 'string' &&
            (createScholarDto.deathDate === '' ||
                createScholarDto.deathDate === 'null'))
            createScholarDto.deathDate = undefined;
        const { ownBooks, sources, relatedBooks, ...scholarData } = createScholarDto;
        const scholar = this.scholarRepository.create(scholarData);
        const savedScholar = await this.scholarRepository.save(scholar);
        if (ownBooks && ownBooks.length > 0) {
            const books = ownBooks.map((book) => this.scholarBookRepository.create({ ...book, scholar: savedScholar }));
            await this.scholarBookRepository.save(books);
        }
        if (sources && sources.length > 0) {
            const sourceEntities = sources.map((source) => this.sourceRepository.create({ ...source, scholar: savedScholar }));
            await this.sourceRepository.save(sourceEntities);
        }
        if (relatedBooks && relatedBooks.length > 0) {
            const books = await this.bookRepository.findByIds(relatedBooks);
            savedScholar.relatedBooks = books;
            await this.scholarRepository.save(savedScholar);
        }
        return this.findOne(savedScholar.id, userId);
    }
    async findAll(userId, page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.scholarRepository
            .createQueryBuilder('scholar')
            .leftJoinAndSelect('scholar.ownBooks', 'ownBooks')
            .leftJoinAndSelect('scholar.relatedBooks', 'relatedBooks')
            .leftJoinAndSelect('relatedBooks.translations', 'relatedBooksTranslations')
            .leftJoinAndSelect('scholar.sources', 'sources')
            .orderBy('scholar.id', 'DESC')
            .skip(skip)
            .take(limit);
        if (search && search.trim()) {
            const searchTerm = `${search.trim().toUpperCase()}%`;
            queryBuilder.where('UPPER(scholar.fullName) LIKE :search', {
                search: searchTerm,
            });
        }
        const scholars = await queryBuilder.getMany();
        for (const scholar of scholars) {
            if (scholar.relatedBooks && scholar.relatedBooks.length > 0) {
                for (const book of scholar.relatedBooks) {
                    const bookTranslations = await this.bookTranslationRepository.find({
                        where: { book: { id: book.id } },
                        relations: ['language'],
                    });
                    book.translations = bookTranslations.map((bt) => ({
                        id: bt.id,
                        bookId: book.id,
                        languageId: bt.language.id,
                        languageName: bt.language.name,
                        languageCode: bt.language.code,
                        title: bt.title,
                        description: bt.description,
                        summary: bt.summary,
                        pdfUrl: bt.pdfUrl || null,
                    }));
                }
            }
        }
        if (userId) {
            for (const scholar of scholars) {
                try {
                    const followRecord = await this.userScholarFollowService.findFollow(userId, scholar.id);
                    scholar.isFollowing = !!followRecord;
                }
                catch (error) {
                    scholar.isFollowing = false;
                }
            }
        }
        else {
            for (const scholar of scholars) {
                scholar.isFollowing = false;
            }
        }
        return scholars;
    }
    async getTotalCount(search) {
        if (search && search.trim()) {
            const searchTerm = `${search.trim().toUpperCase()}%`;
            return this.scholarRepository
                .createQueryBuilder('scholar')
                .where('UPPER(scholar.fullName) LIKE :search', { search: searchTerm })
                .getCount();
        }
        return this.scholarRepository.count();
    }
    async findOne(id, userId) {
        const scholar = await this.scholarRepository.findOne({
            where: { id },
            relations: ['ownBooks', 'relatedBooks', 'sources'],
        });
        if (!scholar) {
            throw new common_1.NotFoundException(`Scholar with id ${id} not found`);
        }
        if (scholar.relatedBooks && scholar.relatedBooks.length > 0) {
            for (const book of scholar.relatedBooks) {
                const bookTranslations = await this.bookTranslationRepository.find({
                    where: { book: { id: book.id } },
                    relations: ['language'],
                });
                book.translations = bookTranslations.map((bt) => ({
                    id: bt.id,
                    bookId: book.id,
                    languageId: bt.language.id,
                    languageName: bt.language.name,
                    languageCode: bt.language.code,
                    title: bt.title,
                    description: bt.description,
                    summary: bt.summary,
                    pdfUrl: bt.pdfUrl || null,
                }));
            }
        }
        if (userId) {
            try {
                const followRecord = await this.userScholarFollowService.findFollow(userId, id);
                scholar.isFollowing = !!followRecord;
            }
            catch (error) {
                scholar.isFollowing = false;
            }
        }
        else {
            scholar.isFollowing = false;
        }
        return scholar;
    }
    async update(id, updateScholarDto, userId) {
        const nullify = (val) => val === '' || val === 'null' ? undefined : val;
        updateScholarDto.birthDate = nullify(updateScholarDto.birthDate);
        updateScholarDto.deathDate = nullify(updateScholarDto.deathDate);
        const { relatedBooks, ownBooks, sources, ...scholarData } = updateScholarDto;
        const scholar = await this.scholarRepository.findOne({
            where: { id },
            relations: ['relatedBooks'],
        });
        if (!scholar) {
            throw new common_1.NotFoundException(`Scholar with id ${id} not found`);
        }
        if (scholarData.coverImage &&
            scholar.coverImage &&
            scholar.coverImage !== scholarData.coverImage) {
            try {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(process.cwd(), scholar.coverImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            catch (error) {
                console.warn('Eski cover image dosyası silinemedi:', error);
            }
        }
        Object.assign(scholar, scholarData);
        await this.scholarRepository.save(scholar);
        if (relatedBooks) {
            const books = await this.bookRepository.findBy({ id: (0, typeorm_3.In)(relatedBooks) });
            scholar.relatedBooks = books;
            await this.scholarRepository.save(scholar);
        }
        if (ownBooks) {
            await this.scholarBookRepository.delete({ scholar: { id } });
            const newBooks = ownBooks.map((book) => this.scholarBookRepository.create({ ...book, scholar }));
            await this.scholarBookRepository.save(newBooks);
        }
        if (sources) {
            await this.sourceRepository.delete({ scholar: { id } });
            const newSources = sources.map((source) => this.sourceRepository.create({ ...source, scholar }));
            await this.sourceRepository.save(newSources);
        }
        return this.findOne(id, userId);
    }
    async updateCoverImage(id, coverImageUrl, userId) {
        const scholar = await this.scholarRepository.findOne({ where: { id } });
        if (!scholar) {
            throw new common_1.NotFoundException(`Scholar with id ${id} not found`);
        }
        if (scholar.coverImage) {
            try {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(process.cwd(), scholar.coverImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            catch (error) {
                console.warn('Eski cover image dosyası silinemedi:', error);
            }
        }
        scholar.coverImage = coverImageUrl;
        await this.scholarRepository.save(scholar);
        return this.findOne(id, userId);
    }
    async remove(id) {
        const scholar = await this.findOne(id);
        if (scholar.coverImage) {
            try {
                const fs = require('fs');
                const path = require('path');
                const coverPath = path.join(process.cwd(), scholar.coverImage);
                if (fs.existsSync(coverPath)) {
                    fs.unlinkSync(coverPath);
                }
            }
            catch (error) {
                console.warn('Cover image dosyası silinemedi:', error);
            }
        }
        await this.scholarRepository.delete(id);
        return scholar;
    }
    async findOnePublic(id) {
        return this.scholarRepository.findOne({
            where: { id },
            select: [
                'id',
                'fullName',
                'photoUrl',
                'biography',
                'birthDate',
                'deathDate',
                'locationName',
                'createdAt',
            ],
        });
    }
};
exports.ScholarsService = ScholarsService;
exports.ScholarsService = ScholarsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_book_entity_1.ScholarBook)),
    __param(2, (0, typeorm_1.InjectRepository)(source_entity_1.Source)),
    __param(3, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(4, (0, typeorm_1.InjectRepository)(book_translation_entity_1.BookTranslation)),
    __param(5, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        user_scholar_follow_service_1.UserScholarFollowService])
], ScholarsService);
//# sourceMappingURL=scholars.service.js.map