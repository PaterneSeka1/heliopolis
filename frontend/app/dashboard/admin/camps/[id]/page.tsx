'use client';
import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { campsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { deferEffect } from '@/lib/effects';
import { Card, SectionTitle, Pill } from '@/components/ui';
import { CampPhotosSection } from '@/components/camps/CampPhotosSection';
import type { Camp, CampParticipant, CampStatus, AutorisationSortie } from '@/types';

const STATUTS: { value: CampStatus; label: string; dot: string }[] = [
  { value: 'BROUILLON', label: 'Brouillon', dot: 'bg-[#9b9ba8]' },
  { value: 'OUVERT',    label: 'Ouvert',    dot: 'bg-[#22c55e]' },
  { value: 'EN_COURS',  label: 'En cours',  dot: 'bg-[#f59e0b]' },
  { value: 'CLOTURE',   label: 'Clôturé',   dot: 'bg-[#ef4444]' },
  { value: 'ARCHIVE',   label: 'Archivé',   dot: 'bg-[#c084fc]' },
];

const TRANSITIONS: Record<CampStatus, CampStatus[]> = {
  BROUILLON: ['OUVERT'],
  OUVERT:    ['BROUILLON', 'EN_COURS'],
  EN_COURS:  ['CLOTURE'],
  CLOTURE:   ['ARCHIVE'],
  ARCHIVE:   [],
};

const STATUT_AUTO = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-[#fff3d6] text-[#9c7218]' },
  APPROUVEE:  { label: 'Approuvée',  color: 'bg-[#e1f4e3] text-[#2E7D32]' },
  REFUSEE:    { label: 'Refusée',    color: 'bg-[#fde8e8] text-[#E55A35]' },
  EXPIREE:    { label: 'Expirée',    color: 'bg-[#f0f0f3] text-[#6b6b78]' },
} as const;

const TYPE_LABEL: Record<string, string> = {
  REGIONAL: 'Régional', NATIONAL: 'National',
  DISTRICT: 'District', PAROISSE: 'Paroisse',
};

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#9b9ba8] uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#1F1B2E]">{value}</p>
    </div>
  );
}

