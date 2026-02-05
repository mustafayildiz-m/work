import { UserFollowService } from '../services/user-follow.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
export interface FollowingItem {
    id: number;
    name: string;
    photoUrl?: string;
    type: 'user' | 'scholar';
    username?: string;
    fullName?: string;
    biography?: string;
    role?: string;
    followId: number;
    followedAt: number;
}
export declare class FollowingController {
    private readonly userFollowService;
    private readonly userScholarFollowService;
    constructor(userFollowService: UserFollowService, userScholarFollowService: UserScholarFollowService);
    getAllFollowing(limit?: string, offset?: string, type?: 'users' | 'scholars' | 'all', req?: any): Promise<{
        items: FollowingItem[];
        totalCount: number;
        hasMore: boolean;
        stats: {
            usersCount: number;
            scholarsCount: number;
            totalCount: number;
        };
    }>;
    getFollowingUsers(limit?: string, offset?: string, req?: any): Promise<{
        users: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
            photoUrl: string;
            role: string;
            followId: number;
            followedAt: number;
        }[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getFollowingScholars(limit?: string, offset?: string, req?: any): Promise<{
        scholars: {
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
        }[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getFollowingStats(req?: any): Promise<{
        followingUsersCount: number;
        followersCount: number;
        followingScholarsCount: number;
        totalFollowingCount: number;
    }>;
    getRecentPostsFromFollowing(limit?: string, language?: string, req?: any): Promise<{
        posts: ({
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
        })[];
        totalCount: number;
        message: string;
    }>;
}
