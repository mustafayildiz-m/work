import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Podcast } from '../entities/podcast.entity';
import { CreatePodcastDto } from '../dto/podcast/create-podcast.dto';
import { UpdatePodcastDto } from '../dto/podcast/update-podcast.dto';

@Injectable()
export class PodcastService {
  private readonly logger = new Logger(PodcastService.name);

  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
  ) { }

  async create(
    createPodcastDto: CreatePodcastDto,
    audioFile?: string,
    coverFile?: string,
  ): Promise<Podcast> {
    try {
      // Tip dönüşümleri yap
      const duration =
        typeof createPodcastDto.duration === 'string'
          ? parseInt(createPodcastDto.duration, 10)
          : createPodcastDto.duration;

      const isActive =
        typeof createPodcastDto.isActive === 'string'
          ? createPodcastDto.isActive === 'true'
          : createPodcastDto.isActive;

      const isFeatured =
        typeof createPodcastDto.isFeatured === 'string'
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
        publishDate: createPodcastDto.publishDate
          ? new Date(createPodcastDto.publishDate)
          : undefined,
      });

      return await this.podcastRepository.save(podcast);
    } catch (error) {
      this.logger.error('Podcast oluşturma hatası:', error.message);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    isActive?: boolean,
    category?: string,
    isFeatured?: boolean,
    language?: string,
  ): Promise<{ podcasts: Podcast[]; total: number; totalPages: number }> {
    try {
      const queryBuilder = this.podcastRepository
        .createQueryBuilder('podcast')
        .orderBy('podcast.createdAt', 'DESC');

      if (isActive !== undefined) {
        queryBuilder.andWhere('podcast.isActive = :isActive', { isActive });
      }

      if (category) {
        queryBuilder.andWhere('podcast.category = :category', { category });
      }

      if (isFeatured !== undefined) {
        queryBuilder.andWhere('podcast.isFeatured = :isFeatured', {
          isFeatured,
        });
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
    } catch (error) {
      this.logger.error('Podcast listesi alınırken hata:', error.message);
      throw error;
    }
  }

  async findOne(id: number): Promise<Podcast> {
    const podcast = await this.podcastRepository.findOne({ where: { id } });

    if (!podcast) {
      throw new NotFoundException(`Podcast bulunamadı (ID: ${id})`);
    }

    return podcast;
  }

  async update(
    id: number,
    updatePodcastDto: UpdatePodcastDto,
    audioFile?: string,
    coverFile?: string,
  ): Promise<Podcast> {
    const podcast = await this.findOne(id);

    // Tip dönüşümleri yap
    if (updatePodcastDto.duration !== undefined) {
      podcast.duration =
        typeof updatePodcastDto.duration === 'string'
          ? parseInt(updatePodcastDto.duration, 10)
          : updatePodcastDto.duration;
    }

    if (updatePodcastDto.isActive !== undefined) {
      podcast.isActive =
        typeof updatePodcastDto.isActive === 'string'
          ? updatePodcastDto.isActive === 'true'
          : updatePodcastDto.isActive;
    }

    if (updatePodcastDto.isFeatured !== undefined) {
      podcast.isFeatured =
        typeof updatePodcastDto.isFeatured === 'string'
          ? updatePodcastDto.isFeatured === 'true'
          : updatePodcastDto.isFeatured;
    }

    if (updatePodcastDto.title) podcast.title = updatePodcastDto.title;
    if (updatePodcastDto.description !== undefined)
      podcast.description = updatePodcastDto.description;
    if (updatePodcastDto.author !== undefined)
      podcast.author = updatePodcastDto.author;
    if (updatePodcastDto.language) podcast.language = updatePodcastDto.language;
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

  async remove(id: number): Promise<void> {
    const podcast = await this.findOne(id);
    await this.podcastRepository.remove(podcast);
  }

  async incrementListenCount(id: number): Promise<void> {
    await this.podcastRepository.increment({ id }, 'listenCount', 1);
  }

  async incrementLikeCount(id: number): Promise<void> {
    await this.podcastRepository.increment({ id }, 'likeCount', 1);
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 20,
    language?: string,
    category?: string,
    isActive?: boolean,
  ): Promise<{ podcasts: Podcast[]; total: number; totalPages: number }> {
    try {
      const searchQuery = `%${query}%`;

      const queryBuilder = this.podcastRepository
        .createQueryBuilder('podcast')
        .where(
          '(podcast.title LIKE :query OR podcast.description LIKE :query OR podcast.author LIKE :query OR podcast.category LIKE :query)',
          { query: searchQuery },
        )
        .orderBy('podcast.createdAt', 'DESC');

      // Language filtresi
      if (language) {
        queryBuilder.andWhere('podcast.language = :language', { language });
      }

      // Category filtresi
      if (category) {
        queryBuilder.andWhere('podcast.category = :category', { category });
      }

      // isActive filtresi
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
    } catch (error) {
      this.logger.error('Podcast arama hatası:', error.message);
      throw error;
    }
  }

  async getFeaturedPodcasts(limit: number = 5): Promise<Podcast[]> {
    try {
      return await this.podcastRepository.find({
        where: { isFeatured: true, isActive: true },
        order: { publishDate: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Öne çıkan podcasts alınırken hata:', error.message);
      throw error;
    }
  }
}
