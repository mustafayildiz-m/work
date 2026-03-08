import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationController } from '../controllers/translation.controller';
import { TranslationService } from '../services/translation.service';
import { TranslationCache } from '../entities/translation-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TranslationCache])],
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
