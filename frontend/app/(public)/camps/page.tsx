import { campsApi } from '@/lib/api';
import type { Camp } from '@/types';
import { CampCard } from '@/components/camps/CampCard';
import { Pill } from '@/components/ui';

async function getCamps(): Promise<Camp[]> {
  try {
    const { data } = await campsApi.list();
    return data as Camp[];
  } catch {
    return [];
  }
}

export default async function CampsPage() {
  const camps = await getCamps();
  const ouverts = camps.filter((c) => c.statut === 'OUVERT');
  const aVenir = camps.filter((c) => c.statut === 'BROUILLON');
  const clotures = camps.filter((c) => ['CLOTURE', 'ARCHIVE'].includes(c.statut));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Les Camps</h1>
        <p className="text-xs opacity-85 mt-0.5">Liste publique des camps de la Route</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {/* Guest banner */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#FFF1DC] to-white border border-[#f0d98a] rounded-2xl p-3 mb-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F58A4B] to-[#C62828] rounded-l-2xl" />
          <span className="text-xl ml-1">⛺</span>
          <div className="flex-1 text-xs text-[#1F1B2E] leading-relaxed">
            Pour <strong>t&apos;inscrire à un camp</strong>, contacte le Guide de ta paroisse.
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <Pill variant="rouge" solid>
            Tous ({camps.length})
          </Pill>
          <Pill variant="gris">Ouverts ({ouverts.length})</Pill>
          <Pill variant="gris">À venir ({aVenir.length})</Pill>
          <Pill variant="gris">Clôturés ({clotures.length})</Pill>
        </div>

        {camps.length === 0 && (
          <div className="text-center py-10 text-[#6b6b78] text-sm">
            <div className="text-4xl mb-3">⛺</div>
            <p>Aucun camp disponible pour le moment.</p>
          </div>
        )}

        {camps.map((camp) => (
          <CampCard key={camp.id} camp={camp} />
        ))}
      </div>
    </div>
  );
}
