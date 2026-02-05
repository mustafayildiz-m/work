import { UserFollowService } from '../services/user-follow.service';
export declare class UserFollowController {
    private readonly userFollowService;
    constructor(userFollowService: UserFollowService);
    follow(body: {
        follower_id: number;
        following_id: number;
    }): Promise<import("../entities/user-follow.entity").UserFollow>;
    unfollow(body: {
        follower_id: number;
        following_id: number;
    }): Promise<{
        unfollowed: boolean;
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
    getFollowers(limit?: string, offset?: string, req?: any): Promise<{
        users: any[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getFollowStats(req?: any): Promise<{
        followingCount: number;
        followersCount: number;
    }>;
}
