import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
import { UserScholarFollowController } from '../controllers/user-scholar-follow.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserScholarFollow, Scholar, User])],
  providers: [UserScholarFollowService],
  controllers: [UserScholarFollowController],
  exports: [UserScholarFollowService],
})
export class UserScholarFollowModule {}
