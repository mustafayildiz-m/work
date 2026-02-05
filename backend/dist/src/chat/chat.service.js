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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const message_entity_1 = require("../entities/message.entity");
const conversation_entity_1 = require("../entities/conversation.entity");
const user_entity_1 = require("../users/entities/user.entity");
let ChatService = class ChatService {
    constructor(messageRepository, conversationRepository, userRepository, jwtService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.onlineUsers = new Map();
    }
    async validateToken(token) {
        try {
            let cleanToken = token;
            if (token.startsWith('Bearer ')) {
                cleanToken = token.substring(7);
            }
            const payload = this.jwtService.verify(cleanToken);
            return {
                id: parseInt(payload.sub),
                username: payload.username,
            };
        }
        catch (error) {
            console.error('Token validation error:', error.message);
            return null;
        }
    }
    async createMessage(createMessageDto) {
        const { senderId, receiverId, content } = createMessageDto;
        const sender = await this.userRepository.findOne({ where: { id: senderId } });
        const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
        if (!sender || !receiver) {
            throw new common_1.NotFoundException('Sender or receiver not found');
        }
        let conversation = await this.findOrCreateConversation(senderId, receiverId);
        const message = this.messageRepository.create({
            content,
            senderId,
            receiverId,
            conversationId: conversation.id,
            status: message_entity_1.MessageStatus.SENT,
        });
        const savedMessage = await this.messageRepository.save(message);
        conversation.lastMessageAt = new Date();
        await this.conversationRepository.save(conversation);
        return savedMessage;
    }
    async findOrCreateConversation(user1Id, user2Id) {
        let conversation = await this.conversationRepository.findOne({
            where: [
                { participant1Id: user1Id, participant2Id: user2Id },
                { participant1Id: user2Id, participant2Id: user1Id },
            ],
        });
        if (conversation) {
            const isUser1Participant1 = conversation.participant1Id === user1Id;
            const isDeletedByUser1 = isUser1Participant1 ? conversation.deletedByParticipant1 : conversation.deletedByParticipant2;
            const isDeletedByUser2 = isUser1Participant1 ? conversation.deletedByParticipant2 : conversation.deletedByParticipant1;
            if (isDeletedByUser1 || isDeletedByUser2) {
                const updateData = {};
                if (isDeletedByUser1) {
                    if (isUser1Participant1) {
                        updateData.deletedByParticipant1 = false;
                        updateData.deletedAtParticipant1 = undefined;
                    }
                    else {
                        updateData.deletedByParticipant2 = false;
                        updateData.deletedAtParticipant2 = undefined;
                    }
                }
                if (isDeletedByUser2) {
                    if (isUser1Participant1) {
                        updateData.deletedByParticipant2 = false;
                        updateData.deletedAtParticipant2 = undefined;
                    }
                    else {
                        updateData.deletedByParticipant1 = false;
                        updateData.deletedAtParticipant1 = undefined;
                    }
                }
                await this.conversationRepository.update(conversation.id, updateData);
                const updatedConversation = await this.conversationRepository.findOne({
                    where: { id: conversation.id }
                });
                if (updatedConversation) {
                    conversation = updatedConversation;
                }
            }
        }
        else {
            conversation = this.conversationRepository.create({
                participant1Id: user1Id,
                participant2Id: user2Id,
            });
            await this.conversationRepository.save(conversation);
        }
        return conversation;
    }
    async getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
        const conversation = await this.conversationRepository.findOne({
            where: [
                { id: conversationId, participant1Id: userId },
                { id: conversationId, participant2Id: userId },
            ],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found or access denied');
        }
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('message.conversationId = :conversationId', { conversationId })
            .andWhere('(message.senderId = :userId AND message.deletedBySender = false) OR (message.receiverId = :userId AND message.deletedByReceiver = false)', { userId })
            .orderBy('message.createdAt', 'ASC')
            .skip(offset)
            .take(limit)
            .getMany();
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            status: message.status,
            createdAt: message.createdAt,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                photoUrl: message.sender.photoUrl || undefined,
            },
            receiver: {
                id: message.receiver.id,
                username: message.receiver.username,
                photoUrl: message.receiver.photoUrl || undefined,
            },
        }));
    }
    async getUserConversations(userId) {
        const conversations = await this.conversationRepository.find({
            where: [
                {
                    participant1Id: userId,
                    deletedByParticipant1: false
                },
                {
                    participant2Id: userId,
                    deletedByParticipant2: false
                },
            ],
            relations: ['participant1', 'participant2'],
            order: { lastMessageAt: 'DESC' },
        });
        return conversations.map(conv => {
            const otherParticipant = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
            return {
                id: conv.id,
                participant: {
                    id: otherParticipant.id,
                    username: otherParticipant.username,
                    photoUrl: otherParticipant.photoUrl || undefined,
                },
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
            };
        });
    }
    async markMessageAsRead(messageId, userId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId, receiverId: userId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found or access denied');
        }
        message.status = message_entity_1.MessageStatus.READ;
        await this.messageRepository.save(message);
    }
    async getMessageById(messageId) {
        return this.messageRepository.findOne({ where: { id: messageId } });
    }
    async setUserOnline(userId, isOnline) {
        if (isOnline) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (user) {
                this.onlineUsers.set(userId, {
                    username: user.username,
                    lastSeen: new Date()
                });
            }
        }
        else {
            const userInfo = this.onlineUsers.get(userId);
            if (userInfo) {
                this.onlineUsers.delete(userId);
            }
        }
    }
    async getOnlineUsers() {
        const onlineUsers = [];
        for (const [userId, userInfo] of this.onlineUsers.entries()) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            onlineUsers.push({
                id: userId,
                username: userInfo.username,
                photoUrl: user?.photoUrl || undefined
            });
        }
        return onlineUsers;
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.BadRequestException('You can only delete your own messages');
        }
        await this.messageRepository.update(messageId, {
            deletedBySender: true,
            deletedAtSender: new Date()
        });
        const updatedMessage = await this.messageRepository.findOne({
            where: { id: messageId }
        });
        if (updatedMessage?.deletedBySender && updatedMessage?.deletedByReceiver) {
            await this.messageRepository.delete(messageId);
        }
    }
    async searchMessages(userId, query) {
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('(message.senderId = :userId OR message.receiverId = :userId) AND message.content LIKE :query', { userId, query: `%${query}%` })
            .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('message.createdAt', 'DESC')
            .getMany();
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            status: message.status,
            createdAt: message.createdAt,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                photoUrl: message.sender.photoUrl || undefined,
            },
            receiver: {
                id: message.receiver.id,
                username: message.receiver.username,
                photoUrl: message.receiver.photoUrl || undefined,
            },
        }));
    }
    async deleteConversation(conversationId, userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'username']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const conversation = await this.conversationRepository.findOne({
            where: [
                { id: conversationId, participant1Id: userId },
                { id: conversationId, participant2Id: userId },
            ],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found or access denied');
        }
        const isParticipant1 = conversation.participant1Id === userId;
        const updateData = isParticipant1
            ? {
                deletedByParticipant1: true,
                deletedAtParticipant1: new Date()
            }
            : {
                deletedByParticipant2: true,
                deletedAtParticipant2: new Date()
            };
        await this.conversationRepository.update(conversationId, updateData);
        const updatedConversation = await this.conversationRepository.findOne({
            where: { id: conversationId }
        });
        if (updatedConversation?.deletedByParticipant1 && updatedConversation?.deletedByParticipant2) {
            await this.messageRepository.delete({ conversationId: conversationId });
            await this.conversationRepository.delete(conversationId);
            return { wasHardDeleted: true, deletedBy: userId, deletedByUsername: user.username };
        }
        return { wasHardDeleted: false, deletedBy: userId, deletedByUsername: user.username, conversation: updatedConversation || undefined };
    }
    async getConversationById(conversationId) {
        return this.conversationRepository.findOne({
            where: { id: conversationId },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], ChatService);
//# sourceMappingURL=chat.service.js.map