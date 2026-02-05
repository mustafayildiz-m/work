import { TranslationService } from '../services/translation.service';
import { TranslateTextDto } from '../dto/translate-text.dto';
export declare class TranslationController {
    private readonly translationService;
    constructor(translationService: TranslationService);
    translate(translateDto: TranslateTextDto): Promise<{
        success: boolean;
        translatedText: string;
        originalLength: number;
        translatedLength: number;
    }>;
}
