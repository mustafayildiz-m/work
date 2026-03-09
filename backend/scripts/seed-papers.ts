import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PapersSeeder } from '../src/seeders/papers-seeder';

async function runSeeder() {
  console.log('🌱 Starting papers seeder...');
  console.log('📄 This will add 5 academic papers.');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(PapersSeeder);

  try {
    await seeder.seed();
    console.log('✅ Papers seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during papers seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
