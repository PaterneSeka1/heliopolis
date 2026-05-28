import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /** Membres de ma paroisse (contacts automatiques) */
  @Get('parish')
  getParishMembers(@CurrentUser() user: AuthUser) {
    return this.contactsService.getParishMembers(user.id);
  }

  /** Mes contacts acceptés (hors paroisse) */
  @Get()
  getAccepted(@CurrentUser() user: AuthUser) {
    return this.contactsService.getAccepted(user.id);
  }

  /** Demandes reçues en attente */
  @Get('requests/received')
  getPendingReceived(@CurrentUser() user: AuthUser) {
    return this.contactsService.getPendingReceived(user.id);
  }

  /** Demandes envoyées en attente */
  @Get('requests/sent')
  getPendingSent(@CurrentUser() user: AuthUser) {
    return this.contactsService.getPendingSent(user.id);
  }

  /** Rechercher des utilisateurs à ajouter */
  @Get('search')
  search(@Query('q') q: string, @CurrentUser() user: AuthUser) {
    return this.contactsService.search(q, user.id);
  }

  /** Envoyer une demande de contact */
  @Post('request/:userId')
  sendRequest(
    @Param('userId') receiverId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.contactsService.sendRequest(user.id, receiverId);
  }

  /** Accepter une demande */
  @Patch(':id/accept')
  acceptRequest(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.contactsService.acceptRequest(id, user.id);
  }

  /** Refuser / annuler une demande */
  @Delete(':id')
  declineRequest(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.contactsService.declineRequest(id, user.id);
  }
}
