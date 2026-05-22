import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

/**
 * PDF'in yapısını analiz et:
 *  - Alimler nasıl sıralanmış (alfabetik mi?)
 *  - Ayırıcı patterns neler?
 *  - Kaynaklar bölümü nasıl yapılandırılmış?
 *  - Başlık formatları
 *  - Sayfa numaraları
 *  - Tekrarlayan bozulmalar var mı?
 */
async function analyze() {
  const pdfPath = path.resolve(__dirname, '../../islam_alimleri.pdf');
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  const text = data.text;
  const lines = text.split('\n').map((l) => l.trimEnd());

  console.log(`Toplam sayfa: ${data.numpages}`);
  console.log(`Toplam satır: ${lines.length}`);
  console.log('');

  // ============ 1. ALIM BAŞLIKLARI: BÜYÜK HARFLE BAŞLAYAN SATIRLAR ============
  const isAllCapsHeader = (s: string): boolean => {
    const t = s.trim();
    if (t.length < 4 || t.length > 120) return false;
    // Parantez içeriğini çıkar
    const noParen = t.replace(/\s*\([^)]*\)\s*/g, '');
    // Sayı içeren satırları atla (referans listesi)
    if (/^\d+[\)\.\s]/.test(noParen)) return false;
    // Sadece sayı/kısa kelime
    if (noParen.length < 4) return false;
    // Büyük harf oranı %85+ olmalı
    const letters = noParen.replace(/[^A-Za-zÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚçğşıöüâîû]/g, '');
    if (letters.length === 0) return false;
    const upperLetters = letters.replace(/[a-zçğşıöüâîû]/g, '');
    return upperLetters.length / letters.length >= 0.85;
  };

  const headers: { lineNum: number; content: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isAllCapsHeader(lines[i])) {
      headers.push({ lineNum: i, content: lines[i].trim() });
    }
  }

  console.log(`=== TESPİT EDİLEN BAŞLIKLAR (büyük harfle): ${headers.length} ===`);
  console.log('İlk 30:');
  headers.slice(0, 30).forEach((h, i) => {
    console.log(`  ${i + 1}. [${h.lineNum}] ${h.content}`);
  });
  console.log('\nSon 10:');
  headers.slice(-10).forEach((h, i) => {
    console.log(`  ${headers.length - 9 + i}. [${h.lineNum}] ${h.content}`);
  });

  // ============ 2. ALFABETİK SIRALAMA KONTROLÜ ============
  console.log('\n=== ALFABETİK SIRA KONTROLÜ ===');
  const sortedCheckRange = headers.slice(50, 100); // ABDULLAH'lardan sonra
  for (let i = 0; i < sortedCheckRange.length - 1; i++) {
    const a = sortedCheckRange[i].content;
    const b = sortedCheckRange[i + 1].content;
    const cmp = a.localeCompare(b, 'tr');
    if (cmp > 0) {
      console.log(`  ⚠️ Sıra bozuk: "${a}" -> "${b}"`);
    }
  }
  console.log('  ✓ Kontrol tamamlandı');

  // ============ 3. KAYNAKLAR BÖLÜMÜ PATTERN'I ============
  console.log('\n=== KAYNAKLAR BÖLÜMÜ ÖRNEKLERİ ===');
  let foundSeparators = 0;
  for (let i = 0; i < lines.length && foundSeparators < 5; i++) {
    if (/^-{10,}$/.test(lines[i].trim())) {
      foundSeparators++;
      console.log(`\n--- Ayraç @line ${i} ---`);
      for (let j = i; j < Math.min(i + 12, lines.length); j++) {
        console.log(`  [${j}] ${lines[j].trim().substring(0, 100)}`);
      }
    }
  }

  // ============ 4. SAYFA NUMARASI / FOOTER PATTERN ============
  console.log('\n=== SAYFA NUMARALARI VE FOOTERS ===');
  let numericLineSample = 0;
  for (let i = 100; i < lines.length && numericLineSample < 15; i++) {
    const t = lines[i].trim();
    if (/^\d{1,5}$/.test(t)) {
      numericLineSample++;
      const before = lines[i - 1]?.trim().substring(0, 60) || '';
      const after = lines[i + 1]?.trim().substring(0, 60) || '';
      console.log(`  [${i}] "${t}" (önce: "${before}" / sonra: "${after}")`);
    }
  }

  // ============ 5. KARAKTER BOZULMASI KONTROLÜ ============
  console.log('\n=== KARAKTER BOZULMA KONTROLÜ ===');
  // "Ş" karakteri nasıl çıkıyor?
  const sampleLines = lines.filter((l) => /Şam|Şâm|şam/i.test(l)).slice(0, 5);
  console.log('Şam/şam içeren örnek satırlar:');
  sampleLines.forEach((l) => console.log(`  "${l.trim().substring(0, 120)}"`));

  const fLines = lines.filter((l) => /\bfam\b/.test(l)).slice(0, 3);
  console.log('Bozulmuş "fam" örnekleri (varsa):');
  if (fLines.length === 0) console.log('  (yok - PDF temiz)');
  else fLines.forEach((l) => console.log(`  "${l.trim().substring(0, 120)}"`));

  // Ö -> Y bozulması var mı?
  const oLines = lines.filter((l) => /Ömrü|Ömer/i.test(l)).slice(0, 3);
  console.log('Ömrü/Ömer örnekleri:');
  oLines.forEach((l) => console.log(`  "${l.trim().substring(0, 120)}"`));

  // ============ 6. ALIMLER ARASI BOŞLUK / AYIRICI ============
  console.log('\n=== İKİ ALIM ARASINDAKİ YAPI ===');
  // SADREDDÎN BEKRÎ örneğindeki gibi 2 başlık bul, aralarını incele
  const sadrIdx = headers.findIndex((h) => /SADREDD.N BEKR/.test(h.content));
  if (sadrIdx >= 0 && sadrIdx + 1 < headers.length) {
    const start = headers[sadrIdx].lineNum;
    const end = headers[sadrIdx + 1].lineNum;
    console.log(`\nSADREDDÎN BEKRÎ → bir sonraki başlık (${end - start} satır):`);
    console.log(`Başlık 1: ${headers[sadrIdx].content}`);
    console.log(`Başlık 2: ${headers[sadrIdx + 1].content}`);
    console.log('\nSon 20 satır (bitişin yapısı):');
    for (let j = Math.max(start, end - 20); j <= end; j++) {
      const marker = j === end ? '>>> ' : '    ';
      console.log(`${marker}[${j}] ${lines[j].trim().substring(0, 110)}`);
    }
  }

  // ============ 7. PARANTEZ İÇİ ALTERNATIVE NAME ÖRNEKLERİ ============
  console.log('\n=== PARANTEZLİ BAŞLIKLAR ===');
  const parenHeaders = headers.filter((h) => /\([^)]+\)/.test(h.content));
  console.log(`Toplam parantezli başlık: ${parenHeaders.length}`);
  parenHeaders.slice(0, 10).forEach((h) => console.log(`  ${h.content}`));

  // ============ 8. TARİH FORMATI ÖRNEKLERİ ============
  console.log('\n=== TARİH FORMATLARI ===');
  const datePattern = /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g;
  let dateCount = 0;
  const dateExamples: string[] = [];
  for (const line of lines) {
    const m = line.match(datePattern);
    if (m) {
      dateCount += m.length;
      if (dateExamples.length < 10) {
        dateExamples.push(line.trim().substring(0, 130));
      }
    }
  }
  console.log(`Toplam "XXX (m. XXXX)" formatlı tarih: ${dateCount}`);
  console.log('Örnekler:');
  dateExamples.forEach((e) => console.log(`  "${e}"`));

  // ============ 9. "EVLİYÂLAR ANSİKLOPEDİSİ" / "İSLAM ÂLİMLERİ ANSİKLOPEDİSİ" SAYISI ============
  console.log('\n=== KAYNAK REFERANSI İSTATİSTİK ===');
  const refPatterns = [
    /Evliyâlar Ansiklopedisi/i,
    /İslâm Âlimleri Ansiklopedisi/i,
    /Tezkiret-ül-huffâz/i,
    /Şezerât-üz-zeheb/i,
  ];
  refPatterns.forEach((p) => {
    const count = lines.filter((l) => p.test(l)).length;
    console.log(`  ${p.source}: ${count} satır`);
  });

  // ============ 10. POTANSİYEL FALSE POSITIVE BAŞLIKLAR ============
  console.log('\n=== ŞÜPHELİ BAŞLIKLAR (TEK KELİME / KISA) ===');
  const suspect = headers.filter((h) => {
    const words = h.content.replace(/\([^)]+\)/, '').trim().split(/\s+/);
    return words.length === 1;
  });
  console.log(`Tek kelimelik başlık: ${suspect.length}`);
  suspect.slice(0, 20).forEach((h) => console.log(`  [${h.lineNum}] ${h.content}`));

  // Çok kısa başlıklar (≤4 karakter)
  const tooShort = headers.filter((h) => h.content.trim().length <= 6);
  console.log(`\nÇok kısa başlık (≤6 char): ${tooShort.length}`);
  tooShort.slice(0, 10).forEach((h) => console.log(`  [${h.lineNum}] "${h.content}"`));
}

analyze().catch(console.error);
