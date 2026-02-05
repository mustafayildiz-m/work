import { User } from '../users/entities/user.entity';
export declare class UserFollow {
    id: number;
    follower_id: number;
    following_id: number;
    follower: User;
    following: User;
}
