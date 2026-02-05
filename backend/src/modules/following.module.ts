import { Module } from '@nestjs/common';
import { FollowingController } from '../controllers/following.controller';
import { UserFollowModule } from './user-follow.module';
import { UserScholarFollowModule } from './user-scholar-follow.module';

@Module({
  imports: [UserFollowModule, UserScholarFollowModule],
  controllers: [FollowingController],
  exports: [],
})
export class FollowingModule {}
