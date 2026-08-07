import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Message, MessageStatus } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { UserFollow } from '../entities/user-follow.entity';

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
  conversationId: string;
  status: MessageStatus;
  timestamp: Date;
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
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    private jwtService: JwtService,
  ) {}

  private static readonly MAX_MESSAGE_LENGTH = 5000;

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
      const userId = parseInt(payload.sub, 10);
      if (!userId || Number.isNaN(userId)) {
        return null;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'isActive'],
      });

      if (!user?.isActive) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
      };
    } catch (error) {
      console.error('Token validation error:', error.message);
      return null;
    }
  }

  async canUsersMessage(user1Id: number, user2Id: number): Promise<boolean> {
    const [aFollowsB, bFollowsA] = await Promise.all([
      this.userFollowRepository.findOne({
        where: {
          follower_id: user1Id,
          following_id: user2Id,
          status: 'accepted',
        },
      }),
      this.userFollowRepository.findOne({
        where: {
          follower_id: user2Id,
          following_id: user1Id,
          status: 'accepted',
        },
      }),
    ]);
    return Boolean(aFollowsB && bFollowsA);
  }

  async userHasConversationAccess(
    conversationId: string,
    userId: number,
  ): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: userId },
        { id: conversationId, participant2Id: userId },
      ],
      select: ['id'],
    });
    return Boolean(conversation);
  }

  async getMutualConnectionUserIds(userId: number): Promise<number[]> {
    const following = await this.userFollowRepository.find({
      where: { follower_id: userId, status: 'accepted' },
      select: ['following_id'],
    });
    if (!following.length) return [];

    const followingIds = following.map((f) => f.following_id);
    const mutual = await this.userFollowRepository.find({
      where: followingIds.map((followingId) => ({
        follower_id: followingId,
        following_id: userId,
        status: 'accepted',
      })),
      select: ['follower_id'],
    });
    return mutual.map((m) => m.follower_id);
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { senderId, receiverId, content } = createMessageDto;
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Message content cannot be empty');
    }
    if (trimmedContent.length > ChatService.MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message content cannot exceed ${ChatService.MAX_MESSAGE_LENGTH} characters`,
      );
    }

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

    if (!(await this.canUsersMessage(senderId, receiverId))) {
      throw new ForbiddenException('FOLLOW_REQUIRED');
    }

    // Conversation'ı bul veya oluştur
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    // Mesajı oluştur
    const message = this.messageRepository.create({
      content: trimmedContent,
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

  private mapMessageToResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      conversationId: message.conversationId,
      status: message.status,
      timestamp: message.createdAt,
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
    };
  }

  async getConversationMessages(
    conversationId: string,
    userId: number,
    limit = 50,
    before?: string,
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: userId },
        { id: conversationId, participant2Id: userId },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const visibilityFilter =
      '(message.senderId = :userId AND message.deletedBySender = false) OR (message.receiverId = :userId AND message.deletedByReceiver = false)';

    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere(visibilityFilter, { userId });

    if (before) {
      const cursor = await this.messageRepository
        .createQueryBuilder('message')
        .where('message.id = :before', { before })
        .andWhere('message.conversationId = :conversationId', { conversationId })
        .andWhere(visibilityFilter, { userId })
        .getOne();

      if (cursor) {
        query.andWhere(
          '(message.createdAt < :cursorAt OR (message.createdAt = :cursorAt AND message.id < :cursorId))',
          {
            cursorAt: cursor.createdAt,
            cursorId: cursor.id,
          },
        );
      }
    }

    const rows = await query
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const page = (hasMore ? rows.slice(0, limit) : rows).reverse();

    return {
      messages: page.map((message) => this.mapMessageToResponse(message)),
      hasMore,
    };
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

    const conversationsWithMeta = await Promise.all(
      conversations.map(async (conv) => {
        const lastVisibleMessage = await this.messageRepository
          .createQueryBuilder('message')
          .where('message.conversationId = :conversationId', {
            conversationId: conv.id,
          })
          .andWhere(
            '(message.senderId = :userId AND message.deletedBySender = false) OR (message.receiverId = :userId AND message.deletedByReceiver = false)',
            { userId },
          )
          .orderBy('message.createdAt', 'DESC')
          .getOne();

        const unreadCount = await this.messageRepository
          .createQueryBuilder('message')
          .where('message.conversationId = :conversationId', {
            conversationId: conv.id,
          })
          .andWhere('message.receiverId = :userId', { userId })
          .andWhere('message.deletedByReceiver = false')
          .andWhere('message.status != :readStatus', {
            readStatus: MessageStatus.READ,
          })
          .getCount();

        return {
          conv,
          lastVisibleMessage,
          unreadCount,
        };
      }),
    );

    return conversationsWithMeta.map(({ conv, lastVisibleMessage, unreadCount }) => {
      const otherParticipant =
        conv.participant1Id === userId ? conv.participant2 : conv.participant1;
      const fullName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim();

      return {
        id: conv.id,
        participant: {
          id: otherParticipant.id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          username: otherParticipant.username,
          photoUrl: otherParticipant.photoUrl || undefined,
        },
        participantName: fullName || otherParticipant.username,
        lastMessage: lastVisibleMessage?.content || '',
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
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

  async markConversationAsRead(
    conversationId: string,
    userId: number,
  ): Promise<number> {
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, participant1Id: userId },
        { id: conversationId, participant2Id: userId },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('status != :readStatus', { readStatus: MessageStatus.READ })
      .andWhere('deletedByReceiver = false')
      .execute();

    return result.affected || 0;
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return this.messageRepository.findOne({ where: { id: messageId } });
  }

  async getUserBasic(userId: number): Promise<{
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  } | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      photoUrl: user.photoUrl || undefined,
    };
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

  async getOnlineUsers(
    requestingUserId: number,
  ): Promise<Array<{ id: number; username: string; photoUrl?: string }>> {
    const allowedIds = new Set(
      await this.getMutualConnectionUserIds(requestingUserId),
    );
    const onlineUsers: Array<{
      id: number;
      username: string;
      photoUrl?: string;
    }> = [];

    for (const [userId, userInfo] of this.onlineUsers.entries()) {
      if (!allowedIds.has(userId)) continue;

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
      .andWhere(
        '(message.senderId = :userId AND message.deletedBySender = false) OR (message.receiverId = :userId AND message.deletedByReceiver = false)',
        { userId },
      )
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      conversationId: message.conversationId,
      status: message.status,
      timestamp: message.createdAt,
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
