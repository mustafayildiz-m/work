import { User } from '../users/entities/user.entity';
import { UserPost } from './user-post.entity';
export declare class UserPostShare {
    id: number;
    user_id: number;
    post_id: string;
    post_type: string;
    created_at: Date;
    user: User;
    post: UserPost;
}
