import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    username: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || true,
    credentials: true,
  },
  namespace: '/chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) { }

  sendToUser(userId: number, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.server) {
      this.server.to(socketId).emit(event, data);
    }
  }

  /**
   * Birden fazla kullanıcıya aynı event'i gönderir (örn: yeni post takipçilere)
   */
  broadcastToUsers(userIds: number[], event: string, data: any) {
    if (!this.server || !userIds?.length) return;
    for (const userId of userIds) {
      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  /**
   * Tüm bağlı istemcilere event gönderir (post silindi gibi - herkes kendi timeline'ında kontrol eder)
   */
  broadcastToAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  private extractHandshakeToken(client: AuthenticatedSocket): string | undefined {
    const auth =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!auth || typeof auth !== 'string') return undefined;
    return auth.startsWith('Bearer ') ? auth.substring(7) : auth;
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractHandshakeToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const user = await this.chatService.validateToken(token);
      if (!user) {
        client.disconnect(true);
        return;
      }

      client.user = user;
      this.connectedUsers.set(user.id, client.id);
      await this.chatService.setUserOnline(user.id, true);

      const connectionIds = await this.chatService.getMutualConnectionUserIds(
        user.id,
      );
      this.broadcastToUsers(connectionIds, 'userOnline', {
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.id);
      await this.chatService.setUserOnline(client.user.id, false);

      const connectionIds = await this.chatService.getMutualConnectionUserIds(
        client.user.id,
      );
      this.broadcastToUsers(connectionIds, 'userOffline', {
        userId: client.user.id,
        username: client.user.username,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { receiverId: number; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    try {
      const receiverId = Number(data.receiverId);
      if (!receiverId || Number.isNaN(receiverId)) {
        return { error: 'Invalid receiver' };
      }

      const message = await this.chatService.createMessage({
        senderId: client.user.id,
        receiverId,
        content: data.content,
      });

      const [sender, receiver] = await Promise.all([
        this.chatService.getUserBasic(client.user.id),
        this.chatService.getUserBasic(receiverId),
      ]);

      const senderFullName =
        `${sender?.firstName || ''} ${sender?.lastName || ''}`.trim() ||
        sender?.username ||
        client.user.username;
      const receiverFullName =
        `${receiver?.firstName || ''} ${receiver?.lastName || ''}`.trim() ||
        receiver?.username ||
        '';

      const messageData = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: message.createdAt,
        status: message.status,
        senderName: senderFullName,
        senderUsername: sender?.username || client.user.username,
        senderFirstName: sender?.firstName || null,
        senderLastName: sender?.lastName || null,
        senderAvatar: sender?.photoUrl || null,
        receiverName: receiverFullName || null,
        receiverUsername: receiver?.username || null,
        receiverFirstName: receiver?.firstName || null,
        receiverLastName: receiver?.lastName || null,
        receiverAvatar: receiver?.photoUrl || null,
        conversationId: message.conversationId,
      };

      const receiverSocketId = this.connectedUsers.get(receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', messageData);
      }

      client.emit('messageSent', messageData);

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Message sending error:', error);
      const isFollowRequired =
        error?.response === 'FOLLOW_REQUIRED' ||
        error?.message === 'FOLLOW_REQUIRED' ||
        error?.response?.message === 'FOLLOW_REQUIRED';
      if (isFollowRequired) {
        return { error: 'Follow required to send messages', code: 'FOLLOW_REQUIRED' };
      }
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.chatService.markMessageAsRead(data.messageId, client.user.id);

      const message = await this.chatService.getMessageById(data.messageId);
      if (message) {
        const senderSocketId = this.connectedUsers.get(message.senderId);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageRead', {
            messageId: data.messageId,
            readBy: client.user.id,
            readAt: new Date(),
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { error: 'Failed to mark message as read' };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { receiverId: number; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    const receiverId = Number(data.receiverId);
    if (!receiverId || Number.isNaN(receiverId)) return;

    const canMessage = await this.chatService.canUsersMessage(
      client.user.id,
      receiverId,
    );
    if (!canMessage) return;

    const receiverSocketId = this.connectedUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: client.user.id,
        username: client.user.username,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user || !data.conversationId) return;

    const hasAccess = await this.chatService.userHasConversationAccess(
      data.conversationId,
      client.user.id,
    );
    if (!hasAccess) return;

    client.join(`conversation_${data.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    client.leave(`conversation_${data.conversationId}`);
  }

  @SubscribeMessage('deleteConversation')
  async handleDeleteConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { error: 'Unauthorized' };
    }

    try {
      const result = await this.chatService.deleteConversation(
        data.conversationId,
        client.user.id,
      );

      client.emit('conversationDeleted', {
        conversationId: data.conversationId,
        deletedBy: result.deletedBy,
        deletedByUsername: result.deletedByUsername,
        deletedAt: new Date(),
        wasHardDeleted: result.wasHardDeleted,
      });

      if (!result.wasHardDeleted && result.conversation) {
        const otherParticipantId =
          result.conversation.participant1Id === client.user.id
            ? result.conversation.participant2Id
            : result.conversation.participant1Id;

        this.sendToUser(otherParticipantId, 'conversationDeleted', {
          conversationId: data.conversationId,
          deletedBy: result.deletedBy,
          deletedByUsername: result.deletedByUsername,
          deletedAt: new Date(),
          wasHardDeleted: false,
        });
      }

      return {
        success: true,
        message: result.wasHardDeleted
          ? 'Conversation permanently deleted'
          : 'Conversation deleted successfully',
        wasHardDeleted: result.wasHardDeleted,
      };
    } catch (error) {
      console.error('Delete conversation error:', error);
      return { error: 'Failed to delete conversation' };
    }
  }
}
