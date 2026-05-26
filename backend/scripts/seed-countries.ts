import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CountriesSeeder } from '../src/seeders/countries-seeder';

async function runSeeder() {
  console.log('🌱 Starting countries seeder...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(CountriesSeeder);

  try {
    const result = await seeder.seed();
    console.log('✅ Countries seeding completed successfully!');
    console.log(
      `   Toplam: ${result.total}, Eklendi: ${result.added}, Atlandı: ${result.skipped}, Eksik dil: ${result.missingLang}`,
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runSeeder();
