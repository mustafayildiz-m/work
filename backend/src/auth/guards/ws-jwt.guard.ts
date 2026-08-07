import { CanActivate, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from '../../chat/chat.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: any): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Token not found');
      }

      const user = await this.chatService.validateToken(token);
      if (!user) {
        throw new WsException('Invalid token');
      }

      client.data.user = user;
      (client as any).user = user;

      return true;
    } catch (err) {
      if (err instanceof WsException) {
        throw err;
      }
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
