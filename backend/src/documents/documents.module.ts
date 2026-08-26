import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { KitapAramaController } from './kitap-arama.controller';
import { KitapAramaService } from './kitap-arama.service';
import { BookTranslation } from '../books/entities/book-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookTranslation])],
  controllers: [DocumentsController, KitapAramaController],
  providers: [DocumentsService, KitapAramaService],
  exports: [DocumentsService, KitapAramaService],
})
export class DocumentsModule {}
