'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { campsApi } from '@/lib/api';
import { Pill, Progress } from '@/components/ui';
import type { Camp, CampStatus } from '@/types';

const STATUS_TABS: { label: string; value: CampStatus | 'TOUS' }[] = [
  { label: 'Tous', value: 'TOUS' },
  { label: 'Ouverts', value: 'OUVERT' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Clôturés', value: 'CLOTURE' },
  { label: 'Brouillons', value: 'BROUILLON' },
];

const STATUS_PILL: Record<string, 'vert' | 'or' | 'rouge' | 'violet' | 'gris'> = {
  OUVERT: 'vert',
  EN_COURS: 'or',
  CLOTURE: 'rouge',
  BROUILLON: 'gris',
  ARCHIVE: 'gris',
};

const STATUS_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  CLOTURE: 'Clôturé',
  BROUILLON: 'Brouillon',
  ARCHIVE: 'Archivé',
};

const TYPE_PILL: Record<string, 'violet' | 'rouge' | 'or' | 'vert' | 'gris'> = {
  REGIONAL: 'violet',
  DISTRICT: 'or',
  PAROISSIAL: 'vert',
  NATIONAL: 'rouge',
  COMMUNAUTE: 'gris',
};

const TYPE_LABELS: Record<string, string> = {
  REGIONAL: 'Régional',
  DISTRICT: 'District',
  PAROISSIAL: 'Paroissial',
  NATIONAL: 'National',
  COMMUNAUTE: 'Communauté',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CampsRegionauxPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CampStatus | 'TOUS'>('TOUS');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await campsApi.list();
        setCamps(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = activeTab === 'TOUS' ? camps : camps.filter(c => c.statut === activeTab);
  const maxParticipants = Math.max(1, ...camps.map(c => c._count?.participants ?? 0));

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="px-6 py-4 flex justify-between items-center mb-5 border-b border-[#ececf0] bg-white -mx-6 -mt-6">
        <h1 className="text-2xl font-black text-[#1F1B2E]">⛺ Camps régionaux</h1>
        <Link href="/dashboard/admin/camps/nouveau"
          className="bg-[#C62828] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#b51d1d] transition-colors">
          + Nouveau camp
        </Link>
      </div>

      {/* Filtre tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map(tab => (
          <button key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab.value
                ? 'bg-[#1F1B2E] text-white'
                : 'bg-white border border-[#e0e0e8] text-[#6b6b78] hover:border-[#1F1B2E] hover:text-[#1F1B2E]'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-[#6b6b78] text-sm">Chargement…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b6b78]">
          <div className="text-5xl mb-3">⛺</div>
          <p className="font-semibold text-base">Aucun camp pour ce filtre</p>
          <p className="text-xs mt-1">Créez un nouveau camp ou modifiez le filtre actif.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(camp => {
          const participants = camp._count?.participants ?? 0;
          return (
            <div key={camp.id} className="bg-white border border-[#ececf0] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#1F1B2E] truncate">{camp.nom}</h2>
                    <Pill variant={TYPE_PILL[camp.type] ?? 'gris'}>{TYPE_LABELS[camp.type] ?? camp.type}</Pill>
                    <Pill variant={STATUS_PILL[camp.statut] ?? 'gris'}>{STATUS_LABELS[camp.statut] ?? camp.statut}</Pill>
                  </div>
                  {camp.theme && <p className="text-xs text-[#6b6b78] mt-0.5 truncate">Thème : {camp.theme}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-[#6b6b78]">
                <div>
                  <span className="font-semibold text-[#1F1B2E]">Début</span><br />
                  {formatDate(camp.dateDebut)}
                </div>
                <div>
                  <span className="font-semibold text-[#1F1B2E]">Fin</span><br />
                  {formatDate(camp.dateFin)}
                </div>
                <div>
                  <span className="font-semibold text-[#1F1B2E]">Lieu</span><br />
                  {camp.lieu}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6b6b78]">Participants</span>
                  <span className="font-semibold text-[#1F1B2E]">{participants}</span>
                </div>
                <Progress value={participants} max={maxParticipants} />
              </div>

              <div className="flex justify-end">
                <Link href={`/dashboard/region/participants?campId=${camp.id}`}
                  className="text-xs border border-[#e6e6ea] text-[#1F1B2E] rounded-lg px-3 py-1.5 font-semibold hover:bg-[#f6f6fa] transition-colors">
                  Voir participants →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
