import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScholarAlimImagesSeeder } from '../src/seeders/scholar-alim-images-seeder';

async function runSeeder() {
  console.log('🖼️  Alim profil ve kapak resimleri seeder başlatılıyor...');
  console.log('   (uploads/alimler/Cover ve ProfilPhotos klasörlerinden karışık atanacak)\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ScholarAlimImagesSeeder);

  try {
    const result = await seeder.seed();
    console.log('\n✅ Alim resimleri seeding tamamlandı!');
    console.log(`   Güncellenen alim: ${result.updated}`);
    console.log(`   Kullanılan kapak resmi sayısı: ${result.coverCount}`);
    console.log(`   Kullanılan profil resmi sayısı: ${result.profileCount}`);
  } catch (error) {
    console.error('❌ Seeder hatası:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeder();
