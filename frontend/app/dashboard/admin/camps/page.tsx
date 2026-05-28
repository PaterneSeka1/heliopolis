'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { campsApi } from '@/lib/api';
import { Card, Pill } from '@/components/ui';
import type { Camp, CampStatus } from '@/types';

const STATUS_SUIVANT: Partial<Record<CampStatus, { label: string; value: CampStatus }>> = {
  BROUILLON: { label: '✓ Ouvrir', value: 'OUVERT' },
  OUVERT:    { label: '▶ Démarrer', value: 'EN_COURS' },
  EN_COURS:  { label: '✕ Clôturer', value: 'CLOTURE' },
};

type Filtre = 'TOUS' | 'OUVERT' | 'EN_COURS' | 'BROUILLON';

const FILTRES: { key: Filtre; label: string }[] = [
  { key: 'TOUS', label: 'Tous' },
  { key: 'OUVERT', label: 'Ouverts' },
  { key: 'EN_COURS', label: 'En cours' },
  { key: 'BROUILLON', label: 'Brouillons' },
];

function statutVariant(statut: string): 'vert' | 'or' | 'rouge' | 'violet' {
  if (statut === 'OUVERT') return 'vert';
  if (statut === 'EN_COURS') return 'or';
  if (statut === 'BROUILLON') return 'violet';
  return 'rouge';
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GestionCampsPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [filtre, setFiltre] = useState<Filtre>('TOUS');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const reload = () => campsApi.list().then(r => setCamps(r.data)).catch(() => {});

  useEffect(() => { reload(); }, []);

  const handleStatusChange = async (id: string, statut: CampStatus) => {
    setUpdatingId(id);
    try {
      await campsApi.updateStatus(id, statut);
      reload();
    } catch { /* ignore */ } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filtre === 'TOUS' ? camps : camps.filter(c => c.statut === filtre);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm opacity-80 mb-2">‹ Retour</button>
        <h1 className="text-xl font-bold">⛺ Gestion des Camps</h1>
        <p className="text-xs opacity-85 mt-0.5">{camps.length} camp{camps.length !== 1 ? 's' : ''} au total</p>
      </div>

      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {FILTRES.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filtre === f.key
                ? 'bg-[#6A1B9A] text-white'
                : 'bg-[#f0f0f4] text-[#6b6b78]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-8 pb-24">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6b6b78] text-sm">
            <div className="text-3xl mb-3">⛺</div>
            <p>Aucun camp dans cette catégorie.</p>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
        {filtered.map(camp => (
          <Card key={camp.id} className="mb-2.5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1F1B2E] truncate">{camp.nom}</div>
                <div className="text-xs text-[#6b6b78] mt-0.5">{camp.lieu} · {camp.type}</div>
              </div>
              <Pill variant={statutVariant(camp.statut)} solid className="flex-shrink-0 ml-2 text-[11px]">
                {camp.statut}
              </Pill>
            </div>
            <div className="flex gap-3 text-xs text-[#6b6b78] mb-3">
              <span>📅 {formatDate(camp.dateDebut)} → {formatDate(camp.dateFin)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/admin/camps/${camp.id}`}
                className="flex-1 text-center border border-[#e6e6ea] text-[#1F1B2E] font-semibold text-xs py-2 rounded-xl hover:bg-[#f7f7fb] transition-colors"
              >
                Voir détail
              </Link>
              {STATUS_SUIVANT[camp.statut as CampStatus] ? (
                <button
                  onClick={() => handleStatusChange(camp.id, STATUS_SUIVANT[camp.statut as CampStatus]!.value)}
                  disabled={updatingId === camp.id}
                  className="flex-1 text-center bg-[#6A1B9A] text-white font-semibold text-xs py-2 rounded-xl disabled:opacity-50 hover:bg-[#4a1370] transition-colors"
                >
                  {updatingId === camp.id ? '…' : STATUS_SUIVANT[camp.statut as CampStatus]!.label}
                </button>
              ) : (
                <Link
                  href={`/dashboard/admin/camps/${camp.id}`}
                  className="flex-1 text-center bg-[#6b6b78]/20 text-[#6b6b78] font-semibold text-xs py-2 rounded-xl"
                >
                  Archivé
                </Link>
              )}
            </div>
          </Card>
        ))}
        </div>
      </div>

      <Link
        href="/dashboard/admin/camps/nouveau"
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-8 bg-[#C62828] text-white font-bold text-sm px-5 py-3.5 rounded-full shadow-lg z-10"
      >
        + Nouveau camp
      </Link>
    </div>
  );
}
