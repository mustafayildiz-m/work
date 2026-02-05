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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSpecificScholarParser = void 0;
exports.testPDFParser = testPDFParser;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
class PDFSpecificScholarParser {
    constructor(pdfPath, outputPath, config) {
        this.pdfPath = pdfPath;
        this.outputPath = outputPath;
        this.config = {
            minNameLength: 3,
            maxNameLength: 120,
            minWordCount: 2,
            maxWordCount: 10,
            datePatterns: [
                /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g,
                /(\d{2,4})\s*[-–]\s*(\d{2,4})/g,
                /doğumu?\s*(\d{2,4})/gi,
                /vefât\s*(\d{2,4})/gi,
                /ölüm\s*(\d{2,4})/gi,
            ],
            lineageKeywords: [
                'İbn',
                'Ebu',
                'Ebû',
                'bin',
                'el-',
                'ed-',
                'en-',
                'er-',
                'es-',
                'et-',
                'ez-',
                'Abd',
                'Künyesi',
                'Adı',
            ],
            excludePatterns: [
                /^\d+$/,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SAYFA[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*İÇİNDEKİLER[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KAYNAKLAR[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*BÖLÜM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*FASIL[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KISIM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*ÖZET[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*GİRİŞ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SONUÇ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
                /^[-–=_\s]+$/,
                /^\([^)]*\)$/,
                /^İÇİNDEKİLER$/,
                /^KAYNAKÇA$/,
                /^DİZİN$/,
            ],
            alternativeNameSupport: true,
            confidenceThreshold: 40,
            ...config,
        };
        this.compilePatterns();
    }
    compilePatterns() {
        this.compiledPatterns = {
            scholarName: /^[A-ZÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚÄÖÜıçğşâîû\s\-\.\']{3,120}(?:\s*\([^)]+\))?$/,
            dateExtraction: this.config.datePatterns,
            lineageKeywords: new RegExp(`(${this.config.lineageKeywords.join('|')})`, 'i'),
            alternativeName: /^(.+?)\s*\((.+?)\)$/,
            knownScholarPatterns: [
                /^(İMAM|EBU|EBÛ|İBN|HZ\.|HAZRET|ŞEYH|MEVLANA|SULTAN|HÂCE|KADI|MÜFTÜ|EMİR)/i,
                /^(ABDULLAH|AHMED|ALİ|HASAN|HÜSEYİN|ÖMER|OSMAN|MUHAMMED|YUSUF|İBRAHİM|İSMAİL|MUSA|İSA|DAVUD|SÜLEYMAN|YAKUP|İSHAK)/i,
                /^(ABDURRAHMAN|ABDULKADİR|ABDULAZİZ|ABDULHAMİT|ABDULMELİK|ABDULVAHID|ABDULLATIF)/i,
                /(BİN|İBN|EBU|EBÛ|EL\-|ED\-|EN\-|ER\-|ES\-|ET\-|EZ\-|HÂFIZ|İMÂM)/i,
                /\b(SERÎ|HETTÂR|HEVÂRÎ|BİRGİVİ|HADİMİ|KOTKU|TOPBAŞ|KONUK|YAZIR)\b/i,
                /[ÂÎÛÇĞŞİÖÜ]/,
                /(GAZALİ|BUHARİ|MÜSLİM|TİRMİZİ|NESAİ|EBU\s*DAVUD|İBN\s*MACE|AHMED\s*BİN\s*HANBEL)$/i,
            ],
        };
    }
    async parsePDF() {
        try {
            const dataBuffer = await fs.promises.readFile(this.pdfPath);
            const data = await (0, pdf_parse_1.default)(dataBuffer);
            return data.text;
        }
        catch (error) {
            console.error('PDF okuma hatası:', error);
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }
    extractAlternativeName(fullName) {
        if (!this.config.alternativeNameSupport) {
            return { mainName: fullName };
        }
        const match = fullName.match(this.compiledPatterns.alternativeName);
        if (match && match.length >= 3) {
            return {
                mainName: match[1].trim(),
                altName: match[2].trim(),
            };
        }
        return { mainName: fullName };
    }
    hasKnownScholarPatterns(name) {
        return this.compiledPatterns.knownScholarPatterns.some((pattern) => pattern.test(name));
    }
    isValidScholarName(name) {
        const trimmed = name.trim();
        if (this.config.excludePatterns.some((pattern) => pattern.test(trimmed))) {
            return false;
        }
        if (!this.compiledPatterns.scholarName.test(trimmed)) {
            return false;
        }
        const mainName = trimmed.replace(/\s*\([^)]+\)/, '');
        const words = mainName.split(/\s+/).filter(Boolean);
        if (words.length < this.config.minWordCount ||
            words.length > this.config.maxWordCount) {
            return false;
        }
        return this.hasKnownScholarPatterns(trimmed);
    }
    extractDatesFromBiography(biography) {
        const result = {};
        const hijriMiladiPattern = /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g;
        const hijriMiladiMatch = biography.match(hijriMiladiPattern);
        if (hijriMiladiMatch) {
            const match = hijriMiladiMatch[0].match(/(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/);
            if (match) {
                result.deathDateHijri = match[1];
                result.deathDate = match[2];
            }
        }
        for (const pattern of this.compiledPatterns.dateExtraction) {
            if (pattern === hijriMiladiPattern)
                continue;
            const match = biography.match(pattern);
            if (match && match.length >= 2) {
                if (pattern.source.includes('doğum')) {
                    result.birthDate = match[1];
                }
                else if (pattern.source.includes('vefât') ||
                    pattern.source.includes('ölüm')) {
                    result.deathDate = match[1];
                }
                else if (match.length >= 3) {
                    result.birthDate = match[1];
                    result.deathDate = match[2];
                }
                break;
            }
        }
        return result;
    }
    extractLineage(biography, scholarName) {
        const lines = biography.split('\n').slice(0, 3);
        for (const line of lines) {
            const trimmedLine = line.trim();
            const explicitPatterns = [
                /künyesi\s+(.+?)['dir'|'dır'|\s|\.]/i,
                /adı,?\s*(.+?)['dir'|'dır'|\s|\.]/i,
                /lakabı\s+(.+?)['dir'|'dır'|\s|\.]/i,
            ];
            for (const pattern of explicitPatterns) {
                const match = trimmedLine.match(pattern);
                if (match && match[1] && match[1].trim().length > 3) {
                    return match[1].trim();
                }
            }
            if (this.compiledPatterns.lineageKeywords.test(trimmedLine)) {
                if (!trimmedLine.toUpperCase().includes(scholarName.toUpperCase())) {
                    return trimmedLine;
                }
            }
        }
        return undefined;
    }
    calculateConfidence(name, biography, hasAlternativeName, hasDateInfo) {
        let confidence = 0;
        if (this.hasKnownScholarPatterns(name)) {
            confidence += 50;
        }
        else if (this.compiledPatterns.scholarName.test(name)) {
            confidence += 30;
        }
        if (hasAlternativeName)
            confidence += 10;
        if (biography.length > 300)
            confidence += 25;
        else if (biography.length > 150)
            confidence += 20;
        else if (biography.length > 50)
            confidence += 10;
        if (hasDateInfo)
            confidence += 10;
        const islamicTerms = /(hadîs|hadis|fıkıh|fiqh|tasavvuf|âlim|alim|imam|hoca|medrese|ilim|rivâyet|rivayet|sika|fakih|muhaddis|mufessir)/i;
        if (islamicTerms.test(biography))
            confidence += 5;
        return Math.min(confidence, 100);
    }
    extractScholars(text) {
        const scholars = [];
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        let currentScholar = {};
        let biographyLines = [];
        let processingBiography = false;
        console.log(`🔍 Toplam ${lines.length} satır işleniyor...`);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.isValidScholarName(line)) {
                console.log(`✅ Âlim tespit edildi: "${line}"`);
                if (currentScholar.fullName && biographyLines.length > 0) {
                    const biography = biographyLines.join(' ').trim();
                    const dates = this.extractDatesFromBiography(biography);
                    const lineage = this.extractLineage(biography, currentScholar.fullName);
                    const hasAltName = !!currentScholar.alternativeName;
                    const hasDateInfo = !!(dates.birthDate ||
                        dates.deathDate ||
                        dates.birthDateHijri ||
                        dates.deathDateHijri);
                    const confidence = this.calculateConfidence(currentScholar.fullName, biography, hasAltName, hasDateInfo);
                    if (confidence >= this.config.confidenceThreshold) {
                        scholars.push({
                            fullName: currentScholar.fullName,
                            alternativeName: currentScholar.alternativeName,
                            lineage,
                            ...dates,
                            biography,
                            confidence,
                            photoUrl: 'uploads/coverImage/coverImage.jpg',
                            coverImage: 'uploads/coverImage/coverImage.jpg',
                            rawLine: currentScholar.rawLine,
                        });
                        console.log(`  💾 Kaydedildi (Güvenilirlik: ${confidence}%)`);
                    }
                    else {
                        console.log(`  ❌ Düşük güvenilirlik (${confidence}%), atlandı`);
                    }
                }
                const { mainName, altName } = this.extractAlternativeName(line);
                currentScholar = {
                    fullName: mainName,
                    alternativeName: altName,
                    rawLine: line,
                };
                biographyLines = [];
                processingBiography = true;
                continue;
            }
            if (processingBiography) {
                if (line.length > 15 &&
                    !line.match(/^[-–=_\s]+$/) &&
                    !line.match(/^\d+$/)) {
                    biographyLines.push(line);
                }
                if (line.match(/^[-–=_]{5,}/) ||
                    (line.length > 50 &&
                        line === line.toUpperCase() &&
                        this.hasKnownScholarPatterns(line))) {
                    processingBiography = false;
                }
            }
        }
        if (currentScholar.fullName && biographyLines.length > 0) {
            const biography = biographyLines.join(' ').trim();
            const dates = this.extractDatesFromBiography(biography);
            const lineage = this.extractLineage(biography, currentScholar.fullName);
            const hasAltName = !!currentScholar.alternativeName;
            const hasDateInfo = !!(dates.birthDate ||
                dates.deathDate ||
                dates.birthDateHijri ||
                dates.deathDateHijri);
            const confidence = this.calculateConfidence(currentScholar.fullName, biography, hasAltName, hasDateInfo);
            if (confidence >= this.config.confidenceThreshold) {
                scholars.push({
                    fullName: currentScholar.fullName,
                    alternativeName: currentScholar.alternativeName,
                    lineage,
                    ...dates,
                    biography,
                    confidence,
                    photoUrl: 'uploads/coverImage/coverImage.jpg',
                    coverImage: 'uploads/coverImage/coverImage.jpg',
                    rawLine: currentScholar.rawLine,
                });
            }
        }
        return scholars.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
    async saveToFile(scholars) {
        const output = {
            metadata: {
                totalCount: scholars.length,
                highConfidence: scholars.filter((s) => (s.confidence || 0) >= 80)
                    .length,
                mediumConfidence: scholars.filter((s) => (s.confidence || 0) >= 60 && (s.confidence || 0) < 80).length,
                lowConfidence: scholars.filter((s) => (s.confidence || 0) >= 40 && (s.confidence || 0) < 60).length,
                processedAt: new Date().toISOString(),
                sourceFile: path.basename(this.pdfPath),
                parserConfig: this.config,
            },
            scholars: scholars,
        };
        await fs.promises.writeFile(this.outputPath, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n✅ ${scholars.length} âlim verisi ${this.outputPath} dosyasına kaydedildi.`);
        console.log(`📊 Güvenilirlik Dağılımı:`);
        console.log(`   🟢 Yüksek (%80+): ${output.metadata.highConfidence} âlim`);
        console.log(`   🟡 Orta (%60-79): ${output.metadata.mediumConfidence} âlim`);
        console.log(`   🔴 Düşük (%40-59): ${output.metadata.lowConfidence} âlim`);
    }
    async process() {
        console.log('📄 PDF dosyası okunuyor...');
        const text = await this.parsePDF();
        console.log('🔍 Âlimler çıkarılıyor...');
        const scholars = this.extractScholars(text);
        console.log('💾 Veriler dosyaya kaydediliyor...');
        await this.saveToFile(scholars);
        return scholars;
    }
    testWithYourExamples() {
        const examples = [
            'HENNÂD BİN SERÎ',
            'HETTÂR (Îsâ bin İkbâl)',
            'HEVÂRÎ (Ebû Abdullah)',
            'İMAM EBU HANİFE',
            'SAYFA 123',
            'İÇİNDEKİLER',
            "ABDULLAH BİN MAS'UD",
        ];
        console.log('\n🧪 PDF Formatınızla Test:');
        console.log('========================');
        examples.forEach((example) => {
            const isValid = this.isValidScholarName(example);
            const { mainName, altName } = this.extractAlternativeName(example);
            const hasKnownPattern = this.hasKnownScholarPatterns(example);
            console.log(`\n📝 "${example}"`);
            console.log(`   ✅ Valid Scholar Name: ${isValid ? 'YES' : 'NO'}`);
            console.log(`   🎯 Has Known Pattern: ${hasKnownPattern ? 'YES' : 'NO'}`);
            if (altName) {
                console.log(`   🔄 Main: "${mainName}" | Alt: "${altName}"`);
            }
            console.log(`   🏆 Final Result: ${isValid ? '✅ DETECTED' : '❌ REJECTED'}`);
        });
        const testBio = "243 (m. 857) senesinin Rebî'ul-evvel ayında vefât etti.";
        console.log(`\n📅 Tarih Extraction Test:`);
        console.log(`Text: "${testBio}"`);
        const dates = this.extractDatesFromBiography(testBio);
        console.log(`Result:`, dates);
    }
    static async processMultiplePDFs(pdfPaths, outputDir, config) {
        const allScholars = [];
        for (const pdfPath of pdfPaths) {
            const outputPath = path.join(outputDir, `${path.basename(pdfPath, '.pdf')}-scholars.json`);
            const parser = new PDFSpecificScholarParser(pdfPath, outputPath, config);
            try {
                const scholars = await parser.process();
                allScholars.push(...scholars);
            }
            catch (error) {
                console.error(`Error processing ${pdfPath}:`, error);
            }
        }
        return allScholars;
    }
}
exports.PDFSpecificScholarParser = PDFSpecificScholarParser;
async function testPDFParser() {
    const pdfPath = path.join(__dirname, '../uploads/0001.İslâm Âlimleri ve Evliyâlar Biyogrofisi_2023.pdf');
    const outputPath = path.join(__dirname, '../data/scholars-pdf-specific.json');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const parser = new PDFSpecificScholarParser(pdfPath, outputPath);
    parser.testWithYourExamples();
    try {
        const scholars = await parser.process();
        console.log(`\n🎉 BAŞARILI! ${scholars.length} âlim tespit edildi.`);
        console.log('\n📋 En Yüksek Güvenilirlikli 5 Âlim:');
        scholars.slice(0, 5).forEach((scholar, index) => {
            console.log(`\n${index + 1}. 🎯 ${scholar.confidence}% - ${scholar.fullName}`);
            if (scholar.alternativeName) {
                console.log(`   🔄 Alt İsim: ${scholar.alternativeName}`);
            }
            if (scholar.birthDateHijri || scholar.deathDateHijri) {
                console.log(`   📅 Hicri: ${scholar.birthDateHijri || '?'} - ${scholar.deathDateHijri || '?'}`);
            }
            if (scholar.birthDate || scholar.deathDate) {
                console.log(`   📅 Miladi: ${scholar.birthDate || '?'} - ${scholar.deathDate || '?'}`);
            }
            if (scholar.lineage) {
                console.log(`   👥 Soy: ${scholar.lineage.substring(0, 80)}...`);
            }
            console.log(`   📝 Biyografi: ${scholar.biography.substring(0, 100)}...`);
        });
        return scholars;
    }
    catch (error) {
        console.error('❌ Hata:', error);
        throw error;
    }
}
//# sourceMappingURL=enhanced-pdf-parser.js.map