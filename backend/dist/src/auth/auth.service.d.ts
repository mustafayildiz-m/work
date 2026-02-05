import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            role: any;
            photoUrl: any;
        };
    }>;
    me(token: string): Promise<{
        id: number;
        email: string;
        role: string;
        photoUrl: string;
    }>;
    register(registerDto: any): Promise<{
        message: string;
        user: import("../users/entities/user.entity").User;
    }>;
}
