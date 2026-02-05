import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IslamicNews } from '../entities/islamic-news.entity';
import { IslamicNewsService } from '../services/islamic-news.service';
import { IslamicNewsController } from '../controllers/islamic-news.controller';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([IslamicNews])],
  providers: [IslamicNewsService, CacheService],
  controllers: [IslamicNewsController],
  exports: [IslamicNewsService],
})
export class IslamicNewsModule {}
