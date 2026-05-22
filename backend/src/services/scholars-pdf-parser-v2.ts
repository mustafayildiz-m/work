import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

/**
 * V2 Parser Stratejisi
 * -------------------------------------------------------------------
 * PDF "İslâm Âlimleri ve Evliyâlar Biyografisi" için özel parser.
 *
 * Yapısal varsayımlar (analyze-pdf-structure.ts çıktısına göre):
 *  1. Her âlim TEK BÜYÜK HARFLİ satırla başlar
 *     örn: "SADREDDÎN BEKRÎ (Hasen bin Muhammed)"
 *  2. Biyografi metin satırları takip eder.
 *  3. Biyografi sonunda ayraç çizgisi: "------------------------------"
 *  4. Ayraçtan sonra numaralı kaynak listesi gelir:
 *       "1) Tezkiret-ül-huffâz, IV, 1444;"
 *       "2) Tabakât-ül-huffâz, 503;"
 *       ...
 *  5. Sayfa numaraları tek başına satırdadır (örn. "9697").
 *  6. PDF içinde tarih formatı: "574 (m. 1178)" — ilki hicri, ikincisi miladi.
 *
 * Tek alim bloğunun anatomi şablonu:
 *   [HEADER]
 *   [BIO LINES...]
 *   ------------------------------
 *   [SOURCE LINES (numbered)]
 *   <boş>
 *   [SONRAKİ HEADER]
 */

export interface ScholarDataV2 {
  fullName: string; // PARANTEZ DAHİL ham başlık (kullanıcı kararı 1.c)
  biography: string; // Temizlenmiş biyografi + kaynaklar
  birthDateHijri?: string;
  birthDate?: string; // miladi
  deathDateHijri?: string;
  deathDate?: string; // miladi
  sources?: string[]; // İsteğe bağlı: debug için ayrı tutulur (DB'ye yazılmaz)
  rawHeaderLineNum: number;
}

export interface ParseResult {
  scholars: ScholarDataV2[];
  stats: {
    totalHeaders: number;
    accepted: number;
    rejected: number;
    rejectedReasons: Record<string, number>;
  };
}

// =============================================================================
// 1. BAŞLIK TESPİTİ
// =============================================================================

/**
 * Bir satırın âlim başlığı olup olmadığını belirler.
 * KRİTERLER:
 *  - 4-120 karakter arası
 *  - Parantez içeriği çıkarıldıktan sonra %85+ büyük harf
 *  - Başında numara (1), 2., vs) olmamalı (referans listesi)
 *  - Sadece sayı olmamalı (sayfa numarası)
 *  - Bilinen bölüm başlıkları (EVLİYÂLAR, SONSÖZ, İÇİNDEKİLER) atlanır
 */
const SECTION_HEADER_BLACKLIST = new Set([
  'EVLİYÂLAR',
  'SONSÖZ',
  'İÇİNDEKİLER',
  'KAYNAKÇA',
  'KAYNAKLAR',
  'BÖLÜM',
  'GİRİŞ',
  'ÖZET',
  'SONUÇ',
  'DİZİN',
]);

function isScholarHeader(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.length < 4 || trimmed.length > 120) return false;

  if (SECTION_HEADER_BLACKLIST.has(trimmed)) return false;

  // Sadece sayı (sayfa numarası)
  if (/^\d+$/.test(trimmed)) return false;

  // Sayı + ) ile başlıyorsa referans listesi
  if (/^\d+[\)\.]/.test(trimmed)) return false;

  // Tire/ayraç satırı
  if (/^[-–=_\s]+$/.test(trimmed)) return false;

  // "1399/1979, II, 670;" gibi kaynak referansı patternları
  // Eğer satırın çoğunluğu sayı/noktalama/virgülse → reject
  const digitsAndPunct = (
    trimmed.match(/[\d.,;:/\-–()]/g) || []
  ).length;
  if (digitsAndPunct >= trimmed.length * 0.4) return false;

  // Parantez içeriğini çıkar, sonra büyük harf oranını kontrol et
  const noParen = trimmed.replace(/\s*\([^)]*\)\s*/g, '').trim();

  if (noParen.length < 3) return false;

  // Sadece harfleri al
  const letters = noParen.replace(
    /[^A-Za-zÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚçğşıöüâîû]/g,
    '',
  );
  // En az 5 harf olmalı (kısa sahte başlıkları filtrele: "II", "VI" gibi)
  if (letters.length < 5) return false;

  // Küçük harf var mı? Türkçe küçük harfler dahil
  const lowerLetters = letters.replace(
    /[A-ZÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚ]/g,
    '',
  );

  // %85+ büyük harf olmalı
  const upperRatio = 1 - lowerLetters.length / letters.length;
  return upperRatio >= 0.85;
}

