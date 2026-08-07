import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';
import { QaImportService } from './qa-import.service';
import { QaExportService } from './qa-export.service';
import { QaSeederService } from './qa-seeder.service';
import {
  QaCategory,
  QaCategoryTranslation,
  QaItem,
  QaItemTranslation,
  QaTag,
  QaTagTranslation,
} from './entities';
import { Language } from '../languages/entities/language.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QaCategory,
      QaCategoryTranslation,
      QaItem,
      QaItemTranslation,
      QaTag,
      QaTagTranslation,
      Language,
    ]),
  ],
  controllers: [QaController],
  providers: [QaService, QaImportService, QaExportService, QaSeederService],
  exports: [QaService, QaSeederService],
})
export class QaModule {}
