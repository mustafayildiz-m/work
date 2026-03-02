import { Module } from '@nestjs/common';
import { TtsController } from '../controllers/tts.controller';
import { TtsService } from '../services/tts.service';

@Module({
  controllers: [TtsController],
  providers: [TtsService],
  exports: [TtsService],
})
export class TtsModule {}
