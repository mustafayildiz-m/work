import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { Scholar } from '../src/scholars/entities/scholar.entity';

/**
 * V2 Import Script
 * ----------------
 * scholars-pdf-parser-v2.ts tarafından üretilen JSON'u alıp doğrudan
 * scholars tablosuna batch'ler halinde ekler.
 *
 * Kullanım:
 *   docker exec islamic_windows_backend npx ts-node scripts/import-pdf-scholars-v2.ts            # full import
 *   docker exec islamic_windows_backend npx ts-node scripts/import-pdf-scholars-v2.ts --dry-run  # sadece ilk 10 alim, DB'ye yazmaz
 *   docker exec islamic_windows_backend npx ts-node scripts/import-pdf-scholars-v2.ts --limit 50 # sadece ilk 50 alim
 */

interface ParsedScholar {
  fullName: string;
  biography: string;
  birthDate?: string;
  birthDateHijri?: string;
  deathDate?: string;
  deathDateHijri?: string;
  sources?: string[];
  rawHeaderLineNum: number;
}

const DEFAULT_PHOTO = 'uploads/coverImage/coverImage.jpg';
const DEFAULT_COVER = 'uploads/coverImage/coverImage.jpg';
const BATCH_SIZE = 100;

async function bootstrap() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit =
    limitIdx >= 0 && args[limitIdx + 1]
      ? parseInt(args[limitIdx + 1], 10)
      : isDryRun
        ? 10
        : Infinity;

  console.log('═'.repeat(70));
  console.log('🚀 PDF Scholar Import V2');
  console.log('═'.repeat(70));
  console.log(`   Mod: ${isDryRun ? 'DRY-RUN (DB\'ye YAZILMAZ)' : 'FULL IMPORT'}`);
  console.log(`   Limit: ${limit === Infinity ? 'tümü' : limit}`);

  const jsonPath = path.resolve(__dirname, '../src/data/scholars-v2.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON bulunamadı: ${jsonPath}`);
    console.error(`   Önce parser'ı çalıştır:`);
    console.error(`   npx ts-node src/services/scholars-pdf-parser-v2.ts`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const allScholars: ParsedScholar[] = raw.scholars;
  console.log(`   JSON'da toplam: ${allScholars.length} alim`);

  // Limitle ve dry-run modunda kes
  const toImport = allScholars.slice(0, limit);
  console.log(`   İçe alınacak: ${toImport.length} alim\n`);

  // NestJS uygulamasını başlat (sadece Scholar repository için)
  console.log('📡 NestJS uygulaması başlatılıyor...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const scholarRepo: Repository<Scholar> = app.get(
    getRepositoryToken(Scholar),
  );

  // Mevcut DB durumu
  const existingCount = await scholarRepo.count();
  console.log(`📊 Mevcut DB'de: ${existingCount} alim`);

  if (existingCount > 0 && !isDryRun) {
    console.log(
      `⚠️  DİKKAT: DB'de zaten ${existingCount} alim var. Devam edilirse ÜZERİNE EKLENİR.`,
    );
    // Otomatik 3 saniye bekle, vazgeçme şansı
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('📥 IMPORT BAŞLIYOR');
  console.log('═'.repeat(70));

  let successCount = 0;
  let errorCount = 0;
  const errors: { name: string; error: string }[] = [];
  const startTime = Date.now();

  for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
    const batchScholars = toImport.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toImport.length / BATCH_SIZE);

    // Scholar entity'lerini hazırla
    const entitiesToSave: Partial<Scholar>[] = batchScholars.map((s) => ({
      fullName: s.fullName,
      biography: s.biography,
      birthDate: s.birthDate || undefined,
      deathDate: s.deathDate || undefined,
      photoUrl: DEFAULT_PHOTO,
      coverImage: DEFAULT_COVER,
      lineage: undefined,
      latitude: undefined,
      longitude: undefined,
      locationName: undefined,
      locationDescription: undefined,
    }));

    if (isDryRun) {
      // Dry-run: göster ama yazma
      console.log(`\n[Batch ${batchNum}/${totalBatches}] ${batchScholars.length} alim önizleme:`);
      batchScholars.slice(0, 5).forEach((s, idx) => {
        const previewBio = s.biography.substring(0, 80).replace(/\n/g, ' ');
        console.log(`   ${idx + 1}. ${s.fullName}`);
        console.log(`      Tarih: ${s.birthDate ?? '-'} / ${s.deathDate ?? '-'}`);
        console.log(`      Bio: ${previewBio}...`);
      });
      successCount += batchScholars.length;
    } else {
      // Gerçek import
      try {
        const entities = scholarRepo.create(entitiesToSave as Scholar[]);
        await scholarRepo.save(entities, { chunk: BATCH_SIZE });
        successCount += batchScholars.length;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (successCount / parseFloat(elapsed)).toFixed(1);
        process.stdout.write(
          `\r   Batch ${batchNum}/${totalBatches}  |  ` +
            `Eklendi: ${successCount}/${toImport.length}  |  ` +
            `Hız: ${rate} alim/sn  |  ` +
            `Geçen: ${elapsed}sn`,
        );
      } catch (err: any) {
        errorCount += batchScholars.length;
        errors.push({
          name: `Batch ${batchNum}`,
          error: err.message,
        });
        console.error(`\n❌ Batch ${batchNum} hatası: ${err.message}`);
        // Bu batch'i tek tek tekrar dene (hangi alim sorunlu?)
        console.log('   Tek tek deniyor...');
        for (const entity of entitiesToSave) {
          try {
            await scholarRepo.save(scholarRepo.create(entity as Scholar));
            successCount++;
            errorCount--;
          } catch (e: any) {
            errors.push({
              name: entity.fullName ?? '?',
              error: e.message?.substring(0, 200),
            });
          }
        }
      }
    }
  }

  console.log('\n\n' + '═'.repeat(70));
  console.log(isDryRun ? '✅ DRY-RUN TAMAMLANDI' : '✅ IMPORT TAMAMLANDI');
  console.log('═'.repeat(70));
  console.log(`   Başarılı: ${successCount}`);
  console.log(`   Hatalı: ${errorCount}`);

  if (!isDryRun) {
    const finalCount = await scholarRepo.count();
    console.log(`   DB'deki final alim sayısı: ${finalCount}`);

    // SADREDDÎN BEKRÎ doğrulaması
    const sadreddin = await scholarRepo.findOne({
      where: { fullName: 'SADREDDÎN BEKRÎ (Hasen bin Muhammed)' },
    });
    if (sadreddin) {
      console.log('\n🎯 DOĞRULAMA: SADREDDÎN BEKRÎ');
      console.log(`   ID: ${sadreddin.id}`);
      console.log(`   Doğum: ${sadreddin.birthDate ?? '-'}`);
      console.log(`   Vefât: ${sadreddin.deathDate ?? '-'}`);
      console.log(`   Bio uzunluğu: ${sadreddin.biography.length} char`);
      console.log(`   İlk 200 char: ${sadreddin.biography.substring(0, 200)}...`);
    } else {
      console.log('\n⚠️  SADREDDÎN BEKRÎ bulunamadı!');
    }
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  HATALAR (ilk 10):`);
    errors.slice(0, 10).forEach((e) => {
      console.log(`   ${e.name}: ${e.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... ve ${errors.length - 10} adet daha`);
    }
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('💥 Fatal hata:', err);
  process.exit(1);
});
