import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RegionalBooksSeeder } from '../src/seeders/regional-books-seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seeder = app.get(RegionalBooksSeeder);
  await seeder.seed();
  
  await app.close();
}

bootstrap().catch(console.error);
