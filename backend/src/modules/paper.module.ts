import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paper } from '../entities/paper.entity';
import { PaperService } from '../services/paper.service';
import { PaperController } from '../controllers/paper.controller';
import { UploadModule } from '../upload/upload.module';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paper]), UploadModule],
  providers: [PaperService, CacheService],
  controllers: [PaperController],
  exports: [PaperService],
})
export class PaperModule {}
