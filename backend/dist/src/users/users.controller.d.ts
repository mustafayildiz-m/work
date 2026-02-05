import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import { UserFollowService } from '../services/user-follow.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
export declare class UsersController {
    private readonly usersService;
    private readonly userFollowService;
    private readonly userScholarFollowService;
    constructor(usersService: UsersService, userFollowService: UserFollowService, userScholarFollowService: UserScholarFollowService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    getMyProfile(req: any): Promise<User | null>;
    findOnePublic(id: number): Promise<User | null>;
    findOne(id: number, req: any): Promise<User | (User & {
        isFollowing: boolean;
    }) | null>;
    updateMyProfile(req: any, updateUserDto: UpdateUserDto): Promise<User | null>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User | null>;
    updateProfilePhoto(id: number, photo: Express.Multer.File, req: any): Promise<User | null>;
    remove(id: number): Promise<void>;
    getFollowingUsersOfUser(id: number, limit?: string, offset?: string): Promise<{
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
    getFollowersOfUser(id: number, limit?: string, offset?: string): Promise<{
        users: any[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getFollowStatsOfUser(id: number): Promise<{
        followingUsersCount: number;
        followersCount: number;
    }>;
    getFollowingScholarsOfUser(id: number, limit?: string, offset?: string): Promise<{
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
}
