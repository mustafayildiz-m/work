import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dataSource from '../src/config/typeorm.config';
import { Language } from '../src/languages/entities/language.entity';

const FLAGPEDIA_BASE = 'https://flagpedia.net/data/flags/h80';

const languageToCountryMap: Record<string, string> = {
  tr: 'tr',
  en: 'gb',
  ar: 'sa',
  bs: 'ba',
  sq: 'al',
  de: 'de',
  fr: 'fr',
  ru: 'ru',
  es: 'es',
  it: 'it',
  fa: 'ir',
  ur: 'pk',
  id: 'id',
  az: 'az',
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
  ms: 'my',
  tl: 'ph',
  sw: 'tz',
  kk: 'kz',
  uz: 'uz',
  ky: 'kg',
  tk: 'tm',
  ug: 'cn',
  ps: 'af',
  ha: 'ng',
  ig: 'ng',
  yo: 'ng',
  lg: 'ug',
  ca: 'es',
  dv: 'mv',
};

function extractCountryCodesFromHtml(html: string): Set<string> {
  const codes = new Set<string>();
  const pattern = /\/data\/flags\/h80\/([a-z]{2})\.(?:png|jpg|jpeg|webp)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    codes.add(match[1].toLowerCase());
  }

  return codes;
}

async function main() {
  const htmlPath = join(process.cwd(), 'flags.html');
  if (!existsSync(htmlPath)) {
    throw new Error(`flags.html bulunamadı: ${htmlPath}`);
  }

  const html = readFileSync(htmlPath, 'utf8');
  const availableCountryCodes = extractCountryCodesFromHtml(html);

  if (availableCountryCodes.size === 0) {
    throw new Error('flags.html içinde bayrak kodları bulunamadı.');
  }

  await dataSource.initialize();
  const languageRepo = dataSource.getRepository(Language);

  const languages = await languageRepo.find();
  let updated = 0;
  let skipped = 0;

  for (const language of languages) {
    const langCode = String(language.code || '').toLowerCase();
    const countryCode = languageToCountryMap[langCode];

    if (!countryCode || !availableCountryCodes.has(countryCode)) {
      skipped += 1;
      continue;
    }

    const flagUrl = `${FLAGPEDIA_BASE}/${countryCode}.png`;
    await languageRepo.update(language.id, { flagUrl });
    updated += 1;
  }

  await dataSource.destroy();

  console.log(
    `Tamamlandı. Toplam: ${languages.length}, Güncellendi: ${updated}, Atlandı: ${skipped}`,
  );
}

main().catch(async (error) => {
  console.error('Script hatası:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
