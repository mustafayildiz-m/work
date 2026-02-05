import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReligiousBooksSeeder } from '../src/seeders/religious-books-seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ReligiousBooksSeeder);
  
  try {
    await seeder.seed();
    console.log('✅ Seeding tamamlandı!');
  } catch (error) {
    console.error('❌ Seeding sırasında hata:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
