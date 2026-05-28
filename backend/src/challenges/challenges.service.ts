import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChallengeDto } from './dto/create-challenge.dto.js';
import type { Prisma } from '../../generated/prisma/client.js';
import {
  ChallengeCategory,
  ChallengeStatus,
  UserRole,
} from '../../generated/prisma/enums.js';
import type { AuthUser } from '../common/types/auth-user.js';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  private submissionScopeWhere(actor: AuthUser): Prisma.SubmissionWhereInput {
    if (actor.role === UserRole.ADMIN) return {};
    if (actor.role === UserRole.REGION) {
      return actor.regionId
        ? { gardien: { regionId: actor.regionId } }
        : { id: '__no_scope__' };
    }
    if (actor.role === UserRole.SENTINELLE) {
      return actor.districtId
        ? { gardien: { districtId: actor.districtId } }
        : { id: '__no_scope__' };
    }
    if (actor.role === UserRole.GUIDE) {
      return actor.parishId
        ? { gardien: { parishId: actor.parishId } }
        : { id: '__no_scope__' };
    }
    return { gardienId: actor.id };
  }

  async findAll(filters?: {
    categorie?: ChallengeCategory;
    statut?: ChallengeStatus;
    campId?: string;
  }) {
    const where: Prisma.ChallengeWhereInput = {
      statut: filters?.statut ?? ChallengeStatus.ACTIF,
    };
    if (filters?.categorie) where.categorie = filters.categorie;
    if (filters?.campId) where.campId = filters.campId;
    return this.prisma.challenge.findMany({
      where,
      include: { _count: { select: { submissions: true } } },
      orderBy: { points: 'desc' },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.challenge.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });
    if (!c) throw new NotFoundException('Défi introuvable');
    return c;
  }

  async create(dto: CreateChallengeDto, createdById: string) {
    return this.prisma.challenge.create({ data: { ...dto, createdById } });
  }

  async getMySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { gardienId: userId },
      include: { challenge: true, media: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async submit(
    challengeId: string,
    gardienId: string,
    data: { texte?: string; preuveUrl?: string },
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, statut: true },
    });
    if (!challenge || challenge.statut !== ChallengeStatus.ACTIF) {
      throw new NotFoundException('Défi introuvable');
    }
    return this.prisma.submission.create({
      data: {
        challengeId,
        gardienId,
        texte: data.texte,
        preuveUrl: data.preuveUrl,
      },
    });
  }

  async validateSubmission(
    submissionId: string,
    validateur: AuthUser,
    approved: boolean,
    comment?: string,
  ) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        ...this.submissionScopeWhere(validateur),
      },
      select: { id: true },
    });
    if (!submission) {
      throw new ForbiddenException('Soumission hors périmètre');
    }
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        statut: approved ? 'VALIDE' : 'REJETE',
        validateurId: validateur.id,
        commentaireValidateur: comment,
        validatedAt: new Date(),
        moderation: approved ? 'APPROUVE' : 'REJETE',
      },
    });
  }

  async getPendingSubmissions(actor: AuthUser) {
    return this.prisma.submission.findMany({
      where: {
        statut: 'EN_ATTENTE',
        ...this.submissionScopeWhere(actor),
      },
      include: {
        challenge: true,
        gardien: {
          select: { id: true, nom: true, prenoms: true, avatarUrl: true },
        },
        media: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
