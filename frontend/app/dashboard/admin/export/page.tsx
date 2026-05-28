'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { campsApi, exportApi } from '@/lib/api';
import { Select, InfoBanner } from '@/components/ui';
import type { Camp, CampParticipant } from '@/types';

export default function ExportPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [campId, setCampId] = useState('');
  const [participants, setParticipants] = useState<CampParticipant[]>([]);
  const [participantsCampId, setParticipantsCampId] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    campsApi.list().then(r => {
      setCamps(r.data);
      if (r.data.length > 0) setCampId(r.data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!campId) {
      return;
    }

    let cancelled = false;
    campsApi.participants(campId)
      .then(r => {
        if (cancelled) return;
        setParticipants(r.data);
        setParticipantsCampId(campId);
      })
      .catch(() => {
        if (cancelled) return;
        setParticipants([]);
        setParticipantsCampId(campId);
      });
    return () => {
      cancelled = true;
    };
  }, [campId]);

  const visibleParticipants = participantsCampId === campId ? participants : [];

  const handleDownload = async () => {
    if (!campId) return;
    setDownloading(true);
    try {
      const { data } = await exportApi.campParticipantsFile(campId);
      const href = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = href;
      link.download = `participants-${campId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm opacity-80 mb-2">‹ Retour</button>
        <h1 className="text-xl font-bold">Export Excel</h1>
        <p className="text-xs opacity-85 mt-0.5">Liste des participants par camp</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
        <div className="lg:max-w-3xl lg:mx-auto">
        <InfoBanner icon="📋">
          L&apos;export est <strong>limité à ton périmètre</strong>. Aucun montant de cotisation n&apos;est exporté.
        </InfoBanner>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#1F1B2E] mb-1.5">Camp</label>
          <Select value={campId} onChange={e => setCampId(e.target.value)}>
            {camps.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            {camps.length === 0 && <option value="">Aucun camp disponible</option>}
          </Select>
        </div>

        <div className="text-xs font-semibold text-[#1F1B2E] mb-2">Aperçu (5 premières lignes)</div>
        <div className="bg-white border border-[#ececf0] rounded-2xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="bg-[#6A1B9A] text-white text-left">
                  {['N°', 'Nom', 'Matricule', 'Paroisse', 'Adhésion', 'Statut'].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleParticipants.slice(0, 5).map((p, index) => (
                  <tr key={p.id} className="border-t border-[#f0f0f4] hover:bg-[#fafafc]">
                    <td className="px-3 py-2.5 text-[#6b6b78]">{index + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-[#1F1B2E]">{p.user.prenoms} {p.user.nom}</td>
                    <td className="px-3 py-2.5 font-mono text-[#6b6b78]">{p.user.matricule ?? '—'}</td>
                    <td className="px-3 py-2.5 text-[#6b6b78]">{p.parish.nom}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.adhesionStatusSnapshot === 'A_JOUR' ? 'bg-[#e1f4e3] text-[#2E7D32]' :
                        p.adhesionStatusSnapshot === 'NON_A_JOUR' ? 'bg-[#fff3d6] text-[#9c7218]' :
                        'bg-[#f0e3ff] text-[#6A1B9A]'
                      }`}>{p.adhesionStatusSnapshot}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[#6b6b78]">{p.participationStatus}</td>
                  </tr>
                ))}
                {participantsCampId === campId && visibleParticipants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-[#6b6b78]">
                      Aucun participant sélectionné pour ce camp.
                    </td>
                  </tr>
                )}
                {participantsCampId !== campId && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-[#6b6b78]">
                      Chargement…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-[#6b6b78] text-center mb-4">
          ⚠️ Aucun montant de cotisation n&apos;est exporté
        </p>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!campId || downloading}
          className={`block w-full text-center font-bold text-sm py-3.5 rounded-xl transition ${
            campId ? 'bg-[#2E7D32] text-white hover:bg-[#256128]' : 'bg-[#e6e6ea] text-[#6b6b78]'
          }`}
        >
          {downloading ? 'Téléchargement…' : '📥 Télécharger .xlsx'}
        </button>
        </div>
      </div>
    </div>
  );
}
