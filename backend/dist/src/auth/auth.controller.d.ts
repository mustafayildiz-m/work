import { AuthService } from './auth.service';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
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
    register(registerDto: RegisterDto, profilePhoto: Express.Multer.File): Promise<{
        message: string;
        user: import("../users/entities/user.entity").User;
    }>;
    me(authHeader: string): Promise<{
        id: number;
        email: string;
        role: string;
        photoUrl: string;
    } | {
        message: string;
    }>;
    test(): Promise<{
        message: string;
    }>;
    testJwt(): Promise<{
        message: string;
        token: string;
        secret: string;
        error?: undefined;
    } | {
        message: string;
        error: any;
        token?: undefined;
        secret?: undefined;
    }>;
    nextAuthCallback(body: any): Promise<{
        ok: boolean;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            role: any;
            photoUrl: any;
        };
        access_token: string;
        error?: undefined;
        message?: undefined;
        status?: undefined;
    } | {
        error: string;
        message: any;
        ok: boolean;
        status: number;
        user?: undefined;
        access_token?: undefined;
    }>;
}
