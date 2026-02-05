import { CanActivate, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Token not found');
      }

      const payload = this.jwtService.verify(token);
      // Store user in both places for compatibility
      client.data.user = payload;
      (client as any).user = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;

    if (auth && typeof auth === 'string') {
      if (auth.startsWith('Bearer ')) {
        return auth.substring(7);
      }
      return auth;
    }

    return undefined;
  }
}
