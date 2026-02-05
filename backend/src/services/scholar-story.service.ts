import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScholarStory } from '../entities/scholar-story.entity';
import { StoryView } from '../entities/story-view.entity';
import { StoryLike } from '../entities/story-like.entity';
import { CreateScholarStoryDto } from '../dto/scholar-story/create-scholar-story.dto';
import { UpdateScholarStoryDto } from '../dto/scholar-story/update-scholar-story.dto';

@Injectable()
export class ScholarStoryService {
  private readonly logger = new Logger(ScholarStoryService.name);

  constructor(
    @InjectRepository(ScholarStory)
    private scholarStoryRepository: Repository<ScholarStory>,
    @InjectRepository(StoryView)
    private storyViewRepository: Repository<StoryView>,
    @InjectRepository(StoryLike)
    private storyLikeRepository: Repository<StoryLike>,
  ) {}

  async create(
    createScholarStoryDto: CreateScholarStoryDto,
  ): Promise<ScholarStory> {
    try {
      const scholarStory = this.scholarStoryRepository.create(
        createScholarStoryDto,
      );
      const savedStory = await this.scholarStoryRepository.save(scholarStory);

      this.logger.log(`Yeni alim hikayesi oluşturuldu: ${savedStory.title}`);
      return savedStory;
    } catch (error) {
      this.logger.error('Alim hikayesi oluşturulurken hata:', error.message);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    language?: string,
    isActive?: boolean,
    search?: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `findAll called with page: ${page}, limit: ${limit}, language: ${language}, isActive: ${isActive}`,
      );
      const queryBuilder = this.scholarStoryRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.scholar', 'scholar');

      // Language filtresi varsa ekle
      if (language !== undefined && language !== null && language !== '') {
        queryBuilder.where('story.language = :language', { language });
      }

      // isActive filtresi varsa ekle
      if (isActive !== undefined && isActive !== null) {
        if (language !== undefined && language !== null && language !== '') {
          queryBuilder.andWhere('story.is_active = :isActive', { isActive });
        } else {
          queryBuilder.where('story.is_active = :isActive', { isActive });
        }
      }

      // Add search functionality
      if (search && search.trim()) {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        queryBuilder.andWhere(
          '(LOWER(story.title) LIKE :search OR LOWER(story.description) LIKE :search OR LOWER(scholar.fullName) LIKE :search)',
          { search: searchTerm },
        );
      }

      // Sıralama: Önce öne çıkanlar (is_featured DESC), sonra yeni ekleneler (id DESC)
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
    } catch (error) {
      this.logger.error('Alim hikayeleri getirilirken hata:', error.message);
      throw error;
    }
  }

  async findOne(id: number): Promise<ScholarStory> {
    try {
      const story = await this.scholarStoryRepository.findOne({
        where: { id },
        relations: ['scholar'],
      });

      if (!story) {
        throw new NotFoundException(`ID ${id} ile alim hikayesi bulunamadı`);
      }

      return story;
    } catch (error) {
      this.logger.error(
        `Alim hikayesi getirilirken hata (ID: ${id}):`,
        error.message,
      );
      throw error;
    }
  }

  async findByScholarId(
    scholarId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ stories: ScholarStory[]; total: number; totalPages: number }> {
    try {
      const queryBuilder = this.scholarStoryRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.scholar', 'scholar')
        .where('story.scholar_id = :scholarId', { scholarId })
        .andWhere('story.is_active = :isActive', { isActive: true })
        .orderBy('story.is_featured', 'DESC') // Önce öne çıkanlar
        .addOrderBy('story.id', 'DESC'); // Sonra yeniler

      const total = await queryBuilder.getCount();

      const stories = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const totalPages = Math.ceil(total / limit);

      return { stories, total, totalPages };
    } catch (error) {
      this.logger.error(
        `Alim hikayeleri getirilirken hata (Scholar ID: ${scholarId}):`,
        error.message,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateScholarStoryDto: UpdateScholarStoryDto,
  ): Promise<ScholarStory> {
    try {
      const story = await this.findOne(id);

      Object.assign(story, updateScholarStoryDto);
      const updatedStory = await this.scholarStoryRepository.save(story);

      this.logger.log(`Alim hikayesi güncellendi: ${updatedStory.title}`);
      return updatedStory;
    } catch (error) {
      this.logger.error(
        `Alim hikayesi güncellenirken hata (ID: ${id}):`,
        error.message,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const story = await this.findOne(id);
      await this.scholarStoryRepository.remove(story);

      this.logger.log(`Alim hikayesi silindi: ${story.title}`);
    } catch (error) {
      this.logger.error(
        `Alim hikayesi silinirken hata (ID: ${id}):`,
        error.message,
      );
      throw error;
    }
  }

  async incrementViewCount(id: number, userId: number): Promise<void> {
    try {
      // Önce bu kullanıcı bu hikayeyi daha önce görüntülemiş mi kontrol et
      const existingView = await this.storyViewRepository.findOne({
        where: { story_id: id, user_id: userId },
      });

      if (!existingView) {
        // Yeni view kaydı oluştur
        const storyView = this.storyViewRepository.create({
          story_id: id,
          user_id: userId,
        });
        await this.storyViewRepository.save(storyView);

        // View count'u artır
        await this.scholarStoryRepository.increment({ id }, 'view_count', 1);
        this.logger.log(
          `View count artırıldı - Story ID: ${id}, User ID: ${userId}`,
        );
      } else {
        this.logger.log(
          `Kullanıcı daha önce görüntülemiş - Story ID: ${id}, User ID: ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `View count artırılırken hata (Story ID: ${id}, User ID: ${userId}):`,
        error.message,
      );
      throw error;
    }
  }

  async incrementLikeCount(id: number, userId: number): Promise<void> {
    try {
      // Önce bu kullanıcı bu hikayeyi daha önce beğenmiş mi kontrol et
      const existingLike = await this.storyLikeRepository.findOne({
        where: { story_id: id, user_id: userId },
      });

      if (!existingLike) {
        // Yeni like kaydı oluştur
        const storyLike = this.storyLikeRepository.create({
          story_id: id,
          user_id: userId,
        });
        await this.storyLikeRepository.save(storyLike);

        // Like count'u artır
        await this.scholarStoryRepository.increment({ id }, 'like_count', 1);
        this.logger.log(
          `Like count artırıldı - Story ID: ${id}, User ID: ${userId}`,
        );
      } else {
        this.logger.log(
          `Kullanıcı daha önce beğenmiş - Story ID: ${id}, User ID: ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Like count artırılırken hata (Story ID: ${id}, User ID: ${userId}):`,
        error.message,
      );
      throw error;
    }
  }

  async getFeaturedStories(limit: number = 5): Promise<ScholarStory[]> {
    try {
      return await this.scholarStoryRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.scholar', 'scholar')
        .where('story.is_featured = :isFeatured', { isFeatured: true })
        .andWhere('story.is_active = :isActive', { isActive: true })
        .orderBy('story.id', 'DESC') // Son eklenen en başta
        .limit(limit)
        .getMany();
    } catch (error) {
      this.logger.error(
        'Öne çıkan hikayeler getirilirken hata:',
        error.message,
      );
      throw error;
    }
  }

  async searchStories(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ stories: ScholarStory[]; total: number; totalPages: number }> {
    try {
      const searchQuery = `%${query}%`;

      const queryBuilder = this.scholarStoryRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.scholar', 'scholar')
        .where('story.is_active = :isActive', { isActive: true })
        .andWhere(
          '(story.title LIKE :query OR story.description LIKE :query OR scholar.fullName LIKE :query)',
          { query: searchQuery },
        )
        .orderBy('story.is_featured', 'DESC') // Önce öne çıkanlar
        .addOrderBy('story.id', 'DESC'); // Sonra yeniler

      const total = await queryBuilder.getCount();

      const stories = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const totalPages = Math.ceil(total / limit);

      return { stories, total, totalPages };
    } catch (error) {
      this.logger.error('Hikaye arama sırasında hata:', error.message);
      throw error;
    }
  }
}
