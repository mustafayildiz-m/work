import { UserPostShareService } from '../services/user-post-share.service';
export declare class UserPostShareController {
    private readonly userPostShareService;
    constructor(userPostShareService: UserPostShareService);
    sharePost(body: {
        post_id: string;
        post_type?: number | string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        share: import("../entities/user-post-share.entity").UserPostShare;
    }>;
    unsharePost(postId: string, postTypeParam: string | undefined, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyShares(limit?: string, offset?: string, req?: any): Promise<{
        shares: import("../entities/user-post-share.entity").UserPostShare[];
        total: number;
        hasMore: boolean;
    }>;
    getPostShareCount(postId: string, postTypeParam?: string): Promise<{
        count: number;
    }>;
    isPostSharedByUser(postId: string, postTypeParam: string | undefined, req: any): Promise<{
        isShared: boolean;
    }>;
}
