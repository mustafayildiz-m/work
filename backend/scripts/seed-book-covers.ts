import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BookCoversSeeder } from '../src/seeders/book-covers-seeder';

async function runSeeder() {
  console.log('📚 Manuel kitap kapakları seeder başlatılıyor...');
  console.log(
    '   (backend/uploads/books/ klasöründeki resimler kitap adına göre eşleştirilecek)\n',
  );

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(BookCoversSeeder);

  try {
    const result = await seeder.seed();
    console.log('\n✅ Kitap kapakları seeding tamamlandı!');
    console.log(`   Eşleşen: ${result.matched}/${result.total}`);
    if (result.unmatched.length > 0) {
      console.log(`   Eşleşmeyen dosyalar: ${result.unmatched.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Seeder hatası:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeder();
