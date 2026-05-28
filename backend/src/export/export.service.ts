import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../../generated/prisma/enums.js';
import type { Prisma } from '../../generated/prisma/client.js';
import type { AuthUser } from '../common/types/auth-user.js';
import * as XLSX from 'xlsx';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  private participantScopeWhere(user: AuthUser): Prisma.CampParticipantWhereInput {
    if (user.role === UserRole.ADMIN) return {};
    if (user.role === UserRole.REGION) {
      return user.regionId
        ? { district: { regionId: user.regionId } }
        : { id: '__no_scope__' };
    }
    if (user.role === UserRole.SENTINELLE) {
      return user.districtId ? { districtId: user.districtId } : { id: '__no_scope__' };
    }
    return { id: '__no_scope__' };
  }

  async exportParticipants(campId: string, user: AuthUser): Promise<Buffer> {
    const participants = await this.prisma.campParticipant.findMany({
      where: { campId, ...this.participantScopeWhere(user) },
      include: {
        user: {
          select: {
            nom: true,
            prenoms: true,
            matricule: true,
            dateNaissance: true,
            sexe: true,
          },
        },
        district: { select: { nom: true } },
        parish: { select: { nom: true } },
      },
      orderBy: [
        { district: { nom: 'asc' } },
        { parish: { nom: 'asc' } },
        { user: { nom: 'asc' } },
      ],
    });

    const rows = participants.map((p, i) => ({
      'N°': i + 1,
      Nom: p.user.nom,
      Prénoms: p.user.prenoms,
      Matricule: p.user.matricule ?? '',
      Doyenné: p.district.nom,
      Paroisse: p.parish.nom,
      'Adhésion (statut)': p.adhesionStatusSnapshot,
      'Statut participation': p.participationStatus,
      'Statut présence': p.presenceStatus,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }
}
