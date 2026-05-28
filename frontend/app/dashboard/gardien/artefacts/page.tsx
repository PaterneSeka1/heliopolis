'use client';
import { useEffect, useState } from 'react';
import { badgesApi } from '@/lib/api';
import { Card, SectionTitle } from '@/components/ui';
import type { Badge, UserBadge } from '@/types';

const BADGE_LEVEL_EMOJI: Record<string, string> = {
  BRONZE: '🪨', ARGENT: '🥈', OR: '🏅', LEGENDE: '⚜️',
};

export default function ArtefactsPage() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([badgesApi.list(), badgesApi.mine()])
      .then(([all, mine]) => {
        setAllBadges(all.data);
        setMyBadges(mine.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const ownedIds = new Set(myBadges.map(ub => ub.badge.id));
  const latestBadge = myBadges[0];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Mes artefacts</h1>
        <p className="text-xs opacity-85 mt-0.5">
          {myBadges.length} badge{myBadges.length !== 1 ? 's' : ''} débloqué{myBadges.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {latestBadge && (
          <Card className="bg-gradient-to-r from-[#fff7e0] to-white border-[#f0d98a] text-center mb-4">
            <div className="text-4xl">{BADGE_LEVEL_EMOJI[latestBadge.badge.niveau]}</div>
            <div className="font-bold mt-2 text-[#1F1B2E]">{latestBadge.badge.nom}</div>
            <div className="text-xs text-[#6b6b78] mt-1">
              Débloqué le {new Date(latestBadge.awardedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </Card>
        )}

        <SectionTitle>Tous les artefacts</SectionTitle>

        <div className="grid grid-cols-3 gap-2.5">
          {allBadges.map(b => ({
            nom: b.nom, emoji: BADGE_LEVEL_EMOJI[b.niveau] || '🏅',
            niveau: b.niveau, locked: !ownedIds.has(b.id), id: b.id,
          })).map(b => (
            <div key={b.id}
              className={`bg-white border border-[#ececf0] rounded-2xl p-3 text-center relative ${b.locked ? 'opacity-45' : ''}`}>
              <div className={`w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl text-white shadow-lg ${
                b.locked
                  ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                  : 'bg-gradient-to-br from-[#D9A441] to-[#b58530]'
              }`}>
                {b.emoji}
              </div>
              <div className="text-[11px] font-semibold text-[#1F1B2E] leading-tight">{b.nom}</div>
              {b.locked && (
                <div className="absolute top-1.5 right-1.5 text-[10px]">🔒</div>
              )}
            </div>
          ))}
        </div>

        {!loading && allBadges.length === 0 && (
          <div className="text-center py-6 text-sm text-[#6b6b78]">
            <p className="text-xs mt-2">Aucun badge n&apos;est encore configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
