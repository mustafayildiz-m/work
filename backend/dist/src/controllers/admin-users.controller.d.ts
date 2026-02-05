import { UsersService } from '../users/users.service';
import { UpdateUserAdminDto } from '../users/dto/update-user-admin.dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class AdminUsersController {
    private readonly usersService;
    private readonly userRepository;
    constructor(usersService: UsersService, userRepository: Repository<User>);
    getUsers(role?: string, search?: string, isActive?: string, limit?: string, offset?: string): Promise<{
        users: {
            id: number;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            photoUrl: string;
            biography: string;
            phoneNo: string;
            location: string;
            birthDate: Date;
            role: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    }>;
    getUser(id: number): Promise<User>;
    updateUser(id: number, updateUserDto: UpdateUserAdminDto): Promise<{
        id: number;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        photoUrl: string;
        biography: string;
        phoneNo: string;
        location: string;
        birthDate: Date;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changeUserRole(id: number, role: string): Promise<{
        id: number;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        photoUrl: string;
        biography: string;
        phoneNo: string;
        location: string;
        birthDate: Date;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleUserStatus(id: number, isActive: boolean): Promise<{
        id: number;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        photoUrl: string;
        biography: string;
        phoneNo: string;
        location: string;
        birthDate: Date;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
    getUserStatistics(): Promise<{
        totalUsers: number;
        adminCount: number;
        editorCount: number;
        userCount: number;
        activeUsers: number;
        inactiveUsers: number;
    }>;
}
