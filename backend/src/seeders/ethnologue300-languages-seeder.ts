import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { CountryLanguage } from '../countries/entities/country-language.entity';
import { Language } from '../languages/entities/language.entity';
import { ETHNOLOGUE300_LANGUAGES } from './ethnologue300-languages.data';

const FLAG_CDN_BASE = 'https://flagcdn.com/w80';

@Injectable()
export class Ethnologue300LanguagesSeeder {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(CountryLanguage)
    private readonly countryLanguageRepository: Repository<CountryLanguage>,
  ) {}

  async seed(): Promise<{
    languagesInserted: number;
    languagesSkipped: number;
    countryLinksAdded: number;
    countryLinksSkipped: number;
  }> {
    console.log('🌍 Ethnologue top-300 diller seeder başlatılıyor...');

    let languagesInserted = 0;
    let languagesSkipped = 0;

    for (const entry of ETHNOLOGUE300_LANGUAGES) {
      const code = entry.code.toLowerCase();
      const existing = await this.languageRepository.findOne({
        where: [{ code }, { name: entry.name }],
      });

      if (existing) {
        languagesSkipped += 1;
        continue;
      }

      const flagUrl = `${FLAG_CDN_BASE}/${entry.flagCountry.toLowerCase()}.png`;
      const language = this.languageRepository.create({
        name: entry.name,
        code,
        flagUrl,
        isActive: true,
      });

      try {
        await this.languageRepository.save(language);
        console.log(
          `✅ Dil eklendi: ${entry.name} (${code}) [#${entry.rank}] → ${flagUrl}`,
        );
        languagesInserted += 1;
      } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY') {
          languagesSkipped += 1;
          continue;
        }
        throw err;
      }
    }

    const allLanguages = await this.languageRepository.find();
    const langByCode = new Map<string, number>();
    for (const l of allLanguages) {
      langByCode.set(l.code.toLowerCase(), l.id);
    }

    const allCountries = await this.countryRepository.find();
    const countryByAlpha2 = new Map<string, Country>();
    for (const c of allCountries) {
      countryByAlpha2.set(c.alpha2.toUpperCase(), c);
    }

    let countryLinksAdded = 0;
    let countryLinksSkipped = 0;

    for (const entry of ETHNOLOGUE300_LANGUAGES) {
      const langId = langByCode.get(entry.code.toLowerCase());
      if (!langId) continue;

      for (const alpha2 of entry.countries) {
        const country = countryByAlpha2.get(alpha2.toUpperCase());
        if (!country) {
          console.warn(
            `⚠️  Ülke bulunamadı: ${alpha2} (dil: ${entry.code})`,
          );
          continue;
        }

        const existingLink = await this.countryLanguageRepository.findOne({
          where: { countryId: country.id, languageId: langId },
        });

        if (existingLink) {
          countryLinksSkipped += 1;
          continue;
        }

        const maxOrder = await this.countryLanguageRepository
          .createQueryBuilder('cl')
          .select('MAX(cl.displayOrder)', 'max')
          .where('cl.countryId = :countryId', { countryId: country.id })
          .getRawOne();

        const nextOrder = (maxOrder?.max ?? -1) + 1;
        const isPrimary = country.primaryLanguageId === langId;

        await this.countryLanguageRepository.save(
          this.countryLanguageRepository.create({
            countryId: country.id,
            languageId: langId,
            isPrimary,
            displayOrder: isPrimary ? 0 : nextOrder,
          }),
        );

        console.log(
          `🔗 ${country.nameTr ?? country.name} (${alpha2}) ← ${entry.name} (${entry.code})`,
        );
        countryLinksAdded += 1;
      }
    }

    console.log(
      `🎉 Ethnologue300 seeder tamamlandı. Dil eklendi: ${languagesInserted}, Dil atlandı: ${languagesSkipped}, Ülke bağlantısı eklendi: ${countryLinksAdded}, Bağlantı atlandı: ${countryLinksSkipped}`,
    );

    return {
      languagesInserted,
      languagesSkipped,
      countryLinksAdded,
      countryLinksSkipped,
    };
  }
}
