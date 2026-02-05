import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class ChatService {
  // Online kullanıcıları takip etmek için in-memory Map
  private onlineUsers = new Map<number, { username: string; lastSeen: Date }>();

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateToken(
    token: string,
  ): Promise<{ id: number; username: string } | null> {
    try {
      // Remove "Bearer " prefix if exists
      let cleanToken = token;
      if (token.startsWith('Bearer ')) {
        cleanToken = token.substring(7);
      }

      const payload = this.jwtService.verify(cleanToken);

      return {
        id: parseInt(payload.sub),
        username: payload.username,
      };
    } catch (error) {
      console.error('Token validation error:', error.message);
      return null;
    }
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { senderId, receiverId, content } = createMessageDto;

    // Sender ve receiver'ın var olduğunu kontrol et
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    // Conversation'ı bul veya oluştur
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    // Mesajı oluştur
    const message = this.messageRepository.create({
      content,
      senderId,
      receiverId,
      conversationId: conversation.id,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Conversation'ın son mesaj zamanını güncelle
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    return savedMessage;
  }

  async findOrCreateConversation(
    user1Id: number,
    user2Id: number,
  ): Promise<Conversation> {
    // Mevcut conversation'ı ara (soft delete durumuna bakmaksızın)
    let conversation = await this.conversationRepository.findOne({
      where: [
        { participant1Id: user1Id, participant2Id: user2Id },
        { participant1Id: user2Id, participant2Id: user1Id },
      ],
    });

    if (conversation) {
      // Conversation bulundu, soft delete durumunu kontrol et
      const isUser1Participant1 = conversation.participant1Id === user1Id;
      const isDeletedByUser1 = isUser1Participant1
        ? conversation.deletedByParticipant1
        : conversation.deletedByParticipant2;
      const isDeletedByUser2 = isUser1Participant1
        ? conversation.deletedByParticipant2
        : conversation.deletedByParticipant1;

      // Eğer herhangi bir kullanıcı conversation'ı silmişse, restore et
      if (isDeletedByUser1 || isDeletedByUser2) {
        const updateData: any = {};

        // User1'in silme durumunu restore et
        if (isDeletedByUser1) {
          if (isUser1Participant1) {
            updateData.deletedByParticipant1 = false;
            updateData.deletedAtParticipant1 = undefined;
          } else {
            updateData.deletedByParticipant2 = false;
            updateData.deletedAtParticipant2 = undefined;
          }
        }

        // User2'nin silme durumunu restore et
        if (isDeletedByUser2) {
          if (isUser1Participant1) {
            updateData.deletedByParticipant2 = false;
            updateData.deletedAtParticipant2 = undefined;
          } else {
            updateData.deletedByParticipant1 = false;
            updateData.deletedAtParticipant1 = undefined;
          }
        }

        await this.conversationRepository.update(conversation.id, updateData);

        // Güncellenmiş conversation'ı al
        const updatedConversation = await this.conversationRepository.findOne({
          where: { id: conversation.id },
        });

        if (updatedConversation) {
          conversation = updatedConversation;
        }
      }
    } else {
      // Conversation bulunamadı, yeni oluştur
      conversation = this.conversationRepository.create({
        participant1Id: user1Id,
        participant2Id: user2Id,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async getConversationMessages(
    conversationId: string,
    userId: number,
    limit = 50,
    offset = 0,
  ): Promise<MessageResponse[]> {
    // User'ın bu conversation'a erişim yetkisi var mı kontrol et
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: userId },
        { id: conversationId, participant2Id: userId },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere(
        '(message.senderId = :userId AND message.deletedBySender = false) OR (message.receiverId = :userId AND message.deletedByReceiver = false)',
        { userId },
      )
      .orderBy('message.createdAt', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    return messages.map((message) => ({
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

  async getUserConversations(userId: number): Promise<any[]> {
    const conversations = await this.conversationRepository.find({
      where: [
        {
          participant1Id: userId,
          deletedByParticipant1: false,
        },
        {
          participant2Id: userId,
          deletedByParticipant2: false,
        },
      ],
      relations: ['participant1', 'participant2'],
      order: { lastMessageAt: 'DESC' },
    });

    return conversations.map((conv) => {
      const otherParticipant =
        conv.participant1Id === userId ? conv.participant2 : conv.participant1;
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

  async markMessageAsRead(messageId: string, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException('Message not found or access denied');
    }

    message.status = MessageStatus.READ;
    await this.messageRepository.save(message);
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return this.messageRepository.findOne({ where: { id: messageId } });
  }

  async setUserOnline(userId: number, isOnline: boolean): Promise<void> {
    if (isOnline) {
      // User'ı online olarak işaretle
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        this.onlineUsers.set(userId, {
          username: user.username,
          lastSeen: new Date(),
        });
      }
    } else {
      // User'ı offline olarak işaretle
      const userInfo = this.onlineUsers.get(userId);
      if (userInfo) {
        this.onlineUsers.delete(userId);
      }
    }
  }

  async getOnlineUsers(): Promise<
    Array<{ id: number; username: string; photoUrl?: string }>
  > {
    // Online kullanıcıların ID, username ve photoUrl'lerini döndür
    const onlineUsers: Array<{
      id: number;
      username: string;
      photoUrl?: string;
    }> = [];

    for (const [userId, userInfo] of this.onlineUsers.entries()) {
      // User'ın güncel bilgilerini veritabanından al (photoUrl için)
      const user = await this.userRepository.findOne({ where: { id: userId } });

      onlineUsers.push({
        id: userId,
        username: userInfo.username,
        photoUrl: user?.photoUrl || undefined,
      });
    }

    return onlineUsers;
  }

  async deleteMessage(messageId: string, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Sadece mesajı gönderen kişi silebilir
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    // Soft delete - sadece gönderen için mesajı gizle
    await this.messageRepository.update(messageId, {
      deletedBySender: true,
      deletedAtSender: new Date(),
    });

    // Eğer alıcı da mesajı silmişse, o zaman hard delete yap
    const updatedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (updatedMessage?.deletedBySender && updatedMessage?.deletedByReceiver) {
      await this.messageRepository.delete(messageId);
    }
  }

  async searchMessages(
    userId: number,
    query: string,
  ): Promise<MessageResponse[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId OR message.receiverId = :userId) AND message.content LIKE :query',
        { userId, query: `%${query}%` },
      )
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    return messages.map((message) => ({
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

  async deleteConversation(
    conversationId: string,
    userId: number,
  ): Promise<{
    wasHardDeleted: boolean;
    deletedBy: number;
    deletedByUsername: string;
    conversation?: Conversation;
  }> {
    // Kullanıcı bilgisini al
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Conversation'ı bul ve kullanıcının erişim yetkisi var mı kontrol et
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: userId },
        { id: conversationId, participant2Id: userId },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Soft delete - sadece o kullanıcı için conversation'ı gizle
    const isParticipant1 = conversation.participant1Id === userId;
    const updateData = isParticipant1
      ? {
          deletedByParticipant1: true,
          deletedAtParticipant1: new Date(),
        }
      : {
          deletedByParticipant2: true,
          deletedAtParticipant2: new Date(),
        };

    await this.conversationRepository.update(conversationId, updateData);

    // Eğer her iki katılımcı da conversation'ı sildiyse, o zaman hard delete yap
    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (
      updatedConversation?.deletedByParticipant1 &&
      updatedConversation?.deletedByParticipant2
    ) {
      // Her iki taraf da sildiyse, conversation'ı ve mesajlarını tamamen sil
      await this.messageRepository.delete({ conversationId: conversationId });
      await this.conversationRepository.delete(conversationId);
      return {
        wasHardDeleted: true,
        deletedBy: userId,
        deletedByUsername: user.username,
      };
    }

    return {
      wasHardDeleted: false,
      deletedBy: userId,
      deletedByUsername: user.username,
      conversation: updatedConversation || undefined,
    };
  }

  async getConversationById(
    conversationId: string,
  ): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
    });
  }
}
