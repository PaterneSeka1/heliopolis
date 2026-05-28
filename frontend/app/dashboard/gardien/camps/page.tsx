'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { campsApi } from '@/lib/api';
import { CampCard } from '@/components/camps/CampCard';
import type { Camp } from '@/types';

type CampFilter = 'TOUS' | 'OUVERT' | 'A_VENIR';

const FILTERS: { label: string; value: CampFilter }[] = [
  { label: 'Tous', value: 'TOUS' },
  { label: 'Ouverts', value: 'OUVERT' },
  { label: 'À venir', value: 'A_VENIR' },
];

export default function GardienCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampFilter>('TOUS');

  useEffect(() => {
    campsApi.list()
      .then(r => setCamps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'TOUS'
    ? camps
    : camps.filter(c => c.statut === filter);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">⛺ Camps</h1>
        <p className="text-xs opacity-85 mt-0.5">Camps des Gardiens de la Création</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-[#fafafa]">
        {/* Bannière info */}
        <div className="flex gap-2 items-start bg-[#e8f5e9] border border-[#2E7D32]/30 rounded-xl p-3 mb-4 text-xs text-[#1F1B2E]">
          <span className="text-base flex-shrink-0">ℹ️</span>
          <span>
            Pour t&apos;inscrire, contacte ton Guide via la{' '}
            <Link href="/dashboard/gardien/messages" className="font-semibold text-[#2E7D32] underline">
              messagerie
            </Link>.
          </span>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === f.value
                  ? 'bg-[#C62828] text-white'
                  : 'bg-[#f3f3f5] text-[#6b6b78]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-10 text-[#6b6b78] text-sm">Chargement…</div>
        )}

        {filtered.map(camp => (
          <CampCard key={camp.id} camp={camp} href={`/dashboard/gardien/camps/${camp.id}`} />
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-[#6b6b78] text-sm">
            <div className="text-3xl mb-2">⛺</div>
            <p>Aucun camp dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
