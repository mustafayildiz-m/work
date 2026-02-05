import { ScholarsService } from './scholars.service';
import { UploadService } from '../upload/upload.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
export declare class ScholarsController {
    private readonly scholarsService;
    private readonly uploadService;
    private readonly userScholarFollowService;
    constructor(scholarsService: ScholarsService, uploadService: UploadService, userScholarFollowService: UserScholarFollowService);
    create(createScholarDto: any, files: Express.Multer.File[], req: any): Promise<import("./entities/scholar.entity").Scholar>;
    findAll(page?: string, limit?: string, search?: string, req?: any): Promise<{
        scholars: import("./entities/scholar.entity").Scholar[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        hasMore: boolean;
    }>;
    findOne(id: string, queryUserId: string, req: any): Promise<import("./entities/scholar.entity").Scholar>;
    update(id: string, updateScholarDto: any, files: Express.Multer.File[], req: any): Promise<import("./entities/scholar.entity").Scholar>;
    updateCoverImage(id: string, files: Express.Multer.File[], req: any): Promise<import("./entities/scholar.entity").Scholar>;
    remove(id: string): Promise<import("./entities/scholar.entity").Scholar>;
    getScholarFollowers(id: string, limit?: string, offset?: string): Promise<{
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
    getScholarFollowStats(id: string): Promise<{
        followersCount: number;
    }>;
}
