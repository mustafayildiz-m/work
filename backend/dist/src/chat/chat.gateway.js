"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("../auth/guards/ws-jwt.guard");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            if (client.user) {
                this.connectedUsers.set(client.user.id, client.id);
                await this.chatService.setUserOnline(client.user.id, true);
                this.server.emit('userOnline', { userId: client.user.id, username: client.user.username });
            }
            else {
                const token = client.handshake.auth.token || client.handshake.headers.authorization;
                if (token) {
                    const user = await this.chatService.validateToken(token);
                    if (user) {
                        client.user = user;
                        this.connectedUsers.set(user.id, client.id);
                        await this.chatService.setUserOnline(user.id, true);
                        this.server.emit('userOnline', { userId: user.id, username: user.username });
                    }
                }
            }
        }
        catch (error) {
            console.error('Connection error:', error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.user) {
            this.connectedUsers.delete(client.user.id);
            await this.chatService.setUserOnline(client.user.id, false);
            this.server.emit('userOffline', { userId: client.user.id, username: client.user.username });
        }
    }
    async handleMessage(data, client) {
        if (!client.user) {
            return { error: 'Unauthorized' };
        }
        try {
            const message = await this.chatService.createMessage({
                senderId: client.user.id,
                receiverId: data.receiverId,
                content: data.content,
            });
            const messageData = {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                timestamp: message.createdAt,
                status: message.status,
                senderName: client.user.username,
                conversationId: message.conversationId
            };
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('newMessage', messageData);
            }
            client.emit('messageSent', messageData);
            this.server.emit('messageUpdate', {
                type: 'new',
                message: messageData
            });
            return { success: true, messageId: message.id };
        }
        catch (error) {
            console.error('Message sending error:', error);
            return { error: 'Failed to send message' };
        }
    }
    async handleMarkAsRead(data, client) {
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
        }
        catch (error) {
            console.error('Mark as read error:', error);
            return { error: 'Failed to mark message as read' };
        }
    }
    handleTyping(data, client) {
        if (!client.user)
            return;
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('userTyping', {
                userId: client.user.id,
                username: client.user.username,
                isTyping: data.isTyping,
            });
        }
    }
    handleJoinConversation(data, client) {
        if (!client.user)
            return;
        client.join(`conversation_${data.conversationId}`);
    }
    handleLeaveConversation(data, client) {
        if (!client.user)
            return;
        client.leave(`conversation_${data.conversationId}`);
    }
    async handleDeleteConversation(data, client) {
        if (!client.user) {
            return { error: 'Unauthorized' };
        }
        try {
            const result = await this.chatService.deleteConversation(data.conversationId, client.user.id);
            client.emit('conversationDeleted', {
                conversationId: data.conversationId,
                deletedBy: result.deletedBy,
                deletedByUsername: result.deletedByUsername,
                deletedAt: new Date(),
                wasHardDeleted: result.wasHardDeleted,
            });
            if (!result.wasHardDeleted && result.conversation) {
                const otherParticipantId = result.conversation.participant1Id === client.user.id
                    ? result.conversation.participant2Id
                    : result.conversation.participant1Id;
                const otherParticipantSocketId = this.connectedUsers.get(otherParticipantId);
                if (otherParticipantSocketId) {
                    this.server.to(otherParticipantSocketId).emit('conversationDeleted', {
                        conversationId: data.conversationId,
                        deletedBy: result.deletedBy,
                        deletedByUsername: result.deletedByUsername,
                        deletedAt: new Date(),
                        wasHardDeleted: false,
                    });
                }
            }
            else if (result.wasHardDeleted) {
            }
            return {
                success: true,
                message: result.wasHardDeleted
                    ? 'Conversation permanently deleted'
                    : 'Conversation deleted successfully',
                wasHardDeleted: result.wasHardDeleted
            };
        }
        catch (error) {
            console.error('Delete conversation error:', error);
            return { error: 'Failed to delete conversation' };
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteConversation", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/chat',
    }),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map