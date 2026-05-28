'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { usersApi, challengesApi, campsApi } from '@/lib/api';
import { getTerritoryLabel, ROLE_LABEL } from '@/lib/roles';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Card, Stat, SectionTitle, Button } from '@/components/ui';
import { CampCard } from '@/components/camps/CampCard';
import type { User, Camp, Submission } from '@/types';

export default function DashboardGuidePage() {
  const { user } = useAuthStore();
  const [routiers, setRoutiers] = useState<User[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [pending, setPending] = useState<Submission[]>([]);

  useEffect(() => {
    if (!user) return;
    const params: Record<string, string> = { role: 'GARDIEN' };
    if (user.role === 'GUIDE') {
      if (!user.parish?.id) return;
      params.parishId = user.parish.id;
    }
    if (user.role === 'SENTINELLE') {
      if (!user.district?.id) return;
      params.districtId = user.district.id;
    }
    Promise.all([
      usersApi.list(params),
      campsApi.list({ statut: 'OUVERT' }),
      challengesApi.pending(),
    ]).then(([u, c, p]) => {
      setRoutiers(u.data);
      setCamps(c.data);
      setPending(p.data);
    }).catch(() => {});
  }, [user]);

  const aJour = routiers.filter(r => r.adhesions?.[0]?.statut === 'A_JOUR').length;
  const nonAJour = routiers.length - aJour;
  const roleName = user ? ROLE_LABEL[user.role] : 'Guide';
  const territory = getTerritoryLabel(user);
  const canExport = user?.role === 'ADMIN' || user?.role === 'REGION' || user?.role === 'SENTINELLE';

  return (
    <AuthGuard roles={['GUIDE', 'SENTINELLE', 'REGION', 'ADMIN']}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
              {user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : 'G'}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{user?.prenoms} {user?.nom}</h1>
              <p className="text-xs opacity-85">📖 {roleName} · {territory}</p>
            </div>
            <LogoutButton className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base hover:bg-white/25 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <Stat value={routiers.length} label="Gardiens" variant="violet" />
            <Stat value={aJour} label="À jour 2026" variant="vert" />
            <Stat value={camps.length} label="Camps ouverts" variant="or" />
            <Stat value={pending.length} label="Défis à valider" variant="rouge" />
          </div>

          {/* Alertes */}
          <SectionTitle>Actions du jour</SectionTitle>

          {nonAJour > 0 && (
            <Card className="mb-2.5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{nonAJour} routier{nonAJour > 1 ? 's' : ''} à relancer</div>
                  <div className="text-xs text-[#6b6b78]">Adhésion 2026 non à jour</div>
                </div>
                <button className="text-xs bg-white border border-[#e6e6ea] px-3 py-1.5 rounded-xl font-semibold">Voir</button>
              </div>
            </Card>
          )}

          {pending.length > 0 && (
            <Card className="mb-2.5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{pending.length} preuve{pending.length > 1 ? 's' : ''} en attente</div>
                  <div className="text-xs text-[#6b6b78]">À valider avant la fin de semaine</div>
                </div>
                <button className="text-xs bg-[#C62828] text-white px-3 py-1.5 rounded-xl font-semibold">Valider</button>
              </div>
            </Card>
          )}

          {/* Camps */}
          {camps.length > 0 && (
            <>
              <SectionTitle>Camps ouverts</SectionTitle>
              {camps.slice(0, 3).map(camp => (
                <div key={camp.id} className="mb-3">
                  <CampCard camp={camp} />
                  <Link
                    href={`/guide/selection/${camp.id}`}
                    className="block w-full text-center bg-[#C62828] text-white font-bold text-sm py-2.5 rounded-xl -mt-1"
                  >
                    Sélectionner pour ce camp →
                  </Link>
                </div>
              ))}
            </>
          )}

          {canExport ? (
            <Link href="/admin/export" className="block w-full text-center bg-[#C62828] text-white font-bold text-sm py-3.5 rounded-xl">
              Exporter les participants
            </Link>
          ) : (
            <Button variant="ghost" disabled>
              Export réservé à la Sentinelle
            </Button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
