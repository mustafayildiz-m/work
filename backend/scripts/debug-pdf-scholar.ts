import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

async function debugPDF() {
  const pdfPath = path.resolve(__dirname, '../../islam_alimleri.pdf');
  
  console.log(`PDF: ${pdfPath}`);
  console.log(`Exists: ${fs.existsSync(pdfPath)}`);
  
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  
  const text = data.text;
  const lines = text.split('\n');
  
  console.log(`\nTotal pages: ${data.numpages}`);
  console.log(`Total text lines: ${lines.length}`);
  console.log(`Total text length: ${text.length} chars`);
  
  // "SADREDDÎN" veya "BEKRÎ" arayalım
  const searchTerms = ['SADREDD', 'BEKR', 'Sadredd', 'Bekr', 'sadredd', 'bekr'];
  
  for (const term of searchTerms) {
    const matchingLines: { lineNum: number; content: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(term)) {
        matchingLines.push({ lineNum: i, content: lines[i].trim() });
      }
    }
    
    if (matchingLines.length > 0) {
      console.log(`\n=== "${term}" - ${matchingLines.length} match(es) ===`);
      for (const m of matchingLines.slice(0, 10)) {
        console.log(`  Line ${m.lineNum}: ${m.content.substring(0, 200)}`);
        
        // Context: 5 lines before and after
        console.log(`  --- Context ---`);
        for (let j = Math.max(0, m.lineNum - 3); j <= Math.min(lines.length - 1, m.lineNum + 10); j++) {
          const prefix = j === m.lineNum ? '>>>' : '   ';
          console.log(`  ${prefix} [${j}] ${lines[j].trim().substring(0, 200)}`);
        }
        console.log('');
      }
    } else {
      console.log(`\n"${term}" - no matches`);
    }
  }

  // İlk 50 satırı göster (PDF yapısını anlama)
  console.log('\n=== İlk 50 satır ===');
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    if (lines[i].trim().length > 0) {
      console.log(`[${i}] ${lines[i].trim().substring(0, 150)}`);
    }
  }

  // Büyük harfle yazılmış satırları say (potansiyel alim isimleri)
  const upperCaseLines = lines.filter(l => {
    const t = l.trim();
    return t.length > 5 && t === t.toUpperCase() && /[A-ZÇĞİÖŞÜÂÎÛ]/.test(t);
  });
  console.log(`\nToplam büyük harfli satır (potansiyel alim ismi): ${upperCaseLines.length}`);
  console.log('İlk 30 örnek:');
  upperCaseLines.slice(0, 30).forEach((l, i) => {
    console.log(`  ${i + 1}. ${l.trim().substring(0, 120)}`);
  });
}

debugPDF().catch(console.error);
