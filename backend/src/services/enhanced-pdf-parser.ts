import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

export interface ParserConfig {
  minNameLength: number;
  maxNameLength: number;
  minWordCount: number;
  maxWordCount: number;
  datePatterns: RegExp[];
  lineageKeywords: string[];
  excludePatterns: RegExp[];
  alternativeNameSupport: boolean;
  confidenceThreshold: number;
}

export interface ScholarData {
  fullName: string;
  alternativeName?: string; // Parantez içindeki isim
  lineage?: string;
  birthDate?: string;
  deathDate?: string;
  birthDateHijri?: string; // Hicri tarih
  deathDateHijri?: string; // Hicri tarih
  biography: string;
  photoUrl?: string;
  coverImage?: string;
  locationName?: string;
  locationDescription?: string;
  confidence?: number;
  rawLine?: string; // Debug için orijinal satır
}

export class PDFSpecificScholarParser {
  private config: ParserConfig;
  private compiledPatterns: {
    scholarName: RegExp;
    dateExtraction: RegExp[];
    lineageKeywords: RegExp;
    alternativeName: RegExp;
    knownScholarPatterns: RegExp[];
  };

  constructor(
    private pdfPath: string,
    private outputPath: string,
    config?: Partial<ParserConfig>,
  ) {
    // PDF formatınıza özel configuration
    this.config = {
      minNameLength: 3,
      maxNameLength: 120,
      minWordCount: 2,
      maxWordCount: 10,
      datePatterns: [
        // PDF'inizdeki özel format: 243 (m. 857)
        /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g,
        // Standart format: 699-767
        /(\d{2,4})\s*[-–]\s*(\d{2,4})/g,
        // Tek tarih formatları
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
        /^\d+$/, // Sadece sayfa numarası
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SAYFA[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*İÇİNDEKİLER[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KAYNAKLAR[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*BÖLÜM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*FASIL[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KISIM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*ÖZET[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*GİRİŞ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SONUÇ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[-–=_\s]+$/, // Ayırıcı çizgiler
        /^\([^)]*\)$/, // Sadece parantez içeriği
        /^İÇİNDEKİLER$/, // Exact match for table of contents
        /^KAYNAKÇA$/, // Bibliography
        /^DİZİN$/, // Index
      ],
      alternativeNameSupport: true,
      confidenceThreshold: 40,
      ...config,
    };

    this.compilePatterns();
  }

  private compilePatterns(): void {
    this.compiledPatterns = {
      // PDF formatınız için optimize edilmiş regex - BÜTÜN Türkçe/Arabic karakterleri dahil
      scholarName:
        /^[A-ZÇĞİÖŞÜÂÎÛÀÁÈÉÌÍÒÓÙÚÄÖÜıçğşâîû\s\-\.\']{3,120}(?:\s*\([^)]+\))?$/,

      dateExtraction: this.config.datePatterns,
      lineageKeywords: new RegExp(
        `(${this.config.lineageKeywords.join('|')})`,
        'i',
      ),

      // Parantez içindeki alternative name için: HETTÂR (Îsâ bin İkbâl)
      alternativeName: /^(.+?)\s*\((.+?)\)$/,

      // PDF'nizden çıkardığımız bilinen âlim patterns
      knownScholarPatterns: [
        // Başlangıç title'ları
        /^(İMAM|EBU|EBÛ|İBN|HZ\.|HAZRET|ŞEYH|MEVLANA|SULTAN|HÂCE|KADI|MÜFTÜ|EMİR)/i,

        // Yaygın İslami isimler
        /^(ABDULLAH|AHMED|ALİ|HASAN|HÜSEYİN|ÖMER|OSMAN|MUHAMMED|YUSUF|İBRAHİM|İSMAİL|MUSA|İSA|DAVUD|SÜLEYMAN|YAKUP|İSHAK)/i,

        // Abdurrahman vs benzeri uzun isimler
        /^(ABDURRAHMAN|ABDULKADİR|ABDULAZİZ|ABDULHAMİT|ABDULMELİK|ABDULVAHID|ABDULLATIF)/i,

        // Bağlayıcı kelimeler içeren
        /(BİN|İBN|EBU|EBÛ|EL\-|ED\-|EN\-|ER\-|ES\-|ET\-|EZ\-|HÂFIZ|İMÂM)/i,

        // PDF'nizden özel patterns (örneklerden çıkardım)
        /\b(SERÎ|HETTÂR|HEVÂRÎ|BİRGİVİ|HADİMİ|KOTKU|TOPBAŞ|KONUK|YAZIR)\b/i,

        // Türkçe karakterler içeren (âlim isimlerinde çok yaygın)
        /[ÂÎÛÇĞŞİÖÜ]/,

        // Meşhur âlimler
        /(GAZALİ|BUHARİ|MÜSLİM|TİRMİZİ|NESAİ|EBU\s*DAVUD|İBN\s*MACE|AHMED\s*BİN\s*HANBEL)$/i,
      ],
    };
  }

  async parsePDF(): Promise<string> {
    try {
      const dataBuffer = await fs.promises.readFile(this.pdfPath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF okuma hatası:', error);
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  private extractAlternativeName(fullName: string): {
    mainName: string;
    altName?: string;
  } {
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

  private hasKnownScholarPatterns(name: string): boolean {
    return this.compiledPatterns.knownScholarPatterns.some((pattern) =>
      pattern.test(name),
    );
  }

  private isValidScholarName(name: string): boolean {
    const trimmed = name.trim();

    // Exclude patterns check
    if (this.config.excludePatterns.some((pattern) => pattern.test(trimmed))) {
      return false;
    }

    // Ana format validation - PDF'nizde tüm karakterler büyük harf
    if (!this.compiledPatterns.scholarName.test(trimmed)) {
      return false;
    }

    // Parantezi çıkararak word count check
    const mainName = trimmed.replace(/\s*\([^)]+\)/, '');
    const words = mainName.split(/\s+/).filter(Boolean);

    if (
      words.length < this.config.minWordCount ||
      words.length > this.config.maxWordCount
    ) {
      return false;
    }

    // Known pattern check
    return this.hasKnownScholarPatterns(trimmed);
  }

  private extractDatesFromBiography(biography: string): {
    birthDate?: string;
    deathDate?: string;
    birthDateHijri?: string;
    deathDateHijri?: string;
  } {
    const result: any = {};

    // PDF'nizin özel formatı: 243 (m. 857)
    const hijriMiladiPattern = /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g;
    const hijriMiladiMatch = biography.match(hijriMiladiPattern);

    if (hijriMiladiMatch) {
      const match = hijriMiladiMatch[0].match(
        /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/,
      );
      if (match) {
        // Vefat tarihi olarak kabul ediyoruz (çünkü örnekte öyle)
        result.deathDateHijri = match[1];
        result.deathDate = match[2];
      }
    }

    // Diğer tarih formatları
    for (const pattern of this.compiledPatterns.dateExtraction) {
      if (pattern === hijriMiladiPattern) continue; // Zaten işledik

      const match = biography.match(pattern);
      if (match && match.length >= 2) {
        if (pattern.source.includes('doğum')) {
          result.birthDate = match[1];
        } else if (
          pattern.source.includes('vefât') ||
          pattern.source.includes('ölüm')
        ) {
          result.deathDate = match[1];
        } else if (match.length >= 3) {
          // İki tarihli format: 699-767
          result.birthDate = match[1];
          result.deathDate = match[2];
        }
        break; // İlk match yeterli
      }
    }

    return result;
  }

  private extractLineage(
    biography: string,
    scholarName: string,
  ): string | undefined {
    const lines = biography.split('\n').slice(0, 3); // İlk 3 satır

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Künyesi, Adı gibi açık belirtmeler
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

      // İmplicit soy bilgisi (bin, ibn vs ile başlayan)
      if (this.compiledPatterns.lineageKeywords.test(trimmedLine)) {
        // Eğer satır scholar name'i içermiyorsa, lineage olabilir
        if (!trimmedLine.toUpperCase().includes(scholarName.toUpperCase())) {
          return trimmedLine;
        }
      }
    }

    return undefined;
  }

  private calculateConfidence(
    name: string,
    biography: string,
    hasAlternativeName: boolean,
    hasDateInfo: boolean,
  ): number {
    let confidence = 0;

    // İsim kalitesi (0-50 puan)
    if (this.hasKnownScholarPatterns(name)) {
      confidence += 50;
    } else if (this.compiledPatterns.scholarName.test(name)) {
      confidence += 30;
    }

    // Alternative name bonus (parantez içi) (0-10 puan)
    if (hasAlternativeName) confidence += 10;

    // Biyografi kalitesi (0-25 puan)
    if (biography.length > 300) confidence += 25;
    else if (biography.length > 150) confidence += 20;
    else if (biography.length > 50) confidence += 10;

    // Tarih bilgisi (0-10 puan)
    if (hasDateInfo) confidence += 10;

    // İslami/Akademik terimler (0-5 puan)
    const islamicTerms =
      /(hadîs|hadis|fıkıh|fiqh|tasavvuf|âlim|alim|imam|hoca|medrese|ilim|rivâyet|rivayet|sika|fakih|muhaddis|mufessir)/i;
    if (islamicTerms.test(biography)) confidence += 5;

    return Math.min(confidence, 100); // Max 100
  }

  extractScholars(text: string): ScholarData[] {
    const scholars: ScholarData[] = [];
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentScholar: Partial<ScholarData> = {};
    let biographyLines: string[] = [];
    let processingBiography = false;

    console.log(`🔍 Toplam ${lines.length} satır işleniyor...`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Scholar name detection
      if (this.isValidScholarName(line)) {
        console.log(`✅ Âlim tespit edildi: "${line}"`);

        // Save previous scholar
        if (currentScholar.fullName && biographyLines.length > 0) {
          const biography = biographyLines.join(' ').trim();
          const dates = this.extractDatesFromBiography(biography);
          const lineage = this.extractLineage(
            biography,
            currentScholar.fullName,
          );
          const hasAltName = !!currentScholar.alternativeName;
          const hasDateInfo = !!(
            dates.birthDate ||
            dates.deathDate ||
            dates.birthDateHijri ||
            dates.deathDateHijri
          );
          const confidence = this.calculateConfidence(
            currentScholar.fullName,
            biography,
            hasAltName,
            hasDateInfo,
          );

          // Confidence threshold check
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
            } as ScholarData);

            console.log(`  💾 Kaydedildi (Güvenilirlik: ${confidence}%)`);
          } else {
            console.log(`  ❌ Düşük güvenilirlik (${confidence}%), atlandı`);
          }
        }

        // Start new scholar
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

      // Collect biography lines
      if (processingBiography) {
        // Skip very short lines and obvious separators
        if (
          line.length > 15 &&
          !line.match(/^[-–=_\s]+$/) &&
          !line.match(/^\d+$/)
        ) {
          biographyLines.push(line);
        }

        // Stop if we hit another potential scholar name or clear section break
        if (
          line.match(/^[-–=_]{5,}/) ||
          (line.length > 50 &&
            line === line.toUpperCase() &&
            this.hasKnownScholarPatterns(line))
        ) {
          processingBiography = false;
        }
      }
    }

    // Save last scholar
    if (currentScholar.fullName && biographyLines.length > 0) {
      const biography = biographyLines.join(' ').trim();
      const dates = this.extractDatesFromBiography(biography);
      const lineage = this.extractLineage(biography, currentScholar.fullName);
      const hasAltName = !!currentScholar.alternativeName;
      const hasDateInfo = !!(
        dates.birthDate ||
        dates.deathDate ||
        dates.birthDateHijri ||
        dates.deathDateHijri
      );
      const confidence = this.calculateConfidence(
        currentScholar.fullName,
        biography,
        hasAltName,
        hasDateInfo,
      );

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
        } as ScholarData);
      }
    }

    // Sort by confidence score
    return scholars.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }

  async saveToFile(scholars: ScholarData[]): Promise<void> {
    const output = {
      metadata: {
        totalCount: scholars.length,
        highConfidence: scholars.filter((s) => (s.confidence || 0) >= 80)
          .length,
        mediumConfidence: scholars.filter(
          (s) => (s.confidence || 0) >= 60 && (s.confidence || 0) < 80,
        ).length,
        lowConfidence: scholars.filter(
          (s) => (s.confidence || 0) >= 40 && (s.confidence || 0) < 60,
        ).length,
        processedAt: new Date().toISOString(),
        sourceFile: path.basename(this.pdfPath),
        parserConfig: this.config,
      },
      scholars: scholars,
    };

    await fs.promises.writeFile(
      this.outputPath,
      JSON.stringify(output, null, 2),
      'utf8',
    );

    console.log(
      `\n✅ ${scholars.length} âlim verisi ${this.outputPath} dosyasına kaydedildi.`,
    );
    console.log(`📊 Güvenilirlik Dağılımı:`);
    console.log(`   🟢 Yüksek (%80+): ${output.metadata.highConfidence} âlim`);
    console.log(
      `   🟡 Orta (%60-79): ${output.metadata.mediumConfidence} âlim`,
    );
    console.log(`   🔴 Düşük (%40-59): ${output.metadata.lowConfidence} âlim`);
  }

  async process(): Promise<ScholarData[]> {
    console.log('📄 PDF dosyası okunuyor...');
    const text = await this.parsePDF();

    console.log('🔍 Âlimler çıkarılıyor...');
    const scholars = this.extractScholars(text);

    console.log('💾 Veriler dosyaya kaydediliyor...');
    await this.saveToFile(scholars);

    return scholars;
  }

  // Test specific examples
  testWithYourExamples(): void {
    const examples = [
      'HENNÂD BİN SERÎ',
      'HETTÂR (Îsâ bin İkbâl)',
      'HEVÂRÎ (Ebû Abdullah)',
      'İMAM EBU HANİFE',
      'SAYFA 123', // Should be false
      'İÇİNDEKİLER', // Should be false
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

      console.log(
        `   🏆 Final Result: ${isValid ? '✅ DETECTED' : '❌ REJECTED'}`,
      );
    });

    // Test date extraction
    const testBio = "243 (m. 857) senesinin Rebî'ul-evvel ayında vefât etti.";
    console.log(`\n📅 Tarih Extraction Test:`);
    console.log(`Text: "${testBio}"`);
    const dates = this.extractDatesFromBiography(testBio);
    console.log(`Result:`, dates);
  }

  // Utility method for batch processing
  static async processMultiplePDFs(
    pdfPaths: string[],
    outputDir: string,
    config?: Partial<ParserConfig>,
  ): Promise<ScholarData[]> {
    const allScholars: ScholarData[] = [];

    for (const pdfPath of pdfPaths) {
      const outputPath = path.join(
        outputDir,
        `${path.basename(pdfPath, '.pdf')}-scholars.json`,
      );
      const parser = new PDFSpecificScholarParser(pdfPath, outputPath, config);

      try {
        const scholars = await parser.process();
        allScholars.push(...scholars);
      } catch (error) {
        console.error(`Error processing ${pdfPath}:`, error);
      }
    }

    return allScholars;
  }
}

// Test function
export async function testPDFParser() {
  const pdfPath = path.join(
    __dirname,
    '../uploads/0001.İslâm Âlimleri ve Evliyâlar Biyogrofisi_2023.pdf',
  );
  const outputPath = path.join(__dirname, '../data/scholars-pdf-specific.json');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const parser = new PDFSpecificScholarParser(pdfPath, outputPath);

  // First, test with your examples
  parser.testWithYourExamples();

  try {
    const scholars = await parser.process();

    console.log(`\n🎉 BAŞARILI! ${scholars.length} âlim tespit edildi.`);

    // Show top 5 scholars
    console.log('\n📋 En Yüksek Güvenilirlikli 5 Âlim:');
    scholars.slice(0, 5).forEach((scholar, index) => {
      console.log(
        `\n${index + 1}. 🎯 ${scholar.confidence}% - ${scholar.fullName}`,
      );
      if (scholar.alternativeName) {
        console.log(`   🔄 Alt İsim: ${scholar.alternativeName}`);
      }
      if (scholar.birthDateHijri || scholar.deathDateHijri) {
        console.log(
          `   📅 Hicri: ${scholar.birthDateHijri || '?'} - ${scholar.deathDateHijri || '?'}`,
        );
      }
      if (scholar.birthDate || scholar.deathDate) {
        console.log(
          `   📅 Miladi: ${scholar.birthDate || '?'} - ${scholar.deathDate || '?'}`,
        );
      }
      if (scholar.lineage) {
        console.log(`   👥 Soy: ${scholar.lineage.substring(0, 80)}...`);
      }
      console.log(`   📝 Biyografi: ${scholar.biography.substring(0, 100)}...`);
    });

    return scholars;
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}
