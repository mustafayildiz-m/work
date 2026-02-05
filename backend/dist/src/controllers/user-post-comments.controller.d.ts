import { UserPostCommentsService } from '../services/user-post-comments.service';
import { CreateUserPostCommentDto } from '../dto/user-post-comments/create-user-post-comment.dto';
import { UpdateUserPostCommentDto } from '../dto/user-post-comments/update-user-post-comment.dto';
export declare class UserPostCommentsController {
    private readonly userPostCommentsService;
    constructor(userPostCommentsService: UserPostCommentsService);
    create(createUserPostCommentDto: CreateUserPostCommentDto, req: any): Promise<{
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
    findOne(id: number): Promise<import("../entities/user-post-comment.entity").UserPostComment>;
    update(id: number, updateUserPostCommentDto: UpdateUserPostCommentDto, req: any): Promise<{
        user_name: string | null;
        user_username: string | null;
        user_photo_url: string | null;
        id: number;
        post_id: number;
        user_id: number;
        content: string;
        created_at: Date;
    }>;
    remove(id: number, req: any): Promise<{
        deleted: boolean;
    }>;
    getCommentCount(postId: number): Promise<number>;
}
