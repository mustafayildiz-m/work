import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LanguagesSeeder } from '../src/seeders/languages-seeder';

async function runSeeder() {
  console.log('🌱 Starting language seeder...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(LanguagesSeeder);
  
  try {
    await seeder.seed();
    console.log('✅ Language seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
