import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TranslationService } from '../services/translation.service';
import { TranslateTextDto } from '../dto/translate-text.dto';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) { }


  @Post('translate')
  @HttpCode(HttpStatus.OK)
  async translate(@Body() translateDto: TranslateTextDto) {
    const { text, targetLangCode, sourceLangCode } = translateDto;

    // Uzun metinler için otomatik parçalama
    if (text.length > 500) {
      const translatedText = await this.translationService.translateLongText(
        text,
        targetLangCode,
        sourceLangCode,
      );
      return {
        success: true,
        translatedText,
        originalLength: text.length,
        translatedLength: translatedText.length,
      };
    } else {
      const translatedText = await this.translationService.translateText(
        text,
        targetLangCode,
        sourceLangCode,
      );
      return {
        success: true,
        translatedText,
        originalLength: text.length,
        translatedLength: translatedText.length,
      };
    }
  }
}
