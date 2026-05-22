import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

async function find() {
  const pdfPath = path.resolve(__dirname, '../../islam_alimleri.pdf');
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  const lines = data.text.split('\n');

  const targets = [
    /HAN[İI]FE/i,
    /GAZÂL[İI]/i,
    /GAZAL[İI]/i,
    /BUHÂR[İI]/i,
    /BUHAR[İI]/i,
    /İMÂM-?[ıİI]\s*A[ZSŞ]AM/i,
    /İMÂM-?[ıİI]\s*GAZÂL/i,
    /Â[ZSŞ]AM/i,
  ];

  for (const re of targets) {
    console.log(`\n=== ${re.source} ===`);
    let found = 0;
    for (let i = 0; i < lines.length && found < 8; i++) {
      const t = lines[i].trim();
      if (re.test(t) && t.length < 80) {
        // Sadece büyük harfle yazılmış olanlara odaklan
        const noParen = t.replace(/\s*\([^)]*\)\s*/g, '').trim();
        const letters = noParen.replace(
          /[^A-Za-zÇĞİÖŞÜÂÎÛçğşıöüâîû]/g,
          '',
        );
        if (letters.length === 0) continue;
        const lowerLetters = letters.replace(
          /[A-ZÇĞİÖŞÜÂÎÛ]/g,
          '',
        );
        const upperRatio = 1 - lowerLetters.length / letters.length;
        if (upperRatio >= 0.85) {
          console.log(`  [${i}] ${t}`);
          found++;
        }
      }
    }
    if (found === 0) console.log(`  (büyük harfle bulunamadı)`);
  }

  // MEVLÂNÂ'nın biyografisinde ayraç var mı?
  console.log('\n=== MEVLÂNÂ CELÂLEDDÎN BİYOGRAFİSİ İÇİNDE AYRAÇ ARAMA ===');
  let mevlanaStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'MEVLÂNÂ CELÂLEDDÎN RÛMÎ') {
      mevlanaStart = i;
      break;
    }
  }
  console.log(`MEVLÂNÂ başlangıç: satır ${mevlanaStart}`);

  if (mevlanaStart > 0) {
    let nextHeader = -1;
    for (let i = mevlanaStart + 1; i < lines.length; i++) {
      const t = lines[i].trim();
      // Sıradaki MEVLÂNÂ başlığı
      if (/^MEVLÂNÂ\s+\S/.test(t) && i !== mevlanaStart) {
        nextHeader = i;
        break;
      }
    }
    console.log(`Sonraki MEVLÂNÂ başlığı: satır ${nextHeader} (delta: ${nextHeader - mevlanaStart})`);

    // Bu aralıkta ayraç var mı say
    let separatorCount = 0;
    const separatorLines: number[] = [];
    for (let i = mevlanaStart; i < nextHeader; i++) {
      if (/^-{10,}$/.test(lines[i].trim())) {
        separatorCount++;
        if (separatorLines.length < 10) separatorLines.push(i);
      }
    }
    console.log(`Bu aralıkta ayraç sayısı: ${separatorCount}`);
    console.log(`İlk 10 ayraç satırı: ${separatorLines.join(', ')}`);

    // İlk birkaç ayracın etrafını göster
    for (const sLine of separatorLines.slice(0, 3)) {
      console.log(`\n  Ayraç @${sLine} etrafı:`);
      for (let j = sLine - 3; j <= sLine + 5; j++) {
        const mark = j === sLine ? '>>>' : '   ';
        console.log(`  ${mark} [${j}] ${lines[j]?.trim().substring(0, 100)}`);
      }
    }
  }
}

find().catch(console.error);
