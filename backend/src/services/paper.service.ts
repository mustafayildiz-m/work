import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Paper } from '../entities/paper.entity';
import { CreatePaperDto } from '../dto/paper/create-paper.dto';
import { UpdatePaperDto } from '../dto/paper/update-paper.dto';
import { CacheService } from './cache.service';

const CACHE_TTL = 300; // 5 dakika

@Injectable()
export class PaperService {
  constructor(
    @InjectRepository(Paper)
    private readonly paperRepository: Repository<Paper>,
    private readonly cacheService: CacheService,
  ) {}

  private parseTags(tags: any): string[] | null {
    if (!tags) return null;
    if (Array.isArray(tags)) return tags.filter((t) => typeof t === 'string');
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : null;
      } catch {
        return null;
      }
    }
    return null;
  }

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

  private toClientModel(item: Paper) {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      publishDate: item.publishDate,
      publishedAt: item.publishDate,
      intro: item.intro,
      imageUrl: item.imageUrl,
      tags: item.tags || [],
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
    dto: CreatePaperDto,
    imageUrl?: string,
  ): Promise<Record<string, any>> {
    const createPayload: DeepPartial<Paper> = {
      title: dto.title,
      author: dto.author || null,
      publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
      intro: dto.intro || '',
      content: this.extractContent(dto),
      imageUrl: imageUrl || null,
      tags: this.parseTags(dto.tags),
    };
    const paper = this.paperRepository.create(createPayload);

    const saved = await this.paperRepository.save(paper);
    await this.invalidatePaperCache();
    return this.toClientModel(saved);
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<Record<string, any>> {
    const cacheKey = `paper:list:${page}:${limit}:${search || 'all'}`;
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const query = this.paperRepository
      .createQueryBuilder('paper')
      .orderBy('paper.publishDate', 'DESC')
      .addOrderBy('paper.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(paper.title LIKE :search OR paper.intro LIKE :search OR paper.author LIKE :search)',
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
    const cacheKey = `paper:${id}`;
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const item = await this.paperRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Paper bulunamadi (ID: ${id})`);
    }

    const result = this.toClientModel(item);
    await this.cacheService.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async update(
    id: number,
    dto: UpdatePaperDto,
    imageUrl?: string,
  ): Promise<Record<string, any>> {
    const item = await this.paperRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Paper bulunamadi (ID: ${id})`);
    }

    if (dto.title !== undefined) item.title = dto.title;
    if (dto.author !== undefined) item.author = dto.author || null;
    if (dto.publishDate !== undefined) {
      item.publishDate = dto.publishDate ? new Date(dto.publishDate) : null;
    }
    if (dto.intro !== undefined) item.intro = dto.intro;
    if (dto.tags !== undefined) item.tags = this.parseTags(dto.tags);

    if (dto.content !== undefined || dto.sections !== undefined) {
      item.content = this.extractContent(dto);
    }

    if (imageUrl) {
      if (item.imageUrl && item.imageUrl !== imageUrl) {
        this.removeImageFiles(item.imageUrl);
      }
      item.imageUrl = imageUrl;
    }

    const updated = await this.paperRepository.save(item);
    await this.cacheService.del(`paper:${id}`);
    await this.invalidatePaperCache();
    return this.toClientModel(updated);
  }

  async remove(id: number): Promise<void> {
    const item = await this.paperRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Paper bulunamadi (ID: ${id})`);
    }

    if (item.imageUrl) {
      this.removeImageFiles(item.imageUrl);
    }

    await this.paperRepository.remove(item);
    await this.cacheService.del(`paper:${id}`);
    await this.invalidatePaperCache();
  }

  private async invalidatePaperCache(): Promise<void> {
    try {
      await this.cacheService.delPattern('paper:*');
    } catch (error) {
      console.error('Paper cache invalidation error:', error);
    }
  }

  /** Seeder veya harici işlemlerden sonra cache temizlemek için */
  async invalidateCache(): Promise<void> {
    await this.invalidatePaperCache();
  }
}
