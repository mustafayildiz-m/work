import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollow } from '../entities/user-follow.entity';
import { User } from '../users/entities/user.entity';
import { UserPost } from '../entities/user-post.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { UserFollowService } from '../services/user-follow.service';
import { UserFollowController } from '../controllers/user-follow.controller';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFollow,
      User,
      UserPost,
      ScholarPost,
      UserScholarFollow,
    ]),
  ],
  providers: [UserFollowService, CacheService],
  controllers: [UserFollowController],
  exports: [UserFollowService],
})
export class UserFollowModule {}
