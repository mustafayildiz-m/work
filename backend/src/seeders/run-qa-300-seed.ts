import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Qa300LanguagesSeeder } from './qa-300-languages-seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(Qa300LanguagesSeeder);
  await seeder.seed();
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
