import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Qa300LanguagesSeeder } from './qa-300-languages-seeder';
import { QaSeederService } from '../qa/qa-seeder.service';
import { DataSource } from 'typeorm';

/** QA seed JSON'daki dil kodları */
const QA_LANG_CODES = [
  'tr', 'en', 'ar', 'de', 'es', 'fr', 'it', 'ru', 'zh', 'ja', 'ko', 'pt',
  'pl', 'uk', 'bg', 'ro', 'hu', 'cs', 'sk', 'sl', 'mk', 'hy', 'ku', 'hi',
  'bn', 'ur', 'fa', 'id', 'ms', 'nl', 'sv',
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('1/4 — 300 dil seed...');
  const langSeeder = app.get(Qa300LanguagesSeeder);
  await langSeeder.seed();

  console.log('2/4 — QA dillerini active yap + iso639_3 eşle...');
  const ds = app.get(DataSource);

  const isoMappings: Array<{ code: string; iso: string; native: string; english: string; direction?: string }> = [
    { code: 'tr', iso: 'tur', native: 'Türkçe', english: 'Turkish' },
    { code: 'en', iso: 'eng', native: 'English', english: 'English' },
    { code: 'ar', iso: 'ara', native: 'العربية', english: 'Arabic', direction: 'rtl' },
    { code: 'de', iso: 'deu', native: 'Deutsch', english: 'German' },
    { code: 'fr', iso: 'fra', native: 'Français', english: 'French' },
    { code: 'es', iso: 'spa', native: 'Español', english: 'Spanish' },
  ];
  for (const m of isoMappings) {
    await ds.query(
      `DELETE FROM languages WHERE iso639_3 = ? AND code != ?`,
      [m.iso, m.code],
    );
    await ds.query(
      `UPDATE languages SET iso639_3 = ?, nativeName = ?, englishName = ?,
       status = 'active', isActive = 1, direction = ?
       WHERE code = ?`,
      [m.iso, m.native, m.english, m.direction ?? 'ltr', m.code],
    );
  }

  await ds.query(
    `UPDATE languages SET status = 'active', isActive = 1
     WHERE code IN (${QA_LANG_CODES.map(() => '?').join(',')})`,
    QA_LANG_CODES,
  );

  console.log('3/4 — 248 dini soru-cevap seed (force)...');
  const qaSeeder = app.get(QaSeederService);
  const result = await qaSeeder.seedComprehensive(true);
  console.log('QA seed sonucu:', result);

  console.log('4/4 — questionCount güncelle + eksik isimleri doldur...');
  await ds.query(`
    UPDATE languages
    SET nativeName = COALESCE(nativeName, name),
        englishName = COALESCE(englishName, name),
        iso639_3 = COALESCE(iso639_3, code)
    WHERE name IS NOT NULL
  `);
  await ds.query(`
    UPDATE languages l
    SET questionCount = (
      SELECT COUNT(DISTINCT qit.qaItemId)
      FROM qa_item_translations qit
      WHERE qit.languageId = l.id
    )
  `);

  const [stats] = await ds.query(`
    SELECT
      (SELECT COUNT(*) FROM qa_items) AS items,
      (SELECT COUNT(*) FROM qa_categories) AS categories,
      (SELECT COUNT(*) FROM languages WHERE status = 'active') AS activeLangs,
      (SELECT SUM(questionCount) FROM languages) AS totalQuestions
  `);
  console.log('Tamamlandı:', stats);

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
