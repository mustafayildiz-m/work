import { PDFSpecificScholarParser } from '../src/services/enhanced-pdf-parser';
import * as path from 'path';

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
  
  const parser = new PDFSpecificScholarParser(pdfPath, outputPath, config);
  
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
    
    // İlk 5 âlimi göster
    console.log('\n📋 İlk 5 âlim:');
    scholars.slice(0, 5).forEach((scholar, index) => {
      console.log(`${index + 1}. ${scholar.fullName} (${scholar.confidence}%)`);
    });
    
  } catch (error) {
    console.error('❌ Parser hatası:', error);
  }
}

testPDFParser();
