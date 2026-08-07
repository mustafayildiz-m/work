import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { QaCategory } from './entities/qa-category.entity';
import { QaCategoryTranslation } from './entities/qa-category-translation.entity';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';
import { QaTag } from './entities/qa-tag.entity';
import { QaTagTranslation } from './entities/qa-tag-translation.entity';
import { Language } from '../languages/entities/language.entity';

interface SeedCategoryDef {
  key: string;
  order: number;
  parentKey?: string;
  names: Record<string, { name: string; description?: string }>;
}

interface SeedTagDef {
  key: string;
  names: Record<string, string>;
}

interface SeedItemDef {
  categoryKey: string;
  langCode: string;
  order: number;
  tagKeys?: string[];
  sourceBookletName?: string;
  sourceSection?: string;
  question: string;
  answer: string;
  keywords: string;
}

interface SeedContentFile {
  categories: SeedCategoryDef[];
  tags: SeedTagDef[];
  items: SeedItemDef[];
}

export interface QaSeedResult {
  seeded: boolean;
  replaced: boolean;
  categories: number;
  items: number;
  tags: number;
  skippedLanguages?: string[];
}

@Injectable()
export class QaSeederService {
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
    @InjectRepository(Language)
    private languageRepo: Repository<Language>,
  ) {}

  /** Eski davranış: yalnızca tablo boşsa küçük örnek set (geriye dönük uyumluluk). */
  async seedIfEmpty(): Promise<QaSeedResult> {
    const existingItems = await this.itemRepo.count();
    if (existingItems > 0) {
      return { seeded: false, replaced: false, categories: 0, items: 0, tags: 0 };
    }
    return this.seedComprehensive(false);
  }

  /** 31 dil × 8 benzersiz soru — canlı ortam için tam seed. force=true mevcut QA verisini siler. */
  async seedComprehensive(force = false): Promise<QaSeedResult> {
    const existingItems = await this.itemRepo.count();
    if (existingItems > 0 && !force) {
      return { seeded: false, replaced: false, categories: 0, items: 0, tags: 0 };
    }

    if (force && existingItems > 0) {
      await this.clearAll();
    }

    const content = this.loadSeedContent();
    const langs = await this.languageRepo.find({ where: { isActive: true } });
    const langMap = new Map(langs.map((l) => [l.code, l.id]));
    const fallbackLangId = langMap.get('en') ?? langMap.get('tr') ?? langs[0]?.id;

    if (!fallbackLangId) {
      throw new Error('Aktif dil kaydı bulunamadı');
    }

    const categoryIdByKey = new Map<string, number>();
    const tagIdByKey = new Map<string, number>();
    const skippedLanguages = new Set<string>();

    for (const catDef of content.categories.sort((a, b) => a.order - b.order)) {
      const parentId = catDef.parentKey ? categoryIdByKey.get(catDef.parentKey) ?? null : null;
      const category = await this.categoryRepo.save(
        this.categoryRepo.create({
          parentId: parentId ?? undefined,
          order: catDef.order,
          isActive: true,
        }),
      );
      categoryIdByKey.set(catDef.key, category.id);

      const translations: Partial<QaCategoryTranslation>[] = [];
      for (const [code, val] of Object.entries(catDef.names)) {
        const languageId = langMap.get(code) ?? fallbackLangId;
        if (!langMap.has(code)) skippedLanguages.add(code);
        translations.push({
          categoryId: category.id,
          languageId,
          name: val.name,
          description: val.description,
        });
      }
      if (translations.length) {
        await this.categoryTransRepo.save(
          translations.map((t) => this.categoryTransRepo.create(t)),
        );
      }
    }

    for (const tagDef of content.tags) {
      const tag = await this.tagRepo.save(this.tagRepo.create());
      tagIdByKey.set(tagDef.key, tag.id);

      const translations: Partial<QaTagTranslation>[] = [];
      for (const [code, name] of Object.entries(tagDef.names)) {
        const languageId = langMap.get(code) ?? fallbackLangId;
        translations.push({ tagId: tag.id, languageId, name });
      }
      if (translations.length) {
        await this.tagTransRepo.save(
          translations.map((t) => this.tagTransRepo.create(t)),
        );
      }
    }

    let itemCount = 0;
    for (const itemDef of content.items) {
      const languageId = langMap.get(itemDef.langCode);
      if (!languageId) {
        skippedLanguages.add(itemDef.langCode);
        continue;
      }

      const categoryId = categoryIdByKey.get(itemDef.categoryKey);
      if (!categoryId) continue;

      const item = await this.itemRepo.save(
        this.itemRepo.create({
          categoryId,
          order: itemDef.order,
          sourceBookletName: itemDef.sourceBookletName,
          sourceSection: itemDef.sourceSection,
          sourceReference: itemDef.sourceBookletName
            ? `${itemDef.sourceBookletName}${itemDef.sourceSection ? ` / ${itemDef.sourceSection}` : ''}`
            : undefined,
          isActive: true,
        }),
      );

      await this.itemTransRepo.save(
        this.itemTransRepo.create({
          qaItemId: item.id,
          languageId,
          question: itemDef.question,
          answer: itemDef.answer,
          keywords: itemDef.keywords,
        }),
      );

      if (itemDef.tagKeys?.length) {
        const tagIds = itemDef.tagKeys
          .map((k) => tagIdByKey.get(k))
          .filter((id): id is number => Boolean(id));
        if (tagIds.length) {
          const tags = await this.tagRepo.findBy({ id: In(tagIds) });
          item.tags = tags;
          await this.itemRepo.save(item);
        }
      }

      itemCount += 1;
    }

    return {
      seeded: true,
      replaced: force,
      categories: content.categories.length,
      items: itemCount,
      tags: content.tags.length,
      skippedLanguages: skippedLanguages.size
        ? Array.from(skippedLanguages).sort()
        : undefined,
    };
  }

  private loadSeedContent(): SeedContentFile {
    const candidates = [
      path.join(__dirname, 'data', 'qa-seed-content.json'),
      path.join(process.cwd(), 'src', 'qa', 'data', 'qa-seed-content.json'),
      path.join(process.cwd(), 'dist', 'qa', 'data', 'qa-seed-content.json'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8')) as SeedContentFile;
      }
    }

    throw new Error('qa-seed-content.json bulunamadı');
  }

  private async clearAll() {
    await this.itemRepo.query('DELETE FROM qa_item_tags');
    await this.itemTransRepo.createQueryBuilder().delete().execute();
    await this.itemRepo.createQueryBuilder().delete().execute();
    await this.categoryTransRepo.createQueryBuilder().delete().execute();
    await this.categoryRepo
      .createQueryBuilder()
      .delete()
      .where('parentId IS NOT NULL')
      .execute();
    await this.categoryRepo.createQueryBuilder().delete().execute();
    await this.tagTransRepo.createQueryBuilder().delete().execute();
    await this.tagRepo.createQueryBuilder().delete().execute();
  }
}
