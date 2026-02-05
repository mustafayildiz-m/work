import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScholarsService } from '../src/scholars/scholars.service';
import * as fs from 'fs';
import * as path from 'path';

interface ScholarData {
  fullName: string;
  lineage?: string;
  birthDate?: string;
  deathDate?: string;
  biography: string;
  photoUrl?: string;
  coverImage?: string;
  locationName?: string;
  locationDescription?: string;
  confidence?: number;
}

interface ScholarFile {
  metadata: {
    totalCount: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    processedAt: string;
    sourceFile: string;
  };
  scholars: ScholarData[];
}

async function importScholars() {
  console.log('🚀 Scholar Import Script Başlatılıyor...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const scholarsService = app.get(ScholarsService);
  
  try {
    // Scholars dosyasını oku
    const filePath = path.join(__dirname, '../data/test-scholars.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ JSON dosyası bulunamadı. Önce parser\'ı çalıştırın.');
      return;
    }
    
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const data: ScholarFile = JSON.parse(fileContent);
    
    console.log(`📚 Toplam ${data.metadata.totalCount} âlim verisi bulundu.`);
    console.log(`🎯 Yüksek güvenilirlik: ${data.metadata.highConfidence}`);
    console.log(`⚖️ Orta güvenilirlik: ${data.metadata.mediumConfidence}`);
    console.log(`⚠️ Düşük güvenilirlik: ${data.metadata.lowConfidence}`);
    
    // Mevcut âlimleri kontrol et
    console.log('🔍 Mevcut âlimler kontrol ediliyor...');
    const existingScholars = await scholarsService.findAll();
    const existingNames = new Set(existingScholars.map(s => s.fullName.toLowerCase().trim()));
    console.log(`📋 Veritabanında ${existingNames.size} âlim mevcut.`);
    
    // Sadece yüksek güvenilirlikli âlimleri al (80+)
    const highConfidenceScholars = data.scholars.filter(s => (s.confidence || 0) >= 80);
    console.log(`🎯 ${highConfidenceScholars.length} yüksek güvenilirlikli âlim işlenecek.`);
    
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    console.log(`🔄 ${batchSize}'li gruplar halinde yükleme başlıyor...\n`);
    
    for (let i = 0; i < highConfidenceScholars.length; i += batchSize) {
      const batch = highConfidenceScholars.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 Batch ${batchNumber}: ${batch.length} âlim işleniyor...`);
      
      for (const scholar of batch) {
        try {
          // Tekilleştirme kontrolü
          const normalizedName = scholar.fullName.toLowerCase().trim();
          if (existingNames.has(normalizedName)) {
            skippedCount++;
            continue;
          }
          
          // Scholar DTO oluştur
          const createScholarDto = {
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
          
          // Veritabanına kaydet
          await scholarsService.create(createScholarDto);
          successCount++;
          
          // Yeni eklenen âlimi set'e ekle
          existingNames.add(normalizedName);
          
        } catch (error) {
          console.error(`❌ Hata (${scholar.fullName}):`, error.message);
          errorCount++;
        }
      }
      
      console.log(`✅ Batch ${batchNumber} tamamlandi. Toplam: ${successCount} basarili, ${errorCount} hatali, ${skippedCount} atlandi`);
    }
    
    console.log('\n🎉 Tum batch\'ler tamamlandi!');
    console.log(`📊 Final Istatistik: ${successCount} basarili, ${errorCount} hatali, ${skippedCount} atlandi`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await app.close();
  }
  
  console.log('\n✅ Import işlemi tamamlandı!');
}

importScholars();
