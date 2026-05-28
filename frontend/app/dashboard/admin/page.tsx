'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { territoriesApi, campsApi, codexApi, messagingApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Card, Stat, SectionTitle, Progress, Pill } from '@/components/ui';
import type { Camp, Submission, Conversation } from '@/types';

interface Stats { totalGardiens: number; campsOuverts: number; defisValides: number; doyennes: number; }

export default function DashboardAdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [pending, setPending] = useState<Submission[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    Promise.all([
      territoriesApi.stats(),
      campsApi.list(),
      codexApi.pending(),
      messagingApi.conversations(),
    ]).then(([s, c, p, conv]) => {
      setStats(s.data);
      setCamps(c.data);
      setPending(p.data);
      setConversations(conv.data);
    }).catch(() => {});
  }, []);

  const activeCamps = camps.filter(c => ['OUVERT', 'EN_COURS'].includes(c.statut));
  const maxParticipants = Math.max(1, ...activeCamps.map(c => c._count?.participants ?? 0));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
            {user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : 'A'}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{user ? `${user.prenoms} ${user.nom}` : 'Grand Archiviste'}</h1>
            <p className="text-xs opacity-85">🛡️ {user?.region?.nom ?? 'Région'} · {user?.role ?? 'Admin'}</p>
          </div>
          <Link href="/dashboard/admin/export" className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base mr-1">📤</Link>
          <LogoutButton className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base hover:bg-white/25 transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <Stat value={camps.length} label="Camps" variant="violet" />
          <Stat value={camps.filter(c => c.statut === 'OUVERT').length} label="Ouverts" variant="rouge" />
          <Stat value={stats?.totalGardiens ?? '—'} label="Gardiens" variant="or" />
          <Stat value={stats?.doyennes ?? '—'} label="Doyennés" variant="vert" />
        </div>

        <SectionTitle action={<Link href="/dashboard/admin/camps/nouveau" className="text-xs text-[#C62828] font-semibold">+ Nouveau →</Link>}>
          Camps actifs
        </SectionTitle>
        {activeCamps.map(camp => (
          <Card key={camp.id} className="mb-2.5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1F1B2E] truncate">{camp.nom}</div>
                <div className="text-xs text-[#6b6b78] mt-0.5">{camp.lieu} · {camp.type}</div>
              </div>
              <Pill variant={camp.statut === 'OUVERT' ? 'vert' : 'or'} solid className="flex-shrink-0 ml-2">
                {camp.statut === 'OUVERT' ? '✓ Ouvert' : '▶ En cours'}
              </Pill>
            </div>
            <div className="flex justify-between text-xs text-[#6b6b78] mb-1.5">
              <span>Participants</span>
              <span className="font-semibold text-[#1F1B2E]">{camp._count?.participants ?? 0}</span>
            </div>
            <Progress value={camp._count?.participants ?? 0} max={maxParticipants} />
          </Card>
        ))}

        {pending.length > 0 && (
          <>
            <SectionTitle>🪶 À modérer ({pending.length})</SectionTitle>
            {pending.slice(0, 3).map(sub => (
              <Card key={sub.id} className="mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#C62828] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {sub.gardien?.nom?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[#1F1B2E]">{sub.gardien?.prenoms} {sub.gardien?.nom}</div>
                    <div className="text-[11px] text-[#6b6b78] truncate">« {sub.texte ?? sub.challenge?.titre} »</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => codexApi.approve(sub.id)}
                      className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white text-sm flex items-center justify-center">✓</button>
                    <button onClick={() => codexApi.reject(sub.id, 'Contenu inapproprié')}
                      className="w-8 h-8 rounded-lg bg-[#C62828] text-white text-sm flex items-center justify-center">✕</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {conversations.length > 0 && (
          <>
            <SectionTitle action={<Link href="/dashboard/admin/messages" className="text-xs text-[#C62828] font-semibold">Tout voir →</Link>}>
              💬 Messages récents
            </SectionTitle>
            {conversations.slice(0, 3).map(conv => {
              const lastMsg = conv.messages?.[0];
              const ICON: Record<string, string> = { COMMUNAUTE: '🌍', REGION: '🗺️', DOYENNE: '🛡️', PAROISSE: '⛪', PRIVE: '🤝', GROUPE: '👥' };
              const timeStr = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <Link key={conv.id} href={`/dashboard/admin/messages/${conv.id}`}>
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

        <div className="flex gap-2 mt-4">
          <Link href="/dashboard/admin/camps/nouveau" className="flex-1 text-center bg-[#C62828] text-white font-bold text-sm py-3.5 rounded-xl">
            + Nouveau camp
          </Link>
          <Link href="/dashboard/admin/export" className="flex-1 text-center bg-[#6A1B9A] text-white font-bold text-sm py-3.5 rounded-xl">
            📤 Export
          </Link>
        </div>
      </div>
    </div>
  );
}
