import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserFollowService } from './user-follow.service';
import { UserScholarFollowService } from './user-scholar-follow.service';
import { CacheService } from './cache.service';
export interface WhoToFollowItem {
    id: number;
    name: string;
    description: string;
    photoUrl?: string;
    type: 'user' | 'scholar';
    username?: string;
    fullName?: string;
    isFollowing?: boolean;
}
export declare class WhoToFollowService {
    private readonly userRepository;
    private readonly scholarRepository;
    private readonly userFollowService;
    private readonly userScholarFollowService;
    private readonly cacheService;
    constructor(userRepository: Repository<User>, scholarRepository: Repository<Scholar>, userFollowService: UserFollowService, userScholarFollowService: UserScholarFollowService, cacheService: CacheService);
    getWhoToFollow(limit?: number, type?: 'users' | 'scholars' | 'all', userId?: number): Promise<WhoToFollowItem[]>;
    private getUserDescription;
    private getScholarDescription;
    private getAdditionalUsers;
    private getAdditionalScholars;
    private shuffleArray;
    getWhoToFollowUsers(userId?: number, page?: number, limit?: number): Promise<WhoToFollowItem[]>;
    getUsersCount(userId?: number): Promise<number>;
    searchUsers(searchQuery: string, userId?: number, page?: number, limit?: number): Promise<WhoToFollowItem[]>;
    searchUsersCount(searchQuery: string, userId?: number): Promise<number>;
}
