import { User } from '../users/entities/user.entity';
import { Conversation } from './conversation.entity';
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class Message {
    id: string;
    content: string;
    status: MessageStatus;
    senderId: number;
    receiverId: number;
    conversationId: string;
    sender: User;
    receiver: User;
    conversation: Conversation;
    isDeleted: boolean;
    deletedBySender: boolean;
    deletedByReceiver: boolean;
    deletedAtSender: Date;
    deletedAtReceiver: Date;
    createdAt: Date;
    updatedAt: Date;
}
