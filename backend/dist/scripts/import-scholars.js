"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const scholars_service_1 = require("../src/scholars/scholars.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function importScholars() {
    console.log('🚀 Scholar Import Script Başlatılıyor...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const scholarsService = app.get(scholars_service_1.ScholarsService);
    try {
        const filePath = path.join(__dirname, '../data/test-scholars.json');
        if (!fs.existsSync(filePath)) {
            console.error('❌ JSON dosyası bulunamadı. Önce parser\'ı çalıştırın.');
            return;
        }
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        console.log(`📚 Toplam ${data.metadata.totalCount} âlim verisi bulundu.`);
        console.log(`🎯 Yüksek güvenilirlik: ${data.metadata.highConfidence}`);
        console.log(`⚖️ Orta güvenilirlik: ${data.metadata.mediumConfidence}`);
        console.log(`⚠️ Düşük güvenilirlik: ${data.metadata.lowConfidence}`);
        console.log('🔍 Mevcut âlimler kontrol ediliyor...');
        const existingScholars = await scholarsService.findAll();
        const existingNames = new Set(existingScholars.map(s => s.fullName.toLowerCase().trim()));
        console.log(`📋 Veritabanında ${existingNames.size} âlim mevcut.`);
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
                    const normalizedName = scholar.fullName.toLowerCase().trim();
                    if (existingNames.has(normalizedName)) {
                        skippedCount++;
                        continue;
                    }
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
                    await scholarsService.create(createScholarDto);
                    successCount++;
                    existingNames.add(normalizedName);
                }
                catch (error) {
                    console.error(`❌ Hata (${scholar.fullName}):`, error.message);
                    errorCount++;
                }
            }
            console.log(`✅ Batch ${batchNumber} tamamlandi. Toplam: ${successCount} basarili, ${errorCount} hatali, ${skippedCount} atlandi`);
        }
        console.log('\n🎉 Tum batch\'ler tamamlandi!');
        console.log(`📊 Final Istatistik: ${successCount} basarili, ${errorCount} hatali, ${skippedCount} atlandi`);
    }
    catch (error) {
        console.error('❌ Import hatası:', error);
    }
    finally {
        await app.close();
    }
    console.log('\n✅ Import işlemi tamamlandı!');
}
importScholars();
//# sourceMappingURL=import-scholars.js.map