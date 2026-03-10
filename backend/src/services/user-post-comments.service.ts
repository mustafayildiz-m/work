import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { CreateUserPostCommentDto } from '../dto/user-post-comments/create-user-post-comment.dto';
import { UpdateUserPostCommentDto } from '../dto/user-post-comments/update-user-post-comment.dto';
import { User } from '../users/entities/user.entity';
import { UserPost } from '../entities/user-post.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationService } from './notification.service';

@Injectable()
export class UserPostCommentsService {
  constructor(
    @InjectRepository(UserPostComment)
    private userPostCommentRepository: Repository<UserPostComment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPost)
    private userPostRepository: Repository<UserPost>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createUserPostCommentDto: CreateUserPostCommentDto,
    userId: number,
  ) {
    const commentData = {
      post_id: createUserPostCommentDto.post_id,
      content: createUserPostCommentDto.content,
      user_id: userId,
    };

    const comment = this.userPostCommentRepository.create(commentData);

    const savedComment = await this.userPostCommentRepository.save(comment);

    // Kullanıcı bilgilerini ekle
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
    });

    const commentWithUser = {
      ...savedComment,
      user_name: user ? `${user.firstName} ${user.lastName}` : null,
      user_username: user ? user.username : null,
      user_photo_url: user ? user.photoUrl : null,
    };

    // Post sahibine anlık bildirim + yorumu göster (kendi paylaşımına yorum yapmadıysa)
    this.notifyPostAuthorAndSendComment(
      createUserPostCommentDto.post_id,
      userId,
      commentWithUser,
      user,
    ).catch((err) =>
      console.error('notifyPostAuthorAndSendComment error:', err),
    );

    return commentWithUser;
  }

  /**
   * Post sahibine bildirim gönder + yorumu anlık göster (LinkedIn/Facebook tarzı)
   */
  private async notifyPostAuthorAndSendComment(
    postId: number,
    commenterId: number,
    comment: any,
    commenterUser: User | null,
  ) {
    const post = await this.userPostRepository.findOne({
      where: { id: postId },
      select: ['user_id'],
    });
    if (!post || post.user_id === commenterId) return; // Kendi paylaşımına yorum yapmışsa bildirim yok

    const postAuthorId = post.user_id;

    // DB'ye bildirim kaydet
    const commenterName = commenterUser
      ? `${commenterUser.firstName} ${commenterUser.lastName}`.trim()
      : 'Birisi';
    const title = `${commenterName} paylaşımına yorum yaptı`;
    const message = (comment.content || '').slice(0, 100);

    const savedNotification =
      await this.notificationService.createNotification({
        userId: postAuthorId,
        type: 'post_comment',
        title,
        message,
        relatedUserId: commenterId,
      });

    // WebSocket ile anlık bildirim
    this.chatGateway.sendToUser(postAuthorId, 'newNotification', {
      id: savedNotification.id,
      type: savedNotification.type,
      title: savedNotification.title,
      message: savedNotification.message,
      postId,
      postType: 'user',
      is_read: savedNotification.is_read,
      created_at: savedNotification.created_at,
      related_user: commenterUser
        ? {
            firstName: commenterUser.firstName,
            lastName: commenterUser.lastName,
            photoUrl: commenterUser.photoUrl,
          }
        : null,
    });

    // Post sahibinin feed'inde yorumu anlık göster
    this.chatGateway.sendToUser(postAuthorId, 'newCommentInPost', {
      postId,
      comment,
    });
  }

  async findByPostId(postId: number) {
    const comments = await this.userPostCommentRepository.find({
      where: { post_id: postId },
      order: { created_at: 'ASC' },
    });

    // Her yorum için kullanıcı bilgilerini ekle
    const commentsWithUserInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await this.userRepository.findOne({
          where: { id: comment.user_id },
          select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
        });

        return {
          ...comment,
          user_name: user ? `${user.firstName} ${user.lastName}` : null,
          user_username: user ? user.username : null,
          user_photo_url: user ? user.photoUrl : null,
        };
      }),
    );

    return commentsWithUserInfo;
  }

  async findOne(id: number) {
    const comment = await this.userPostCommentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    id: number,
    updateUserPostCommentDto: UpdateUserPostCommentDto,
    userId: number,
  ) {
    const comment = await this.findOne(id);

    // Sadece yorum sahibi güncelleyebilir
    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateUserPostCommentDto);
    const updatedComment = await this.userPostCommentRepository.save(comment);

    // Kullanıcı bilgilerini ekle
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'username', 'photoUrl'],
    });

    return {
      ...updatedComment,
      user_name: user ? `${user.firstName} ${user.lastName}` : null,
      user_username: user ? user.username : null,
      user_photo_url: user ? user.photoUrl : null,
    };
  }

  async remove(id: number, userId: number) {
    const comment = await this.findOne(id);

    // Sadece yorum sahibi silebilir
    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.userPostCommentRepository.remove(comment);
    return { deleted: true };
  }

  async getCommentCount(postId: number): Promise<number> {
    return await this.userPostCommentRepository.count({
      where: { post_id: postId },
    });
  }
}
