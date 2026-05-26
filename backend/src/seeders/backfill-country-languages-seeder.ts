import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Country } from '../countries/entities/country.entity';
import { Language } from '../languages/entities/language.entity';
import { COUNTRY_SEED } from './countries-seeder';

/**
 * COUNTRY_SEED içindeki her primaryLangCode için languages tablosunda olması beklenen
 * dilin Türkçe adı + bayrak için kullanılacak ISO 3166-1 alpha-2 ülke kodu.
 *
 * Bu dictionary backfill sırasında "olmayan dilleri" tabloya eklemek için kullanılır.
 * Mevcut diller atlanır (idempotent).
 */
const LANGUAGE_DICTIONARY: Record<
  string,
  { name: string; flagCountry: string }
> = {
  ar: { name: 'Arapça', flagCountry: 'sa' },
  am: { name: 'Amharic', flagCountry: 'et' },
  az: { name: 'Azerbaycan Türkçesi', flagCountry: 'az' },
  be: { name: 'Belarusça', flagCountry: 'by' },
  bg: { name: 'Bulgarca', flagCountry: 'bg' },
  bn: { name: 'Bengalce', flagCountry: 'bd' },
  bs: { name: 'Boşnakça', flagCountry: 'ba' },
  ca: { name: 'Katalanca', flagCountry: 'es' },
  cs: { name: 'Çekçe', flagCountry: 'cz' },
  da: { name: 'Danca', flagCountry: 'dk' },
  de: { name: 'Almanca', flagCountry: 'de' },
  dv: { name: 'Dhivehi', flagCountry: 'mv' },
  dz: { name: 'Dzongkha', flagCountry: 'bt' },
  el: { name: 'Yunanca', flagCountry: 'gr' },
  en: { name: 'İngilizce', flagCountry: 'gb' },
  es: { name: 'İspanyolca', flagCountry: 'es' },
  et: { name: 'Estonyaca', flagCountry: 'ee' },
  fa: { name: 'Farsça', flagCountry: 'ir' },
  fi: { name: 'Fince', flagCountry: 'fi' },
  fo: { name: 'Faroe Dili', flagCountry: 'fo' },
  fr: { name: 'Fransızca', flagCountry: 'fr' },
  he: { name: 'İbranice', flagCountry: 'il' },
  hi: { name: 'Hintçe', flagCountry: 'in' },
  hr: { name: 'Hırvatça', flagCountry: 'hr' },
  hu: { name: 'Macarca', flagCountry: 'hu' },
  hy: { name: 'Ermenice', flagCountry: 'am' },
  id: { name: 'Endonezyaca', flagCountry: 'id' },
  is: { name: 'İzlandaca', flagCountry: 'is' },
  it: { name: 'İtalyanca', flagCountry: 'it' },
  ja: { name: 'Japonca', flagCountry: 'jp' },
  ka: { name: 'Gürcüce', flagCountry: 'ge' },
  kk: { name: 'Kazakça', flagCountry: 'kz' },
  kl: { name: 'Grönlandca', flagCountry: 'gl' },
  km: { name: 'Khmer', flagCountry: 'kh' },
  ko: { name: 'Korece', flagCountry: 'kr' },
  ky: { name: 'Kırgızca', flagCountry: 'kg' },
  lo: { name: 'Lao', flagCountry: 'la' },
  lt: { name: 'Litvanca', flagCountry: 'lt' },
  lv: { name: 'Letonca', flagCountry: 'lv' },
  mg: { name: 'Malgaşça', flagCountry: 'mg' },
  mn: { name: 'Moğolca', flagCountry: 'mn' },
  ms: { name: 'Malayca', flagCountry: 'my' },
  mt: { name: 'Maltaca', flagCountry: 'mt' },
  my: { name: 'Myanmar', flagCountry: 'mm' },
  ne: { name: 'Nepalce', flagCountry: 'np' },
  nl: { name: 'Hollandaca', flagCountry: 'nl' },
  no: { name: 'Norveççe', flagCountry: 'no' },
  pl: { name: 'Lehçe', flagCountry: 'pl' },
  pt: { name: 'Portekizce', flagCountry: 'pt' },
  rn: { name: 'Rundi', flagCountry: 'bi' },
  ro: { name: 'Rumence', flagCountry: 'ro' },
  ru: { name: 'Rusça', flagCountry: 'ru' },
  rw: { name: 'Kinyarwanda', flagCountry: 'rw' },
  si: { name: 'Sinhala', flagCountry: 'lk' },
  sk: { name: 'Slovakça', flagCountry: 'sk' },
  sl: { name: 'Slovence', flagCountry: 'si' },
  sq: { name: 'Arnavutça', flagCountry: 'al' },
  sr: { name: 'Sırpça', flagCountry: 'rs' },
  sv: { name: 'İsveççe', flagCountry: 'se' },
  sw: { name: 'Swahili', flagCountry: 'tz' },
  th: { name: 'Tayca', flagCountry: 'th' },
  ti: { name: 'Tigrinya', flagCountry: 'er' },
  tl: { name: 'Tagalog', flagCountry: 'ph' },
  tr: { name: 'Türkçe', flagCountry: 'tr' },
  uk: { name: 'Ukraynaca', flagCountry: 'ua' },
  ur: { name: 'Urduca', flagCountry: 'pk' },
  uz: { name: 'Özbekçe', flagCountry: 'uz' },
  vi: { name: 'Vietnamca', flagCountry: 'vn' },
  zh: { name: 'Çince', flagCountry: 'cn' },
  // ISO 3166-1 tam liste için ek dil kodları:
  mk: { name: 'Makedonca', flagCountry: 'mk' },
  so: { name: 'Somalice', flagCountry: 'so' },
  tk: { name: 'Türkmence', flagCountry: 'tm' },
  tg: { name: 'Tacikçe', flagCountry: 'tj' },
};

