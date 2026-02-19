import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

/**
 * PDF sayfalarından OCR ile metin çıkaran servis.
 *
 * Pipeline:
 *  PDF sayfa → pdfjs canvas render (4x) → PNG buffer
 *    → sharp (gri ton + normalize + sharpen + threshold) → temiz PNG
 *    → Tesseract.js OCR (ara dili, LSTM, PSM 3)
 *    → metin
 */
@Injectable()
export class PdfOcrService {
    private readonly logger = new Logger(PdfOcrService.name);

    /**
     * Metnin büyük bölümünün kontrol karakterlerinden oluşup oluşmadığını
     * kontrol eder. Eğer true dönerse OCR gereklidir.
     */
    isGarbageText(text: string): boolean {
        if (!text || text.trim().length === 0) return true;

        const controlChars = (text.match(/[\x00-\x1F]/g) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        if (totalChars === 0) return true;

        // Kontrol karakterleri, anlamlı karakterlerin %30'undan fazlaysa bozuk
        return controlChars / totalChars > 0.3;
    }

    /**
     * PDF sayfasını canvas'a render edip PNG buffer üretir.
     */
    private async renderPageToPng(
        pdfPath: string,
        pageNumber: number,
        scale: number = 4.0,
    ): Promise<Buffer> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfjsLib = require('pdfjs-dist/build/pdf.js');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createCanvas } = require('canvas');

        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: false,
        });

        const pdfDocument = await loadingTask.promise;
        this.logger.log(`PDF yüklendi: toplam sayfa=${pdfDocument.numPages}`);

        if (pageNumber > pdfDocument.numPages) {
            throw new Error(
                `Sayfa numarası geçersiz: ${pageNumber} / toplam: ${pdfDocument.numPages}`,
            );
        }

        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = createCanvas(
            Math.ceil(viewport.width),
            Math.ceil(viewport.height),
        );
        const context = canvas.getContext('2d');

        this.logger.log(
            `Sayfa render ediliyor: ${Math.ceil(viewport.width)}x${Math.ceil(viewport.height)}px (scale=${scale})`,
        );

        await page.render({
            canvasContext: context,
            viewport,
            get canvas() {
                return canvas;
            },
        } as any).promise;

        return canvas.toBuffer('image/png') as Buffer;
    }

    /**
     * Sharp ile görüntüyü OCR için ön işler:
     * - Gri tonlamaya çevir (renk gürültüsünü kaldırır)
     * - Normalize et (kontrast genişletme)
     * - Hafif Gaussian blur (noise azaltma)
     * - Keskinleştir (edge netliği artırma)
     * - Siyah-beyaz eşik uygula (binarization) — Tesseract için en iyi format
     */
    private async preprocessImage(rawPng: Buffer): Promise<Buffer> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sharp = require('sharp');

        return sharp(rawPng)
            .greyscale()           // Gri tona çevir
            .normalize()           // Kontrast genişlet (min→siyah, max→beyaz)
            .blur(0.3)             // Hafif blur ile noise azalt
            .sharpen({ sigma: 1.5, m1: 1.5, m2: 2.0 }) // Harfleri netleştir
            .png({ quality: 100 })
            .toBuffer();
    }

    /**
     * Verilen PDF dosyasının belirtilen sayfasından OCR ile metin çıkarır.
     *
     * @param pdfPath  - Sunucudaki PDF dosyasının mutlak yolu
     * @param pageNumber - 1-tabanlı sayfa numarası
     * @param lang - Tesseract dil kodu ('ara', 'tur', 'eng' vb.)
     * @returns OCR ile çıkarılan metin
     */
    async extractTextViaOcr(
        pdfPath: string,
        pageNumber: number,
        lang: string = 'ara',
    ): Promise<string> {
        this.logger.log(
            `OCR başlatılıyor: sayfa=${pageNumber}, dil=${lang}, dosya=${path.basename(pdfPath)}`,
        );

        if (!fs.existsSync(pdfPath)) {
            throw new Error(`PDF dosyası bulunamadı: ${pdfPath}`);
        }

        // 1. PDF sayfasını yüksek çözünürlükte render et
        const rawPng = await this.renderPageToPng(pdfPath, pageNumber, 4.0);
        this.logger.log(`PNG oluşturuldu: ${rawPng.length} bytes`);

        // Not: Bu tür özel fontlu PDF'lerde pdfjs render çıktısı
        // Tesseract için zaten yeterince net — ek preprocessing kaliteyi düşürüyor.

        // 3. Tesseract.js ile OCR
        // Tesseract NestJS ortamında Buffer'dan doğru okuyamıyor;
        // geçici dosyaya yazıp yol geçmek güveni %42→%66'ya yükseltiyor.
        const os = require('os');
        const tmpPath = path.join(os.tmpdir(), `ocr_page_${Date.now()}_${pageNumber}.png`);
        fs.writeFileSync(tmpPath, rawPng);

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createWorker } = require('tesseract.js');

        const worker = await createWorker(lang, 1, {
            logger: (m: { status: string; progress: number }) => {
                if (m.status === 'recognizing text') {
                    this.logger.debug(`OCR ilerleme: %${Math.round(m.progress * 100)}`);
                }
            },
        });

        try {
            const { data: ocrData } = await worker.recognize(tmpPath);
            const extractedText: string = (ocrData.text as string).trim();

            this.logger.log(
                `OCR tamamlandı: ${extractedText.length} karakter, güven: ${Math.round(ocrData.confidence || 0)}%`,
            );

            return extractedText;
        } finally {
            await worker.terminate();
            try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
        }
    }

    /**
     * PDF dil kodunu Tesseract dil koduna çevirir.
     */
    getTesseractLang(langCode: string): string {
        const map: Record<string, string> = {
            ar: 'ara',
            tr: 'tur',
            en: 'eng',
            de: 'deu',
            fr: 'fra',
            es: 'spa',
            it: 'ita',
            ru: 'rus',
            zh: 'chi_sim',
            ja: 'jpn',
            ko: 'kor',
            fa: 'fas',
            ur: 'urd',
        };
        return map[langCode.toLowerCase()] || 'ara';
    }

    /**
     * Yüklenen PDF'in metin kalitesini kontrol eder.
     * İlk 3 sayfayı analiz eder. Bozuksa BadRequestException fırlatır.
     */
    async validatePdfTextQuality(pdfPath: string): Promise<void> {
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`Dosya bulunamadı: ${pdfPath}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { BadRequestException } = require('@nestjs/common');

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfjsLib = require('pdfjs-dist/build/pdf.js');
        const data = new Uint8Array(fs.readFileSync(pdfPath));

        try {
            const loadingTask = pdfjsLib.getDocument({
                data,
                useSystemFonts: true,
                disableFontFace: false,
            });
            const doc = await loadingTask.promise;

            let totalGarbageChars = 0;
            let totalChars = 0;
            const pagesToCheck = Math.min(doc.numPages, 3); // İlk 3 sayfayı kontrol et

            for (let i = 1; i <= pagesToCheck; i++) {
                const page = await doc.getPage(i);
                const content = await page.getTextContent();
                const text = content.items
                    .map((item: any) => item.str)
                    .join(' ')
                    .trim();

                if (!text) continue;

                // Kontrol karakterleri ve replacement char U+FFFD
                const garbageCount = (text.match(/[\x00-\x1F\uFFFD]/g) || []).length;
                totalGarbageChars += garbageCount;
                totalChars += text.replace(/\s/g, '').length;
            }

            // Hiç metin yoksa (resim PDF)
            if (totalChars === 0) {
                // Not: Sadece resim olan PDF'leri reddediyoruz çünkü DeepL çeviri yapamaz
                // (OCR sadece garbage text düzeltmek için var, sıfırdan tüm kitabı OCR yapmak şu anki tasarımda yok)
                throw new BadRequestException(
                    'Bu PDF herhangi bir metin içermiyor (sadece resim olabilir). Lütfen metni seçilebilir/kopyalanabilir bir PDF yükleyin.',
                );
            }

            // Metin var ama bozuksa (garbled text)
            if (totalGarbageChars / totalChars > 0.3) {
                throw new BadRequestException(
                    'Bu PDF dosyasının metin kodlaması bozuk (Kopyalanamaz metin). Lütfen doğru Unicode font kullanan bir PDF yükleyin.',
                );
            }

        } catch (error) {
            // pdfjs hatasını veya bizim fırlattığımız hatayı yukarı ilet
            throw error;
        }
    }
}
