import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
interface AuthenticatedSocket extends Socket {
    user?: {
        id: number;
        username: string;
    };
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleMessage(data: {
        receiverId: number;
        content: string;
    }, client: AuthenticatedSocket): Promise<{
        error: string;
        success?: undefined;
        messageId?: undefined;
    } | {
        success: boolean;
        messageId: string;
        error?: undefined;
    }>;
    handleMarkAsRead(data: {
        messageId: string;
    }, client: AuthenticatedSocket): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleTyping(data: {
        receiverId: number;
        isTyping: boolean;
    }, client: AuthenticatedSocket): void;
    handleJoinConversation(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): void;
    handleLeaveConversation(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): void;
    handleDeleteConversation(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
        wasHardDeleted?: undefined;
    } | {
        success: boolean;
        message: string;
        wasHardDeleted: boolean;
        error?: undefined;
    }>;
}
export {};
