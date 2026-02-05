import { Repository } from 'typeorm';
import { UserPostShare } from '../entities/user-post-share.entity';
import { UserPost } from '../entities/user-post.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
export declare class UserPostShareService {
    private userPostShareRepository;
    private userPostRepository;
    private scholarPostRepository;
    constructor(userPostShareRepository: Repository<UserPostShare>, userPostRepository: Repository<UserPost>, scholarPostRepository: Repository<ScholarPost>);
    sharePost(userId: number, postId: string, postType?: 'user' | 'scholar'): Promise<{
        success: boolean;
        message: string;
        share: UserPostShare;
    }>;
    unsharePost(userId: number, postId: string, postType?: 'user' | 'scholar'): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserShares(userId: number, limit?: number, offset?: number): Promise<{
        shares: UserPostShare[];
        total: number;
        hasMore: boolean;
    }>;
    getPostShareCount(postId: string, postType?: 'user' | 'scholar'): Promise<number>;
    isPostSharedByUser(userId: number, postId: string, postType?: 'user' | 'scholar'): Promise<boolean>;
}
