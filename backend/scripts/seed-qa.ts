import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { QaSeederService } from '../src/qa/qa-seeder.service';

async function bootstrap() {
  const force = process.argv.includes('--force');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seeder = app.get(QaSeederService);
    console.log(`🌱 QA seed başlıyor${force ? ' (force — mevcut veri silinir)' : ''}...`);
    const result = await seeder.seedComprehensive(force);
    console.log(JSON.stringify(result, null, 2));
    if (!result.seeded) {
      console.log('ℹ️  Seed atlandı (veri zaten var). --force ile yeniden yükleyin.');
      process.exitCode = force ? 0 : 1;
    } else {
      console.log(`✅ ${result.items} soru, ${result.categories} kategori, ${result.tags} etiket eklendi.`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
