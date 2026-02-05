import { Module } from '@nestjs/common';
import { TranslationController } from '../controllers/translation.controller';
import { TranslationService } from '../services/translation.service';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
