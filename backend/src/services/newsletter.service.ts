import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Newsletter } from '../entities/newsletter.entity';
import { CreateNewsletterDto } from '../dto/newsletter/create-newsletter.dto';
import { UpdateNewsletterDto } from '../dto/newsletter/update-newsletter.dto';
import { CacheService } from './cache.service';

const CACHE_TTL = 300; // 5 dakika

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepository: Repository<Newsletter>,
    private readonly cacheService: CacheService,
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

  private toClientModel(item: Newsletter) {
    return {
      id: item.id,
      title: item.title,
      publishDate: item.publishDate,
      publishedAt: item.publishDate,
      intro: item.intro,
      imageUrl: item.imageUrl,
      content: item.content,
      sections: item.content
        ? [{ title: 'Detay', content: item.content }]
        : [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
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
  ): Promise<Record<string, any>> {
    const cacheKey = `newsletter:list:${page}:${limit}:${search || 'all'}`;
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

    const result = {
      data: items.map((item) => this.toClientModel(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await this.cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findOne(id: number): Promise<Record<string, any>> {
    const cacheKey = `newsletter:${id}`;
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const item = await this.newsletterRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Newsletter bulunamadi (ID: ${id})`);
    }

    const result = this.toClientModel(item);
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
