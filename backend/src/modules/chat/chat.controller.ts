import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // CHAT-6: Chat list screen — conversations with unread badges.
  @Get('conversations')
  listConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.listConversationsForUser(user);
  }

    // CHAT-4: GET paginated history endpoint.
  @Get('conversations/:id/messages')
  listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.chatService.listMessages(user, conversationId, query);
  }

  // CHAT-5: POST send a message (text and/or attachment).
  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user, conversationId, dto.body, dto.attachmentUrl);
  }
}