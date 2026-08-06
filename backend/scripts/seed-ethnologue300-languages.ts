import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Ethnologue300LanguagesSeeder } from '../src/seeders/ethnologue300-languages-seeder';

async function runSeeder() {
  console.log('🌱 Starting Ethnologue top-300 languages seeder...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(Ethnologue300LanguagesSeeder);

  try {
    await seeder.seed();
    console.log('✅ Ethnologue300 language seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runSeeder();
