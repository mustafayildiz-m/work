import { Repository } from 'typeorm';
import { UserFollow } from '../entities/user-follow.entity';
import { User } from '../users/entities/user.entity';
import { UserPost } from '../entities/user-post.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { CacheService } from './cache.service';
export declare class UserFollowService {
    private userFollowRepository;
    private userRepository;
    private userPostRepository;
    private scholarPostRepository;
    private userScholarFollowRepository;
    private readonly cacheService;
    constructor(userFollowRepository: Repository<UserFollow>, userRepository: Repository<User>, userPostRepository: Repository<UserPost>, scholarPostRepository: Repository<ScholarPost>, userScholarFollowRepository: Repository<UserScholarFollow>, cacheService: CacheService);
    private invalidateFollowingCache;
    follow(follower_id: number, following_id: number): Promise<UserFollow>;
    unfollow(follower_id: number, following_id: number): Promise<{
        unfollowed: boolean;
    }>;
    findFollow(follower_id: number, following_id: number): Promise<UserFollow | null>;
    getFollowingUsers(userId: number, limit?: number, offset?: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        role: string;
        followId: number;
        followedAt: number;
    }[]>;
    getFollowers(userId: number, limit?: number, offset?: number): Promise<any[]>;
    getFollowingCount(userId: number): Promise<number>;
    getFollowersCount(userId: number): Promise<number>;
    getRecentPostsFromFollowing(userId: number, limit?: number, language?: string): Promise<({
        id: number;
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: number | undefined;
            firstName: string | undefined;
            lastName: string | undefined;
            username: string | undefined;
            photoUrl: string | undefined;
            role: string | undefined;
            type: string;
        };
        type: string;
    } | {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: number;
            fullName: string;
            photoUrl: string;
            biography: string;
            type: string;
        };
        type: string;
    })[]>;
    private getUserPosts;
    private getScholarPosts;
}
