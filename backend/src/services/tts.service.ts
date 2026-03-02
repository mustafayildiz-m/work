import { Injectable, Logger } from '@nestjs/common';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

/**
 * Dil kodu → Microsoft Edge TTS ses adı
 * https://speech.microsoft.com/portal/voicegallery
 */
const VOICE_MAP: Record<string, string> = {
  uz: 'uz-UZ-MadinaNeural',       // Özbekçe - Kadın
  tr: 'tr-TR-EmelNeural',         // Türkçe - Kadın
  en: 'en-US-AriaNeural',         // İngilizce - Kadın
  ar: 'ar-SA-ZariyahNeural',      // Arapça - Kadın
  de: 'de-DE-KatjaNeural',        // Almanca
  fr: 'fr-FR-DeniseNeural',       // Fransızca
  es: 'es-ES-ElviraNeural',       // İspanyolca
  it: 'it-IT-ElsaNeural',         // İtalyanca
  ru: 'ru-RU-SvetlanaNeural',     // Rusça
  zh: 'zh-CN-XiaoxiaoNeural',     // Çince
  ja: 'ja-JP-NanamiNeural',       // Japonca
  ko: 'ko-KR-SunHiNeural',        // Korece
  pt: 'pt-BR-FranciscaNeural',    // Portekizce
  nl: 'nl-NL-ColetteNeural',      // Hollandaca
  pl: 'pl-PL-ZofiaNeural',        // Lehçe
  sv: 'sv-SE-SofieNeural',        // İsveççe
  da: 'da-DK-ChristelNeural',     // Danca
  fi: 'fi-FI-NooraNeural',        // Fince
  hi: 'hi-IN-SwaraNeural',        // Hintçe
  id: 'id-ID-GadisNeural',        // Endonezyaca
  ms: 'ms-MY-YasminNeural',       // Malayca
  th: 'th-TH-PremwadeeNeural',    // Tayca
  vi: 'vi-VN-HoaiMyNeural',       // Vietnamca
  uk: 'uk-UA-PolinaNeural',       // Ukraynaca
  cs: 'cs-CZ-VlastaNeural',       // Çekçe
  ro: 'ro-RO-AlinaNeural',        // Romence
  hu: 'hu-HU-NoemiNeural',        // Macarca
  bg: 'bg-BG-KalinaNeural',       // Bulgarca
  el: 'el-GR-AthinaNeural',       // Yunanca
  he: 'he-IL-HilaNeural',         // İbranice
  fa: 'fa-IR-DilaraNeural',       // Farsça
  ur: 'ur-PK-UzmaNeural',         // Urduca
  kk: 'kk-KZ-AigulNeural',        // Kazakça
  az: 'az-AZ-BabekNeural',        // Azerbaycan Türkçesi
};

const DEFAULT_VOICE = 'en-US-AriaNeural';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  private getVoice(lang: string): string {
    const code = lang.toLowerCase().split('-')[0];
    return VOICE_MAP[code] || VOICE_MAP[lang.toLowerCase()] || DEFAULT_VOICE;
  }

  private cleanText(text: string): string {
    return text
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;|&#039;/g, "'")
      .trim();
  }

  /**
   * Microsoft Edge TTS ile metni MP3 formatında seslendirir.
   * Neural kaliteli sesler, Özbekçe dahil 300+ dil ve lehçe desteği.
   */
  async synthesize(text: string, lang: string): Promise<Buffer> {
    const cleanedText = this.cleanText(text);
    if (!cleanedText) return Buffer.alloc(0);

    const voice = this.getVoice(lang);
    this.logger.log(`Edge TTS: ses="${voice}", uzunluk=${cleanedText.length} karakter`);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      // msedge-tts versiyonuna göre { audioStream } veya doğrudan Readable döner
      const result = tts.toStream(cleanedText);
      const audioStream = (result as any).audioStream ?? result;

      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', (err: Error) => {
        this.logger.error(`Edge TTS stream hatası: ${err.message}`);
        reject(err);
      });
    });
  }
}
