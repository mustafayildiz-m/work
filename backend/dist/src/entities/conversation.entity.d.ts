import { User } from '../users/entities/user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    participant1Id: number;
    participant2Id: number;
    participant1: User;
    participant2: User;
    messages: Message[];
    lastMessageAt: Date;
    isDeleted: boolean;
    deletedByParticipant1: boolean;
    deletedByParticipant2: boolean;
    deletedAtParticipant1: Date;
    deletedAtParticipant2: Date;
    createdAt: Date;
    updatedAt: Date;
}
