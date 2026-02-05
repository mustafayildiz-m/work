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
    origin: '*',
  },
  namespace: '/chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // WsJwtGuard already set client.user, so we can use it directly
      if (client.user) {
        this.connectedUsers.set(client.user.id, client.id);

        // User'ı online olarak işaretle
        await this.chatService.setUserOnline(client.user.id, true);

        // Online olan user'ları broadcast et
        this.server.emit('userOnline', {
          userId: client.user.id,
          username: client.user.username,
        });
      } else {
        // Fallback: JWT token'dan user bilgisini al
        const token =
          client.handshake.auth.token || client.handshake.headers.authorization;

        if (token) {
          const user = await this.chatService.validateToken(token);

          if (user) {
            client.user = user;
            this.connectedUsers.set(user.id, client.id);

            // User'ı online olarak işaretle
            await this.chatService.setUserOnline(user.id, true);

            // Online olan user'ları broadcast et
            this.server.emit('userOnline', {
              userId: user.id,
              username: user.username,
            });
          }
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.id);

      // User'ı offline olarak işaretle
      await this.chatService.setUserOnline(client.user.id, false);

      // Offline olan user'ı broadcast et
      this.server.emit('userOffline', {
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
      const message = await this.chatService.createMessage({
        senderId: client.user.id,
        receiverId: data.receiverId,
        content: data.content,
      });

      // Mesaj objesini hazırla
      const messageData = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: message.createdAt,
        status: message.status,
        senderName: client.user.username,
        conversationId: message.conversationId,
      };

      // Receiver'a mesajı gönder
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', messageData);
      }

      // Sender'a confirmation gönder (aynı mesaj formatında)
      client.emit('messageSent', messageData);

      // Broadcast to all connected clients in the same conversation
      this.server.emit('messageUpdate', {
        type: 'new',
        message: messageData,
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Message sending error:', error);
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

      // Sender'a read status'u bildir
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
  handleTyping(
    @MessageBody() data: { receiverId: number; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: client.user.id,
        username: client.user.username,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

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

      // Conversation'ı silen kullanıcıya confirmation gönder
      client.emit('conversationDeleted', {
        conversationId: data.conversationId,
        deletedBy: result.deletedBy,
        deletedByUsername: result.deletedByUsername,
        deletedAt: new Date(),
        wasHardDeleted: result.wasHardDeleted,
      });

      // Eğer hard delete yapılmadıysa, diğer katılımcıya da bildirim gönder
      if (!result.wasHardDeleted && result.conversation) {
        const otherParticipantId =
          result.conversation.participant1Id === client.user.id
            ? result.conversation.participant2Id
            : result.conversation.participant1Id;

        const otherParticipantSocketId =
          this.connectedUsers.get(otherParticipantId);
        if (otherParticipantSocketId) {
          this.server.to(otherParticipantSocketId).emit('conversationDeleted', {
            conversationId: data.conversationId,
            deletedBy: result.deletedBy,
            deletedByUsername: result.deletedByUsername,
            deletedAt: new Date(),
            wasHardDeleted: false,
          });
        }
      } else if (result.wasHardDeleted) {
        // Hard delete yapıldıysa, tüm katılımcılara bildirim gönder
        // (Bu durumda conversation artık yok, bu yüzden mevcut katılımcıları bulamayız)
        // Bu durumda sadece silen kullanıcıya bildirim yeterli
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
