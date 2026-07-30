import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { CountryLanguage } from '../countries/entities/country-language.entity';
import { Language } from '../languages/entities/language.entity';

/**
 * Multilingual countries: alpha2 -> additional language codes (beyond the primary).
 * Only codes that exist in the languages table are effective; missing ones are silently skipped.
 */
const MULTILINGUAL_COUNTRIES: Record<string, string[]> = {
  // ── Europe ──
  CH: ['fr', 'it'],              // Switzerland: de + fr, it
  BE: ['fr', 'de'],              // Belgium: nl + fr, de
  LU: ['de'],                    // Luxembourg: fr + de
  FI: ['sv'],                    // Finland: fi + sv
  MT: ['en'],                    // Malta: mt + en
  CY: ['tr'],                    // Cyprus: el + tr
  BY: ['ru'],                    // Belarus: be + ru
  BA: ['hr', 'sr'],              // Bosnia: bs + hr, sr
  ME: ['bs'],                    // Montenegro: sr + bs
  MK: ['sq'],                    // N. Macedonia: mk + sq
  AD: ['es', 'fr'],              // Andorra: ca + es, fr
  RO: ['hu'],                    // Romania: ro + hu
  RS: ['hu'],                    // Serbia: sr + hu
  SK: ['hu'],                    // Slovakia: sk + hu
  UA: ['ru'],                    // Ukraine: uk + ru
  MD: ['ru'],                    // Moldova: ro + ru
  AZ: ['ru'],                    // Azerbaijan: az + ru

  // ── Central Asia ──
  KZ: ['ru'],                    // Kazakhstan: kk + ru
  KG: ['ru'],                    // Kyrgyzstan: ky + ru
  TJ: ['ru'],                    // Tajikistan: tg + ru
  UZ: ['ru'],                    // Uzbekistan: uz + ru
  TM: ['ru'],                    // Turkmenistan: tk + ru
  MN: ['ru'],                    // Mongolia: mn + ru

  // ── Middle East & North Africa ──
  AF: ['ps'],                    // Afghanistan: fa + Pashto
  DZ: ['fr'],                    // Algeria: ar + fr
  MA: ['fr'],                    // Morocco: ar + fr
  TN: ['fr'],                    // Tunisia: ar + fr
  LB: ['fr', 'en'],              // Lebanon: ar + fr, en
  IL: ['ar', 'en'],              // Israel: he + ar, en
  AE: ['en'],                    // UAE: ar + en
  BH: ['en'],                    // Bahrain: ar + en
  QA: ['en'],                    // Qatar: ar + en
  KW: ['en'],                    // Kuwait: ar + en
  OM: ['en'],                    // Oman: ar + en
  SA: ['en'],                    // Saudi Arabia: ar + en
  IQ: ['en'],                    // Iraq: ar + en
  JO: ['en'],                    // Jordan: ar + en
  SD: ['en'],                    // Sudan: ar + en
  MR: ['fr'],                    // Mauritania: ar + fr
  KM: ['fr'],                    // Comoros: ar + fr
  DJ: ['ar'],                    // Djibouti: fr + ar
  TD: ['ar'],                    // Chad: fr + ar
  ER: ['ar', 'en'],              // Eritrea: ti + ar, en
  SO: ['ar'],                    // Somalia: so + ar

  // ── South Asia ──
  IN: ['en', 'bn', 'ta', 'ur'],  // India: hi + en, bn, ta, ur
  PK: ['en'],                    // Pakistan: ur + en
  BD: ['en'],                    // Bangladesh: bn + en
  LK: ['ta'],                    // Sri Lanka: si + ta
  NP: ['en'],                    // Nepal: ne + en

  // ── Southeast Asia ──
  SG: ['zh', 'ms', 'ta'],        // Singapore: en + zh, ms, ta
  MY: ['en', 'zh', 'ta'],        // Malaysia: ms + en, zh, ta
  PH: ['en'],                    // Philippines: tl + en
  BN: ['en'],                    // Brunei: ms + en
  HK: ['en'],                    // Hong Kong: zh + en
  MO: ['pt'],                    // Macao: zh + pt
  TW: ['en'],                    // Taiwan: zh + en

  // ── East Asia ──
  RU: ['tt', 'ba'],              // Russia: ru + Tatar, Bashkir

  // ── Africa ──
  CM: ['en'],                    // Cameroon: fr + en
  NG: ['ha', 'ig', 'yo', 'pcm'],  // Nigeria: en + Hausa, Igbo, Yoruba, Pidgin
  KE: ['en'],                    // Kenya: sw + en
  TZ: ['en'],                    // Tanzania: sw + en
  UG: ['sw', 'lg'],              // Uganda: en + sw, Luganda
  ET: ['en', 'so'],              // Ethiopia: am + en, Somali
  RW: ['fr', 'en'],              // Rwanda: rw + fr, en
  CD: ['sw'],                    // Congo DRC: fr + Swahili
  NE: ['ha'],                    // Niger: fr + Hausa
  SC: ['en'],                    // Seychelles: fr + en
  MU: ['fr'],                    // Mauritius: en + fr
  SS: ['ar'],                    // South Sudan: en + ar
  NA: ['de'],                    // Namibia: en + de

  // ── Americas & Caribbean ──
  CA: ['fr'],                    // Canada: en + fr
  US: ['es'],                    // USA: en + es
  PR: ['en'],                    // Puerto Rico: es + en
  BZ: ['es'],                    // Belize: en + es
  HT: ['en'],                    // Haiti: fr + en
  TT: ['es'],                    // Trinidad: en + es
  VU: ['fr'],                    // Vanuatu: en + fr
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
      const extra = MULTILINGUAL_COUNTRIES[country.alpha2];

      const desiredRows: Partial<CountryLanguage>[] = [];

      if (country.primaryLanguageId) {
        desiredRows.push({
          countryId: country.id,
          languageId: country.primaryLanguageId,
          isPrimary: true,
          displayOrder: 0,
        });
      }

      if (extra) {
        let order = 1;
        for (const code of extra) {
          const langId = langByCode.get(code.toLowerCase());
          if (langId && langId !== country.primaryLanguageId) {
            desiredRows.push({
              countryId: country.id,
              languageId: langId,
              isPrimary: false,
              displayOrder: order++,
            });
          }
        }
      }

      if (desiredRows.length === 0) continue;

      const existingRows = await this.countryLanguageRepository.find({
        where: { countryId: country.id },
      });

      const existingLangIds = new Set(existingRows.map((r) => r.languageId));
      const desiredLangIds = new Set(
        desiredRows.map((r) => r.languageId).filter((id): id is number => id !== undefined),
      );

      const alreadyCorrect =
        existingLangIds.size === desiredLangIds.size &&
        [...desiredLangIds].every((id) => existingLangIds.has(id));

      if (alreadyCorrect) continue;

      await this.countryLanguageRepository.delete({ countryId: country.id });
      await this.countryLanguageRepository.save(
        desiredRows.map((r) => this.countryLanguageRepository.create(r)),
      );
      synced++;

      if (desiredRows.length > 1) {
        multilingual++;
      }
    }

    console.log(
      `🎉 country_languages seeding done. Updated: ${synced}, Multilingual: ${multilingual}`,
    );
    return { synced, multilingual };
  }
}
