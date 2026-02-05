import { SearchService } from '../services/search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchUsers(searchQuery: string, limit?: string, offset?: string, req?: any): Promise<{
        users: never[];
        totalCount: number;
        hasMore: boolean;
        searchQuery?: undefined;
    } | {
        users: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
            photoUrl: string;
            role: string;
            fullName: string;
        }[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
    searchFollowers(searchQuery: string, limit?: string, offset?: string, req?: any): Promise<{
        users: never[];
        totalCount: number;
        hasMore: boolean;
        searchQuery?: undefined;
    } | {
        users: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
            photoUrl: string;
            role: string;
            followId: number;
            followedAt: number;
            fullName: string;
        }[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
    searchFollowing(searchQuery: string, limit?: string, offset?: string, req?: any): Promise<{
        users: never[];
        totalCount: number;
        hasMore: boolean;
        searchQuery?: undefined;
    } | {
        users: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
            photoUrl: string;
            role: string;
            followId: number;
            followedAt: number;
            fullName: string;
        }[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
    searchScholars(searchQuery: string, page?: string, limit?: string, req?: any): Promise<{
        scholars: never[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
        searchQuery?: undefined;
    } | {
        scholars: import("../scholars/entities/scholar.entity").Scholar[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        hasMore: boolean;
        searchQuery: string;
    }>;
    generalSearch(searchQuery: string, type?: 'users' | 'scholars' | 'all', limit?: string, offset?: string, req?: any): Promise<{
        results: any[];
        totalCount: number;
        hasMore: boolean;
        searchQuery: string;
    } | {
        results: never[];
        totalCount: number;
        hasMore: boolean;
    }>;
}
