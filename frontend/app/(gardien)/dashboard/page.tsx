'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { authApi, challengesApi, badgesApi, campsApi } from '@/lib/api';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Avatar, Card, SectionTitle, Progress, Pill } from '@/components/ui';
import { CampCard } from '@/components/camps/CampCard';
import type { Submission, UserBadge, Camp } from '@/types';

const BADGE_EMOJI: Record<string, string> = {
  BRONZE: '🪨', ARGENT: '🥈', OR: '🏅', LEGENDE: '⚜️',
};

export default function DashboardGardienPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [camp, setCamp] = useState<Camp | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, badgeRes, campsRes] = await Promise.all([
          challengesApi.mySubmissions(),
          badgesApi.mine(),
          campsApi.list({ statut: 'OUVERT' }),
        ]);
        setSubmissions(subRes.data);
        setBadges(badgeRes.data);
        if (campsRes.data.length > 0) setCamp(campsRes.data[0]);
      } catch { /* ignore */ }
    })();
  }, []);

  const validated = submissions.filter(s => s.statut === 'VALIDE').length;
  const total = 10;
  const latestBadge = badges[0];

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/activation');
  };

  return (
    <AuthGuard roles={['GARDIEN']}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header rouge */}
        <div className="bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white px-4 pt-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar
              initials={user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : '?'}
              size={42}
              className="border-2 border-white/40 bg-white/20"
            />
            <div className="flex-1">
              <h1 className="text-lg font-bold">{user?.prenoms} {user?.nom}</h1>
              <p className="text-xs opacity-85">🛡️ Gardien · {user?.parish?.nom ?? 'Paroisse'}</p>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base">
              ⚙️
            </button>
          </div>

          {/* Matricule card */}
          <div className="bg-black/20 rounded-xl px-3.5 py-2.5 flex justify-between items-center">
            <div>
              <div className="text-[11px] opacity-85">Matricule</div>
              <div className="font-bold tracking-widest">{user?.matricule ?? '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] opacity-85">Adhésion 2026</div>
              {user?.adhesions?.[0]?.statut === 'A_JOUR'
                ? <span className="inline-flex items-center gap-1 bg-[#2E7D32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ À jour</span>
                : <span className="inline-flex items-center gap-1 bg-[#9c7218] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⏳ En attente</span>
              }
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-[#fafafa]">

          {/* Progression */}
          <SectionTitle>Ma progression</SectionTitle>
          <Card className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-2xl font-black text-[#D9A441]">{validated} / {total}</div>
                <div className="text-xs text-[#6b6b78]">défis validés</div>
              </div>
              {latestBadge && (
                <Pill variant="or">{BADGE_EMOJI[latestBadge.badge.niveau]} {latestBadge.badge.nom}</Pill>
              )}
            </div>
            <Progress value={validated} max={total} />
            <p className="text-[11px] text-[#6b6b78] mt-2">
              Prochain artefact : Flamme du Gardien à {Math.max(0, 5 - validated)} défis validés
            </p>
          </Card>

          {/* Prochain camp */}
          {camp && (
            <>
              <SectionTitle>Mon prochain camp</SectionTitle>
              <CampCard camp={camp} />
            </>
          )}

          {/* Missions en cours */}
          <SectionTitle>Missions en cours</SectionTitle>
          {submissions.filter(s => s.statut === 'EN_ATTENTE').slice(0, 3).map(sub => (
            <Card key={sub.id} className="mb-2.5 border-l-4 border-l-[#D9A441]">
              <h4 className="font-bold text-sm text-[#1F1B2E] mb-1">{sub.challenge.titre}</h4>
              <p className="text-xs text-[#6b6b78]">En attente de validation</p>
              <div className="flex justify-between items-center mt-2">
                <Pill variant="or">Défi long</Pill>
                <span className="text-xs font-bold text-[#9c7218]">+{sub.challenge.points} pts</span>
              </div>
            </Card>
          ))}

          {submissions.length === 0 && (
            <Card className="text-center py-6 text-sm text-[#6b6b78]">
              <div className="text-3xl mb-2">🎯</div>
              <p>Aucune mission en cours.</p>
              <p className="text-xs mt-1">Explore les défis pour commencer ta Route !</p>
            </Card>
          )}

          <Link href="/missions" className="block w-full text-center bg-[#C62828] text-white font-bold text-sm py-3.5 rounded-xl mt-3">
            Voir toutes mes missions →
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
