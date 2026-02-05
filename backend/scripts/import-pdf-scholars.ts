import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScholarsService } from '../src/scholars/scholars.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateScholarDto } from '../src/scholars/dto/create-scholar.dto';
import { ScholarData } from '../src/services/enhanced-pdf-parser';

async function bootstrap() {
  console.log('🚀 PDF Scholar Import Script Başlatılıyor...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const scholarsService = app.get(ScholarsService);

  const jsonFilePath = path.resolve(__dirname, '../src/data/scholars-pdf-specific.json');

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ Hata: JSON dosyası bulunamadı: ${jsonFilePath}`);
    await app.close();
    return;
  }

  console.log('📄 JSON dosyası okunuyor...');
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  const { scholars: parsedScholars, metadata } = JSON.parse(rawData);

  console.log(`📚 Toplam ${metadata.totalCount} âlim verisi bulundu.`);
  console.log(`🎯 Yüksek güvenilirlik: ${metadata.highConfidence}`);
  console.log(`⚖️ Orta güvenilirlik: ${metadata.mediumConfidence}`);
  console.log(`⚠️ Düşük güvenilirlik: ${metadata.lowConfidence}`);

  // Sadece yüksek güvenilirlikli âlimleri al (80+)
  const highConfidenceScholars = parsedScholars.filter((s: ScholarData) => (s.confidence || 0) >= 80);
  console.log(`🎯 ${highConfidenceScholars.length} yüksek güvenilirlikli âlim işlenecek.`);

  // Mevcut âlimleri kontrol et
  console.log('🔍 Mevcut âlimler kontrol ediliyor...');
  const existingScholars = await scholarsService.findAll();
  const existingNames = new Set(existingScholars.map(s => s.fullName.toLowerCase().trim()));
  console.log(`📋 Veritabanında ${existingNames.size} âlim mevcut.`);

  let successfulImports = 0;
  let failedImports = 0;
  let skippedCount = 0;
  const batchSize = 50;

  console.log(`🔄 ${batchSize}'li gruplar halinde yükleme başlıyor...`);

  for (let i = 0; i < highConfidenceScholars.length; i += batchSize) {
    const batch = highConfidenceScholars.slice(i, i + batchSize);
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} âlim işleniyor...`);

    await Promise.all(batch.map(async (scholar: ScholarData) => {
      const normalizedName = scholar.fullName.toLowerCase().trim();

      // Tekilleştirme kontrolü
      if (existingNames.has(normalizedName)) {
        skippedCount++;
        return;
      }

      const createScholarDto: CreateScholarDto = {
        fullName: scholar.fullName,
        lineage: scholar.lineage || undefined,
        birthDate: scholar.birthDate || undefined,
        deathDate: scholar.deathDate || undefined,
        biography: scholar.biography,
        photoUrl: scholar.photoUrl || 'uploads/coverImage/coverImage.jpg',
        coverImage: scholar.coverImage || 'uploads/coverImage/coverImage.jpg',
        locationName: scholar.locationName || undefined,
        locationDescription: scholar.locationDescription || undefined,
      };

      try {
        await scholarsService.create(createScholarDto);
        successfulImports++;
        existingNames.add(normalizedName); // Yeni eklenen âlimi set'e ekle
        
        if (successfulImports % 100 === 0) {
          console.log(`✅ ${successfulImports} âlim başarıyla eklendi...`);
        }
      } catch (error) {
        console.error(`❌ Hata oluştu: ${scholar.fullName} - ${error.message}`);
        failedImports++;
      }
    }));
    
    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} tamamlandı. Toplam: ${successfulImports} başarılı, ${failedImports} hatalı, ${skippedCount} atlandı`);
  }

  console.log('\n🎉 Tüm batch\'ler tamamlandı!');
  console.log(`📊 Final İstatistik:`);
  console.log(`   ✅ Başarılı: ${successfulImports} âlim`);
  console.log(`   ❌ Hatalı: ${failedImports} âlim`);
  console.log(`   ⏭️ Atlandı: ${skippedCount} âlim`);

  // Örnek âlim kontrolü
  const abdullahAyderusiInDb = await scholarsService.findAll();
  const abdullahAyderusi = abdullahAyderusiInDb.find(s => s.fullName.includes('ABDULLAH AYDERÛSÎ'));
  if (abdullahAyderusi) {
    console.log('\n🎉 ABDULLAH AYDERÛSÎ veritabanında bulundu!');
    console.log(`📝 ID: ${abdullahAyderusi.id}`);
    console.log(`📝 İsim: ${abdullahAyderusi.fullName}`);
  } else {
    console.log('\n❌ ABDULLAH AYDERÛSÎ veritabanında bulunamadı.');
  }

  // Son durum kontrolü
  const finalCount = await scholarsService.findAll();
  console.log(`\n📈 Veritabanındaki toplam âlim sayısı: ${finalCount.length}`);

  console.log('\n✅ Import işlemi tamamlandı!');
  await app.close();
}

bootstrap().catch(console.error);
