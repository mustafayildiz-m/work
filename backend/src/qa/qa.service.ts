import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Brackets, IsNull } from 'typeorm';
import { QaCategory } from './entities/qa-category.entity';
import { QaCategoryTranslation } from './entities/qa-category-translation.entity';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';
import { QaTag } from './entities/qa-tag.entity';
import { QaTagTranslation } from './entities/qa-tag-translation.entity';
import { CreateQaCategoryDto } from './dto/create-qa-category.dto';
import { UpdateQaCategoryDto } from './dto/update-qa-category.dto';
import { CreateQaItemDto } from './dto/create-qa-item.dto';
import { UpdateQaItemDto } from './dto/update-qa-item.dto';
import { CreateQaTagDto, UpdateQaTagDto } from './dto/create-qa-tag.dto';
import { QaFilterDto } from './dto/qa-filter.dto';

@Injectable()
export class QaService {
  constructor(
    @InjectRepository(QaCategory)
    private categoryRepo: Repository<QaCategory>,
    @InjectRepository(QaCategoryTranslation)
    private categoryTransRepo: Repository<QaCategoryTranslation>,
    @InjectRepository(QaItem)
    private itemRepo: Repository<QaItem>,
    @InjectRepository(QaItemTranslation)
    private itemTransRepo: Repository<QaItemTranslation>,
    @InjectRepository(QaTag)
    private tagRepo: Repository<QaTag>,
    @InjectRepository(QaTagTranslation)
    private tagTransRepo: Repository<QaTagTranslation>,
  ) {}

  // ─── CATEGORIES ──────────────────────────────────────────────

  async createCategory(dto: CreateQaCategoryDto): Promise<QaCategory> {
    const category = this.categoryRepo.create({
      parentId: dto.parentId,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
      iconUrl: dto.iconUrl,
    });
    const saved = await this.categoryRepo.save(category);

    if (dto.translations?.length) {
      const translations = dto.translations.map((t) =>
        this.categoryTransRepo.create({
          categoryId: saved.id,
          languageId: t.languageId,
          name: t.name,
          description: t.description,
        }),
      );
      await this.categoryTransRepo.save(translations);
    }

    const result = await this.categoryRepo.findOne({
      where: { id: saved.id },
      relations: ['translations', 'children', 'children.translations'],
    });
    return result!;
  }

