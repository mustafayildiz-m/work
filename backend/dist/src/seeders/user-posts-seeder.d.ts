import { Repository } from 'typeorm';
import { UserPost } from '../entities/user-post.entity';
import { User } from '../users/entities/user.entity';
export declare class UserPostsSeeder {
    private readonly userPostRepository;
    private readonly userRepository;
    constructor(userPostRepository: Repository<UserPost>, userRepository: Repository<User>);
    seed(): Promise<void>;
    private getRandomImageUrl;
    private getRandomVideoUrl;
}