const FLAG_CDN_BASE = 'https://flagcdn.com/w80';

@Injectable()
export class BackfillCountryLanguagesSeeder {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed(): Promise<{
    languagesInserted: number;
    languagesSkipped: number;
    countriesUpdated: number;
    countriesSkipped: number;
    totalNullCountries: number;
  }> {
    console.log('🔁 Backfill country languages seeder başlatılıyor...');

    const requiredCodes = new Set<string>();
    for (const seed of COUNTRY_SEED) {
      if (seed.primaryLangCode) {
        requiredCodes.add(seed.primaryLangCode.toLowerCase());
      }
    }

    let languagesInserted = 0;
    let languagesSkipped = 0;

    for (const code of requiredCodes) {
      const meta = LANGUAGE_DICTIONARY[code];
      if (!meta) {
        console.warn(
          `⚠️  Sözlükte yok: '${code}' — LANGUAGE_DICTIONARY içine ekleyin.`,
        );
        languagesSkipped += 1;
        continue;
      }

      const existing = await this.languageRepository.findOne({
        where: [{ code }, { name: meta.name }],
      });
      if (existing) {
        languagesSkipped += 1;
        continue;
      }

      const flagUrl = `${FLAG_CDN_BASE}/${meta.flagCountry}.png`;
      const language = this.languageRepository.create({
        name: meta.name,
        code,
        flagUrl,
        isActive: true,
      });
      try {
        await this.languageRepository.save(language);
        console.log(`✅ Dil eklendi: ${meta.name} (${code}) → ${flagUrl}`);
        languagesInserted += 1;
      } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY') {
          languagesSkipped += 1;
          continue;
        }
        throw err;
      }
    }

    const alpha2ToLangCode = new Map<string, string | null>();
    for (const seed of COUNTRY_SEED) {
      alpha2ToLangCode.set(
        seed.alpha2.toUpperCase(),
        seed.primaryLangCode ? seed.primaryLangCode.toLowerCase() : null,
      );
    }

    const nullCountries = await this.countryRepository.find({
      where: { primaryLanguageId: IsNull() },
    });

    let countriesUpdated = 0;
    let countriesSkipped = 0;

    for (const country of nullCountries) {
      const langCode = alpha2ToLangCode.get(country.alpha2.toUpperCase());
      if (!langCode) {
        countriesSkipped += 1;
        continue;
      }

      const language = await this.languageRepository.findOne({
        where: { code: langCode },
      });
      if (!language) {
        console.warn(
          `⚠️  ${country.name} (${country.alpha2}) için dil hâlâ yok: code='${langCode}'`,
        );
        countriesSkipped += 1;
        continue;
      }

      await this.countryRepository.update(country.id, {
        primaryLanguageId: language.id,
      });
      console.log(
        `🔗 ${country.name} (${country.alpha2}) → ${language.name} (${language.code})`,
      );
      countriesUpdated += 1;
    }

    console.log(
      `🎉 Backfill tamamlandı. Dil eklendi: ${languagesInserted}, Dil atlandı: ${languagesSkipped}, Ülke güncellendi: ${countriesUpdated}, Ülke atlandı: ${countriesSkipped} (toplam null: ${nullCountries.length})`,
    );

    return {
      languagesInserted,
      languagesSkipped,
      countriesUpdated,
      countriesSkipped,
      totalNullCountries: nullCountries.length,
    };
  }
}