  async updateCategory(id: number, dto: UpdateQaCategoryDto): Promise<QaCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.parentId !== undefined) category.parentId = dto.parentId;
    if (dto.order !== undefined) category.order = dto.order;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.iconUrl !== undefined) category.iconUrl = dto.iconUrl;

    await this.categoryRepo.save(category);

    if (dto.translations?.length) {
      await this.categoryTransRepo.delete({ categoryId: id });
      const translations = dto.translations.map((t) =>
        this.categoryTransRepo.create({
          categoryId: id,
          languageId: t.languageId,
          name: t.name,
          description: t.description,
        }),
      );
      await this.categoryTransRepo.save(translations);
    }

    const result = await this.categoryRepo.findOne({
      where: { id },
      relations: ['translations', 'children', 'children.translations'],
    });
    return result!;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(category);
  }

  async getCategories(languageId?: number): Promise<QaCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ['translations', 'children', 'children.translations'],
      order: { order: 'ASC', children: { order: 'ASC' } },
    });

    if (!languageId) return categories;

    return categories
      .map((cat) => this.localizeCategory(cat, languageId))
      .filter((cat): cat is QaCategory => cat !== null);
  }

  async getCategoryById(id: number): Promise<QaCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['translations', 'children', 'children.translations', 'parent'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getAllCategoriesAdmin(): Promise<QaCategory[]> {
    return this.categoryRepo.find({
      where: { parentId: IsNull() },
      relations: ['translations', 'children', 'children.translations'],
      order: { order: 'ASC', children: { order: 'ASC' } },
    });
  }

  // ─── ITEMS ───────────────────────────────────────────────────

  async createItem(dto: CreateQaItemDto): Promise<QaItem> {
    const item = this.itemRepo.create({
      categoryId: dto.categoryId,
      order: dto.order ?? 0,
      sourceReference: dto.sourceReference,
      sourceBookletName: dto.sourceBookletName,
      sourceSection: dto.sourceSection,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.itemRepo.save(item);

    if (dto.translations?.length) {
      const translations = dto.translations.map((t) =>
        this.itemTransRepo.create({
          qaItemId: saved.id,
          languageId: t.languageId,
          question: t.question,
          answer: t.answer,
          keywords: t.keywords,
        }),
      );
      await this.itemTransRepo.save(translations);
    }

    if (dto.tagIds?.length) {
      const tags = await this.tagRepo.findBy({ id: In(dto.tagIds) });
      saved.tags = tags;
      await this.itemRepo.save(saved);
    }

    const result = await this.itemRepo.findOne({
      where: { id: saved.id },
      relations: ['translations', 'tags', 'tags.translations', 'category', 'category.translations'],
    });
    return result!;
  }

  async updateItem(id: number, dto: UpdateQaItemDto): Promise<QaItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!item) throw new NotFoundException('Q&A item not found');

    if (dto.categoryId !== undefined) item.categoryId = dto.categoryId;
    if (dto.order !== undefined) item.order = dto.order;
    if (dto.sourceReference !== undefined) item.sourceReference = dto.sourceReference;
    if (dto.sourceBookletName !== undefined) item.sourceBookletName = dto.sourceBookletName;
    if (dto.sourceSection !== undefined) item.sourceSection = dto.sourceSection;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;

    await this.itemRepo.save(item);

    if (dto.translations?.length) {
      await this.itemTransRepo.delete({ qaItemId: id });
      const translations = dto.translations.map((t) =>
        this.itemTransRepo.create({
          qaItemId: id,
          languageId: t.languageId,
          question: t.question,
          answer: t.answer,
          keywords: t.keywords,
        }),
      );
      await this.itemTransRepo.save(translations);
    }

    if (dto.tagIds !== undefined) {
      const tags = dto.tagIds.length ? await this.tagRepo.findBy({ id: In(dto.tagIds) }) : [];
      item.tags = tags;
      await this.itemRepo.save(item);
    }

    const result = await this.itemRepo.findOne({
      where: { id },
      relations: ['translations', 'tags', 'tags.translations', 'category', 'category.translations'],
    });
    return result!;
  }

  async deleteItem(id: number): Promise<void> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Q&A item not found');
    await this.itemRepo.remove(item);
  }

  async getItemById(id: number): Promise<QaItem> {
    const item = await this.itemRepo.findOne({
      where: { id, isActive: true },
      relations: ['translations', 'tags', 'tags.translations', 'category', 'category.translations'],
    });
    if (!item) throw new NotFoundException('Q&A item not found');

    item.viewCount += 1;
    await this.itemRepo.save(item);

    return item;
  }

  async getItemsByCategory(categoryId: number, languageId?: number, page = 1, limit = 50): Promise<{ items: QaItem[]; total: number }> {
    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.translations', 'trans')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('tag.translations', 'tagTrans')
      .where('item.categoryId = :categoryId', { categoryId })
      .andWhere('item.isActive = :active', { active: true })
      .orderBy('item.order', 'ASC');

    if (languageId) {
      qb.andWhere('trans.languageId = :languageId', { languageId });
    }

    const total = await qb.getCount();
    const rawItems = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = rawItems.map((item) => this.localizeItem(item, languageId));

    return { items, total };
  }

  async searchItems(filter: QaFilterDto): Promise<{ items: QaItem[]; total: number }> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.translations', 'trans')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('tag.translations', 'tagTrans')
      .leftJoinAndSelect('item.category', 'cat')
      .leftJoinAndSelect('cat.translations', 'catTrans')
      .where('item.isActive = :active', { active: true });

    if (filter.languageId) {
      qb.andWhere('trans.languageId = :languageId', { languageId: filter.languageId });
    }

    if (filter.categoryId) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId: filter.categoryId });
    }

    if (filter.tagId) {
      qb.andWhere('tag.id = :tagId', { tagId: filter.tagId });
    }

    if (filter.q) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('MATCH(trans.question, trans.answer, trans.keywords) AGAINST(:q IN BOOLEAN MODE)', { q: `*${filter.q}*` })
            .orWhere('trans.question LIKE :like', { like: `%${filter.q}%` })
            .orWhere('trans.answer LIKE :like', { like: `%${filter.q}%` })
            .orWhere('trans.keywords LIKE :like', { like: `%${filter.q}%` });
        }),
      );
    }

    qb.orderBy('item.order', 'ASC');

    const total = await qb.getCount();
    const rawItems = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = rawItems.map((item) => this.localizeItem(item, filter.languageId));

    return { items, total };
  }

  async getAllItemsAdmin(filter: QaFilterDto): Promise<{ items: QaItem[]; total: number }> {
    const page = filter.page || 1;
    const limit = filter.limit || 50;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.translations', 'trans')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('tag.translations', 'tagTrans')
      .leftJoinAndSelect('item.category', 'cat')
      .leftJoinAndSelect('cat.translations', 'catTrans');

    if (filter.categoryId) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId: filter.categoryId });
    }

    if (filter.languageId) {
      qb.andWhere('trans.languageId = :languageId', { languageId: filter.languageId });
    }

    if (filter.q) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('trans.question LIKE :like', { like: `%${filter.q}%` })
            .orWhere('trans.answer LIKE :like', { like: `%${filter.q}%` })
            .orWhere('trans.keywords LIKE :like', { like: `%${filter.q}%` });
        }),
      );
    }

    qb.orderBy('item.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  // ─── TAGS ────────────────────────────────────────────────────

  async createTag(dto: CreateQaTagDto): Promise<QaTag> {
    const tag = this.tagRepo.create();
    const saved = await this.tagRepo.save(tag);

    if (dto.translations?.length) {
      const translations = dto.translations.map((t) =>
        this.tagTransRepo.create({
          tagId: saved.id,
          languageId: t.languageId,
          name: t.name,
        }),
      );
      await this.tagTransRepo.save(translations);
    }

    const result = await this.tagRepo.findOne({ where: { id: saved.id }, relations: ['translations'] });
    return result!;
  }

  async updateTag(id: number, dto: UpdateQaTagDto): Promise<QaTag> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    if (dto.translations?.length) {
      await this.tagTransRepo.delete({ tagId: id });
      const translations = dto.translations.map((t) =>
        this.tagTransRepo.create({
          tagId: id,
          languageId: t.languageId,
          name: t.name,
        }),
      );
      await this.tagTransRepo.save(translations);
    }

    const result = await this.tagRepo.findOne({ where: { id }, relations: ['translations'] });
    return result!;
  }

  async deleteTag(id: number): Promise<void> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepo.remove(tag);
  }

  async getAllTags(): Promise<QaTag[]> {
    return this.tagRepo.find({ relations: ['translations'], order: { createdAt: 'DESC' } });
  }

  private filterTranslations<T extends { languageId: number }>(
    translations: T[] | undefined,
    languageId: number,
  ): T[] {
    return translations?.filter((t) => t.languageId === languageId) ?? [];
  }

  private localizeCategory(category: QaCategory, languageId: number): QaCategory | null {
    const translations = this.filterTranslations(category.translations, languageId);
    if (!translations.length) return null;

    const children =
      category.children
        ?.map((child) => this.localizeCategory(child, languageId))
        .filter((child): child is QaCategory => child !== null) ?? [];

    return { ...category, translations, children };
  }

  private localizeItem(item: QaItem, languageId?: number): QaItem {
    if (!languageId) return item;

    return {
      ...item,
      translations: this.filterTranslations(item.translations, languageId),
      category: item.category
        ? {
            ...item.category,
            translations: this.filterTranslations(item.category.translations, languageId),
          }
        : item.category,
      tags: item.tags?.map((tag) => ({
        ...tag,
        translations: this.filterTranslations(tag.translations, languageId),
      })),
    };
  }
}
