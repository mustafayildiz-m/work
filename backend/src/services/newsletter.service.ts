import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Newsletter } from '../entities/newsletter.entity';
import { NewsletterTranslation } from '../entities/newsletter-translation.entity';
import { CreateNewsletterDto } from '../dto/newsletter/create-newsletter.dto';
import { UpdateNewsletterDto } from '../dto/newsletter/update-newsletter.dto';
import { CacheService } from './cache.service';
import { TranslationService } from './translation.service';
import { UserPostsService } from './user-posts.service';

const CACHE_TTL = 300; // 5 dakika

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepository: Repository<Newsletter>,
    @InjectRepository(NewsletterTranslation)
    private readonly newsletterTranslationRepo: Repository<NewsletterTranslation>,
    private readonly cacheService: CacheService,
    private readonly translationService: TranslationService,
    private readonly userPostsService: UserPostsService,
  ) {}

  private extractContent(dto: { content?: string; sections?: any }): string {
    if (dto.content && typeof dto.content === 'string') {
      return dto.content;
    }

    if (!dto.sections) {
      return '';
    }

    const sectionsValue =
      typeof dto.sections === 'string' ? JSON.parse(dto.sections) : dto.sections;

    if (!Array.isArray(sectionsValue) || sectionsValue.length === 0) {
      return '';
    }

    return sectionsValue[0]?.content || '';
  }

  private toClientModel(
    item: Newsletter,
    overrides?: { title?: string; intro?: string; content?: string },
  ) {
    const title = overrides?.title ?? item.title;
    const intro = overrides?.intro ?? item.intro;
    const content = overrides?.content ?? item.content;
    return {
      id: item.id,
      title,
      publishDate: item.publishDate,
      publishedAt: item.publishDate,
      intro,
      imageUrl: item.imageUrl,
      content,
      sections: content
        ? [{ title: 'Detay', content }]
        : [],
      sourceLanguage: item.sourceLanguage || 'tr',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private async getOrCreateTranslation(
    newsletter: Newsletter,
    targetLangCode: string,
  ): Promise<NewsletterTranslation | null> {
    const targetNorm = targetLangCode?.toLowerCase().split('-')[0];
    const sourceNorm = (newsletter.sourceLanguage || 'tr')
      ?.toLowerCase()
      .split('-')[0];
    if (!targetNorm || !sourceNorm || targetNorm === sourceNorm) return null;

    let trans = await this.newsletterTranslationRepo.findOne({
      where: { newsletterId: newsletter.id, languageCode: targetNorm },
    });
    if (trans) return trans;

    try {
      const [title, intro, content] = await Promise.all([
        this.translationService.translateText(
          newsletter.title || '',
          targetNorm,
          sourceNorm,
        ),
        newsletter.intro
          ? this.translationService.translateText(
              newsletter.intro,
              targetNorm,
              sourceNorm,
            )
          : Promise.resolve(''),
        newsletter.content
          ? this.translationService.translateLongText(
              newsletter.content,
              targetNorm,
              sourceNorm,
            )
          : Promise.resolve(''),
      ]);

      trans = this.newsletterTranslationRepo.create({
        newsletterId: newsletter.id,
        languageCode: targetNorm,
        title,
        intro: intro || null,
        content: content || null,
      });
      await this.newsletterTranslationRepo.save(trans);
      return trans;
    } catch (err) {
      console.error('Newsletter translation error:', err);
      return null;
    }
  }

  private removeImageFiles(imageUrl?: string | null): void {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      return;
    }

    const normalizedFileName = imageUrl.replace('/uploads/', '');
    const imageAbsolutePath = path.join(
      process.cwd(),
      'uploads',
      normalizedFileName,
    );
    const thumbnailAbsolutePath = path.join(
      process.cwd(),
      'uploads',
      'thumbnails',
      normalizedFileName,
    );

    if (fs.existsSync(imageAbsolutePath)) {
      fs.unlinkSync(imageAbsolutePath);
    }

    if (fs.existsSync(thumbnailAbsolutePath)) {
      fs.unlinkSync(thumbnailAbsolutePath);
    }
  }

  async create(
    dto: CreateNewsletterDto,
    imageUrl?: string,
  ): Promise<Record<string, any>> {
    const createPayload: DeepPartial<Newsletter> = {
      title: dto.title,
      publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
      intro: dto.intro || '',
      content: this.extractContent(dto),
      imageUrl: imageUrl || null,
      sourceLanguage:
        dto.sourceLanguage?.toLowerCase().split('-')[0] || 'tr',
    };
    const newsletter = this.newsletterRepository.create(createPayload);

    const saved = await this.newsletterRepository.save(newsletter);
    await this.invalidateNewsletterCache();
    return this.toClientModel(saved);
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    lang?: string,
  ): Promise<Record<string, any>> {
    const langNorm = lang?.toLowerCase().split('-')[0];
    const cacheKey = `newsletter:list:${page}:${limit}:${search || 'all'}:${langNorm || 'tr'}`;
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const query = this.newsletterRepository
      .createQueryBuilder('newsletter')
      .orderBy('newsletter.publishDate', 'DESC')
      .addOrderBy('newsletter.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(newsletter.title LIKE :search OR newsletter.intro LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      items.map(async (item) => {
        const sourceNorm = (item.sourceLanguage || 'tr')
          ?.toLowerCase()
          .split('-')[0];
        if (langNorm && langNorm !== sourceNorm) {
          const trans = await this.getOrCreateTranslation(item, langNorm);
          if (trans) {
            return this.toClientModel(item, {
              title: trans.title,
              intro: trans.intro ?? undefined,
              content: trans.content ?? undefined,
            });
          }
        }
        return this.toClientModel(item);
      }),
    );

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await this.cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findOne(id: number, lang?: string): Promise<Record<string, any>> {
    const langNorm = lang?.toLowerCase().split('-')[0];
    const cacheKey = `newsletter:${id}:${langNorm || 'tr'}`;
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const item = await this.newsletterRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Newsletter bulunamadi (ID: ${id})`);
    }

    const sourceNorm = (item.sourceLanguage || 'tr')
      ?.toLowerCase()
      .split('-')[0];
    let result: Record<string, any>;
    if (langNorm && langNorm !== sourceNorm) {
      const trans = await this.getOrCreateTranslation(item, langNorm);
      if (trans) {
        result = this.toClientModel(item, {
          title: trans.title,
          intro: trans.intro ?? undefined,
          content: trans.content ?? undefined,
        });
      } else {
        result = this.toClientModel(item);
      }
    } else {
      result = this.toClientModel(item);
    }

    await this.cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async update(
    id: number,
    dto: UpdateNewsletterDto,
    imageUrl?: string,
  ): Promise<Record<string, any>> {
    const item = await this.newsletterRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Newsletter bulunamadi (ID: ${id})`);
    }

    if (dto.title !== undefined) item.title = dto.title;
    if (dto.publishDate !== undefined) {
      item.publishDate = dto.publishDate ? new Date(dto.publishDate) : null;
    }
    if (dto.intro !== undefined) item.intro = dto.intro;

    if (dto.content !== undefined || dto.sections !== undefined) {
      item.content = this.extractContent(dto);
    }

    if (dto.sourceLanguage !== undefined) {
      const newSource =
        dto.sourceLanguage?.toLowerCase().split('-')[0] || 'tr';
      if (newSource !== (item.sourceLanguage || 'tr')) {
        await this.newsletterTranslationRepo.delete({ newsletterId: item.id });
      }
      item.sourceLanguage = newSource;
    }

    if (imageUrl) {
      if (item.imageUrl && item.imageUrl !== imageUrl) {
        this.removeImageFiles(item.imageUrl);
      }
      item.imageUrl = imageUrl;
    }

    const updated = await this.newsletterRepository.save(item);
    await this.cacheService.del(`newsletter:${id}`);
    await this.invalidateNewsletterCache();
    return this.toClientModel(updated);
  }

  async remove(id: number): Promise<void> {
    const item = await this.newsletterRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Newsletter bulunamadi (ID: ${id})`);
    }

    await this.userPostsService.removePostsBySharedNewsletterId(id);

    if (item.imageUrl) {
      this.removeImageFiles(item.imageUrl);
    }

    await this.newsletterRepository.remove(item);
    await this.cacheService.del(`newsletter:${id}`);
    await this.invalidateNewsletterCache();
  }

  private async invalidateNewsletterCache(): Promise<void> {
    try {
      await this.cacheService.delPattern('newsletter:*');
    } catch (error) {
      console.error('Newsletter cache invalidation error:', error);
    }
  }
}
