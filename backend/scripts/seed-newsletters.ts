import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NewslettersSeeder } from '../src/seeders/newsletters-seeder';

async function runSeeder() {
  console.log('🌱 Starting newsletters seeder...');
  console.log('📰 This will add 10 realistic Islamic newsletters.');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(NewslettersSeeder);

  try {
    await seeder.seed();
    console.log('✅ Newsletters seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during newsletters seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
