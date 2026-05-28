'use client';
import { useEffect, useState } from 'react';
import { territoriesApi, campsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Progress, Pill } from '@/components/ui';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import type { District, Camp } from '@/types';

interface RegionStats {
  doyennes?: number;
}

export default function DashboardRegionPage() {
  const { user } = useAuthStore();
  const [districts, setDistricts] = useState<District[]>([]);
  const [stats, setStats] = useState<RegionStats | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);

  useEffect(() => {
    Promise.all([
      territoriesApi.districts(),
      territoriesApi.stats(),
      campsApi.list({ statut: 'OUVERT' }),
    ]).then(([d, s, c]) => {
      setDistricts(d.data);
      setStats(s.data);
      setCamps(c.data);
    }).catch(() => {});
  }, []);

  return (
    <AuthGuard roles={['ADMIN', 'REGION']}>
      {/* Desktop layout */}
      <div className="min-h-screen bg-[#f6f6fa] flex">

        {/* Sidebar */}
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
              { icon: '💬', label: 'Messagerie' },
              { icon: '📋', label: 'Rapports régionaux' },
              { icon: '📤', label: 'Exports Excel' },
            ].map(item => (
              <div key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-colors ${
                  item.active ? 'bg-gradient-to-r from-[#F58A4B]/30 to-[#C62828]/30 font-semibold' : 'hover:bg-white/6'
                }`}>
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Top bar */}
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
              <button className="bg-[#C62828] text-white font-bold text-sm px-4 py-2 rounded-xl">
                + Créer camp régional
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58A4B] to-[#C62828] flex items-center justify-center text-white font-bold text-sm">
                {user ? `${user.nom[0]}${user.prenoms[0]}`.toUpperCase() : 'HR'}
              </div>
              <LogoutButton className="w-10 h-10 rounded-full bg-white border border-[#e0e0e8] flex items-center justify-center text-base hover:bg-[#fff0f0] transition-colors" />
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3.5 mb-5">
            {[
              { label: 'Doyennés', value: stats?.doyennes ?? 7, delta: '100% rattachés', icon: '🛡️', color: '#C62828' },
              { label: 'Paroisses actives', value: districts.length > 0 ? `38 / 42` : '—', delta: '4 sans Guide', icon: '⛪', color: '#6A1B9A', neg: true },
              { label: 'Camp d\'Abay-Ka', value: camps[0]?._count?.participants ?? 147, delta: 'participants sélectionnés', icon: '⛺', color: '#D9A441' },
              { label: 'Doyennés transmis', value: '5 / 7', delta: 'Plateau & Bassam en retard', icon: '✓', color: '#2E7D32', neg: true },
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

          {/* Suivi doyennés */}
          <div className="bg-white border border-[#ececf0] rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-sm text-[#1F1B2E] mb-4 flex justify-between">
              Suivi des doyennés — Camp d&apos;Abay-Ka 2026
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
                {[
                  { nom: 'Yopougon',      s: 'P. Kouassi', p: 11, r: 203, sel: 42, max: 60, statut: 'valide' },
                  { nom: 'Cocody',        s: 'M. N\'Dri',  p: 8,  r: 156, sel: 38, max: 50, statut: 'valide' },
                  { nom: 'Marcory',       s: 'S. Bamba',   p: 6,  r: 124, sel: 31, max: 40, statut: 'valide' },
                  { nom: 'Plateau',       s: 'J. Yao',     p: 5,  r: 98,  sel: 21, max: 30, statut: 'attente' },
                  { nom: 'Bingerville',   s: 'D. Coulibaly',p: 4, r: 87,  sel: 9,  max: 30, statut: 'non' },
                  { nom: 'Abobo',         s: 'R. Ouattara',p: 6,  r: 76,  sel: 3,  max: 25, statut: 'non' },
                  { nom: 'Grand-Bassam',  s: 'F. Diomandé',p: 2,  r: 103, sel: 3,  max: 20, statut: 'attente' },
                ].map(row => (
                  <tr key={row.nom} className="border-b border-[#f0f0f4] hover:bg-[#fafafc]">
                    <td className="px-3 py-3 font-semibold text-[#1F1B2E]">{row.nom}</td>
                    <td className="px-3 py-3 text-[#6b6b78]">{row.s}</td>
                    <td className="px-3 py-3 text-center text-[#6b6b78]">{row.p}</td>
                    <td className="px-3 py-3 text-center text-[#6b6b78]">{row.r}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[#1F1B2E] mb-1">{row.sel} / {row.max}</div>
                      <Progress value={row.sel} max={row.max} />
                    </td>
                    <td className="px-3 py-3">
                      {row.statut === 'valide' ? <Pill variant="vert">✓ Validé</Pill> :
                       row.statut === 'attente' ? <Pill variant="or">⏳ En attente</Pill> :
                       <Pill variant="rouge">✕ Non transmis</Pill>}
                    </td>
                    <td className="px-3 py-3">
                      <button className={`text-[11px] border rounded-lg px-2.5 py-1 font-semibold ${
                        row.statut === 'valide' ? 'border-[#e6e6ea] text-[#1F1B2E]' :
                        row.statut === 'attente' ? 'border-[#f0d98a] bg-[#fff3d6] text-[#9c7218]' :
                        'border-[#ffb3b3] bg-[#ffe6e6] text-[#C62828]'
                      }`}>
                        {row.statut === 'valide' ? 'Voir' : 'Relancer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom charts */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bar chart */}
            <div className="bg-white border border-[#ececf0] rounded-2xl p-4">
              <h3 className="font-bold text-sm text-[#1F1B2E] mb-4">Activité du Mur du Codex (7 jours)</h3>
              <div className="flex items-end gap-2 h-32">
                {[8, 14, 11, 19, 16, 23, 12].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <span className="text-[10px] font-bold text-[#1F1B2E]">{v}</span>
                    <div className="w-full rounded-t-md"
                      style={{ height: `${(v / 23) * 100}%`, background: 'linear-gradient(180deg,#FFB36B,#E55A35)' }} />
                    <span className="text-[10px] text-[#6b6b78]">{['L','M','M','J','V','S','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top défis */}
            <div className="bg-white border border-[#ececf0] rounded-2xl p-4">
              <h3 className="font-bold text-sm text-[#1F1B2E] mb-4">Top défis validés ce mois</h3>
              <div className="flex flex-col gap-2">
                {[
                  { titre: '🌱 Planter une graine', count: 48 },
                  { titre: '🧹 Nettoyer une paroisse', count: 32 },
                  { titre: '🙏 Prière du Gardien', count: 28 },
                  { titre: '🚰 Réduire l\'eau', count: 22 },
                  { titre: '🌿 21 jours de Gardien', count: 14 },
                ].map(d => (
                  <div key={d.titre} className="flex justify-between items-center py-2 border-b border-[#f0f0f4] last:border-0 text-sm">
                    <span className="text-[#1F1B2E]">{d.titre}</span>
                    <Pill variant="rouge">{d.count}</Pill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
