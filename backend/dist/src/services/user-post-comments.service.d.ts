import { Repository } from 'typeorm';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { CreateUserPostCommentDto } from '../dto/user-post-comments/create-user-post-comment.dto';
import { UpdateUserPostCommentDto } from '../dto/user-post-comments/update-user-post-comment.dto';
import { User } from '../users/entities/user.entity';
export declare class UserPostCommentsService {
    private userPostCommentRepository;
    private userRepository;
    constructor(userPostCommentRepository: Repository<UserPostComment>, userRepository: Repository<User>);
    create(createUserPostCommentDto: CreateUserPostCommentDto, userId: number): Promise<{
        user_name: string | null;
        user_username: string | null;
        user_photo_url: string | null;
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: Date;
    }>;
    findByPostId(postId: number): Promise<{
        user_name: string | null;
        user_username: string | null;
        user_photo_url: string | null;
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: Date;
    }[]>;
    findOne(id: number): Promise<UserPostComment>;
    update(id: number, updateUserPostCommentDto: UpdateUserPostCommentDto, userId: number): Promise<{
        user_name: string | null;
        user_username: string | null;
        user_photo_url: string | null;
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: Date;
    }>;
    remove(id: number, userId: number): Promise<{
        deleted: boolean;
    }>;
    getCommentCount(postId: number): Promise<number>;
}