// =============================================================================
// 2. KAYNAK SATIRI TESPİTİ
// =============================================================================

/**
 * Bir satırın numaralı kaynak satırı olup olmadığını kontrol eder.
 *   "1) Tezkiret-ül-huffâz, IV, 1444;"
 *   "2) Tabakât-ül-huffâz, 503;"
 *   ") İslâm Âlimleri Ansiklopedisi, IX, 246-247." (bazen numara eksik)
 *
 * NOT: Sadece 1-2 basamaklı numaralarda kabul edilir, böylece "1258)" gibi
 * metin içindeki tarih parçaları kaynak satırı olarak yanlış algılanmaz.
 */
function isSourceLine(line: string): boolean {
  const t = line.trim();
  // "N) ..." formatı (N: 1-2 basamaklı) veya numarasız ") ..." formatı
  return /^(\d{1,2}\s*)?\)\s+\S/.test(t);
}

// =============================================================================
// 3. AYRAÇ TESPİTİ (---------- gibi)
// =============================================================================

function isSeparatorLine(line: string): boolean {
  const t = line.trim();
  return /^-{10,}$/.test(t) || /^_{10,}$/.test(t) || /^={10,}$/.test(t);
}

// =============================================================================
// 4. ATILACAK SATIR (sayfa numarası vs)
// =============================================================================

function isJunkLine(line: string): boolean {
  const t = line.trim();
  if (t === '') return true;
  // Tek başına 1-5 basamaklı sayı = sayfa numarası
  if (/^\d{1,5}$/.test(t)) return true;
  // "-- 123 of 12061 --" formatı
  if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(t)) return true;
  return false;
}

// =============================================================================
// 5. METİN NORMALİZASYONU
// =============================================================================

/**
 * Çoklu boşlukları tek boşluğa indirir.
 * Satır sonu kesintilerini düzeltir: "ön-\nce" -> "önce"
 * (PDF'de bazen kelimeler tire ile bölünür)
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ') // çoklu whitespace tek boşluk
    .trim();
}

/**
 * Satır satır gelen biyografi parçalarını paragrafa dönüştürür.
 * Aynı paragraftaki satırları birleştirir, gereksiz tire ile bölünmeleri onarır.
 */
function joinBiographyLines(lines: string[]): string {
  const cleaned = lines
    .filter((l) => !isJunkLine(l))
    .map((l) => l.trim());

  // Satır sonu tire ile bölünmüş kelimeleri birleştir
  // "ön-" + "ce" -> "önce"  (sadece harf ile biten tire'lar)
  const merged: string[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const current = cleaned[i];
    const next = cleaned[i + 1] ?? '';
    if (
      current.endsWith('-') &&
      /[a-zA-ZçğşıöüâîûÇĞŞİÖÜÂÎÛ]$/.test(current.slice(-2, -1)) &&
      next.length > 0 &&
      /^[a-zA-ZçğşıöüâîûÇĞŞİÖÜÂÎÛ]/.test(next)
    ) {
      merged.push(current.slice(0, -1) + next);
      i++;
    } else {
      merged.push(current);
    }
  }

  return normalizeWhitespace(merged.join(' '));
}

// =============================================================================
// 6. TARİH ÇIKARMA
// =============================================================================

/**
 * Biyografiden doğum ve vefat tarihlerini çıkarır.
 * Format: "XXX (m. XXXX)"
 *
 * STRATEJİ:
 *  - "doğdu" kelimesi yakınındaki tarih → birthDate
 *  - "vefât etti" kelimesi yakınındaki tarih → deathDate
 *  - Bulunamazsa: İlk tarih → doğum, İkinci tarih → vefat
 */
