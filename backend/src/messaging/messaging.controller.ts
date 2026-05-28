import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagingService } from './messaging.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { MessageType } from '../../generated/prisma/enums.js';

interface SendMessageBody {
  contenu?: string;
  type?: MessageType;
}

@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get('conversations')
  getMyConversations(@CurrentUser() user: AuthUser) {
    return this.messagingService.getMyConversations(user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
  ) {
    return this.messagingService.getMessages(id, user.id, page ? +page : 1);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() body: SendMessageBody,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagingService.sendMessage(id, user.id, body);
  }

  @Post('conversations/:id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.messagingService.markRead(id, user.id);
  }

  @Post('conversations/private')
  createPrivate(
    @Body('userId') targetId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagingService.createPrivateConversation(user.id, targetId);
  }
}
