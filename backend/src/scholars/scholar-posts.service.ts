import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScholarPost } from './entities/scholar-post.entity';
import { ScholarPostTranslation } from './entities/scholar-post-translation.entity';
import {
  CreateScholarPostDto,
  CreateTranslationDto,
} from './dto/create-scholar-post.dto';
import { UpdateTranslationDto } from './dto/update-scholar-post.dto';
import { Scholar } from './entities/scholar.entity';
import * as fs from 'fs';
import { join } from 'path';
import { CacheService } from '../services/cache.service';

@Injectable()
export class ScholarPostsService {
  constructor(
    @InjectRepository(ScholarPost)
    private scholarPostRepository: Repository<ScholarPost>,
    @InjectRepository(ScholarPostTranslation)
    private translationRepository: Repository<ScholarPostTranslation>,
    @InjectRepository(Scholar)
    private scholarRepository: Repository<Scholar>,
    private readonly cacheService: CacheService,
  ) { }

  async create(
    createScholarPostDto: CreateScholarPostDto,
  ): Promise<ScholarPost> {
    const scholar = await this.scholarRepository.findOne({
      where: { id: createScholarPostDto.scholarId },
    });

    if (!scholar) {
      throw new NotFoundException('Scholar not found');
    }

    // Post oluştur
    const post = this.scholarPostRepository.create({
      scholarId: createScholarPostDto.scholarId,
      scholar,
    });

    const savedPost = await this.scholarPostRepository.save(post);

    // Translations oluştur
    if (
      createScholarPostDto.translations &&
      createScholarPostDto.translations.length > 0
    ) {
      const translations = createScholarPostDto.translations.map(
        (translationDto) => {
          // null değerleri undefined'a çevir (TypeORM için)
          const { status, translatedBy, approvedBy, ...rest } = translationDto;
          return this.translationRepository.create({
            ...rest,
            status: status === null ? undefined : status,
            translatedBy: translatedBy === null ? undefined : translatedBy,
            approvedBy: approvedBy === null ? undefined : approvedBy,
            post: savedPost,
            postId: savedPost.id,
          });
        },
      );

      await this.translationRepository.save(translations);
    }

    // Post'u translations ile birlikte döndür
    const result = await this.scholarPostRepository.findOne({
      where: { id: savedPost.id },
      relations: ['translations'],
    });

    if (!result) {
      throw new NotFoundException('Post not found');
    }

    // Timeline cache'ini temizle (bu alimi takip eden kullanıcılar için)
    await this.clearTimelineCacheForScholar(createScholarPostDto.scholarId);

    return result;
  }

  private async clearTimelineCacheForScholar(scholarId: number): Promise<void> {
    try {
      // Bu metodun implement edilmesi için UserScholarFollow repository'ye ihtiyacımız var
      // Basit çözüm: Tüm timeline cache'ini temizle (pattern match ile)
      const pattern = 'user-posts:timeline:*';
      await this.cacheService.delPattern(pattern);
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
    }
  }

  async findAll(scholarId: number, language?: string): Promise<ScholarPost[]> {
    // Tüm translations'ları getir
    const posts = await this.scholarPostRepository.find({
      where: { scholarId },
      relations: ['translations', 'scholar'],
      order: { createdAt: 'DESC' },
    });

    // Eğer language belirtilmişse, her post'ta o dil önce gelecek şekilde sırala
    if (language) {
      posts.forEach((post) => {
        if (post.translations) {
          post.translations.sort((a, b) => {
            if (a.language === language) return -1;
            if (b.language === language) return 1;
            return 0;
          });
        }
      });
    }

    return posts;
  }

  async findOne(id: string, language?: string): Promise<ScholarPost> {
    // Tüm translations'ları getir, frontend'de language'e göre filtreleme yapılacak
    const post = await this.scholarPostRepository.findOne({
      where: { id },
      relations: ['translations', 'scholar'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Eğer language belirtilmişse, o dil önce gelecek şekilde sırala
    if (language && post.translations) {
      post.translations.sort((a, b) => {
        if (a.language === language) return -1;
        if (b.language === language) return 1;
        return 0;
      });
    }

    return post;
  }

  async remove(id: string): Promise<void> {
    const result = await this.scholarPostRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Post not found');
    }
  }

  async update(
    id: string,
    updateDto: UpdateTranslationDto,
  ): Promise<ScholarPost> {
    const post = await this.scholarPostRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.scholarPostRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!result) {
      throw new NotFoundException('Post not found');
    }

    return result;
  }

  // Translation ekleme/güncelleme
  async addOrUpdateTranslation(
    postId: string,
    language: string,
    translationData: UpdateTranslationDto,
  ): Promise<ScholarPostTranslation> {
    const post = await this.scholarPostRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Mevcut translation var mı kontrol et
    let translation = await this.translationRepository.findOne({
      where: { postId, language },
    });

    if (translation) {
      // Eski dosyaları temizle (eğer değişmişse)
      const oldFileUrls = translation.fileUrls || [];
      const oldMediaUrls = translation.mediaUrls || [];
      const newFileUrls = translationData.fileUrls || [];
      const newMediaUrls = translationData.mediaUrls || [];

      const filesToDelete = oldFileUrls.filter(
        (url) => !newFileUrls.includes(url),
      );
      const mediaToDelete = oldMediaUrls.filter(
        (url) => !newMediaUrls.includes(url),
      );
      const allToDelete = [...filesToDelete, ...mediaToDelete];

      for (const filePath of allToDelete) {
        const absolutePath = join(process.cwd(), filePath);
        if (fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
          } catch (err) {
            console.error('Dosya silinemedi:', absolutePath, err);
          }
        }
      }

      // Güncelle
      Object.assign(translation, translationData);
    } else {
      // Yeni translation oluştur - null değerleri undefined'a çevir
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

  // Translation silme
  async deleteTranslation(postId: string, language: string): Promise<void> {
    const translation = await this.translationRepository.findOne({
      where: { postId, language },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    // Dosyaları sil
    const allFiles = [
      ...(translation.fileUrls || []),
      ...(translation.mediaUrls || []),
    ];

    for (const filePath of allFiles) {
      const absolutePath = join(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (err) {
          console.error('Dosya silinemedi:', absolutePath, err);
        }
      }
    }

    await this.translationRepository.delete({ postId, language });
  }
}
