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
var PodcastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodcastService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const podcast_entity_1 = require("../entities/podcast.entity");
let PodcastService = PodcastService_1 = class PodcastService {
    constructor(podcastRepository) {
        this.podcastRepository = podcastRepository;
        this.logger = new common_1.Logger(PodcastService_1.name);
    }
    async create(createPodcastDto, audioFile, coverFile) {
        try {
            const duration = typeof createPodcastDto.duration === 'string'
                ? parseInt(createPodcastDto.duration, 10)
                : createPodcastDto.duration;
            const isActive = typeof createPodcastDto.isActive === 'string'
                ? createPodcastDto.isActive === 'true'
                : createPodcastDto.isActive;
            const isFeatured = typeof createPodcastDto.isFeatured === 'string'
                ? createPodcastDto.isFeatured === 'true'
                : createPodcastDto.isFeatured;
            const podcast = this.podcastRepository.create({
                title: createPodcastDto.title,
                description: createPodcastDto.description,
                audioUrl: audioFile || createPodcastDto.audioUrl,
                coverImage: coverFile || createPodcastDto.coverImage,
                duration: duration,
                author: createPodcastDto.author,
                language: createPodcastDto.language,
                isActive: isActive,
                isFeatured: isFeatured,
                category: createPodcastDto.category,
                publishDate: createPodcastDto.publishDate ? new Date(createPodcastDto.publishDate) : undefined,
            });
            return await this.podcastRepository.save(podcast);
        }
        catch (error) {
            this.logger.error('Podcast oluşturma hatası:', error.message);
            throw error;
        }
    }
    async findAll(page = 1, limit = 20, isActive, category, isFeatured, language) {
        try {
            const queryBuilder = this.podcastRepository
                .createQueryBuilder('podcast')
                .orderBy('podcast.isFeatured', 'DESC')
                .addOrderBy('podcast.publishDate', 'DESC')
                .addOrderBy('podcast.id', 'DESC');
            if (isActive !== undefined) {
                queryBuilder.andWhere('podcast.isActive = :isActive', { isActive });
            }
            if (category) {
                queryBuilder.andWhere('podcast.category = :category', { category });
            }
            if (isFeatured !== undefined) {
                queryBuilder.andWhere('podcast.isFeatured = :isFeatured', { isFeatured });
            }
            if (language) {
                queryBuilder.andWhere('podcast.language = :language', { language });
            }
            const total = await queryBuilder.getCount();
            const podcasts = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();
            const totalPages = Math.ceil(total / limit);
            return { podcasts, total, totalPages };
        }
        catch (error) {
            this.logger.error('Podcast listesi alınırken hata:', error.message);
            throw error;
        }
    }
    async findOne(id) {
        const podcast = await this.podcastRepository.findOne({ where: { id } });
        if (!podcast) {
            throw new common_1.NotFoundException(`Podcast bulunamadı (ID: ${id})`);
        }
        return podcast;
    }
    async update(id, updatePodcastDto, audioFile, coverFile) {
        const podcast = await this.findOne(id);
        if (updatePodcastDto.duration !== undefined) {
            podcast.duration = typeof updatePodcastDto.duration === 'string'
                ? parseInt(updatePodcastDto.duration, 10)
                : updatePodcastDto.duration;
        }
        if (updatePodcastDto.isActive !== undefined) {
            podcast.isActive = typeof updatePodcastDto.isActive === 'string'
                ? updatePodcastDto.isActive === 'true'
                : updatePodcastDto.isActive;
        }
        if (updatePodcastDto.isFeatured !== undefined) {
            podcast.isFeatured = typeof updatePodcastDto.isFeatured === 'string'
                ? updatePodcastDto.isFeatured === 'true'
                : updatePodcastDto.isFeatured;
        }
        if (updatePodcastDto.title)
            podcast.title = updatePodcastDto.title;
        if (updatePodcastDto.description !== undefined)
            podcast.description = updatePodcastDto.description;
        if (updatePodcastDto.author !== undefined)
            podcast.author = updatePodcastDto.author;
        if (updatePodcastDto.language)
            podcast.language = updatePodcastDto.language;
        if (updatePodcastDto.category !== undefined)
            podcast.category = updatePodcastDto.category;
        if (updatePodcastDto.publishDate)
            podcast.publishDate = new Date(updatePodcastDto.publishDate);
        if (audioFile) {
            podcast.audioUrl = audioFile;
        }
        if (coverFile) {
            podcast.coverImage = coverFile;
        }
        return await this.podcastRepository.save(podcast);
    }
    async remove(id) {
        const podcast = await this.findOne(id);
        await this.podcastRepository.remove(podcast);
    }
    async incrementListenCount(id) {
        await this.podcastRepository.increment({ id }, 'listenCount', 1);
    }
    async incrementLikeCount(id) {
        await this.podcastRepository.increment({ id }, 'likeCount', 1);
    }
    async search(query, page = 1, limit = 20, language, category, isActive) {
        try {
            const searchQuery = `%${query}%`;
            const queryBuilder = this.podcastRepository
                .createQueryBuilder('podcast')
                .where('(podcast.title LIKE :query OR podcast.description LIKE :query OR podcast.author LIKE :query OR podcast.category LIKE :query)', { query: searchQuery })
                .orderBy('podcast.isFeatured', 'DESC')
                .addOrderBy('podcast.id', 'DESC');
            if (language) {
                queryBuilder.andWhere('podcast.language = :language', { language });
            }
            if (category) {
                queryBuilder.andWhere('podcast.category = :category', { category });
            }
            if (isActive !== undefined) {
                queryBuilder.andWhere('podcast.isActive = :isActive', { isActive });
            }
            const total = await queryBuilder.getCount();
            const podcasts = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();
            const totalPages = Math.ceil(total / limit);
            return { podcasts, total, totalPages };
        }
        catch (error) {
            this.logger.error('Podcast arama hatası:', error.message);
            throw error;
        }
    }
    async getFeaturedPodcasts(limit = 5) {
        try {
            return await this.podcastRepository.find({
                where: { isFeatured: true, isActive: true },
                order: { publishDate: 'DESC' },
                take: limit,
            });
        }
        catch (error) {
            this.logger.error('Öne çıkan podcasts alınırken hata:', error.message);
            throw error;
        }
    }
};
exports.PodcastService = PodcastService;
exports.PodcastService = PodcastService = PodcastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(podcast_entity_1.Podcast)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PodcastService);
//# sourceMappingURL=podcast.service.js.map