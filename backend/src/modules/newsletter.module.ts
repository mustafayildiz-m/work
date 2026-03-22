import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletter } from '../entities/newsletter.entity';
import { NewsletterTranslation } from '../entities/newsletter-translation.entity';
import { NewsletterService } from '../services/newsletter.service';
import { NewsletterController } from '../controllers/newsletter.controller';
import { UploadModule } from '../upload/upload.module';
import { CacheService } from '../services/cache.service';
import { TranslationModule } from './translation.module';
import { UserPostsModule } from './user-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Newsletter, NewsletterTranslation]),
    UploadModule,
    TranslationModule,
    UserPostsModule,
  ],
  providers: [NewsletterService, CacheService],
  controllers: [NewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
