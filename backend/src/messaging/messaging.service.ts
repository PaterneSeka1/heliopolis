import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MessageType } from '../../generated/prisma/enums.js';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async assertMember(conversationId: string, userId: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member || member.leftAt) {
      throw new ForbiddenException('Accès refusé à cette conversation');
    }
    return member;
  }

  async getMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: { some: { userId, leftAt: null } },
        archivedAt: null,
      },
      include: {
        members: {
          where: { userId },
          select: { lastReadAt: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            author: { select: { id: true, nom: true, prenoms: true } },
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    await this.assertMember(conversationId, userId);

    const skip = (page - 1) * limit;
    return this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: {
        author: {
          select: { id: true, nom: true, prenoms: true, avatarUrl: true },
        },
        attachments: { include: { media: true } },
        replyTo: { include: { author: { select: { id: true, nom: true } } } },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    });
  }

  async sendMessage(
    conversationId: string,
    authorId: string,
    data: { contenu?: string; type?: MessageType },
  ) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversation introuvable');
    await this.assertMember(conversationId, authorId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        authorId,
        contenu: data.contenu,
        type: data.type ?? MessageType.TEXTE,
      },
      include: {
        author: {
          select: { id: true, nom: true, prenoms: true, avatarUrl: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);
    return this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  async createPrivateConversation(userId1: string, userId2: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: 'PRIVE',
        members: { some: { userId: userId1 } },
        AND: [{ members: { some: { userId: userId2 } } }],
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        type: 'PRIVE',
        members: {
          create: [
            { userId: userId1, role: 'MEMBRE' },
            { userId: userId2, role: 'MEMBRE' },
          ],
        },
      },
    });
  }
}
