import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TtsService } from '../services/tts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @UseGuards(JwtAuthGuard)
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
    } catch (err) {
      throw new HttpException(
        `TTS hatası: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
