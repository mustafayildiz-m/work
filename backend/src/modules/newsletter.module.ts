import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletter } from '../entities/newsletter.entity';
import { NewsletterService } from '../services/newsletter.service';
import { NewsletterController } from '../controllers/newsletter.controller';
import { UploadModule } from '../upload/upload.module';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter]), UploadModule],
  providers: [NewsletterService, CacheService],
  controllers: [NewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
