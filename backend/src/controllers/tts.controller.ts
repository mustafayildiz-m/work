import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TtsService } from '../services/tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) { }

  @Post('synthesize')
  async synthesize(
    @Body() body: { text: string; lang: string },
    @Res() res: Response,
  ) {
    if (!body.text || !body.text.trim()) {
      throw new HttpException('Metin boş olamaz', HttpStatus.BAD_REQUEST);
    }
    if (!body.lang) {
      throw new HttpException('Dil kodu gerekli', HttpStatus.BAD_REQUEST);
    }

    try {
      const audioBuffer = await this.ttsService.synthesize(
        body.text,
        body.lang,
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });

      res.send(audioBuffer);
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Bilinmeyen hata';
      throw new HttpException(
        `TTS hatası: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
