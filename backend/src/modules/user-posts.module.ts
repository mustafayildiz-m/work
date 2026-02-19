import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPost } from '../entities/user-post.entity';
import { UserPostsController } from '../controllers/user-posts.controller';
import { UserPostsService } from '../services/user-posts.service';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { UserPostShare } from '../entities/user-post-share.entity';
import { UserPostShareController } from '../controllers/user-post-share.controller';
import { UserPostShareService } from '../services/user-post-share.service';
import { CacheService } from '../services/cache.service';
import { SystemSettingsModule } from './system-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPost,
      UserFollow,
      UserScholarFollow,
      ScholarPost,
      User,
      Scholar,
      UserPostComment,
      UserPostShare,
    ]),
    SystemSettingsModule,
  ],
  controllers: [UserPostsController, UserPostShareController],
  providers: [UserPostsService, UserPostShareService, CacheService],
  exports: [UserPostsService, UserPostShareService],
})
export class UserPostsModule { }
