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
exports.ScholarPostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_post_entity_1 = require("./entities/scholar-post.entity");
const scholar_post_translation_entity_1 = require("./entities/scholar-post-translation.entity");
const scholar_entity_1 = require("./entities/scholar.entity");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const cache_service_1 = require("../services/cache.service");
let ScholarPostsService = class ScholarPostsService {
    constructor(scholarPostRepository, translationRepository, scholarRepository, cacheService) {
        this.scholarPostRepository = scholarPostRepository;
        this.translationRepository = translationRepository;
        this.scholarRepository = scholarRepository;
        this.cacheService = cacheService;
    }
    async create(createScholarPostDto) {
        const scholar = await this.scholarRepository.findOne({
            where: { id: createScholarPostDto.scholarId },
        });
        if (!scholar) {
            throw new common_1.NotFoundException('Scholar not found');
        }
        const post = this.scholarPostRepository.create({
            scholarId: createScholarPostDto.scholarId,
            scholar,
        });
        const savedPost = await this.scholarPostRepository.save(post);
        if (createScholarPostDto.translations &&
            createScholarPostDto.translations.length > 0) {
            const translations = createScholarPostDto.translations.map((translationDto) => {
                const { status, translatedBy, approvedBy, ...rest } = translationDto;
                return this.translationRepository.create({
                    ...rest,
                    status: status === null ? undefined : status,
                    translatedBy: translatedBy === null ? undefined : translatedBy,
                    approvedBy: approvedBy === null ? undefined : approvedBy,
                    post: savedPost,
                    postId: savedPost.id,
                });
            });
            await this.translationRepository.save(translations);
        }
        const result = await this.scholarPostRepository.findOne({
            where: { id: savedPost.id },
            relations: ['translations'],
        });
        if (!result) {
            throw new common_1.NotFoundException('Post not found');
        }
        await this.clearTimelineCacheForScholar(createScholarPostDto.scholarId);
        return result;
    }
    async clearTimelineCacheForScholar(scholarId) {
        try {
            const pattern = 'user-posts:timeline:*';
            await this.cacheService.delPattern(pattern);
        }
        catch (error) {
            console.error('Cache temizleme hatası:', error);
        }
    }
    async findAll(scholarId, language) {
        const posts = await this.scholarPostRepository.find({
            where: { scholarId },
            relations: ['translations', 'scholar'],
            order: { createdAt: 'DESC' },
        });
        if (language) {
            posts.forEach((post) => {
                if (post.translations) {
                    post.translations.sort((a, b) => {
                        if (a.language === language)
                            return -1;
                        if (b.language === language)
                            return 1;
                        return 0;
                    });
                }
            });
        }
        return posts;
    }
    async findOne(id, language) {
        const post = await this.scholarPostRepository.findOne({
            where: { id },
            relations: ['translations', 'scholar'],
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (language && post.translations) {
            post.translations.sort((a, b) => {
                if (a.language === language)
                    return -1;
                if (b.language === language)
                    return 1;
                return 0;
            });
        }
        return post;
    }
    async remove(id) {
        const result = await this.scholarPostRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Post not found');
        }
    }
    async update(id, updateDto) {
        const post = await this.scholarPostRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const result = await this.scholarPostRepository.findOne({
            where: { id },
            relations: ['translations'],
        });
        if (!result) {
            throw new common_1.NotFoundException('Post not found');
        }
        return result;
    }
    async addOrUpdateTranslation(postId, language, translationData) {
        const post = await this.scholarPostRepository.findOne({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        let translation = await this.translationRepository.findOne({
            where: { postId, language },
        });
        if (translation) {
            const oldFileUrls = translation.fileUrls || [];
            const oldMediaUrls = translation.mediaUrls || [];
            const newFileUrls = translationData.fileUrls || [];
            const newMediaUrls = translationData.mediaUrls || [];
            const filesToDelete = oldFileUrls.filter((url) => !newFileUrls.includes(url));
            const mediaToDelete = oldMediaUrls.filter((url) => !newMediaUrls.includes(url));
            const allToDelete = [...filesToDelete, ...mediaToDelete];
            for (const filePath of allToDelete) {
                const absolutePath = (0, path_1.join)(process.cwd(), filePath);
                if (fs.existsSync(absolutePath)) {
                    try {
                        fs.unlinkSync(absolutePath);
                    }
                    catch (err) {
                        console.error('Dosya silinemedi:', absolutePath, err);
                    }
                }
            }
            Object.assign(translation, translationData);
        }
        else {
            const { status, translatedBy, approvedBy, ...rest } = translationData;
            translation = this.translationRepository.create({
                ...rest,
                status: status === null ? undefined : status,
                translatedBy: translatedBy === null ? undefined : translatedBy,
                approvedBy: approvedBy === null ? undefined : approvedBy,
                postId,
                language,
                post,
            });
        }
        return this.translationRepository.save(translation);
    }
    async deleteTranslation(postId, language) {
        const translation = await this.translationRepository.findOne({
            where: { postId, language },
        });
        if (!translation) {
            throw new common_1.NotFoundException('Translation not found');
        }
        const allFiles = [
            ...(translation.fileUrls || []),
            ...(translation.mediaUrls || []),
        ];
        for (const filePath of allFiles) {
            const absolutePath = (0, path_1.join)(process.cwd(), filePath);
            if (fs.existsSync(absolutePath)) {
                try {
                    fs.unlinkSync(absolutePath);
                }
                catch (err) {
                    console.error('Dosya silinemedi:', absolutePath, err);
                }
            }
        }
        await this.translationRepository.delete({ postId, language });
    }
};
exports.ScholarPostsService = ScholarPostsService;
exports.ScholarPostsService = ScholarPostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_post_entity_1.ScholarPost)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_post_translation_entity_1.ScholarPostTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cache_service_1.CacheService])
], ScholarPostsService);
//# sourceMappingURL=scholar-posts.service.js.map