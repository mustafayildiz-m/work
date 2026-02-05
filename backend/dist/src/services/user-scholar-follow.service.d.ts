import { Repository } from 'typeorm';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { User } from '../users/entities/user.entity';
export declare class UserScholarFollowService {
    private userScholarFollowRepository;
    private scholarRepository;
    private userRepository;
    constructor(userScholarFollowRepository: Repository<UserScholarFollow>, scholarRepository: Repository<Scholar>, userRepository: Repository<User>);
    follow(user_id: number, scholar_id: number): Promise<UserScholarFollow>;
    unfollow(user_id: number, scholar_id: number): Promise<{
        unfollowed: boolean;
    }>;
    findFollow(user_id: number, scholar_id: number): Promise<UserScholarFollow | null>;
    getFollowingScholars(userId: number, limit?: number, offset?: number): Promise<{
        id: number;
        fullName: string;
        photoUrl: string;
        biography: string;
        lineage: string;
        birthDate: string;
        deathDate: string;
        locationName: string;
        followId: number;
        followedAt: number;
    }[]>;
    getFollowingScholarsCount(userId: number): Promise<number>;
    getScholarFollowers(scholarId: number, limit?: number, offset?: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        role: string;
        followId: number;
        followedAt: number;
    }[]>;
    getScholarFollowersCount(scholarId: number): Promise<number>;
}
