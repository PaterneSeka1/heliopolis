'use client';
import { useEffect, useState } from 'react';
import { campsApi, exportApi } from '@/lib/api';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Select, InfoBanner } from '@/components/ui';
import type { Camp } from '@/types';

const MOCK_ROWS = [
  { n: 1, nom: 'Kouamé E.', matricule: '0525247O', paroisse: 'St-Joseph', adhesion: 'À jour', statut: 'Confirmé' },
  { n: 2, nom: 'Moussa S.',  matricule: '0525248P', paroisse: 'St-Joseph', adhesion: 'À jour', statut: 'Confirmé' },
  { n: 3, nom: 'Traoré A.',  matricule: '0525249Q', paroisse: 'St-Paul',   adhesion: 'Non à jour', statut: 'Sélectionné' },
  { n: 4, nom: 'Diomandé B.',matricule: '0525250R', paroisse: 'St-Paul',   adhesion: 'En attente', statut: 'Sélectionné' },
  { n: 5, nom: "N'Guessan F.",matricule:'0525251S', paroisse: 'Christ-Roi',adhesion: 'À jour', statut: 'Confirmé' },
];

export default function ExportPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [campId, setCampId] = useState('');

  useEffect(() => {
    campsApi.list().then(r => {
      setCamps(r.data);
      if (r.data.length > 0) setCampId(r.data[0].id);
    }).catch(() => {});
  }, []);

  const downloadUrl = campId ? exportApi.campParticipants(campId) : '#';

  return (
    <AuthGuard roles={['ADMIN', 'REGION', 'SENTINELLE']}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
          <button onClick={() => history.back()} className="text-sm opacity-80 mb-2">‹ Retour</button>
          <h1 className="text-xl font-bold">Export Excel</h1>
          <p className="text-xs opacity-85 mt-0.5">Liste des participants par camp</p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
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

          {/* Preview table */}
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
                  {MOCK_ROWS.map(r => (
                    <tr key={r.n} className="border-t border-[#f0f0f4] hover:bg-[#fafafc]">
                      <td className="px-3 py-2.5 text-[#6b6b78]">{r.n}</td>
                      <td className="px-3 py-2.5 font-medium text-[#1F1B2E]">{r.nom}</td>
                      <td className="px-3 py-2.5 font-mono text-[#6b6b78]">{r.matricule}</td>
                      <td className="px-3 py-2.5 text-[#6b6b78]">{r.paroisse}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.adhesion === 'À jour' ? 'bg-[#e1f4e3] text-[#2E7D32]' :
                          r.adhesion === 'Non à jour' ? 'bg-[#fff3d6] text-[#9c7218]' :
                          'bg-[#f0e3ff] text-[#6A1B9A]'
                        }`}>{r.adhesion}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[#6b6b78]">{r.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-[#6b6b78] text-center mb-4">
            ⚠️ Aucun montant de cotisation n&apos;est exporté
          </p>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full text-center font-bold text-sm py-3.5 rounded-xl transition ${
              campId ? 'bg-[#2E7D32] text-white hover:bg-[#256128]' : 'bg-[#e6e6ea] text-[#6b6b78] pointer-events-none'
            }`}
          >
            📥 Télécharger .xlsx
          </a>
        </div>
      </div>
    </AuthGuard>
  );
}
