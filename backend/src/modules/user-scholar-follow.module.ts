import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
import { UserScholarFollowController } from '../controllers/user-scholar-follow.controller';
import { User } from '../users/entities/user.entity';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserScholarFollow, Scholar, User])],
  providers: [UserScholarFollowService, CacheService],
  controllers: [UserScholarFollowController],
  exports: [UserScholarFollowService],
})
export class UserScholarFollowModule {}
