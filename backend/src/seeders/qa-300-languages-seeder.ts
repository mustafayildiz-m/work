import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import {
  QA_300_LANGUAGES,
  QA_PARENT_LANGUAGES,
  Qa300LanguageEntry,
} from './qa-300-languages.data';

@Injectable()
export class Qa300LanguagesSeeder {
  private readonly logger = new Logger(Qa300LanguagesSeeder.name);

  constructor(
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting QA 300 languages seed...');

    const allEntries = [...QA_PARENT_LANGUAGES, ...QA_300_LANGUAGES];
    let created = 0;
    let updated = 0;

    // Pass 1: upsert all languages (without parent links)
    for (const entry of allEntries) {
      const result = await this.upsertLanguage(entry);
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
    }

    // Pass 2: set parent relationships
    await this.linkParents();

    this.logger.log(
      `QA 300 seed complete: ${created} created, ${updated} updated, total entries: ${allEntries.length}`,
    );
  }

  private async upsertLanguage(
    entry: Qa300LanguageEntry,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const existing = await this.languageRepo.findOne({
      where: [
        { iso639_3: entry.iso639_3 },
        { code: entry.iso639_3 },
      ],
    });

    const aliasesJson =
      entry.aliases.length > 0 ? JSON.stringify(entry.aliases) : null;

    if (existing) {
      await this.languageRepo.update(existing.id, {
        nativeName: entry.nativeName,
        englishName: entry.englishName,
        iso639_3: entry.iso639_3,
        direction: entry.direction,
        aliases: aliasesJson,
      });
      return 'updated';
    }

    try {
      const lang = this.languageRepo.create({
        name: entry.englishName,
        code: entry.iso639_3,
        nativeName: entry.nativeName,
        englishName: entry.englishName,
        iso639_3: entry.iso639_3,
        direction: entry.direction,
        aliases: aliasesJson,
        status: 'not_published',
        questionCount: 0,
        isActive: true,
      });
      await this.languageRepo.save(lang);
      return 'created';
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        this.logger.warn(
          `Duplicate entry for ${entry.englishName} (${entry.iso639_3}), skipping`,
        );
        return 'skipped';
      }
      throw err;
    }
  }

  private async linkParents(): Promise<void> {
    const allEntries = [...QA_PARENT_LANGUAGES, ...QA_300_LANGUAGES];
    const childEntries = allEntries.filter((e) => e.parentIso);

    for (const child of childEntries) {
      const parentLang = await this.languageRepo.findOne({
        where: { iso639_3: child.parentIso },
      });
      if (!parentLang) continue;

      const childLang = await this.languageRepo.findOne({
        where: { iso639_3: child.iso639_3 },
      });
      if (!childLang) continue;

      if (childLang.parentLanguageId !== parentLang.id) {
        await this.languageRepo.update(childLang.id, {
          parentLanguageId: parentLang.id,
        });
      }
    }
    this.logger.log(`Linked ${childEntries.length} child→parent relationships`);
  }
}
