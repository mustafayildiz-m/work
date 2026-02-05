import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MultiLanguageArticlesSeeder } from '../src/seeders/multilanguage-articles-seeder';

async function runSeeder() {
  console.log('🌱 Starting multilanguage articles seeder...');
  console.log('📚 This will add 70 articles in multiple languages...');
  console.log('⚠️  Make sure you have books and languages in your database first!');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(MultiLanguageArticlesSeeder);
  
  try {
    await seeder.seed();
    console.log('✅ Multilanguage articles seeding completed successfully!');
    console.log('🎉 You now have articles in Turkish, English, and Arabic!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
