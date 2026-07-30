import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { CountryLanguage } from '../countries/entities/country-language.entity';
import { Language } from '../languages/entities/language.entity';

/**
 * Multilingual countries: alpha2 -> additional language codes (beyond the primary).
 * Primary language is already set via countries.primaryLanguageId.
 */
const MULTILINGUAL_COUNTRIES: Record<string, string[]> = {
  CH: ['fr', 'it'],              // Switzerland: de(primary) + fr, it
  BE: ['fr', 'de'],              // Belgium:     nl(primary) + fr, de
  CA: ['fr'],                    // Canada:      en(primary) + fr
  LU: ['fr', 'de'],              // Luxembourg:  lb(primary) + fr, de
  SG: ['zh', 'ms', 'ta'],        // Singapore:   en(primary) + zh, ms, ta
  IN: ['en', 'bn', 'ta', 'te', 'ur'], // India:  hi(primary) + en, bn, ta, te, ur
  PK: ['en'],                    // Pakistan:    ur(primary) + en
  ZA: ['af', 'zu'],              // South Africa: en(primary) + af, zu
  FI: ['sv'],                    // Finland:     fi(primary) + sv
  IE: ['ga'],                    // Ireland:     en(primary) + ga
  MT: ['en'],                    // Malta:       mt(primary) + en
  CY: ['tr'],                    // Cyprus:      el(primary) + tr
  BY: ['ru'],                    // Belarus:     be(primary) + ru
  KZ: ['ru'],                    // Kazakhstan:  kk(primary) + ru
  KG: ['ru'],                    // Kyrgyzstan:  ky(primary) + ru
  PH: ['en'],                    // Philippines: tl(primary) + en
  MY: ['en', 'zh', 'ta'],        // Malaysia:    ms(primary) + en, zh, ta
  CM: ['en'],                    // Cameroon:    fr(primary) + en
  TD: ['ar'],                    // Chad:        fr(primary) + ar
  DJ: ['ar'],                    // Djibouti:    fr(primary) + ar
  HK: ['en'],                    // Hong Kong:   zh(primary) + en
  MO: ['pt'],                    // Macao:       zh(primary) + pt
  PR: ['en'],                    // Puerto Rico: es(primary) + en
  BO: ['qu', 'ay'],              // Bolivia:     es(primary) + qu, ay
  PY: ['gn'],                    // Paraguay:    es(primary) + gn
  PE: ['qu'],                    // Peru:        es(primary) + qu
};

@Injectable()
export class CountryLanguagesSeeder {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(CountryLanguage)
    private readonly countryLanguageRepository: Repository<CountryLanguage>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed(): Promise<{ synced: number; multilingual: number }> {
    console.log('🌐 Starting country_languages seeding...');

    const allLanguages = await this.languageRepository.find();
    const langByCode = new Map<string, number>();
    for (const l of allLanguages) {
      langByCode.set(l.code.toLowerCase(), l.id);
    }

    const countries = await this.countryRepository.find();
    let synced = 0;
    let multilingual = 0;

    for (const country of countries) {
      const existing = await this.countryLanguageRepository.findOne({
        where: { countryId: country.id },
      });
      if (existing) continue;

      const languageRows: Partial<CountryLanguage>[] = [];

      if (country.primaryLanguageId) {
        languageRows.push({
          countryId: country.id,
          languageId: country.primaryLanguageId,
          isPrimary: true,
          displayOrder: 0,
        });
      }

      const extra = MULTILINGUAL_COUNTRIES[country.alpha2];
      if (extra) {
        let order = 1;
        for (const code of extra) {
          const langId = langByCode.get(code.toLowerCase());
          if (langId && langId !== country.primaryLanguageId) {
            languageRows.push({
              countryId: country.id,
              languageId: langId,
              isPrimary: false,
              displayOrder: order++,
            });
          }
        }
        if (languageRows.length > 1) {
          multilingual++;
        }
      }

      if (languageRows.length > 0) {
        await this.countryLanguageRepository.save(
          languageRows.map((r) => this.countryLanguageRepository.create(r)),
        );
        synced++;
      }
    }

    console.log(
      `🎉 country_languages seeding done. Synced: ${synced}, Multilingual: ${multilingual}`,
    );
    return { synced, multilingual };
  }
}
