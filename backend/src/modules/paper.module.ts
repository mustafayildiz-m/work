import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paper } from '../entities/paper.entity';
import { PaperTranslation } from '../entities/paper-translation.entity';
import { PaperService } from '../services/paper.service';
import { PaperController } from '../controllers/paper.controller';
import { UploadModule } from '../upload/upload.module';
import { CacheService } from '../services/cache.service';
import { TranslationModule } from './translation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paper, PaperTranslation]),
    UploadModule,
    TranslationModule,
  ],
  providers: [PaperService, CacheService],
  controllers: [PaperController],
  exports: [PaperService],
})
export class PaperModule {}
