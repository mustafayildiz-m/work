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
async function bootstrap() {
    console.log('🚀 PDF Scholar Import Script Başlatılıyor...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const scholarsService = app.get(scholars_service_1.ScholarsService);
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
    const highConfidenceScholars = parsedScholars.filter((s) => (s.confidence || 0) >= 80);
    console.log(`🎯 ${highConfidenceScholars.length} yüksek güvenilirlikli âlim işlenecek.`);
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
        await Promise.all(batch.map(async (scholar) => {
            const normalizedName = scholar.fullName.toLowerCase().trim();
            if (existingNames.has(normalizedName)) {
                skippedCount++;
                return;
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
            try {
                await scholarsService.create(createScholarDto);
                successfulImports++;
                existingNames.add(normalizedName);
                if (successfulImports % 100 === 0) {
                    console.log(`✅ ${successfulImports} âlim başarıyla eklendi...`);
                }
            }
            catch (error) {
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
    const abdullahAyderusiInDb = await scholarsService.findAll();
    const abdullahAyderusi = abdullahAyderusiInDb.find(s => s.fullName.includes('ABDULLAH AYDERÛSÎ'));
    if (abdullahAyderusi) {
        console.log('\n🎉 ABDULLAH AYDERÛSÎ veritabanında bulundu!');
        console.log(`📝 ID: ${abdullahAyderusi.id}`);
        console.log(`📝 İsim: ${abdullahAyderusi.fullName}`);
    }
    else {
        console.log('\n❌ ABDULLAH AYDERÛSÎ veritabanında bulunamadı.');
    }
    const finalCount = await scholarsService.findAll();
    console.log(`\n📈 Veritabanındaki toplam âlim sayısı: ${finalCount.length}`);
    console.log('\n✅ Import işlemi tamamlandı!');
    await app.close();
}
bootstrap().catch(console.error);
//# sourceMappingURL=import-pdf-scholars.js.map