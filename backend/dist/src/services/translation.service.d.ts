export declare class TranslationService {
    private readonly DEEPL_API_URL;
    private readonly DEEPL_API_KEY;
    private mapLanguageCode;
    translateText(text: string, targetLangCode: string, sourceLangCode?: string, retries?: number): Promise<string>;
    translateLongText(text: string, targetLangCode: string, sourceLangCode?: string, chunkSize?: number): Promise<string>;
}
