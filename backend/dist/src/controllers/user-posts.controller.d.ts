import { UserPostsService } from '../services/user-posts.service';
import { CreateUserPostDto } from '../dto/user-posts/create-user-post.dto';
import { UpdateUserPostDto } from '../dto/user-posts/update-user-post.dto';
export declare class UserPostsController {
    private readonly userPostsService;
    constructor(userPostsService: UserPostsService);
    create(file: Express.Multer.File, body: CreateUserPostDto): Promise<import("../entities/user-post.entity").UserPost>;
    findAll(): Promise<import("../entities/user-post.entity").UserPost[]>;
    getUserPosts(userId: number, req: any): Promise<{
        id: number;
        user_id: number;
        type: string | null;
        content: string;
        title: string;
        image_url: string;
        video_url: any;
        created_at: Date;
        updated_at: Date;
        timeAgo: string;
        status: import("../entities/user-post.entity").PostStatus;
        user_name: string | null;
        user_username: string | null;
        user_photo_url: string | null;
        ownPost: boolean;
        shared_profile_type: any;
        shared_profile_id: any;
        shared_book_id: any;
        shared_article_id: any;
    }[]>;
    findOne(id: number): Promise<import("../entities/user-post.entity").UserPost | null>;
    update(id: number, updateUserPostDto: UpdateUserPostDto): Promise<import("../entities/user-post.entity").UserPost>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    getTimeline(userId: number, language?: string): Promise<any[]>;
    getSharedProfileData(profileType: string, profileId: number): Promise<{
        type: string;
        id: number;
        name: string;
        username: string;
        photoUrl: string;
        biography: string;
        birthDate?: undefined;
        deathDate?: undefined;
    } | {
        type: string;
        id: number;
        name: string;
        photoUrl: string;
        biography: string;
        birthDate: string;
        deathDate: string;
        username?: undefined;
    }>;
    getPendingPosts(req: any): Promise<import("../entities/user-post.entity").UserPost[]>;
    approvePost(id: number, req: any): Promise<import("../entities/user-post.entity").UserPost>;
    rejectPost(id: number, req: any): Promise<import("../entities/user-post.entity").UserPost>;
}
