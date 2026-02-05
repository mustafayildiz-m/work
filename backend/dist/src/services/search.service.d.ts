import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
export declare class SearchService {
    private userRepository;
    private scholarRepository;
    private userFollowRepository;
    private userScholarFollowRepository;
    constructor(userRepository: Repository<User>, scholarRepository: Repository<Scholar>, userFollowRepository: Repository<UserFollow>, userScholarFollowRepository: Repository<UserScholarFollow>);
    searchUsers(searchQuery: string, limit?: number, offset?: number, currentUserId?: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        role: string;
        fullName: string;
    }[]>;
    getSearchUsersCount(searchQuery: string, currentUserId?: number): Promise<number>;
    searchFollowers(searchQuery: string, limit: number | undefined, offset: number | undefined, userId: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        role: string;
        followId: number;
        followedAt: number;
        fullName: string;
    }[]>;
    getSearchFollowersCount(searchQuery: string, userId: number): Promise<number>;
    searchFollowing(searchQuery: string, limit: number | undefined, offset: number | undefined, userId: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        role: string;
        followId: number;
        followedAt: number;
        fullName: string;
    }[]>;
    getSearchFollowingCount(searchQuery: string, userId: number): Promise<number>;
    searchScholars(searchQuery: string, limit?: number, offset?: number, userId?: number): Promise<Scholar[]>;
    getSearchScholarsCount(searchQuery: string, userId?: number): Promise<number>;
    generalSearch(searchQuery: string, type: 'users' | 'scholars' | 'all', limit?: number, offset?: number, userId?: number): Promise<{
        results: any[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
}
