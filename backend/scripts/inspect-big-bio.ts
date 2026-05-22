import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

/**
 * Büyük biyografili alimleri inceleyip ne oluyor anlayalım.
 * Özellikle Mevlana Celaleddin'in başlığı + sonraki birkaç başlığı bul.
 */
async function inspect() {
  const pdfPath = path.resolve(__dirname, '../../islam_alimleri.pdf');
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  const lines = data.text.split('\n');

  // MEVLÂNÂ başlığını bul
  let mevlanaIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^MEVLÂNÂ\s+CELÂLEDD/.test(lines[i].trim())) {
      mevlanaIdx = i;
      break;
    }
  }

  console.log(`MEVLÂNÂ başlığı: satır ${mevlanaIdx}`);
  console.log(`İçerik: ${lines[mevlanaIdx]?.trim()}`);

  if (mevlanaIdx < 0) return;

  // MEVLÂNÂ'dan sonra ilk 30 büyük harfli (potansiyel başlık) satır
  const candidates: { line: number; content: string }[] = [];
  for (let i = mevlanaIdx + 1; i < lines.length && candidates.length < 30; i++) {
    const t = lines[i].trim();
    if (t.length < 3) continue;

    // %85+ büyük harf testi
    const noParen = t.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const letters = noParen.replace(
      /[^A-Za-zÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚçğşıöüâîû]/g,
      '',
    );
    if (letters.length < 3) continue;
    const lowerLetters = letters.replace(
      /[A-ZÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚ]/g,
      '',
    );
    const upperRatio = 1 - lowerLetters.length / letters.length;

    if (upperRatio >= 0.85 && !/^\d/.test(t)) {
      candidates.push({ line: i, content: t });
    }
  }

  console.log(`\nMEVLÂNÂ sonrası tespit edilen büyük harfli satırlar:`);
  candidates.forEach((c) => {
    console.log(`  [${c.line}] (delta: ${c.line - mevlanaIdx}) ${c.content.substring(0, 100)}`);
  });

  // Ahmed Yesevî için aynı
  console.log('\n\n========== AHMED YESEVÎ ==========');
  let yeseviIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^AHMED\s+YESEV/.test(lines[i].trim())) {
      yeseviIdx = i;
      break;
    }
  }
  console.log(`AHMED YESEVÎ: satır ${yeseviIdx}`);

  if (yeseviIdx > 0) {
    const yeseviCandidates: { line: number; content: string }[] = [];
    for (
      let i = yeseviIdx + 1;
      i < lines.length && yeseviCandidates.length < 10;
      i++
    ) {
      const t = lines[i].trim();
      if (t.length < 3) continue;
      const noParen = t.replace(/\s*\([^)]*\)\s*/g, '').trim();
      const letters = noParen.replace(
        /[^A-Za-zÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚçğşıöüâîû]/g,
        '',
      );
      if (letters.length < 3) continue;
      const lowerLetters = letters.replace(
        /[A-ZÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚ]/g,
        '',
      );
      const upperRatio = 1 - lowerLetters.length / letters.length;

      if (upperRatio >= 0.85 && !/^\d/.test(t)) {
        yeseviCandidates.push({ line: i, content: t });
      }
    }

    console.log('\nAHMED YESEVÎ sonrası büyük harfli satırlar:');
    yeseviCandidates.forEach((c) => {
      console.log(
        `  [${c.line}] (delta: ${c.line - yeseviIdx}) ${c.content.substring(0, 100)}`,
      );
    });
  }
}

inspect().catch(console.error);
