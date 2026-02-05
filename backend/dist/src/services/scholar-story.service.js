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
var ScholarStoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarStoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_story_entity_1 = require("../entities/scholar-story.entity");
const story_view_entity_1 = require("../entities/story-view.entity");
const story_like_entity_1 = require("../entities/story-like.entity");
let ScholarStoryService = ScholarStoryService_1 = class ScholarStoryService {
    constructor(scholarStoryRepository, storyViewRepository, storyLikeRepository) {
        this.scholarStoryRepository = scholarStoryRepository;
        this.storyViewRepository = storyViewRepository;
        this.storyLikeRepository = storyLikeRepository;
        this.logger = new common_1.Logger(ScholarStoryService_1.name);
    }
    async create(createScholarStoryDto) {
        try {
            const scholarStory = this.scholarStoryRepository.create(createScholarStoryDto);
            const savedStory = await this.scholarStoryRepository.save(scholarStory);
            this.logger.log(`Yeni alim hikayesi oluşturuldu: ${savedStory.title}`);
            return savedStory;
        }
        catch (error) {
            this.logger.error('Alim hikayesi oluşturulurken hata:', error.message);
            throw error;
        }
    }
    async findAll(page = 1, limit = 20, language, isActive, search) {
        try {
            this.logger.log(`findAll called with page: ${page}, limit: ${limit}, language: ${language}, isActive: ${isActive}`);
            const queryBuilder = this.scholarStoryRepository
                .createQueryBuilder('story')
                .leftJoinAndSelect('story.scholar', 'scholar');
            if (language !== undefined && language !== null && language !== '') {
                queryBuilder.where('story.language = :language', { language });
            }
            if (isActive !== undefined && isActive !== null) {
                if (language !== undefined && language !== null && language !== '') {
                    queryBuilder.andWhere('story.is_active = :isActive', { isActive });
                }
                else {
                    queryBuilder.where('story.is_active = :isActive', { isActive });
                }
            }
            if (search && search.trim()) {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                queryBuilder.andWhere('(LOWER(story.title) LIKE :search OR LOWER(story.description) LIKE :search OR LOWER(scholar.fullName) LIKE :search)', { search: searchTerm });
            }
            queryBuilder
                .orderBy('story.is_featured', 'DESC')
                .addOrderBy('story.id', 'DESC');
            const total = await queryBuilder.getCount();
            const stories = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();
            const totalPages = Math.ceil(total / limit);
            const result = {
                stories,
                total,
                totalPages,
                page: page,
                limit: limit,
            };
            this.logger.log(`Returning ${stories.length} stories for page ${page}`);
            return result;
        }
        catch (error) {
            this.logger.error('Alim hikayeleri getirilirken hata:', error.message);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const story = await this.scholarStoryRepository.findOne({
                where: { id },
                relations: ['scholar'],
            });
            if (!story) {
                throw new common_1.NotFoundException(`ID ${id} ile alim hikayesi bulunamadı`);
            }
            return story;
        }
        catch (error) {
            this.logger.error(`Alim hikayesi getirilirken hata (ID: ${id}):`, error.message);
            throw error;
        }
    }
    async findByScholarId(scholarId, page = 1, limit = 20) {
        try {
            const queryBuilder = this.scholarStoryRepository
                .createQueryBuilder('story')
                .leftJoinAndSelect('story.scholar', 'scholar')
                .where('story.scholar_id = :scholarId', { scholarId })
                .andWhere('story.is_active = :isActive', { isActive: true })
                .orderBy('story.is_featured', 'DESC')
                .addOrderBy('story.id', 'DESC');
            const total = await queryBuilder.getCount();
            const stories = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();
            const totalPages = Math.ceil(total / limit);
            return { stories, total, totalPages };
        }
        catch (error) {
            this.logger.error(`Alim hikayeleri getirilirken hata (Scholar ID: ${scholarId}):`, error.message);
            throw error;
        }
    }
    async update(id, updateScholarStoryDto) {
        try {
            const story = await this.findOne(id);
            Object.assign(story, updateScholarStoryDto);
            const updatedStory = await this.scholarStoryRepository.save(story);
            this.logger.log(`Alim hikayesi güncellendi: ${updatedStory.title}`);
            return updatedStory;
        }
        catch (error) {
            this.logger.error(`Alim hikayesi güncellenirken hata (ID: ${id}):`, error.message);
            throw error;
        }
    }
    async remove(id) {
        try {
            const story = await this.findOne(id);
            await this.scholarStoryRepository.remove(story);
            this.logger.log(`Alim hikayesi silindi: ${story.title}`);
        }
        catch (error) {
            this.logger.error(`Alim hikayesi silinirken hata (ID: ${id}):`, error.message);
            throw error;
        }
    }
    async incrementViewCount(id, userId) {
        try {
            const existingView = await this.storyViewRepository.findOne({
                where: { story_id: id, user_id: userId },
            });
            if (!existingView) {
                const storyView = this.storyViewRepository.create({
                    story_id: id,
                    user_id: userId,
                });
                await this.storyViewRepository.save(storyView);
                await this.scholarStoryRepository.increment({ id }, 'view_count', 1);
                this.logger.log(`View count artırıldı - Story ID: ${id}, User ID: ${userId}`);
            }
            else {
                this.logger.log(`Kullanıcı daha önce görüntülemiş - Story ID: ${id}, User ID: ${userId}`);
            }
        }
        catch (error) {
            this.logger.error(`View count artırılırken hata (Story ID: ${id}, User ID: ${userId}):`, error.message);
            throw error;
        }
    }
    async incrementLikeCount(id, userId) {
        try {
            const existingLike = await this.storyLikeRepository.findOne({
                where: { story_id: id, user_id: userId },
            });
            if (!existingLike) {
                const storyLike = this.storyLikeRepository.create({
                    story_id: id,
                    user_id: userId,
                });
                await this.storyLikeRepository.save(storyLike);
                await this.scholarStoryRepository.increment({ id }, 'like_count', 1);
                this.logger.log(`Like count artırıldı - Story ID: ${id}, User ID: ${userId}`);
            }
            else {
                this.logger.log(`Kullanıcı daha önce beğenmiş - Story ID: ${id}, User ID: ${userId}`);
            }
        }
        catch (error) {
            this.logger.error(`Like count artırılırken hata (Story ID: ${id}, User ID: ${userId}):`, error.message);
            throw error;
        }
    }
    async getFeaturedStories(limit = 5) {
        try {
            return await this.scholarStoryRepository
                .createQueryBuilder('story')
                .leftJoinAndSelect('story.scholar', 'scholar')
                .where('story.is_featured = :isFeatured', { isFeatured: true })
                .andWhere('story.is_active = :isActive', { isActive: true })
                .orderBy('story.id', 'DESC')
                .limit(limit)
                .getMany();
        }
        catch (error) {
            this.logger.error('Öne çıkan hikayeler getirilirken hata:', error.message);
            throw error;
        }
    }
    async searchStories(query, page = 1, limit = 20) {
        try {
            const searchQuery = `%${query}%`;
            const queryBuilder = this.scholarStoryRepository
                .createQueryBuilder('story')
                .leftJoinAndSelect('story.scholar', 'scholar')
                .where('story.is_active = :isActive', { isActive: true })
                .andWhere('(story.title LIKE :query OR story.description LIKE :query OR scholar.fullName LIKE :query)', { query: searchQuery })
                .orderBy('story.is_featured', 'DESC')
                .addOrderBy('story.id', 'DESC');
            const total = await queryBuilder.getCount();
            const stories = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();
            const totalPages = Math.ceil(total / limit);
            return { stories, total, totalPages };
        }
        catch (error) {
            this.logger.error('Hikaye arama sırasında hata:', error.message);
            throw error;
        }
    }
};
exports.ScholarStoryService = ScholarStoryService;
exports.ScholarStoryService = ScholarStoryService = ScholarStoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_story_entity_1.ScholarStory)),
    __param(1, (0, typeorm_1.InjectRepository)(story_view_entity_1.StoryView)),
    __param(2, (0, typeorm_1.InjectRepository)(story_like_entity_1.StoryLike)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ScholarStoryService);
//# sourceMappingURL=scholar-story.service.js.map