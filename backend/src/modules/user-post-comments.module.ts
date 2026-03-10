import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { UserPost } from '../entities/user-post.entity';
import { User } from '../users/entities/user.entity';
import { UserPostCommentsController } from '../controllers/user-post-comments.controller';
import { UserPostCommentsService } from '../services/user-post-comments.service';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from './notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPostComment, UserPost, User]),
    forwardRef(() => ChatModule),
    NotificationModule,
  ],
  controllers: [UserPostCommentsController],
  providers: [UserPostCommentsService],
  exports: [UserPostCommentsService],
})
export class UserPostCommentsModule {}
