import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';

/**
 * Dil kodu (ISO 639-1) -> Ülke kodu (ISO 3166-1 alpha-2) eşlemesi.
 * Bayrak PNG'leri flagcdn.com'dan alınır.
 */
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  tr: 'tr',
  en: 'gb',
  ar: 'sa',
  fa: 'ir',
  ur: 'pk',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  ru: 'ru',
  zh: 'cn',
  ja: 'jp',
  ko: 'kr',
  nl: 'nl',
  pt: 'pt',
  sv: 'se',
  no: 'no',
  da: 'dk',
  fi: 'fi',
  el: 'gr',
  he: 'il',
  hi: 'in',
  bn: 'bd',
  ta: 'lk',
  th: 'th',
  vi: 'vn',
  id: 'id',
  ms: 'my',
  tl: 'ph',
  sw: 'tz',
  kk: 'kz',
  uz: 'uz',
  ky: 'kg',
  tk: 'tm',
  ug: 'cn',
  az: 'az',
  ps: 'af',
  ha: 'ng',
  ig: 'ng',
  yo: 'ng',
  lg: 'ug',
  ca: 'es',
  tt: 'ru',
  ba: 'ru',
  cv: 'ru',
  sah: 'ru',
  bua: 'ru',
  xal: 'ru',
  tyv: 'ru',
  kjh: 'ru',
  alt: 'ru',
  cjs: 'ru',
  dlg: 'ru',
  kim: 'ru',
  gag: 'md',
  kdr: 'ua',
  crh: 'ua',
  krc: 'ru',
  kum: 'ru',
  nog: 'ru',
  kaa: 'uz',
  chg: 'uz',
  ota: 'tr',
  otk: 'mn',
  slr: 'cn',
  rhg: 'bd',
  mr: 'in',
  te: 'in',
  gu: 'in',
  ml: 'in',
  kn: 'in',
  or: 'in',
  uk: 'ua',
  ku: 'iq',
  ro: 'ro',
  bg: 'bg',
  sr: 'rs',
  hu: 'hu',
  cs: 'cz',
  pl: 'pl',
  sk: 'sk',
  sl: 'si',
  mk: 'mk',
  hy: 'am',
  my: 'mm',
  lo: 'la',
  km: 'kh',
  si: 'lk',
  mn: 'mn',
  jv: 'id',
  zu: 'za',
  xh: 'za',
  sn: 'zw',
  am: 'et',
  bm: 'ml',
  ff: 'sn',
  ln: 'cd',
  kg: 'cd',
  rn: 'bi',
  so: 'so',
  eo: 'eu',
  eu: 'es',
  bs: 'ba',
  sq: 'al',
  dv: 'mv',
};

const FLAG_CDN_BASE = 'https://flagcdn.com/w80';

@Injectable()
export class LanguageFlagsSeeder {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed() {
    console.log('🚩 Starting language flags seeding (flagUrl null olanlar)...');

    const languages = await this.languageRepository.find({
      where: { flagUrl: IsNull() },
    });

    if (languages.length === 0) {
      console.log('✅ Tüm dillerin flagUrl değeri zaten dolu. Güncellenecek kayıt yok.');
      return { updated: 0, skipped: 0, total: 0 };
    }

    let updated = 0;
    let skipped = 0;

    for (const language of languages) {
      const langCode = String(language.code || '').toLowerCase().split('-')[0];
      const countryCode = LANGUAGE_TO_COUNTRY[langCode];

      if (!countryCode) {
        console.log(`⏭️  Atlandı (eşleme yok): ${language.name} (${language.code})`);
        skipped += 1;
        continue;
      }

      const flagUrl = `${FLAG_CDN_BASE}/${countryCode}.png`;
      await this.languageRepository.update(language.id, { flagUrl });
      console.log(`✅ Güncellendi: ${language.name} (${language.code}) -> ${flagUrl}`);
      updated += 1;
    }

    console.log(
      `🎉 Tamamlandı. Toplam null: ${languages.length}, Güncellendi: ${updated}, Atlandı: ${skipped}`,
    );
    return { updated, skipped, total: languages.length };
  }
}
