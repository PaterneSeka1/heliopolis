'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { campsApi } from '@/lib/api';
import { Pill, Select } from '@/components/ui';
import type { Camp, CampParticipant, AdhesionStatus, ParticipationStatus } from '@/types';

const ADHESION_PILL: Record<AdhesionStatus, 'vert' | 'rouge' | 'or'> = {
  A_JOUR: 'vert',
  NON_A_JOUR: 'rouge',
  EN_ATTENTE: 'or',
};
const ADHESION_LABELS: Record<AdhesionStatus, string> = {
  A_JOUR: 'À jour',
  NON_A_JOUR: 'Non à jour',
  EN_ATTENTE: 'En attente',
};

const PARTICIPATION_PILL: Record<ParticipationStatus, 'vert' | 'rouge' | 'or' | 'violet' | 'gris'> = {
  SELECTIONNE: 'vert',
  CONFIRME: 'vert',
  PRESENT: 'vert',
  EN_ATTENTE: 'or',
  NON_SELECTIONNE: 'gris',
  DESISTE: 'rouge',
  ABSENT: 'rouge',
};
const PARTICIPATION_LABELS: Record<ParticipationStatus, string> = {
  SELECTIONNE: 'Sélectionné',
  CONFIRME: 'Confirmé',
  PRESENT: 'Présent',
  EN_ATTENTE: 'En attente',
  NON_SELECTIONNE: 'Non sélectionné',
  DESISTE: 'Désisté',
  ABSENT: 'Absent',
};

function ParticipantsContent() {
  const searchParams = useSearchParams();
  const initialCampId = searchParams.get('campId') ?? '';

  const [camps, setCamps] = useState<Camp[]>([]);
  const [selectedCampId, setSelectedCampId] = useState(initialCampId);
  const [participants, setParticipants] = useState<CampParticipant[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [loadingParts, setLoadingParts] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await campsApi.list();
        setCamps(data);
        if (!initialCampId && data[0]?.id) setSelectedCampId(data[0].id);
      } catch { /* ignore */ }
      finally { setLoadingCamps(false); }
    })();
  }, [initialCampId]);

  useEffect(() => {
    if (!selectedCampId) return;
    setLoadingParts(true);
    (async () => {
      try {
        const { data } = await campsApi.participants(selectedCampId);
        setParticipants(data);
      } catch { setParticipants([]); }
      finally { setLoadingParts(false); }
    })();
  }, [selectedCampId]);

  const filtered = participants.filter(p => {
    const q = search.toLowerCase();
    const nom = `${p.user.prenoms ?? ''} ${p.user.nom ?? ''}`.toLowerCase();
    const mat = (p.user.matricule ?? '').toLowerCase();
    return !q || nom.includes(q) || mat.includes(q);
  });

  const total = participants.length;
  const confirmes = participants.filter(p => ['CONFIRME', 'PRESENT'].includes(p.participationStatus)).length;
  const enAttente = participants.filter(p => p.participationStatus === 'EN_ATTENTE').length;
  const selectionnes = participants.filter(p => p.participationStatus === 'SELECTIONNE').length;

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="px-6 py-4 flex justify-between items-center mb-5 border-b border-[#ececf0] bg-white -mx-6 -mt-6">
        <h1 className="text-2xl font-black text-[#1F1B2E]">👥 Participants</h1>
        <Link href="/dashboard/admin/export"
          className="bg-[#6A1B9A] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#5a1280] transition-colors">
          📤 Exporter
        </Link>
      </div>

      {/* Select camp */}
      <div className="mb-5 max-w-sm">
        {loadingCamps ? (
          <div className="h-10 bg-white border border-[#e6e6ea] rounded-xl animate-pulse" />
        ) : (
          <Select
            value={selectedCampId}
            onChange={e => setSelectedCampId(e.target.value)}
            className="w-full">
            <option value="">— Sélectionner un camp —</option>
            {camps.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </Select>
        )}
      </div>

      {/* KPIs */}
      {selectedCampId && (
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {[
            { label: 'Total', value: total, color: '#1F1B2E' },
            { label: 'Confirmés', value: confirmes, color: '#2E7D32' },
            { label: 'En attente', value: enAttente, color: '#D9A441' },
            { label: 'Sélectionnés', value: selectionnes, color: '#6A1B9A' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-[#ececf0] rounded-2xl p-4">
              <div className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-xs text-[#6b6b78] uppercase tracking-wide mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {selectedCampId && (
        <div className="mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-[#e0e0e8] rounded-xl px-3 py-2 text-sm outline-none w-72"
            placeholder="🔍 Rechercher par nom ou matricule…"
          />
        </div>
      )}

      {/* Table */}
      {selectedCampId && (
        loadingParts ? (
          <div className="flex items-center justify-center py-16 text-[#6b6b78] text-sm">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#6b6b78]">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-semibold">Aucun participant trouvé</p>
          </div>
        ) : (
          <div className="bg-white border border-[#ececf0] rounded-2xl overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#f9f9fc] text-[#6b6b78] uppercase tracking-wide">
                  {['Nom', 'Matricule', 'Paroisse', 'Doyenné', 'Adhésion', 'Statut participation'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold border-b border-[#ececf0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[#f0f0f4] hover:bg-[#fafafc]">
                    <td className="px-4 py-3 font-semibold text-[#1F1B2E]">
                      {p.user.prenoms} {p.user.nom}
                    </td>
                    <td className="px-4 py-3 text-[#6b6b78] font-mono">{p.user.matricule ?? '—'}</td>
                    <td className="px-4 py-3 text-[#6b6b78]">{p.parish?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-[#6b6b78]">{p.district?.nom ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Pill variant={ADHESION_PILL[p.adhesionStatusSnapshot]}>
                        {ADHESION_LABELS[p.adhesionStatusSnapshot]}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill variant={PARTICIPATION_PILL[p.participationStatus]}>
                        {PARTICIPATION_LABELS[p.participationStatus]}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!selectedCampId && !loadingCamps && (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b6b78]">
          <div className="text-5xl mb-3">⛺</div>
          <p className="font-semibold">Sélectionnez un camp pour voir les participants</p>
        </div>
      )}
    </div>
  );
}

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#6b6b78] text-sm">Chargement…</div>}>
      <ParticipantsContent />
    </Suspense>
  );
}