function extractDates(biography: string): {
  birthDate?: string;
  birthDateHijri?: string;
  deathDate?: string;
  deathDateHijri?: string;
} {
  const result: {
    birthDate?: string;
    birthDateHijri?: string;
    deathDate?: string;
    deathDateHijri?: string;
  } = {};

  // Tüm "XXX (m. XXXX)" eşleşmelerini al, pozisyonlarıyla birlikte
  const datePattern = /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g;
  const matches: { hijri: string; miladi: string; index: number }[] = [];
  let m;
  while ((m = datePattern.exec(biography)) !== null) {
    matches.push({ hijri: m[1], miladi: m[2], index: m.index });
  }

  if (matches.length === 0) {
    // Alternatif: standalone "(m. XXXX)" veya 4 basamaklı yıl arama yapılabilir
    return result;
  }

  // Kelime tabanlı eşleştirme: "doğdu" ve "vefât" yakınındaki tarihi tespit et
  const birthKeywords = /\b(doğ(du|umu)?|doğdu|doğumu)/i;
  const deathKeywords = /\b(vefât|vefat|öldü|ölüm)/i;

  let birthMatch: typeof matches[0] | undefined;
  let deathMatch: typeof matches[0] | undefined;

  // Her tarih için ±150 karakter pencere içinde anahtar kelime ara
  for (const match of matches) {
    const windowStart = Math.max(0, match.index - 150);
    const windowEnd = Math.min(
      biography.length,
      match.index + match.hijri.length + 30,
    );
    const window = biography.slice(windowStart, windowEnd);

    if (!birthMatch && birthKeywords.test(window)) {
      birthMatch = match;
    }
    if (!deathMatch && deathKeywords.test(window)) {
      deathMatch = match;
    }
  }

  // Eğer kelime ile bulunamadıysa: ilk tarih = doğum, ikinci = vefat
  if (!birthMatch && !deathMatch) {
    if (matches.length >= 2) {
      birthMatch = matches[0];
      deathMatch = matches[1];
    } else {
      // Tek tarih varsa vefat olarak kabul et (PDF konvansiyonu)
      deathMatch = matches[0];
    }
  } else if (!birthMatch && matches.length >= 2 && deathMatch === matches[1]) {
    // İlki anahtar kelimesizdi ama mantıken doğum
    birthMatch = matches[0];
  } else if (!deathMatch && matches.length >= 2 && birthMatch === matches[0]) {
    deathMatch = matches[1];
  }

  if (birthMatch) {
    result.birthDateHijri = birthMatch.hijri;
    result.birthDate = birthMatch.miladi;
  }
  if (deathMatch) {
    result.deathDateHijri = deathMatch.hijri;
    result.deathDate = deathMatch.miladi;
  }

  return result;
}

// =============================================================================
// 7. KAYNAK LİSTESİNİ FORMATLA
// =============================================================================

/**
 * Toplanan ham kaynak satırlarını birleştirip biyografi sonuna eklenecek
 * temiz formata dönüştürür.
 */
function formatSources(rawSourceLines: string[]): string[] {
  const sources: string[] = [];
  let current = '';

  for (const rawLine of rawSourceLines) {
    const t = rawLine.trim();
    if (isJunkLine(t)) continue;

    // Yeni kaynak başlangıcı: "1)", "2)", ")" vs.
    if (/^(\d+\s*)?\)\s+\S/.test(t)) {
      if (current) sources.push(normalizeWhitespace(current));
      current = t;
    } else {
      // Önceki kaynağın devamı
      current += ' ' + t;
    }
  }
  if (current) sources.push(normalizeWhitespace(current));

  return sources;
}

// =============================================================================
// 8. ANA PARSER
// =============================================================================