export default function AdminCampDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user: actor } = useAuthStore();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [participants, setParticipants] = useState<CampParticipant[]>([]);
  const [autorisations, setAutorisations] = useState<AutorisationSortie[]>([]);
  const [updating, setUpdating] = useState(false);
  const [secuLoadingId, setSecuLoadingId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const canToggleSecurite = actor?.role === 'ADMIN' || actor?.role === 'REGION' || actor?.role === 'SENTINELLE';

  // Modal réponse
  const [reponseModal, setReponseModal] = useState<{ id: string; action: 'valider' | 'refuser' } | null>(null);
  const [reponseText, setReponseText] = useState('');
  const [reponseLoading, setReponseLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [c, p, a] = await Promise.all([
        campsApi.get(id),
        campsApi.participants(id),
        campsApi.autorisations(id)
      ]);
      setCamp(c.data);
      setParticipants(p.data);
      setAutorisations(a.data as AutorisationSortie[]);
    } catch { router.push('/dashboard/admin/camps'); }
  }, [id, router]);

  useEffect(() => deferEffect(reload), [reload]);

  const handleStatus = async (statut: CampStatus) => {
    if (!camp || updating || camp.statut === statut) return;
    setUpdating(true);
    try { await campsApi.updateStatus(id, statut); await reload(); }
    catch { /* ignore */ } finally { setUpdating(false); }
  };

  const handleToggleSecurite = async (p: CampParticipant) => {
    if (secuLoadingId) return;
    setSecuLoadingId(p.id);
    try {
      await campsApi.toggleChargeSecurite(id, p.userId);
      setParticipants(prev =>
        prev.map(x => x.id === p.id ? { ...x, chargeSecurite: !x.chargeSecurite } : x)
      );
    } catch { /* ignore */ } finally { setSecuLoadingId(null); }
  };

  const handleReponse = async () => {
    if (!reponseModal) return;
    setReponseLoading(true);
    try {
      if (reponseModal.action === 'valider') {
        await campsApi.validerAutorisation(id, reponseModal.id, reponseText || undefined);
      } else {
        await campsApi.refuserAutorisation(id, reponseModal.id, reponseText || undefined);
      }
      setReponseModal(null);
      setReponseText('');
      await reload();
    } catch { /* ignore */ } finally { setReponseLoading(false); }
  };

  if (!camp) return (
    <div className="flex-1 flex items-center justify-center text-[#6b6b78] text-sm">
      <div className="text-center"><div className="text-3xl mb-2 animate-pulse">⛺</div>Chargement…</div>
    </div>
  );

  const currentMeta = STATUTS.find(s => s.value === camp.statut);
  const aJour     = participants.filter(p => p.adhesionStatusSnapshot === 'A_JOUR').length;
  const confirmes = participants.filter(p => p.participationStatus === 'CONFIRME').length;
  const autoEnAttente = autorisations.filter(a => a.statut === 'EN_ATTENTE');

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:p-6">
      <div className="space-y-4">

        {/* ── En-tête camp ── */}
        <div>
          <Link href="/dashboard/admin/camps" className="inline-flex items-center gap-1 text-xs text-[#9b9ba8] hover:text-[#1F1B2E] mb-2">
            ‹ Camps
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-[#1F1B2E] leading-tight">{camp.nom}</h1>
              <p className="text-xs text-[#9b9ba8] mt-0.5">{camp.lieu}</p>
            </div>
            {currentMeta && (
              <span className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full border border-[#ececf0] bg-white text-xs font-semibold text-[#1F1B2E]">
                <span className={`w-1.5 h-1.5 rounded-full ${currentMeta.dot}`} />
                {currentMeta.label}
              </span>
            )}
          </div>
        </div>

        {/* ── Changer le statut ── */}
        <div className="bg-white border border-[#ececf0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-bold text-[#9b9ba8] uppercase tracking-widest mb-2">Statut du camp</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {STATUTS.map(s => {
                const isCurrent  = camp.statut === s.value;
                const isAllowed  = (TRANSITIONS[camp.statut] ?? []).includes(s.value);
                return (
                  <button
                    key={s.value}
                    onClick={() => isAllowed ? handleStatus(s.value) : undefined}
                    disabled={updating || (!isCurrent && !isAllowed)}
                    title={!isCurrent && !isAllowed ? `Transition non autorisée depuis ${camp.statut}` : undefined}
                    className={`flex items-center gap-1.5 flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      isCurrent
                        ? 'bg-[#1F1B2E] text-white border-[#1F1B2E] cursor-default'
                        : isAllowed
                          ? 'bg-white border-[#e0e0e8] text-[#1F1B2E] hover:border-[#1F1B2E] hover:bg-[#f5f5f8] cursor-pointer'
                          : 'bg-white border-[#ececf0] text-[#c8c8d0] cursor-not-allowed opacity-40'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCurrent ? 'bg-white/70' : s.dot}`} />
                    {updating && isAllowed ? '…' : s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-[#ececf0] px-4 py-2.5">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl w-full justify-center"
              style={{ background: 'linear-gradient(135deg,#F58A4B,#E55A35)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Publier des photos
            </button>
          </div>
        </div>

        {/* ── Grille principale ── */}
        <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-6 lg:items-start">

          {/* Colonne gauche — infos + participants */}
          <div className="space-y-4">

            {/* Infos camp */}
            <div className="bg-white border border-[#ececf0] rounded-2xl shadow-sm p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Début" value={formatDate(camp.dateDebut)} />
                <InfoRow label="Fin"   value={formatDate(camp.dateFin)} />
                <InfoRow label="Lieu"  value={camp.lieu ?? '—'} />
                <InfoRow label="Type"  value={
                  <span className="inline-flex items-center gap-1">
                    {TYPE_LABEL[camp.type ?? ''] ?? camp.type}
                  </span>
                } />
              </div>
              {camp.theme && (
                <div className="pt-3 border-t border-[#f5f5f8]">
                  <InfoRow label="Thème" value={camp.theme} />
                </div>
              )}
              {camp.description && (
                <p className="text-xs text-[#9b9ba8] leading-relaxed border-t border-[#f5f5f8] pt-3">{camp.description}</p>
              )}
            </div>

            {/* Sélection */}
            <div className="bg-white border border-[#ececf0] rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1F1B2E]">Sélection participants</p>
                <p className="text-xs text-[#9b9ba8] mt-0.5">
                  {camp.selectionOuverte ? 'Ouverte — les Guides peuvent sélectionner' : 'Fermée'}
                </p>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                camp.selectionOuverte ? 'bg-green-50 text-[#2E7D32]' : 'bg-[#f5f5f8] text-[#6b6b78]'
              }`}>
                {camp.selectionOuverte ? '✓ Ouverte' : '✕ Fermée'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Sélectionnés', value: participants.length, color: 'text-[#6A1B9A]' },
                { label: 'Adhésion OK',  value: aJour,               color: 'text-[#2E7D32]' },
                { label: 'Confirmés',    value: confirmes,            color: 'text-[#D9A441]' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-[#ececf0] rounded-2xl p-3 text-center shadow-sm">
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-[#9b9ba8] mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Participants */}
            <div className="bg-white border border-[#ececf0] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f5f5f8] flex items-center justify-between">
                <p className="text-sm font-bold text-[#1F1B2E]">Participants</p>
                <span className="text-xs bg-[#f5f5f8] text-[#6b6b78] px-2 py-0.5 rounded-full font-semibold">{participants.length}</span>
              </div>
              {participants.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#9b9ba8]">
                  <div className="text-2xl mb-2">👥</div>
                  Aucun participant sélectionné.
                </div>
              ) : (
                <div className="divide-y divide-[#f5f5f8] max-h-72 overflow-y-auto">
                  {participants.map(p => {
                    const isSecuLoading = secuLoadingId === p.id;
                    return (
                      <div key={p.id} className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${p.chargeSecurite ? 'bg-[#fffaf9]' : ''}`}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#E55A35] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {p.user.nom?.[0]}{p.user.prenoms?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1F1B2E] truncate">{p.user.prenoms} {p.user.nom}</p>
                          <p className="text-[11px] text-[#9b9ba8] truncate">{p.parish?.nom ?? '—'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.participationStatus === 'EN_ATTENTE' ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setSecuLoadingId(p.id);
                                try {
                                  await campsApi.validerDemande(id, p.userId);
                                  setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, participationStatus: 'SELECTIONNE' as const } : x));
                                } catch { /* ignore */ } finally { setSecuLoadingId(null); }
                              }}
                              disabled={secuLoadingId === p.id}
                              title="Valider la demande de participation"
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#e8f5e9] text-[#2E7D32] border border-[#a5d6a7] hover:bg-[#2E7D32] hover:text-white transition-colors disabled:opacity-40"
                            >
                              {secuLoadingId === p.id ? '…' : '✓ Valider'}
                            </button>
                          ) : (
                            <Pill variant={p.adhesionStatusSnapshot === 'A_JOUR' ? 'vert' : 'or'} className="text-[10px]">
                              {p.adhesionStatusSnapshot === 'A_JOUR' ? 'À jour' : 'En attente'}
                            </Pill>
                          )}
                          {p.roleAtCamp !== 'GARDIEN' && p.participationStatus !== 'EN_ATTENTE' && canToggleSecurite && (
                            <button
                              type="button"
                              onClick={() => handleToggleSecurite(p)}
                              disabled={isSecuLoading}
                              title={p.chargeSecurite ? 'Retirer charge sécurité' : 'Désigner chargé sécurité'}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors disabled:opacity-40 ${
                                p.chargeSecurite
                                  ? 'bg-[#fde8e8] text-[#E55A35] hover:bg-[#fcd0d0]'
                                  : 'bg-[#f5f5f8] text-[#c0c0c8] hover:bg-[#e8e8f0] hover:text-[#6b6b78]'
                              }`}
                            >
                              {isSecuLoading ? '…' : '🛡️'}
                            </button>
                          )}
                          {p.roleAtCamp !== 'GARDIEN' && p.participationStatus !== 'EN_ATTENTE' && !canToggleSecurite && p.chargeSecurite && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#fde8e8] text-[#E55A35]">🛡️</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-[#f5f5f8] p-3">
                <Link
                  href="/dashboard/admin/participants"
                  className="flex items-center justify-center gap-1.5 w-full text-center bg-[#1F1B2E] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#2d2640] transition-colors"
                >
                  Vue complète →
                </Link>
              </div>
            </div>

            {/* ── Autorisations de sortie ─────────────────────────────── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle>
                  Autorisations de sortie
                </SectionTitle>
                {autoEnAttente.length > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#fff3d6] text-[#9c7218]">
                    {autoEnAttente.length} en attente
                  </span>
                )}
              </div>

              {autorisations.length === 0 ? (
                <Card className="text-center py-5 text-sm text-[#6b6b78]">
                  <div className="text-2xl mb-1">🚪</div>
                  <p>Aucune demande d&apos;autorisation reçue.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {autorisations.map(a => {
                    const s = STATUT_AUTO[a.statut];
                    return (
                      <div key={a.id} className={`bg-white border rounded-2xl p-4 ${
                        a.statut === 'EN_ATTENTE' ? 'border-[#ffd700] shadow-sm' : 'border-[#ececf0]'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-[#6b6b78] mb-0.5">
                              Sentinelle : <span className="font-semibold text-[#1F1B2E]">
                                {a.demandeur.prenoms} {a.demandeur.nom}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-[#1F1B2E] leading-snug">{a.motif}</p>
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

                        <div className="text-[10px] text-[#6b6b78] mb-1">
                          Demande : {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
          </div>

          {/* Colonne droite — publications */}
          <div className="mt-4 lg:mt-0">
            <CampPhotosSection
              campId={id}
              singleColumn
              externalUploadOpen={showUploadModal}
              onExternalUploadClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>

      </div>

      {/* ── Modal réponse Administrateur ─────────────────────────────── */}
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
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#1F1B2E] uppercase tracking-wide block mb-1.5">
                Message (optionnel)
              </label>
              <textarea
                value={reponseText}
                onChange={e => setReponseText(e.target.value)}
                rows={3}
                placeholder={reponseModal.action === 'valider'
                  ? 'Consignes particulières pour la sortie…'
                  : 'Raison du refus…'}
                className="w-full border border-[#e6e6ea] rounded-xl px-3 py-2.5 text-sm text-[#1F1B2E] resize-none focus:outline-none focus:ring-2 focus:ring-[#6A1B9A]/30"
              />
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => { setReponseModal(null); setReponseText(''); }}
                className="flex-1 py-3 rounded-xl border border-[#e6e6ea] text-sm font-semibold text-[#6b6b78]"
              >
                Annuler
              </button>
              <button
                onClick={handleReponse}
                disabled={reponseLoading}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 ${
                  reponseModal.action === 'valider' ? 'bg-[#2E7D32]' : 'bg-[#E55A35]'
                }`}
              >
                {reponseLoading ? '…' : reponseModal.action === 'valider' ? 'Confirmer' : 'Refuser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
