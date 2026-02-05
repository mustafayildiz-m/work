import { WhoToFollowService } from '../services/who-to-follow.service';
export declare class WhoToFollowController {
    private readonly whoToFollowService;
    constructor(whoToFollowService: WhoToFollowService);
    getWhoToFollow(page?: string, limit?: string, type?: 'users' | 'scholars' | 'all', req?: any): Promise<import("../services/who-to-follow.service").WhoToFollowItem[] | {
        users: import("../services/who-to-follow.service").WhoToFollowItem[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        hasMore: boolean;
    }>;
    searchWhoToFollow(searchQuery: string, page?: string, limit?: string, req?: any): Promise<{
        users: never[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
        searchQuery?: undefined;
    } | {
        users: import("../services/who-to-follow.service").WhoToFollowItem[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
}
