import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('conversations')
  async getUserConversations(@Request() req) {
    const userId = req.user.id;
    return this.chatService.getUserConversations(userId);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Request() req,
    @Query('limit') limit = '50',
    @Query('before') before?: string,
  ) {
    const userId = req.user.id;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const beforeId = before?.trim() || undefined;
    return this.chatService.getConversationMessages(
      conversationId,
      userId,
      limitNum,
      beforeId,
    );
  }

  @Get('search')
  async searchMessages(@Request() req, @Query('q') query: string) {
    const userId = req.user.id;
    if (!query || query.trim().length < 2) {
      return { error: 'Search query must be at least 2 characters long' };
    }
    return this.chatService.searchMessages(userId, query.trim());
  }

  @Post('conversations/:conversationId/read')
  async markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const markedCount = await this.chatService.markConversationAsRead(
      conversationId,
      userId,
    );
    return {
      success: true,
      message: 'Conversation marked as read',
      markedCount,
    };
  }

  @Get('online-users')
  async getOnlineUsers(@Request() req) {
    return this.chatService.getOnlineUsers(req.user.id);
  }

  @Delete('conversations/:conversationId')
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.chatService.deleteConversation(
      conversationId,
      userId,
    );

    if (!result.wasHardDeleted && result.conversation) {
      const otherParticipantId =
        result.conversation.participant1Id === userId
          ? result.conversation.participant2Id
          : result.conversation.participant1Id;

      this.chatGateway.sendToUser(otherParticipantId, 'conversationDeleted', {
        conversationId,
        deletedBy: result.deletedBy,
        deletedByUsername: result.deletedByUsername,
        deletedAt: new Date(),
        wasHardDeleted: false,
      });
    }

    return {
      success: true,
      message: result.wasHardDeleted
        ? 'Conversation permanently deleted'
        : 'Conversation deleted successfully',
      wasHardDeleted: result.wasHardDeleted,
      deletedBy: result.deletedBy,
      deletedByUsername: result.deletedByUsername,
    };
  }
}
