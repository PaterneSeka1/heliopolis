import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

interface BadgeConditionMeta {
  type: 'challenges_validated' | 'communautaire_validated';
  count: number;
}

function isBadgeConditionMeta(value: unknown): value is BadgeConditionMeta {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const meta = value as { type?: unknown; count?: unknown };
  return (
    (meta.type === 'challenges_validated' ||
      meta.type === 'communautaire_validated') &&
    typeof meta.count === 'number'
  );
}

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.badge.findMany({ orderBy: { niveau: 'asc' } });
  }

  async getMyBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  async checkAndAwardBadges(userId: string) {
    const [validatedCount, communautaireCount] = await Promise.all([
      this.prisma.submission.count({
        where: { gardienId: userId, statut: 'VALIDE' },
      }),
      this.prisma.submission.count({
        where: {
          gardienId: userId,
          statut: 'VALIDE',
          challenge: { categorie: 'COMMUNAUTAIRE' },
        },
      }),
    ]);

    const allBadges = await this.prisma.badge.findMany();
    const owned = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const ownedIds = new Set(owned.map((b) => b.badgeId));
    const newlyAwarded: string[] = [];

    for (const badge of allBadges) {
      if (ownedIds.has(badge.id)) continue;
      const meta = badge.conditionMeta;
      if (!isBadgeConditionMeta(meta)) continue;
      let earned = false;
      if (meta?.type === 'challenges_validated' && validatedCount >= meta.count)
        earned = true;
      if (
        meta?.type === 'communautaire_validated' &&
        communautaireCount >= meta.count
      )
        earned = true;

      if (earned) {
        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        newlyAwarded.push(badge.nom);
      }
    }
    return newlyAwarded;
  }
}
