'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { authApi, challengesApi, badgesApi, campsApi, messagingApi } from '@/lib/api';
import { Avatar, Card, SectionTitle, Progress, Pill } from '@/components/ui';
import { CampCard } from '@/components/camps/CampCard';
import type { Badge, Challenge, ChallengeCategory, Submission, UserBadge, Camp, Conversation } from '@/types';

const BADGE_EMOJI: Record<string, string> = {
  BRONZE: '🪨', ARGENT: '🥈', OR: '🏅', LEGENDE: '⚜️',
};
const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  PERSONNEL: 'Personnel',
  COMMUNAUTAIRE: 'Communautaire',
  SPIRITUEL: 'Spirituel',
  LONG: 'Défi long',
};

export default function DashboardGardienPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, badgeRes, allBadgeRes, challengeRes, campsRes, convRes] = await Promise.all([
          challengesApi.mySubmissions(),
          badgesApi.mine(),
          badgesApi.list(),
          challengesApi.list(),
          campsApi.list({ statut: 'OUVERT' }),
          messagingApi.conversations(),
        ]);
        setSubmissions(subRes.data);
        setBadges(badgeRes.data);
        setAllBadges(allBadgeRes.data);
        setChallenges(challengeRes.data);
        if (campsRes.data.length > 0) setCamp(campsRes.data[0]);
        setConversations(convRes.data);
      } catch { /* ignore */ }
    })();
  }, []);

  const validated = submissions.filter(s => s.statut === 'VALIDE').length;
  const total = Math.max(challenges.length, validated, 1);
  const latestBadge = badges[0];
  const ownedBadgeIds = new Set(badges.map(b => b.badge.id));
  const nextBadge = allBadges.find(b => !ownedBadgeIds.has(b.id));
  const pendingSubmissions = submissions.filter(s => s.statut === 'EN_ATTENTE');

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/activation');
  };

  return (
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
          {nextBadge ? (
            <p className="text-[11px] text-[#6b6b78] mt-2">
              Prochain artefact : {nextBadge.nom}
            </p>
          ) : (
            <p className="text-[11px] text-[#6b6b78] mt-2">
              Tous les artefacts disponibles sont débloqués.
            </p>
          )}
        </Card>

        {/* Prochain camp */}
        {camp && (
          <>
            <SectionTitle>Mon prochain camp</SectionTitle>
            <CampCard camp={camp} href={`/dashboard/gardien/camps/${camp.id}`} />
          </>
        )}

        {/* Missions en cours */}
        <SectionTitle>Missions en cours</SectionTitle>
        {pendingSubmissions.slice(0, 3).map(sub => (
          <Card key={sub.id} className="mb-2.5 border-l-4 border-l-[#D9A441]">
            <h4 className="font-bold text-sm text-[#1F1B2E] mb-1">{sub.challenge.titre}</h4>
            <p className="text-xs text-[#6b6b78]">En attente de validation</p>
            <div className="flex justify-between items-center mt-2">
              <Pill variant="or">{CATEGORY_LABELS[sub.challenge.categorie as ChallengeCategory]}</Pill>
              <span className="text-xs font-bold text-[#9c7218]">+{sub.challenge.points} pts</span>
            </div>
          </Card>
        ))}

        {pendingSubmissions.length === 0 && (
          <Card className="text-center py-6 text-sm text-[#6b6b78]">
            <div className="text-3xl mb-2">🎯</div>
            <p>Aucune mission en cours.</p>
            <p className="text-xs mt-1">Explore les défis pour commencer ta Route !</p>
          </Card>
        )}

        <Link href="/dashboard/gardien/missions" className="block w-full text-center bg-[#C62828] text-white font-bold text-sm py-3.5 rounded-xl mt-3">
          Voir toutes mes missions →
        </Link>

        {/* Messages récents */}
        {conversations.length > 0 && (
          <>
            <SectionTitle action={<Link href="/dashboard/gardien/messages" className="text-xs text-[#C62828] font-semibold">Tout voir →</Link>}>
              Messages récents
            </SectionTitle>
            {conversations.slice(0, 3).map(conv => {
              const lastMsg = conv.messages?.[0];
              const ICON: Record<string, string> = { COMMUNAUTE: '🌍', REGION: '🗺️', DOYENNE: '🛡️', PAROISSE: '⛪', PRIVE: '🤝', GROUPE: '👥' };
              const timeStr = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <Link key={conv.id} href={`/dashboard/gardien/messages/${conv.id}`}>
                  <Card className="mb-2.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#3d1163] flex items-center justify-center text-base text-white flex-shrink-0">
                      {ICON[conv.type] ?? '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-1">
                        <span className="font-semibold text-xs text-[#1F1B2E] truncate">{conv.nom ?? 'Conversation'}</span>
                        {timeStr && <span className="text-[10px] text-[#6b6b78] flex-shrink-0">{timeStr}</span>}
                      </div>
                      <p className="text-[11px] text-[#6b6b78] truncate mt-0.5">{lastMsg?.contenu ?? 'Aucun message'}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
