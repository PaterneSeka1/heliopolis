'use client';
import { useEffect, useState } from 'react';
import { territoriesApi, usersApi, campsApi } from '@/lib/api';
import { Pill, Progress } from '@/components/ui';
import type { District, User, Camp } from '@/types';

interface TerritoryStats {
  gardiens?: number;
  adhesionsAJour?: number;
  soumissionsValidees?: number;
  campsActifs?: number;
  [key: string]: unknown;
}

export default function RapportsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [gardiens, setGardiens] = useState<User[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stats, setStats] = useState<TerritoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, g, c, s] = await Promise.all([
          territoriesApi.districts(),
          usersApi.list({ role: 'GARDIEN' }),
          campsApi.list(),
          territoriesApi.stats(),
        ]);
        setDistricts(d.data);
        setGardiens(g.data);
        setCamps(c.data);
        setStats(s.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Compute per-district stats
  const gardiensByDistrict = new Map<string, User[]>();
  for (const g of gardiens) {
    if (g.district?.id) {
      const list = gardiensByDistrict.get(g.district.id) ?? [];
      list.push(g);
      gardiensByDistrict.set(g.district.id, list);
    }
  }

  const campsActifs = camps.filter(c => ['OUVERT', 'EN_COURS'].includes(c.statut)).length;
  const totalGardiens = gardiens.length;
  const adhesionsAJour = gardiens.filter(g =>
    g.adhesions?.some(a => a.statut === 'A_JOUR')
  ).length;
  const adhesionsPct = totalGardiens > 0 ? Math.round((adhesionsAJour / totalGardiens) * 100) : 0;
  const soumissionsValidees = stats?.soumissionsValidees ?? 0;

  const districtStats = districts.map(d => {
    const gList = gardiensByDistrict.get(d.id) ?? [];
    const aJour = gList.filter(g => g.adhesions?.some(a => a.statut === 'A_JOUR')).length;
    return {
      district: d,
      gardiens: gList.length,
      aJour,
      total: gList.length,
    };
  });

  const maxGardiens = Math.max(1, ...districtStats.map(s => s.gardiens));

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="px-6 py-4 flex justify-between items-center mb-5 border-b border-[#ececf0] bg-white -mx-6 -mt-6">
        <h1 className="text-2xl font-black text-[#1F1B2E]">📋 Rapports régionaux</h1>
        <div className="relative group">
          <button
            disabled
            className="bg-[#6b6b78]/20 text-[#6b6b78] font-bold text-sm px-4 py-2 rounded-xl cursor-not-allowed">
            📄 Exporter PDF
          </button>
          <div className="absolute right-0 top-full mt-1 bg-[#1F1B2E] text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Disponible prochainement
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-[#6b6b78] text-sm">Chargement…</div>
      )}

      {!loading && (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            {[
              { label: 'Gardiens total', value: totalGardiens, icon: '🛡️', color: '#1F1B2E' },
              { label: 'Adhésions à jour', value: `${adhesionsPct}%`, icon: '✓', color: '#2E7D32' },
              { label: 'Soumissions validées', value: soumissionsValidees, icon: '🎯', color: '#6A1B9A' },
              { label: 'Camps actifs', value: campsActifs, icon: '⛺', color: '#D9A441' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white border border-[#ececf0] rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 rounded-bl-2xl flex items-center justify-center text-lg"
                  style={{ background: kpi.color, color: 'white' }}>{kpi.icon}</div>
                <div className="text-xs text-[#6b6b78] uppercase tracking-wide">{kpi.label}</div>
                <div className="text-3xl font-black mt-1.5" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Tableau par doyenné */}
          <div className="bg-white border border-[#ececf0] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#ececf0]">
              <h2 className="font-bold text-sm text-[#1F1B2E]">Synthèse par doyenné</h2>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#f9f9fc] text-[#6b6b78] uppercase tracking-wide">
                  {['Doyenné', 'Gardiens', 'Adhésions à jour', 'Taux', 'Statut'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold border-b border-[#ececf0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districtStats.map(({ district, gardiens: nbG, aJour, total }) => {
                  const pct = total > 0 ? Math.round((aJour / total) * 100) : 0;
                  return (
                    <tr key={district.id} className="border-b border-[#f0f0f4] hover:bg-[#fafafc]">
                      <td className="px-4 py-3 font-semibold text-[#1F1B2E]">{district.nom}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1F1B2E] mb-1">{nbG}</div>
                        <Progress value={nbG} max={maxGardiens} />
                      </td>
                      <td className="px-4 py-3 text-[#6b6b78]">
                        {aJour} / {total}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${pct >= 80 ? 'text-[#2E7D32]' : pct >= 50 ? 'text-[#D9A441]' : 'text-[#C62828]'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pct >= 80
                          ? <Pill variant="vert">✓ Bon</Pill>
                          : pct >= 50
                            ? <Pill variant="or">⚠ Moyen</Pill>
                            : <Pill variant="rouge">✕ Faible</Pill>
                        }
                      </td>
                    </tr>
                  );
                })}
                {districtStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#6b6b78]">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
