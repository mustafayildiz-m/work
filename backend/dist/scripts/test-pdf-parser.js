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
const enhanced_pdf_parser_1 = require("../src/services/enhanced-pdf-parser");
const path = __importStar(require("path"));
async function testPDFParser() {
    const pdfPath = path.join(__dirname, '../uploads/0001.İslâm Âlimleri ve Evliyâlar Biyogrofisi_2023.pdf');
    const outputPath = path.join(__dirname, '../data/test-scholars.json');
    console.log('🚀 PDF Parser Test Başlatılıyor...');
    console.log(`📄 PDF: ${pdfPath}`);
    console.log(`💾 Output: ${outputPath}`);
    const config = {
        minNameLength: 6,
        maxNameLength: 100,
        minWordCount: 2,
        maxWordCount: 12,
    };
    const parser = new enhanced_pdf_parser_1.PDFSpecificScholarParser(pdfPath, outputPath, config);
    try {
        const scholars = await parser.process();
        console.log('\n📊 Sonuçlar:');
        console.log(`✅ Toplam âlim: ${scholars.length}`);
        const highConfidence = scholars.filter(s => (s.confidence || 0) >= 80).length;
        const mediumConfidence = scholars.filter(s => (s.confidence || 0) >= 50 && (s.confidence || 0) < 80).length;
        const lowConfidence = scholars.filter(s => (s.confidence || 0) < 50).length;
        console.log(`🎯 Yüksek güvenilirlik (80+): ${highConfidence}`);
        console.log(`⚖️ Orta güvenilirlik (50-79): ${mediumConfidence}`);
        console.log(`⚠️ Düşük güvenilirlik (<50): ${lowConfidence}`);
        console.log('\n📋 İlk 5 âlim:');
        scholars.slice(0, 5).forEach((scholar, index) => {
            console.log(`${index + 1}. ${scholar.fullName} (${scholar.confidence}%)`);
        });
    }
    catch (error) {
        console.error('❌ Parser hatası:', error);
    }
}
testPDFParser();
//# sourceMappingURL=test-pdf-parser.js.map