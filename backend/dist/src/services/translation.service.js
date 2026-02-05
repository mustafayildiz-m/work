"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TranslationService = class TranslationService {
    constructor() {
        this.DEEPL_API_URL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
        this.DEEPL_API_KEY = process.env.DEEPL_API_KEY;
    }
    mapLanguageCode(langCode) {
        const langMap = {
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
            cs: 'CS',
            sk: 'SK',
            uk: 'UK',
            bg: 'BG',
            hr: 'HR',
            ro: 'RO',
            hu: 'HU',
            et: 'ET',
            lv: 'LV',
            lt: 'LT',
            sl: 'SL',
            mt: 'MT',
        };
        const mapped = langMap[langCode.toLowerCase()];
        if (!mapped) {
            return langCode.toUpperCase();
        }
        return mapped;
    }
    async translateText(text, targetLangCode, sourceLangCode, retries = 3) {
        if (!text || text.trim().length === 0) {
            throw new common_1.HttpException('Çevrilecek metin boş olamaz', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!targetLangCode) {
            throw new common_1.HttpException('Hedef dil kodu belirtilmelidir', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!this.DEEPL_API_KEY) {
            throw new common_1.HttpException('DeepL API key yapılandırılmamış. Lütfen DEEPL_API_KEY environment variable\'ını ayarlayın.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const targetLang = this.mapLanguageCode(targetLangCode);
        const sourceLang = sourceLangCode
            ? this.mapLanguageCode(sourceLangCode)
            : undefined;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
                const params = new URLSearchParams();
                params.append('text', text);
                params.append('target_lang', targetLang);
                if (sourceLang) {
                    params.append('source_lang', sourceLang);
                }
                const response = await axios_1.default.post(this.DEEPL_API_URL, params.toString(), {
                    headers: {
                        'Authorization': `DeepL-Auth-Key ${this.DEEPL_API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    timeout: 30000,
                });
                if (response.data &&
                    response.data.translations &&
                    response.data.translations.length > 0 &&
                    response.data.translations[0].text) {
                    return response.data.translations[0].text;
                }
                else {
                    throw new Error('Çeviri başarısız oldu');
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const status = error.response?.status;
                    const statusText = error.response?.statusText || '';
                    const errorMessage = error.response?.data?.message || error.response?.data?.error?.message;
                    if (status === 429 ||
                        status === 456 ||
                        statusText.includes('Too Many Requests') ||
                        statusText.includes('Rate limit') ||
                        errorMessage?.includes('quota') ||
                        errorMessage?.includes('limit')) {
                        if (attempt < retries - 1) {
                            continue;
                        }
                    }
                    if (attempt < retries - 1) {
                        continue;
                    }
                    if (error.response) {
                        const errorMsg = errorMessage ||
                            error.response.statusText ||
                            'Bilinmeyen hata';
                        throw new common_1.HttpException(`DeepL API hatası: ${errorMsg}`, error.response.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    else if (error.request) {
                        throw new common_1.HttpException('DeepL servisine bağlanılamadı', common_1.HttpStatus.SERVICE_UNAVAILABLE);
                    }
                }
                if (attempt === retries - 1) {
                    throw new common_1.HttpException('Çeviri sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }
        throw new common_1.HttpException('Çeviri sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.', common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
    async translateLongText(text, targetLangCode, sourceLangCode, chunkSize = 1000) {
        if (!text || text.trim().length === 0) {
            throw new common_1.HttpException('Çevrilecek metin boş olamaz', common_1.HttpStatus.BAD_REQUEST);
        }
        if (text.length <= chunkSize) {
            return this.translateText(text, targetLangCode, sourceLangCode);
        }
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > chunkSize && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
            else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        const translatedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            try {
                const translated = await this.translateText(chunks[i], targetLangCode, sourceLangCode, 3);
                translatedChunks.push(translated);
                if (i < chunks.length - 1) {
                    const delay = i === 0 ? 500 : 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
            catch (error) {
                if (error instanceof common_1.HttpException &&
                    error.getStatus() === common_1.HttpStatus.TOO_MANY_REQUESTS) {
                    console.warn(`Rate limit hatası - Chunk ${i + 1}/${chunks.length}. 5 saniye bekleniyor...`);
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    try {
                        const translated = await this.translateText(chunks[i], targetLangCode, sourceLangCode, 3);
                        translatedChunks.push(translated);
                    }
                    catch (retryError) {
                        console.error(`Chunk ${i + 1} translation retry error:`, retryError);
                        translatedChunks.push(chunks[i]);
                    }
                }
                else {
                    console.error(`Chunk ${i + 1} translation error:`, error);
                    translatedChunks.push(chunks[i]);
                }
            }
        }
        return translatedChunks.join(' ');
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = __decorate([
    (0, common_1.Injectable)()
], TranslationService);
//# sourceMappingURL=translation.service.js.map