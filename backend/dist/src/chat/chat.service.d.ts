import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Message, MessageStatus } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../users/entities/user.entity';
export interface CreateMessageDto {
    senderId: number;
    receiverId: number;
    content: string;
}
export interface MessageResponse {
    id: string;
    content: string;
    senderId: number;
    receiverId: number;
    status: MessageStatus;
    createdAt: Date;
    sender: {
        id: number;
        username: string;
        photoUrl?: string;
    };
    receiver: {
        id: number;
        username: string;
        photoUrl?: string;
    };
}
export declare class ChatService {
    private messageRepository;
    private conversationRepository;
    private userRepository;
    private jwtService;
    private onlineUsers;
    constructor(messageRepository: Repository<Message>, conversationRepository: Repository<Conversation>, userRepository: Repository<User>, jwtService: JwtService);
    validateToken(token: string): Promise<{
        id: number;
        username: string;
    } | null>;
    createMessage(createMessageDto: CreateMessageDto): Promise<Message>;
    findOrCreateConversation(user1Id: number, user2Id: number): Promise<Conversation>;
    getConversationMessages(conversationId: string, userId: number, limit?: number, offset?: number): Promise<MessageResponse[]>;
    getUserConversations(userId: number): Promise<any[]>;
    markMessageAsRead(messageId: string, userId: number): Promise<void>;
    getMessageById(messageId: string): Promise<Message | null>;
    setUserOnline(userId: number, isOnline: boolean): Promise<void>;
    getOnlineUsers(): Promise<Array<{
        id: number;
        username: string;
        photoUrl?: string;
    }>>;
    deleteMessage(messageId: string, userId: number): Promise<void>;
    searchMessages(userId: number, query: string): Promise<MessageResponse[]>;
    deleteConversation(conversationId: string, userId: number): Promise<{
        wasHardDeleted: boolean;
        deletedBy: number;
        deletedByUsername: string;
        conversation?: Conversation;
    }>;
    getConversationById(conversationId: string): Promise<Conversation | null>;
}
