import { CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
export declare class WsJwtGuard implements CanActivate {
    private jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: any): Promise<boolean>;
    private extractToken;
}
