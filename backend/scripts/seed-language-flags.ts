import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LanguageFlagsSeeder } from '../src/seeders/language-flags-seeder';

async function runSeeder() {
  console.log('🚩 Language flags seeder başlatılıyor...');
  console.log('   (Sadece flagUrl null olan diller güncellenir)\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(LanguageFlagsSeeder);

  try {
    const result = await seeder.seed();
    console.log('\n✅ Language flags seeding tamamlandı!');
    console.log(`   Güncellenen: ${result.updated}, Atlanan: ${result.skipped}`);

    const fixResult = await seeder.fixWrongFlags();
    if (fixResult.fixed > 0) {
      console.log(`\n🔧 Yanlış bayraklar düzeltildi: ${fixResult.fixed}`);
    }
  } catch (error) {
    console.error('❌ Seeder hatası:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeder();
