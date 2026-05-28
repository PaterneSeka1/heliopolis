'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { territoriesApi, campsApi, usersApi, challengesApi, messagingApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Progress, Pill } from '@/components/ui';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import type { Challenge, District, Camp, CampParticipant, User, Conversation } from '@/types';

interface RegionStats {
  doyennes?: number;
}

export default function DashboardRegionPage() {
  const { user } = useAuthStore();
  const [districts, setDistricts] = useState<District[]>([]);
  const [stats, setStats] = useState<RegionStats | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [gardiens, setGardiens] = useState<User[]>([]);
  const [sentinelles, setSentinelles] = useState<User[]>([]);
  const [participants, setParticipants] = useState<CampParticipant[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [d, s, c, g, sent, ch, conv] = await Promise.all([
          territoriesApi.districts(),
          territoriesApi.stats(),
          campsApi.list({ statut: 'OUVERT' }),
          usersApi.list({ role: 'GARDIEN' }),
          usersApi.list({ role: 'SENTINELLE' }),
          challengesApi.list(),
          messagingApi.conversations(),
        ]);
        setDistricts(d.data);
        setStats(s.data);
        setCamps(c.data);
        setGardiens(g.data);
        setSentinelles(sent.data);
        setChallenges(ch.data);
        setConversations(conv.data);

        if (c.data[0]?.id) {
          const p = await campsApi.participants(c.data[0].id);
          setParticipants(p.data);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const activeCamp = camps[0];
  const parishesCount = districts.reduce((total, d) => total + (d._count?.parishes ?? 0), 0);
  const gardiensByDistrict = new Map<string, number>();
  const participantsByDistrict = new Map<string, number>();
  const sentinelleByDistrict = new Map<string, User>();

  for (const gardien of gardiens) {
    if (gardien.district?.id) {
      gardiensByDistrict.set(gardien.district.id, (gardiensByDistrict.get(gardien.district.id) ?? 0) + 1);
    }
  }
  for (const participant of participants) {
    participantsByDistrict.set(
      participant.district.id,
      (participantsByDistrict.get(participant.district.id) ?? 0) + 1,
    );
  }
  for (const sentinelle of sentinelles) {
    if (sentinelle.district?.id) sentinelleByDistrict.set(sentinelle.district.id, sentinelle);
  }

  const transmittedDistricts = districts.filter(d => (participantsByDistrict.get(d.id) ?? 0) > 0).length;
  const maxCampParticipants = Math.max(1, ...camps.map(c => c._count?.participants ?? 0));
  const topChallenges = [...challenges]
    .sort((a, b) => (b._count?.submissions ?? 0) - (a._count?.submissions ?? 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex">

      <aside className="w-60 bg-gradient-to-b from-[#1F1B2E] to-[#3a1d4d] text-white flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2.5 p-4 pb-4 border-b border-white/10">
          <GardiensBlazon size={46} />
          <div>
            <div className="text-[10px] tracking-widest opacity-70 uppercase">Région d&apos;Abidjan</div>
            <div className="text-sm font-bold leading-tight mt-0.5">Conseil<br/>d&apos;Héliopolis</div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {[
            { icon: '📊', label: 'Vue régionale', active: true },
            { icon: '⛺', label: 'Camps régionaux' },
            { icon: '👥', label: 'Participants' },
            { icon: '🛡️', label: 'Doyennés' },
            { icon: '⛪', label: 'Paroisses' },
            { icon: '🎯', label: 'Défis & soumissions' },
            { icon: '🪶', label: 'Mur du Codex' },
            { icon: '💬', label: 'Messagerie', href: '/dashboard/admin/messages' },
            { icon: '📋', label: 'Rapports régionaux' },
            { icon: '📤', label: 'Exports Excel', href: '/dashboard/admin/export' },
          ].map(item => (
            item.href ? (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors hover:bg-white/6">
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <div key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-colors ${
                  item.active ? 'bg-gradient-to-r from-[#F58A4B]/30 to-[#C62828]/30 font-semibold' : 'hover:bg-white/6'
                }`}>
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </div>
            )
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#1F1B2E]">Vue régionale</h1>
            <p className="text-xs text-[#6b6b78] mt-0.5">
              {user ? `${user.prenoms} ${user.nom}` : '—'} · {user?.region?.nom ?? 'Région'} · {user?.role ?? 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="bg-white border border-[#e0e0e8] rounded-xl px-3 py-2 text-sm outline-none w-64"
              placeholder="🔍 Doyenné, paroisse, camp…"
            />
            <Link href="/dashboard/admin/camps/nouveau"
              className="bg-[#C62828] text-white font-bold text-sm px-4 py-2 rounded-xl">
              + Créer camp régional
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58A4B] to-[#C62828] flex items-center justify-center text-white font-bold text-sm">
              {user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : 'HR'}
            </div>
            <LogoutButton className="w-10 h-10 rounded-full bg-white border border-[#e0e0e8] flex items-center justify-center text-base hover:bg-[#fff0f0] transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {[
            { label: 'Doyennés', value: stats?.doyennes ?? districts.length, delta: `${districts.length} chargés`, icon: '🛡️', color: '#C62828' },
            { label: 'Paroisses actives', value: parishesCount, delta: 'données territoriales', icon: '⛪', color: '#6A1B9A' },
            { label: activeCamp?.nom ?? 'Camp ouvert', value: activeCamp?._count?.participants ?? 0, delta: 'participants sélectionnés', icon: '⛺', color: '#D9A441' },
            { label: 'Doyennés transmis', value: `${transmittedDistricts} / ${districts.length || 0}`, delta: activeCamp ? activeCamp.nom : 'aucun camp ouvert', icon: '✓', color: '#2E7D32', neg: transmittedDistricts < districts.length },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-[#ececf0] rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-10 h-10 rounded-bl-2xl flex items-center justify-center text-lg"
                style={{ background: kpi.color, color: 'white' }}>{kpi.icon}</div>
              <div className="text-xs text-[#6b6b78] uppercase tracking-wide">{kpi.label}</div>
              <div className="text-3xl font-black text-[#1F1B2E] mt-1.5">{kpi.value}</div>
              <div className={`text-xs mt-1 font-semibold ${kpi.neg ? 'text-[#C62828]' : 'text-[#2E7D32]'}`}>{kpi.delta}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#ececf0] rounded-2xl p-4 mb-5">
          <h3 className="font-bold text-sm text-[#1F1B2E] mb-4 flex justify-between">
            Suivi des doyennés — {activeCamp?.nom ?? 'aucun camp ouvert'}
            <span className="text-xs text-[#C62828] font-semibold cursor-pointer">Détail →</span>
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f9f9fc] text-[#6b6b78] uppercase tracking-wide">
                {['Doyenné', 'Sentinelle', 'Paroisses', 'Routiers', 'Sélectionnés', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 font-semibold border-b border-[#ececf0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districts.map(district => {
                const sentinelle = sentinelleByDistrict.get(district.id);
                const routiers = gardiensByDistrict.get(district.id) ?? 0;
                const selected = participantsByDistrict.get(district.id) ?? 0;
                return (
                  <tr key={district.id} className="border-b border-[#f0f0f4] hover:bg-[#fafafc]">
                    <td className="px-3 py-3 font-semibold text-[#1F1B2E]">{district.nom}</td>
                    <td className="px-3 py-3 text-[#6b6b78]">
                      {sentinelle ? `${sentinelle.prenoms} ${sentinelle.nom}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-center text-[#6b6b78]">{district._count?.parishes ?? 0}</td>
                    <td className="px-3 py-3 text-center text-[#6b6b78]">{routiers}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[#1F1B2E] mb-1">{selected} / {routiers}</div>
                      <Progress value={selected} max={routiers} />
                    </td>
                    <td className="px-3 py-3">
                      {selected > 0 ? <Pill variant="vert">✓ Transmis</Pill> : <Pill variant="or">⏳ En attente</Pill>}
                    </td>
                    <td className="px-3 py-3">
                      <button className="text-[11px] border border-[#e6e6ea] text-[#1F1B2E] rounded-lg px-2.5 py-1 font-semibold">
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {conversations.length > 0 && (
          <div className="bg-white border border-[#ececf0] rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-sm text-[#1F1B2E] mb-4 flex justify-between">
              💬 Messages récents
              <Link href="/dashboard/admin/messages" className="text-xs text-[#C62828] font-semibold">Tout voir →</Link>
            </h3>
            <div className="flex flex-col gap-2">
              {conversations.slice(0, 5).map(conv => {
                const lastMsg = conv.messages?.[0];
                const ICON: Record<string, string> = { COMMUNAUTE: '🌍', REGION: '🗺️', DOYENNE: '🛡️', PAROISSE: '⛪', PRIVE: '🤝', GROUPE: '👥' };
                const GRADIENT: Record<string, string> = {
                  COMMUNAUTE: 'from-[#F58A4B] to-[#C62828]', REGION: 'from-[#F58A4B] to-[#C62828]',
                  DOYENNE: 'from-[#6A1B9A] to-[#3d1163]', PAROISSE: 'from-[#C62828] to-[#7a1717]',
                  PRIVE: 'from-[#1F1B2E] to-[#3a1d4d]', GROUPE: 'from-[#2E7D32] to-[#1a5021]',
                };
                const timeStr = conv.lastMessageAt
                  ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <Link key={conv.id} href={`/dashboard/admin/messages/${conv.id}`}
                    className="flex items-center gap-3 py-2 border-b border-[#f0f0f4] last:border-0 hover:bg-[#fafafc] px-1 rounded-lg transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm text-white bg-gradient-to-br ${GRADIENT[conv.type] ?? 'from-[#6A1B9A] to-[#3d1163]'} flex-shrink-0`}>
                      {ICON[conv.type] ?? '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-semibold text-sm text-[#1F1B2E] truncate">{conv.nom ?? 'Conversation'}</span>
                        {timeStr && <span className="text-[10px] text-[#6b6b78] flex-shrink-0">{timeStr}</span>}
                      </div>
                      <p className="text-xs text-[#6b6b78] truncate">{lastMsg?.contenu ?? 'Aucun message'}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#ececf0] rounded-2xl p-4">
            <h3 className="font-bold text-sm text-[#1F1B2E] mb-4">Camps ouverts</h3>
            <div className="flex flex-col gap-2">
              {camps.slice(0, 5).map(camp => (
                <div key={camp.id} className="py-2 border-b border-[#f0f0f4] last:border-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1F1B2E] font-semibold">{camp.nom}</span>
                    <span className="text-[#6b6b78]">{camp._count?.participants ?? 0}</span>
                  </div>
                  <Progress value={camp._count?.participants ?? 0} max={maxCampParticipants} />
                </div>
              ))}
              {camps.length === 0 && <p className="text-xs text-[#6b6b78]">Aucun camp ouvert.</p>}
            </div>
          </div>

          <div className="bg-white border border-[#ececf0] rounded-2xl p-4">
            <h3 className="font-bold text-sm text-[#1F1B2E] mb-4">Défis les plus soumis</h3>
            <div className="flex flex-col gap-2">
              {topChallenges.map(challenge => (
                <div key={challenge.id} className="flex justify-between items-center py-2 border-b border-[#f0f0f4] last:border-0 text-sm">
                  <span className="text-[#1F1B2E]">{challenge.titre}</span>
                  <Pill variant="rouge">{challenge._count?.submissions ?? 0}</Pill>
                </div>
              ))}
              {topChallenges.length === 0 && <p className="text-xs text-[#6b6b78]">Aucun défi soumis.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
