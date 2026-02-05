import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScholarsService } from '../src/scholars/scholars.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateScholarDto } from '../src/scholars/dto/create-scholar.dto';
import { ScholarData } from '../src/services/enhanced-pdf-parser';

async function bootstrap() {
  console.log('🔧 Lineage Hatalarını Düzeltme Script\'i Başlatılıyor...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const scholarsService = app.get(ScholarsService);

  const jsonFilePath = path.resolve(__dirname, '../src/data/scholars-pdf-specific.json');
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  const { scholars: parsedScholars } = JSON.parse(rawData);

  // Hatalı âlimlerin isimleri
  const errorScholars = [
    'ALİ BİN EMRULLAH',
    'BEHÂEDDÎN MUHAMMED BUHÂRÎ',
    'MUHAMMED BİN SELÂME MISRÎ',
    'MUHAMMED ALEYHİSSELÂM',
    'ABDÜLHAKÎM-İ ARVÂSÎ',
    'İBRÂHİM HAKKI ERZURUMÎ',
    'MUHYİDDÎN-İ ARABÎ',
    'FÂTİH SULTAN MEHMED HÂN'
  ];

  let fixedCount = 0;
  let errorCount = 0;

  for (const scholarName of errorScholars) {
    const scholar = parsedScholars.find((s: ScholarData) => s.fullName === scholarName);
    
    if (!scholar) {
      console.log(`❌ ${scholarName} bulunamadı`);
      continue;
    }

    // Lineage'ı kısalt (255 karakter limit)
    const truncatedLineage = scholar.lineage ? scholar.lineage.substring(0, 250) + '...' : undefined;

    const createScholarDto: CreateScholarDto = {
      fullName: scholar.fullName,
      lineage: truncatedLineage,
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
      console.log(`✅ ${scholarName} başarıyla eklendi`);
      fixedCount++;
    } catch (error) {
      console.error(`❌ ${scholarName} hata: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Düzeltme Sonuçları:`);
  console.log(`   ✅ Düzeltilen: ${fixedCount} âlim`);
  console.log(`   ❌ Hatalı: ${errorCount} âlim`);

  // ABDULLAH AYDERÛSÎ'yi arayalım
  console.log('\n🔍 ABDULLAH AYDERÛSÎ aranıyor...');
  const abdullahAyderusi = parsedScholars.find((s: ScholarData) => 
    s.fullName.includes('ABDULLAH AYDERÛSÎ') || s.fullName.includes('ABDULLAH AYDERUSI')
  );
  
  if (abdullahAyderusi) {
    console.log(`✅ ABDULLAH AYDERÛSÎ bulundu: ${abdullahAyderusi.fullName}`);
    console.log(`📊 Güvenilirlik: ${abdullahAyderusi.confidence}%`);
    
    if ((abdullahAyderusi.confidence || 0) >= 40) {
      const createScholarDto: CreateScholarDto = {
        fullName: abdullahAyderusi.fullName,
        lineage: abdullahAyderusi.lineage ? abdullahAyderusi.lineage.substring(0, 250) : undefined,
        birthDate: abdullahAyderusi.birthDate || undefined,
        deathDate: abdullahAyderusi.deathDate || undefined,
        biography: abdullahAyderusi.biography,
        photoUrl: abdullahAyderusi.photoUrl || 'uploads/coverImage/coverImage.jpg',
        coverImage: abdullahAyderusi.coverImage || 'uploads/coverImage/coverImage.jpg',
        locationName: abdullahAyderusi.locationName || undefined,
        locationDescription: abdullahAyderusi.locationDescription || undefined,
      };

      try {
        await scholarsService.create(createScholarDto);
        console.log(`✅ ABDULLAH AYDERÛSÎ başarıyla eklendi!`);
      } catch (error) {
        console.error(`❌ ABDULLAH AYDERÛSÎ hata: ${error.message}`);
      }
    } else {
      console.log(`⚠️ ABDULLAH AYDERÛSÎ güvenilirlik skoru düşük: ${abdullahAyderusi.confidence}%`);
    }
  } else {
    console.log(`❌ ABDULLAH AYDERÛSÎ bulunamadı`);
  }

  // Son durum
  const finalCount = await scholarsService.findAll();
  console.log(`\n📈 Veritabanındaki toplam âlim sayısı: ${finalCount.length}`);

  console.log('\n✅ Düzeltme işlemi tamamlandı!');
  await app.close();
}

bootstrap().catch(console.error);
