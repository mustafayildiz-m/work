import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CountryLanguagesSeeder } from '../src/seeders/country-languages-seeder';

async function runSeeder() {
  console.log('🌱 Starting country_languages seeder...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(CountryLanguagesSeeder);

  try {
    const result = await seeder.seed();
    console.log('✅ country_languages seeding completed!');
    console.log(
      `   Synced: ${result.synced}, Multilingual: ${result.multilingual}`,
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runSeeder();
