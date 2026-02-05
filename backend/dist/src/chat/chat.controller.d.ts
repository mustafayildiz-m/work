import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getUserConversations(req: any): Promise<any[]>;
    getConversationMessages(conversationId: string, req: any, limit?: string, offset?: string): Promise<import("./chat.service").MessageResponse[]>;
    searchMessages(req: any, query: string): Promise<import("./chat.service").MessageResponse[] | {
        error: string;
    }>;
    markConversationAsRead(conversationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getOnlineUsers(): Promise<{
        id: number;
        username: string;
        photoUrl?: string;
    }[]>;
    deleteConversation(conversationId: string, req: any): Promise<{
        success: boolean;
        message: string;
        wasHardDeleted: boolean;
        deletedBy: number;
        deletedByUsername: string;
    }>;
}
