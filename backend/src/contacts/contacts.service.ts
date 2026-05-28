import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContactStatus } from '../../generated/prisma/enums.js';

const USER_MINI = {
  id: true,
  nom: true,
  prenoms: true,
  avatarUrl: true,
  role: true,
  parish: { select: { id: true, nom: true } },
  district: { select: { id: true, nom: true } },
};

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  /** Membres de la même paroisse — contacts automatiques */
  async getParishMembers(userId: string) {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { parishId: true },
    });
    if (!me?.parishId) return [];

    return this.prisma.user.findMany({
      where: {
        parishId: me.parishId,
        id: { not: userId },
        deletedAt: null,
      },
      select: USER_MINI,
      orderBy: [{ nom: 'asc' }, { prenoms: 'asc' }],
    });
  }

  /** Contacts acceptés (hors paroisse) */
  async getAccepted(userId: string) {
    const rows = await this.prisma.contact.findMany({
      where: {
        OR: [
          { requesterId: userId, status: ContactStatus.ACCEPTED },
          { receiverId: userId, status: ContactStatus.ACCEPTED },
        ],
      },
      include: {
        requester: { select: USER_MINI },
        receiver: { select: USER_MINI },
      },
    });

    return rows.map((c) => ({
      contactId: c.id,
      user: c.requesterId === userId ? c.receiver : c.requester,
      since: c.updatedAt,
    }));
  }

  /** Demandes reçues en attente */
  async getPendingReceived(userId: string) {
    return this.prisma.contact.findMany({
      where: { receiverId: userId, status: ContactStatus.PENDING },
      include: { requester: { select: USER_MINI } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Demandes envoyées en attente */
  async getPendingSent(userId: string) {
    return this.prisma.contact.findMany({
      where: { requesterId: userId, status: ContactStatus.PENDING },
      include: { receiver: { select: USER_MINI } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Envoyer une demande de contact */
  async sendRequest(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) {
      throw new BadRequestException('Impossible de s\'ajouter soi-même');
    }

    // Vérifier si le destinataire existe
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, parishId: true },
    });
    if (!receiver) throw new NotFoundException('Utilisateur introuvable');

    // Vérifier si déjà dans la même paroisse
    const me = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { parishId: true },
    });
    if (me?.parishId && me.parishId === receiver.parishId) {
      throw new BadRequestException('Cet utilisateur est déjà dans ta paroisse');
    }

    // Vérifier si une relation existe déjà
    const existing = await this.prisma.contact.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });
    if (existing) {
      if (existing.status === ContactStatus.ACCEPTED) {
        throw new BadRequestException('Vous êtes déjà contacts');
      }
      if (existing.status === ContactStatus.PENDING) {
        throw new BadRequestException('Une demande est déjà en attente');
      }
      // DECLINED ou BLOCKED : réactiver
      return this.prisma.contact.update({
        where: { id: existing.id },
        data: { status: ContactStatus.PENDING, requesterId, receiverId, updatedAt: new Date() },
      });
    }

    return this.prisma.contact.create({
      data: { requesterId, receiverId, status: ContactStatus.PENDING },
    });
  }

  /** Accepter une demande */
  async acceptRequest(contactId: string, userId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Demande introuvable');
    if (contact.receiverId !== userId) throw new ForbiddenException('Non autorisé');
    if (contact.status !== ContactStatus.PENDING) {
      throw new BadRequestException('Demande déjà traitée');
    }

    const updated = await this.prisma.contact.update({
      where: { id: contactId },
      data: { status: ContactStatus.ACCEPTED },
    });

    // Créer automatiquement une conversation privée
    await this.prisma.conversation.create({
      data: {
        type: 'PRIVE',
        members: {
          create: [
            { userId: contact.requesterId },
            { userId: contact.receiverId },
          ],
        },
      },
    });

    return updated;
  }

  /** Refuser ou supprimer une demande */
  async declineRequest(contactId: string, userId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Demande introuvable');
    if (contact.receiverId !== userId && contact.requesterId !== userId) {
      throw new ForbiddenException('Non autorisé');
    }
    return this.prisma.contact.update({
      where: { id: contactId },
      data: { status: ContactStatus.DECLINED },
    });
  }

  /** Rechercher des utilisateurs (hors paroisse) */
  async search(query: string, userId: string) {
    if (!query || query.length < 2) return [];

    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { parishId: true },
    });

    return this.prisma.user.findMany({
      where: {
        id: { not: userId },
        parishId: me?.parishId ? { not: me.parishId } : undefined,
        deletedAt: null,
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { prenoms: { contains: query, mode: 'insensitive' } },
          { matricule: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: USER_MINI,
      take: 20,
    });
  }
}
