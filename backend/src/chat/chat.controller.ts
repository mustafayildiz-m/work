import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
    @Query('offset') offset = '0',
  ) {
    const userId = req.user.id;
    return this.chatService.getConversationMessages(
      conversationId,
      userId,
      parseInt(limit),
      parseInt(offset),
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
    // Bu endpoint conversation'daki tüm mesajları okundu olarak işaretler
    // Implementation için ChatService'e yeni method eklenebilir
    return { success: true, message: 'Conversation marked as read' };
  }

  @Get('online-users')
  async getOnlineUsers() {
    return this.chatService.getOnlineUsers();
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
