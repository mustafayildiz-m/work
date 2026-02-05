import { UserScholarFollowService } from '../services/user-scholar-follow.service';
export declare class UserScholarFollowController {
    private readonly userScholarFollowService;
    constructor(userScholarFollowService: UserScholarFollowService);
    follow(body: {
        user_id: number;
        scholar_id: number;
    }): Promise<import("../entities/user-scholar-follow.entity").UserScholarFollow>;
    unfollow(body: {
        user_id: number;
        scholar_id: number;
    }): Promise<{
        unfollowed: boolean;
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
    getScholarFollowStats(req?: any): Promise<{
        followingScholarsCount: number;
    }>;
}
