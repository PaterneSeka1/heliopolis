'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { usersApi } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';
import type { User, AdhesionStatus, Adhesion } from '@/types';

const PER_PAGE = 10;

const CURRENT_YEAR = new Date().getFullYear();

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:4000';

const STATUS_LABEL: Record<AdhesionStatus, string> = {
  A_JOUR: 'À jour',
  NON_A_JOUR: 'Non à jour',
  EN_ATTENTE: 'En attente',
};

const STATUS_PILL: Record<AdhesionStatus, string> = {
  A_JOUR: 'bg-green-100 text-[#2E7D32] border border-green-200',
  NON_A_JOUR: 'bg-red-100 text-[#C62828] border border-red-200',
  EN_ATTENTE: 'bg-amber-100 text-[#D9A441] border border-amber-200',
};

function AdhesionPill({ statut }: { statut?: AdhesionStatus }) {
  if (!statut) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        Non renseigné
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_PILL[statut]}`}>
      {STATUS_LABEL[statut]}
    </span>
  );
}

interface RowState {
  selectedStatut: AdhesionStatus | null;
  file: File | null;
  loading: boolean;
  success: boolean;
  error: string;
}

export default function GuideAdhesionsPage() {
  const { user } = useAuthStore();
  const [gardiens, setGardiens] = useState<User[]>([]);
  const [loadingGardiens, setLoadingGardiens] = useState(true);
  const [search, setSearch] = useState('');

  // Guide own adhesion state
  const [guideStatut, setGuideStatut] = useState<AdhesionStatus | null>(null);
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideSuccess, setGuideSuccess] = useState(false);
  const [guideError, setGuideError] = useState('');
  const guideFileRef = useRef<HTMLInputElement>(null);

  // Gardien rows: activeRow = id of expanded row, rowStates = per-row state
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const rowFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Local adhesion cache for gardiens (updated after save)
  const [adhesionCache, setAdhesionCache] = useState<Record<string, Adhesion | undefined>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ role: 'GARDIEN' });
        setGardiens(data);
        // Build initial adhesion cache from returned data
        const cache: Record<string, Adhesion | undefined> = {};
        for (const g of data as User[]) {
          cache[g.id] = g.adhesions?.find(a => a.annee === CURRENT_YEAR) ?? g.adhesions?.[0];
        }
        setAdhesionCache(cache);
      } catch {
        // ignore
      } finally {
        setLoadingGardiens(false);
      }
    })();
  }, []);

  const currentGuideAdhesion = user?.adhesions?.find(a => a.annee === CURRENT_YEAR) ?? user?.adhesions?.[0];

  const handleGuideSave = async () => {
    if (!user || !guideStatut) return;
    setGuideLoading(true);
    setGuideError('');
    setGuideSuccess(false);
    try {
      await usersApi.updateAdhesion(user.id, CURRENT_YEAR, guideStatut, guideFile ?? undefined);
      setGuideSuccess(true);
      setGuideFile(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setGuideError(err?.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setGuideLoading(false);
    }
  };

  const getRowState = (id: string): RowState =>
    rowStates[id] ?? { selectedStatut: null, file: null, loading: false, success: false, error: '' };

  const setRowState = (id: string, patch: Partial<RowState>) => {
    setRowStates(prev => ({
      ...prev,
      [id]: { ...getRowState(id), ...patch },
    }));
  };

  const handleRowSave = async (gardienId: string) => {
    const rs = getRowState(gardienId);
    if (!rs.selectedStatut) return;
    setRowState(gardienId, { loading: true, error: '', success: false });
    try {
      const { data } = await usersApi.updateAdhesion(
        gardienId,
        CURRENT_YEAR,
        rs.selectedStatut,
        rs.file ?? undefined,
      );
      setAdhesionCache(prev => ({ ...prev, [gardienId]: data as Adhesion }));
      setRowState(gardienId, { loading: false, success: true, file: null });
      // Collapse after a brief delay
      setTimeout(() => {
        setActiveRow(null);
        setRowState(gardienId, { success: false });
      }, 1200);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setRowState(gardienId, {
        loading: false,
        error: err?.response?.data?.message ?? 'Erreur lors de la mise à jour.',
      });
    }
  };

  const filtered = gardiens.filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.nom.toLowerCase().includes(q) ||
      g.prenoms.toLowerCase().includes(q) ||
      (g.matricule ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-[#ececf0] pb-4">
        <h1 className="text-xl lg:text-2xl font-black text-[#1F1B2E]">
          📋 Adhésions {CURRENT_YEAR}
        </h1>
      </div>

      {/* ── Section : Mon adhésion ── */}
      <div className="bg-white border border-[#ececf0] rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#1F1B2E]">Mon adhésion</h2>
          <AdhesionPill statut={currentGuideAdhesion?.statut} />
        </div>

        {/* Status buttons */}
        <div className="flex gap-2 mb-3">
          {(['A_JOUR', 'EN_ATTENTE', 'NON_A_JOUR'] as AdhesionStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setGuideStatut(s)}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                guideStatut === s
                  ? s === 'A_JOUR'
                    ? 'bg-green-600 text-white border-green-600'
                    : s === 'EN_ATTENTE'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-[#C62828] text-white border-[#C62828]'
                  : 'bg-gray-50 text-[#1F1B2E] border-[#ececf0] hover:bg-gray-100'
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* File upload */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => guideFileRef.current?.click()}
            className="text-xs font-medium text-[#6A1B9A] hover:text-[#4a1370] transition-colors"
          >
            📎 Joindre une preuve
          </button>
          {guideFile && (
            <span className="text-xs text-gray-600 truncate max-w-[200px]">{guideFile.name}</span>
          )}
          {!guideFile && currentGuideAdhesion?.preuveUrl && (
            <a
              href={`${API_BASE}${currentGuideAdhesion.preuveUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6A1B9A] hover:underline"
            >
              Voir la preuve existante
            </a>
          )}
          <input
            ref={guideFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setGuideFile(f); setGuideSuccess(false); }
              e.target.value = '';
            }}
          />
        </div>

        {guideSuccess && (
          <p className="text-xs text-green-600 mb-2">✓ Adhésion mise à jour.</p>
        )}
        {guideError && (
          <p className="text-xs text-[#C62828] mb-2">{guideError}</p>
        )}

        <button
          onClick={handleGuideSave}
          disabled={guideLoading || !guideStatut}
          className="w-full bg-[#1F1B2E] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#2d2640] transition-colors disabled:opacity-40"
        >
          {guideLoading ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* ── Section : Mes Gardiens ── */}
      <div className="bg-white border border-[#ececf0] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#1F1B2E]">
            Mes Gardiens{user?.parish ? ` — ${user.parish.nom}` : ''}
          </h2>
          <span className="text-xs text-gray-400">{gardiens.length} gardien{gardiens.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#e0e0e8] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6A1B9A] focus:ring-1 focus:ring-[#6A1B9A]/20 transition-colors"
            placeholder="🔍 Rechercher par nom ou matricule…"
          />
        </div>

        {loadingGardiens ? (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🌿</div>
            <p className="text-sm font-medium">Aucun gardien trouvé</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(g => {
              const adhesion = adhesionCache[g.id];
              const rs = getRowState(g.id);
              const isActive = activeRow === g.id;

              return (
                <div
                  key={g.id}
                  className="border border-[#ececf0] rounded-xl overflow-hidden"
                >
                  {/* Row header */}
                  <div className="flex items-center gap-3 p-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#3d1163] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {g.nom[0]}{g.prenoms[0]}
                    </div>

                    {/* Name + matricule */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#1F1B2E] truncate">
                        {g.prenoms} {g.nom}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {g.matricule ?? '—'}
                      </div>
                    </div>

                    {/* Adhesion pill */}
                    <AdhesionPill statut={adhesion?.statut} />

                    {/* Toggle button */}
                    <button
                      onClick={() => {
                        if (isActive) {
                          setActiveRow(null);
                        } else {
                          setActiveRow(g.id);
                          // Pre-select current status
                          setRowState(g.id, {
                            selectedStatut: adhesion?.statut ?? null,
                            file: null,
                            success: false,
                            error: '',
                          });
                        }
                      }}
                      className="text-xs font-semibold text-[#6A1B9A] hover:text-[#4a1370] transition-colors flex-shrink-0 ml-1"
                    >
                      {isActive ? 'Fermer' : 'Mettre à jour'}
                    </button>
                  </div>

                  {/* Inline expand */}
                  {isActive && (
                    <div className="border-t border-[#ececf0] bg-[#fafafa] p-3">
                      {/* Status buttons */}
                      <div className="flex gap-2 mb-2">
                        {(['A_JOUR', 'EN_ATTENTE', 'NON_A_JOUR'] as AdhesionStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setRowState(g.id, { selectedStatut: s })}
                            className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                              rs.selectedStatut === s
                                ? s === 'A_JOUR'
                                  ? 'bg-green-600 text-white border-green-600'
                                  : s === 'EN_ATTENTE'
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-[#C62828] text-white border-[#C62828]'
                                : 'bg-white text-[#1F1B2E] border-[#e0e0e8] hover:bg-gray-50'
                            }`}
                          >
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>

                      {/* File upload */}
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => rowFileRefs.current[g.id]?.click()}
                          className="text-xs font-medium text-[#6A1B9A] hover:text-[#4a1370] transition-colors"
                        >
                          📎 Joindre une preuve
                        </button>
                        {rs.file && (
                          <span className="text-xs text-gray-600 truncate max-w-[180px]">{rs.file.name}</span>
                        )}
                        {!rs.file && adhesion?.preuveUrl && (
                          <a
                            href={`${API_BASE}${adhesion.preuveUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#6A1B9A] hover:underline"
                          >
                            Voir la preuve
                          </a>
                        )}
                        <input
                          ref={el => { rowFileRefs.current[g.id] = el; }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) setRowState(g.id, { file: f, success: false });
                            e.target.value = '';
                          }}
                        />
                      </div>

                      {rs.success && (
                        <p className="text-xs text-green-600 mb-2">✓ Adhésion mise à jour.</p>
                      )}
                      {rs.error && (
                        <p className="text-xs text-[#C62828] mb-2">{rs.error}</p>
                      )}

                      <button
                        onClick={() => handleRowSave(g.id)}
                        disabled={rs.loading || !rs.selectedStatut}
                        className="w-full bg-[#6A1B9A] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#5a1280] transition-colors disabled:opacity-40"
                      >
                        {rs.loading ? 'Enregistrement…' : 'Enregistrer'}
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
  );
}