export async function parseScholarsPDF(
  pdfPath: string,
): Promise<ParseResult> {
  const dataBuffer = await fs.promises.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  const lines = data.text.split('\n');

  // -----------------------------------------------------------------
  // YENİ STRATEJİ: Ayraç tabanlı segmentasyon
  // -----------------------------------------------------------------
  // 1. Tüm "------" ayraçlarının indeksleri bulunur.
  // 2. Her ayraç bir alimin biyografisinin BİTİŞ noktasıdır.
  // 3. Ayraçtan SONRAKİ ilk büyük harfli satır = bir sonraki alimin başlığı.
  // 4. Bu yöntem, biyografi içindeki sahte başlıkları (ünlem, şiir başlığı,
  //    "HİKMET", "ÂH YAZIK!" gibi) elimine eder.

  const separatorIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isSeparatorLine(lines[i])) {
      separatorIndices.push(i);
    }
  }

  // Önce ilk başlığı bul (dosya başından ilk ayraca kadar olan blokta)
  const headerIndices: number[] = [];
  const firstSeparator = separatorIndices[0] ?? lines.length;
  for (let i = 0; i < firstSeparator; i++) {
    if (isScholarHeader(lines[i])) {
      headerIndices.push(i);
      break;
    }
  }

  // Her ayraçtan sonra: kaynak satırları + sonraki başlık aranır
  // Sonraki başlık = ayraç + kaynaklar bittikten sonraki ilk büyük harfli satır
  for (let s = 0; s < separatorIndices.length; s++) {
    const sepLine = separatorIndices[s];
    const nextSepLine =
      s + 1 < separatorIndices.length
        ? separatorIndices[s + 1]
        : lines.length;

    // Bu blokta (ayraçtan sonraki ayraca kadar) ilk geçerli başlığı bul
    for (let j = sepLine + 1; j < nextSepLine; j++) {
      if (isScholarHeader(lines[j])) {
        headerIndices.push(j);
        break;
      }
    }
  }

  const scholars: ScholarDataV2[] = [];
  const rejectedReasons: Record<string, number> = {};
  const reject = (reason: string) => {
    rejectedReasons[reason] = (rejectedReasons[reason] || 0) + 1;
  };

  // Her başlık için: başlıktan sonraki ilk ayraca kadar = biyografi
  //                  ayraçtan sonraki ilk başlığa kadar = kaynaklar
  for (let h = 0; h < headerIndices.length; h++) {
    const headerLine = headerIndices[h];
    const nextHeaderLine =
      h + 1 < headerIndices.length ? headerIndices[h + 1] : lines.length;

    const header = lines[headerLine].trim();

    // Bu blok içinde ilk ayracı bul
    const ownSeparatorIdx = separatorIndices.find(
      (sIdx) => sIdx > headerLine && sIdx < nextHeaderLine,
    );

    const bioEnd = ownSeparatorIdx ?? nextHeaderLine;
    const bioLines: string[] = [];
    for (let j = headerLine + 1; j < bioEnd; j++) {
      const raw = lines[j];
      if (isJunkLine(raw)) continue;
      bioLines.push(raw);
    }

    const sourceLines: string[] = [];
    if (ownSeparatorIdx !== undefined) {
      for (let j = ownSeparatorIdx + 1; j < nextHeaderLine; j++) {
        const raw = lines[j];
        if (isJunkLine(raw)) continue;
        if (isSeparatorLine(raw)) continue;
        sourceLines.push(raw);
      }
    }

    if (bioLines.length < 2) {
      reject('biography_too_short');
      continue;
    }

    const biographyText = joinBiographyLines(bioLines);
    if (biographyText.length < 50) {
      reject('biography_under_50_chars');
      continue;
    }

    const sources = formatSources(sourceLines);
    const dates = extractDates(biographyText);

    // Final biyografi: temiz bio + (varsa) kaynaklar
    let finalBio = biographyText;
    if (sources.length > 0) {
      finalBio += '\n\nKaynaklar:\n' + sources.join('\n');
    }

    scholars.push({
      fullName: header,
      biography: finalBio,
      ...dates,
      sources,
      rawHeaderLineNum: headerLine,
    });
  }

  return {
    scholars,
    stats: {
      totalHeaders: headerIndices.length,
      accepted: scholars.length,
      rejected: headerIndices.length - scholars.length,
      rejectedReasons,
    },
  };
}

// =============================================================================
// 9. CLI ENTRY POINT (script olarak da çalıştırılabilir)
// =============================================================================

if (require.main === module) {
  (async () => {
    const pdfPath =
      process.argv[2] ||
      path.resolve(__dirname, '../../../islam_alimleri.pdf');
    const outPath =
      process.argv[3] || path.resolve(__dirname, '../data/scholars-v2.json');

    console.log(`PDF: ${pdfPath}`);
    console.log(`OUT: ${outPath}`);

    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const result = await parseScholarsPDF(pdfPath);

    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          metadata: {
            sourceFile: path.basename(pdfPath),
            processedAt: new Date().toISOString(),
            stats: result.stats,
          },
          scholars: result.scholars,
        },
        null,
        2,
      ),
      'utf8',
    );

    console.log(`\n✅ Sonuç:`);
    console.log(`   Toplam tespit edilen başlık: ${result.stats.totalHeaders}`);
    console.log(`   Kabul edilen alim: ${result.stats.accepted}`);
    console.log(`   Reddedilen: ${result.stats.rejected}`);
    console.log(`   Red sebepleri:`, result.stats.rejectedReasons);
    console.log(`\n📁 JSON kaydedildi: ${outPath}`);
  })().catch(console.error);
}
