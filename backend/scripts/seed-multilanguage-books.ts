import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MultiLanguageBooksSeeder } from '../src/seeders/multilanguage-books-seeder';

async function runSeeder() {
  console.log('🌱 Starting multilanguage books seeder...');
  console.log('📚 This will add 60 books in multiple languages...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(MultiLanguageBooksSeeder);
  
  try {
    await seeder.seed();
    console.log('✅ Multilanguage books seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeder();

