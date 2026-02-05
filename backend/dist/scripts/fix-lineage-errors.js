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
    console.log('🔧 Lineage Hatalarını Düzeltme Script\'i Başlatılıyor...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const scholarsService = app.get(scholars_service_1.ScholarsService);
    const jsonFilePath = path.resolve(__dirname, '../src/data/scholars-pdf-specific.json');
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const { scholars: parsedScholars } = JSON.parse(rawData);
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
        const scholar = parsedScholars.find((s) => s.fullName === scholarName);
        if (!scholar) {
            console.log(`❌ ${scholarName} bulunamadı`);
            continue;
        }
        const truncatedLineage = scholar.lineage ? scholar.lineage.substring(0, 250) + '...' : undefined;
        const createScholarDto = {
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
        }
        catch (error) {
            console.error(`❌ ${scholarName} hata: ${error.message}`);
            errorCount++;
        }
    }
    console.log(`\n📊 Düzeltme Sonuçları:`);
    console.log(`   ✅ Düzeltilen: ${fixedCount} âlim`);
    console.log(`   ❌ Hatalı: ${errorCount} âlim`);
    console.log('\n🔍 ABDULLAH AYDERÛSÎ aranıyor...');
    const abdullahAyderusi = parsedScholars.find((s) => s.fullName.includes('ABDULLAH AYDERÛSÎ') || s.fullName.includes('ABDULLAH AYDERUSI'));
    if (abdullahAyderusi) {
        console.log(`✅ ABDULLAH AYDERÛSÎ bulundu: ${abdullahAyderusi.fullName}`);
        console.log(`📊 Güvenilirlik: ${abdullahAyderusi.confidence}%`);
        if ((abdullahAyderusi.confidence || 0) >= 40) {
            const createScholarDto = {
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
            }
            catch (error) {
                console.error(`❌ ABDULLAH AYDERÛSÎ hata: ${error.message}`);
            }
        }
        else {
            console.log(`⚠️ ABDULLAH AYDERÛSÎ güvenilirlik skoru düşük: ${abdullahAyderusi.confidence}%`);
        }
    }
    else {
        console.log(`❌ ABDULLAH AYDERÛSÎ bulunamadı`);
    }
    const finalCount = await scholarsService.findAll();
    console.log(`\n📈 Veritabanındaki toplam âlim sayısı: ${finalCount.length}`);
    console.log('\n✅ Düzeltme işlemi tamamlandı!');
    await app.close();
}
bootstrap().catch(console.error);
//# sourceMappingURL=fix-lineage-errors.js.map