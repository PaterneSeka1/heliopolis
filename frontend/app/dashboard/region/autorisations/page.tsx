'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { campsApi } from '@/lib/api';
import { useUnreadCounts } from '@/store/unreadCounts';
import { deferEffect } from '@/lib/effects';
import { Card, SectionTitle } from '@/components/ui';
import type { AutorisationSortie, AutorisationStatut } from '@/types';

const STATUT_CFG: Record<AutorisationStatut, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-[#fff3d6] text-[#9c7218]' },
  APPROUVEE:  { label: 'Approuvée',  color: 'bg-[#e1f4e3] text-[#2E7D32]' },
  REFUSEE:    { label: 'Refusée',    color: 'bg-[#fde8e8] text-[#E55A35]' },
  EXPIREE:    { label: 'Expirée',    color: 'bg-[#f0f0f3] text-[#6b6b78]' },
};

type Filtre = 'EN_ATTENTE' | 'TOUTES';

export default function RegionAutorisationsPage() {
  const [autorisations, setAutorisations] = useState<AutorisationSortie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState<Filtre>('EN_ATTENTE');
  const refreshAutorisations = useUnreadCounts(s => s.refreshAutorisations);

  const [reponseModal, setReponseModal] = useState<{ id: string; action: 'valider' | 'refuser' } | null>(null);
  const [reponseText, setReponseText] = useState('');
  const [reponseLoading, setReponseLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      const { data } = await campsApi.allAutorisations(filtre === 'EN_ATTENTE' ? 'EN_ATTENTE' : undefined);
      setAutorisations(data as AutorisationSortie[]);
    } catch { /* ignore */ } finally { setChargement(false); }
  }, [filtre]);

  useEffect(() => deferEffect(reload), [reload]);

  const handleReponse = async () => {
    if (!reponseModal) return;
    const a = autorisations.find(x => x.id === reponseModal.id);
    if (!a) return;
    setReponseLoading(true);
    try {
      if (reponseModal.action === 'valider') {
        await campsApi.validerAutorisation(a.campId, a.id, reponseText || undefined);
      } else {
        await campsApi.refuserAutorisation(a.campId, a.id, reponseText || undefined);
      }
      setReponseModal(null);
      setReponseText('');
      await reload();
      void refreshAutorisations();
    } catch { /* ignore */ } finally { setReponseLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-4 border-b border-[#ececf0] pb-4">
          <h1 className="text-xl lg:text-2xl font-black text-[#1F1B2E]">🚪 Autorisations de sortie</h1>
          <p className="text-xs text-[#6b6b78] mt-0.5">Demandes soumises par les Sentinelles et Guides, tous camps confondus.</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Demandes</SectionTitle>
          <div className="flex gap-1.5">
            {(['EN_ATTENTE', 'TOUTES'] as Filtre[]).map(f => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                  filtre === f ? 'bg-[#1F1B2E] text-white' : 'bg-[#f3f3f5] text-[#6b6b78] hover:bg-[#e8e8ec]'
                }`}
              >
                {f === 'EN_ATTENTE' ? 'En attente' : 'Toutes'}
              </button>
            ))}
          </div>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center py-16 text-sm text-[#6b6b78]">Chargement…</div>
        ) : autorisations.length === 0 ? (
          <Card className="text-center py-8 text-sm text-[#6b6b78]">
            <div className="text-2xl mb-1">🚪</div>
            <p>{filtre === 'EN_ATTENTE' ? 'Aucune demande en attente.' : 'Aucune demande reçue.'}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {autorisations.map(a => {
              const s = STATUT_CFG[a.statut];
              return (
                <div key={a.id} className={`bg-white border rounded-2xl p-4 ${
                  a.statut === 'EN_ATTENTE' ? 'border-[#ffd700] shadow-sm' : 'border-[#ececf0]'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {a.camp && (
                        <Link href={`/dashboard/region/camps/${a.campId}`} className="text-[11px] font-bold text-[#6A1B9A] hover:underline">
                          ⛺ {a.camp.nom}
                        </Link>
                      )}
                      <div className="text-[11px] text-[#6b6b78] mt-0.5">
                        Sentinelle : <span className="font-semibold text-[#1F1B2E]">
                          {a.demandeur.prenoms} {a.demandeur.nom}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1F1B2E] leading-snug mt-0.5">{a.motif}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${s.color}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {a.personnes.map(p => (
                      <span key={p.id} className="text-[10px] bg-[#f3f3f5] text-[#1F1B2E] px-2 py-0.5 rounded-full">
                        {p.nomSnapshot}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-[#6b6b78] mb-2">
                    Sortie : <span className="font-semibold text-[#1F1B2E]">{new Date(a.heureSortie).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    {' · '}Retour : <span className="font-semibold text-[#1F1B2E]">{new Date(a.dateHeureRetour).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {' · '}{a.personnes.length} personne(s)
                  </div>

                  {a.reponse && (
                    <p className="text-[11px] px-2.5 py-1.5 bg-[#f7f5fb] rounded-lg text-[#4a1370] italic mb-2">
                      {a.reponse}
                    </p>
                  )}

                  {a.statut === 'EN_ATTENTE' && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { setReponseModal({ id: a.id, action: 'valider' }); setReponseText(''); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256227] transition-colors"
                      >
                        ✓ Valider
                      </button>
                      <button
                        onClick={() => { setReponseModal({ id: a.id, action: 'refuser' }); setReponseText(''); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#E55A35] hover:bg-[#c94d2b] transition-colors"
                      >
                        ✕ Refuser
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal réponse ───────────────────────────────────── */}
      {reponseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl">
            <div className="px-5 pt-5 pb-3 border-b border-[#ececf0]">
              <h2 className="text-base font-black text-[#1F1B2E]">
                {reponseModal.action === 'valider' ? '✓ Valider l\'autorisation' : '✕ Refuser l\'autorisation'}
              </h2>
              <p className="text-xs text-[#6b6b78] mt-0.5">
                La Sentinelle et les chargés de sécurité seront notifiés.
              </p>
            </div>
            <div className="p-5">
              <textarea
                value={reponseText}
                onChange={e => setReponseText(e.target.value)}
                placeholder="Message optionnel…"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4731] focus:border-transparent"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setReponseModal(null); setReponseText(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#6b6b78] bg-[#f3f3f5] hover:bg-[#e8e8ec] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReponse}
                  disabled={reponseLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 ${
                    reponseModal.action === 'valider' ? 'bg-[#2E7D32] hover:bg-[#256227]' : 'bg-[#E55A35] hover:bg-[#c94d2b]'
                  }`}
                >
                  {reponseLoading ? '…' : reponseModal.action === 'valider' ? 'Valider' : 'Refuser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
