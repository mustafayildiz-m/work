import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { CreateUserPostCommentDto } from '../dto/user-post-comments/create-user-post-comment.dto';
import { UpdateUserPostCommentDto } from '../dto/user-post-comments/update-user-post-comment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserPostCommentsService {
  constructor(
    @InjectRepository(UserPostComment)
    private userPostCommentRepository: Repository<UserPostComment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    return {
      ...savedComment,
      user_name: user ? `${user.firstName} ${user.lastName}` : null,
      user_username: user ? user.username : null,
      user_photo_url: user ? user.photoUrl : null,
    };
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
