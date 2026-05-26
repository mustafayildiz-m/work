import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BackfillCountryLanguagesSeeder } from '../src/seeders/backfill-country-languages-seeder';

async function runSeeder() {
  console.log('🔁 Backfill country languages seeder başlatılıyor...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(BackfillCountryLanguagesSeeder);

  try {
    const result = await seeder.seed();
    console.log('✅ Backfill tamamlandı.');
    console.log(
      `   Dil eklendi: ${result.languagesInserted}, Dil atlandı: ${result.languagesSkipped}, Ülke güncellendi: ${result.countriesUpdated}, Ülke atlandı: ${result.countriesSkipped}, Null ülke: ${result.totalNullCountries}`,
    );
  } catch (error) {
    console.error('❌ Backfill hatası:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runSeeder();
