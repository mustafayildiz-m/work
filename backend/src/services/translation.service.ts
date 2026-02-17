import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TranslationService {
  constructor(private configService: ConfigService) { }

  // DeepL API endpoint - ücretsiz plan
  private get DEEPL_API_URL(): string {
    return (
      this.configService.get<string>('DEEPL_API_URL') ||
      'https://api-free.deepl.com/v2/translate'
    );
  }

  // DeepL API key - environment variable'dan alınır
  private get DEEPL_API_KEY(): string | undefined {
    return this.configService.get<string>('DEEPL_API_KEY');
  }

  /**
   * Dil kodunu DeepL formatına çevirir (büyük harf, özel kodlar)
   */
  private mapLanguageCode(langCode: string): string {
    const langMap: { [key: string]: string } = {
      tr: 'TR',
      en: 'EN',
      ar: 'AR',
      de: 'DE',
      fr: 'FR',
      es: 'ES',
      it: 'IT',
      ru: 'RU',
      zh: 'ZH',
      ja: 'JA',
      ko: 'KO',
      pt: 'PT',
      nl: 'NL',
      pl: 'PL',
      sv: 'SV',
      da: 'DA',
      fi: 'FI',
      el: 'EL',
      he: 'HE',
      hi: 'HI',
      bn: 'BN',
      ta: 'TA',
      th: 'TH',
      vi: 'VI',
      id: 'ID',
      ms: 'MS',
      fa: 'FA',
      ur: 'UR',
      cs: 'CS', // Çekçe
      sk: 'SK', // Slovakça
      uk: 'UK', // Ukraynaca
      bg: 'BG', // Bulgarca
      hr: 'HR', // Hırvatça
      ro: 'RO', // Romence
      hu: 'HU', // Macarca
      et: 'ET', // Estonca
      lv: 'LV', // Letonca
      lt: 'LT', // Litvanca
      sl: 'SL', // Slovence
      mt: 'MT', // Maltaca
    };

    const mapped = langMap[langCode.toLowerCase()];
    if (!mapped) {
      // Eğer mapping yoksa, büyük harfe çevir
      return langCode.toUpperCase();
    }
    return mapped;
  }

  /**
   * Retry mekanizması ile metni belirtilen dile çevirir
   * DeepL API kullanır (ücretsiz plan: 500,000 karakter/ay)
   * @param text Çevrilecek metin
   * @param targetLangCode Hedef dil kodu (örn: 'tr', 'en', 'ar')
   * @param sourceLangCode Kaynak dil kodu (opsiyonel, otomatik tespit edilir)
   * @param retries Maksimum retry sayısı (varsayılan: 3)
   * @returns Çevrilmiş metin
   */
  async translateText(
    text: string,
    targetLangCode: string,
    sourceLangCode?: string,
    retries: number = 3,
  ): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new HttpException(
        'Çevrilecek metin boş olamaz',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!targetLangCode) {
      throw new HttpException(
        'Hedef dil kodu belirtilmelidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    // DeepL API key kontrolü
    if (!this.DEEPL_API_KEY) {
      throw new HttpException(
        "DeepL API key yapılandırılmamış. Lütfen DEEPL_API_KEY environment variable'ını ayarlayın.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const targetLang = this.mapLanguageCode(targetLangCode);
    const sourceLang = sourceLangCode
      ? this.mapLanguageCode(sourceLangCode)
      : undefined; // DeepL otomatik tespit eder

    // Retry mekanizması
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Exponential backoff: 1s, 2s, 4s
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // DeepL API - POST request (form-urlencoded format)
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('target_lang', targetLang);

        // Source lang belirtilmişse ekle
        if (sourceLang) {
          params.append('source_lang', sourceLang);
        }

        const response = await axios.post(
          this.DEEPL_API_URL,
          params.toString(),
          {
            headers: {
              Authorization: `DeepL-Auth-Key ${this.DEEPL_API_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000, // 30 saniye timeout
          },
        );

        if (
          response.data &&
          response.data.translations &&
          response.data.translations.length > 0 &&
          response.data.translations[0].text
        ) {
          return response.data.translations[0].text;
        } else {
          throw new Error('Çeviri başarısız oldu');
        }
      } catch (error) {
        // Rate limit hatası (429) veya Too Many Requests durumunda retry yap
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const statusText = error.response?.statusText || '';
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error?.message;

          // Rate limit hatası ise retry yap
          if (
            status === 429 ||
            status === 456 || // DeepL quota exceeded
            statusText.includes('Too Many Requests') ||
            statusText.includes('Rate limit') ||
            errorMessage?.includes('quota') ||
            errorMessage?.includes('limit')
          ) {
            if (attempt < retries - 1) {
              // Sonraki denemeye geç
              continue;
            }
          }

          // Son deneme değilse devam et
          if (attempt < retries - 1) {
            continue;
          }

          // Son deneme başarısız oldu
          if (error.response) {
            const errorMsg =
              errorMessage || error.response.statusText || 'Bilinmeyen hata';
            throw new HttpException(
              `DeepL API hatası: ${errorMsg}`,
              error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          } else if (error.request) {
            throw new HttpException(
              'DeepL servisine bağlanılamadı',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }
        }

        // Son deneme ve hata yakalanamadı
        if (attempt === retries - 1) {
          throw new HttpException(
            'Çeviri sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }

    // Buraya gelmemeli ama yine de throw
    throw new HttpException(
      'Çeviri sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /**
   * Uzun metni parçalara bölerek çevirir
   * @param text Çevrilecek metin
   * @param targetLangCode Hedef dil kodu
   * @param sourceLangCode Kaynak dil kodu (opsiyonel)
   * @param chunkSize Parça boyutu (varsayılan: 1000 karakter - daha az istek için)
   * @returns Çevrilmiş metin
   */
  async translateLongText(
    text: string,
    targetLangCode: string,
    sourceLangCode?: string,
    chunkSize: number = 1000, // Daha büyük chunk size - daha az istek
  ): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new HttpException(
        'Çevrilecek metin boş olamaz',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Metin kısa ise direkt çevir
    if (text.length <= chunkSize) {
      return this.translateText(text, targetLangCode, sourceLangCode);
    }

    // Metni cümlelere göre böl
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // Her parçayı çevir - rate limiting ile
    const translatedChunks: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const translated = await this.translateText(
          chunks[i],
          targetLangCode,
          sourceLangCode,
          3, // 3 retry
        );
        translatedChunks.push(translated);

        // Rate limiting için bekleme - her istek arasında 500ms-1s bekle
        // İlk chunk'tan sonra bekleme süresini artır
        if (i < chunks.length - 1) {
          const delay = i === 0 ? 500 : 1000; // İlk chunk'tan sonra 1 saniye bekle
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        // Rate limit hatası ise daha uzun bekle ve tekrar dene
        if (
          error instanceof HttpException &&
          error.getStatus() === HttpStatus.TOO_MANY_REQUESTS
        ) {
          console.warn(
            `Rate limit hatası - Chunk ${i + 1}/${chunks.length}. 5 saniye bekleniyor...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Bir kez daha dene
          try {
            const translated = await this.translateText(
              chunks[i],
              targetLangCode,
              sourceLangCode,
              3,
            );
            translatedChunks.push(translated);
          } catch (retryError) {
            // İkinci deneme de başarısız olursa, orijinal metni kullan
            console.error(
              `Chunk ${i + 1} translation retry error:`,
              retryError,
            );
            translatedChunks.push(chunks[i]);
          }
        } else {
          // Bir parça çevrilemezse, orijinal metni kullan
          console.error(`Chunk ${i + 1} translation error:`, error);
          translatedChunks.push(chunks[i]);
        }
      }
    }

    return translatedChunks.join(' ');
  }
}
