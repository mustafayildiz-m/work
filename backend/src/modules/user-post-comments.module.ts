import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { User } from '../users/entities/user.entity';
import { UserPostCommentsController } from '../controllers/user-post-comments.controller';
import { UserPostCommentsService } from '../services/user-post-comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserPostComment, User])],
  controllers: [UserPostCommentsController],
  providers: [UserPostCommentsService],
  exports: [UserPostCommentsService],
})
export class UserPostCommentsModule {}
