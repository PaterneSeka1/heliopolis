'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { usersApi } from '@/lib/api';
import { Pill } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import type { User } from '@/types';

const PER_PAGE = 20;

const ADHESION_PILL: Record<string, 'vert' | 'rouge' | 'or'> = {
  A_JOUR:    'vert',
  NON_A_JOUR: 'rouge',
  EN_ATTENTE: 'or',
};
const ADHESION_LABEL: Record<string, string> = {
  A_JOUR:    'À jour',
  NON_A_JOUR: 'Non à jour',
  EN_ATTENTE: 'En attente',
};
const STATUT_PILL: Record<string, 'vert' | 'rouge' | 'or' | 'gris'> = {
  ACTIF:                 'vert',
  SUSPENDU:              'rouge',
  EN_ATTENTE_ACTIVATION: 'or',
  INACTIF:               'rouge',
  ARCHIVE:               'gris',
};
const STATUT_LABEL: Record<string, string> = {
  ACTIF:                 'Actif',
  SUSPENDU:              'Suspendu',
  EN_ATTENTE_ACTIVATION: 'En attente',
  INACTIF:               'Inactif',
  ARCHIVE:               'Archivé',
};

export default function GuideMembresPage() {
  const { user: actor } = useAuthStore();
  const [membres, setMembres] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const isSentinelle = actor?.role === 'SENTINELLE';
  const targetRole   = isSentinelle ? 'GUIDE' : 'GARDIEN';
  const territoire   = isSentinelle
    ? (actor?.district?.nom ?? 'Mon doyenné')
    : (actor?.parish?.nom ?? 'Ma paroisse');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ role: targetRole });
        setMembres(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [targetRole]);

  const handleCreated = (newUser: User) => {
    setMembres(prev => [newUser, ...prev]);
  };

  const filtered = membres.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.nom.toLowerCase().includes(q) ||
      m.prenoms.toLowerCase().includes(q) ||
      (m.matricule ?? '').toLowerCase().includes(q) ||
      (m.email ?? '').toLowerCase().includes(q)
    );
  });

  const nbActifs   = membres.filter(m => m.statutProfil === 'ACTIF').length;
  const nbAJour    = membres.filter(m => m.adhesions?.[0]?.statut === 'A_JOUR').length;
  const nbNonAJour = membres.filter(m => m.adhesions?.[0]?.statut === 'NON_A_JOUR').length;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:p-6">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-5 border-b border-[#ececf0] pb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-[#1F1B2E]">
            {isSentinelle ? '🛡️ Mes Guides' : '🤝 Mes Gardiens'}
          </h1>
          <p className="text-sm text-[#6b6b78] mt-0.5">{territoire}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-[#1F1B2E] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#2d2640] transition-colors flex-shrink-0"
        >
          + Ajouter
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Total',      value: membres.length, color: '#1F1B2E' },
          { label: 'Actifs',     value: nbActifs,       color: '#2E7D32' },
          { label: 'Adhés. à jour', value: nbAJour,     color: '#2E7D32' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-[#ececf0] rounded-xl p-3">
            <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px] text-[#6b6b78] uppercase tracking-wide mt-0.5 leading-tight">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-[#e0e0e8] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6A1B9A] focus:ring-1 focus:ring-[#6A1B9A]/20 transition-colors"
          placeholder="🔍 Rechercher par nom, matricule…"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-[#6b6b78] text-sm">Chargement…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[#6b6b78]">
          <div className="text-5xl mb-3">{isSentinelle ? '🛡️' : '🤝'}</div>
          <p className="font-semibold">
            {membres.length === 0
              ? `Aucun ${isSentinelle ? 'guide' : 'gardien'} enregistré`
              : 'Aucun résultat pour cette recherche'}
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 text-sm font-semibold text-[#6A1B9A] hover:underline"
          >
            + Ajouter un membre
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Mobile : cartes */}
          <div className="lg:hidden flex flex-col gap-2">
            {filtered.map(m => {
              const adhesion = m.adhesions?.[0];
              return (
                <div key={m.id} className="bg-white border border-[#ececf0] rounded-xl p-3 flex items-center gap-3">
                  <UserAvatar
                    avatarUrl={m.avatarUrl}
                    initials={`${m.nom[0]}${m.prenoms[0]}`}
                    sizeClass="w-10 h-10"
                    bgClass={isSentinelle ? 'bg-[#6A1B9A]' : 'bg-[#C62828]'}
                    textClass="text-xs font-bold text-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1F1B2E] truncate">{m.prenoms} {m.nom}</div>
                    <div className="text-[11px] text-[#6b6b78] font-mono truncate">{m.matricule ?? '—'}</div>
                    {!isSentinelle && m.parish && (
                      <div className="text-[10px] text-[#6b6b78] truncate">{m.parish.nom}</div>
                    )}
                    {isSentinelle && m.district && (
                      <div className="text-[10px] text-[#6b6b78] truncate">{m.district.nom}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Pill variant={STATUT_PILL[m.statutProfil] ?? 'gris'} className="text-[10px]">
                      {STATUT_LABEL[m.statutProfil] ?? m.statutProfil}
                    </Pill>
                    {adhesion ? (
                      <Pill variant={ADHESION_PILL[adhesion.statut] ?? 'gris'} className="text-[10px]">
                        {ADHESION_LABEL[adhesion.statut] ?? adhesion.statut}
                      </Pill>
                    ) : (
                      <span className="text-[10px] text-[#b0b0bc]">Adhés. —</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop : table */}
          <div className="hidden lg:block bg-white border border-[#ececf0] rounded-2xl overflow-hidden">
            <table className="w-full text-xs border-collapse table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[14%]" />
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#f9f9fc] text-[#6b6b78] uppercase tracking-wide">
                  {['Membre', 'Matricule', isSentinelle ? 'Paroisse / Doyenné' : 'Paroisse', 'Adhésion', 'Statut', ''].map(h => (
                    <th key={h} className="text-left px-3 py-3 font-semibold border-b border-[#ececf0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const adhesion = m.adhesions?.[0];
                  return (
                    <tr key={m.id} className="border-b border-[#f0f0f4] hover:bg-[#fafafc]">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar
                            avatarUrl={m.avatarUrl}
                            initials={`${m.nom[0]}${m.prenoms[0]}`}
                            sizeClass="w-7 h-7 flex-shrink-0"
                            bgClass={isSentinelle ? 'bg-[#6A1B9A]' : 'bg-[#C62828]'}
                            textClass="text-[10px] font-bold text-white"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1F1B2E] truncate">{m.prenoms} {m.nom}</div>
                            {m.email && <div className="text-[10px] text-[#6b6b78] truncate">{m.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#6b6b78] truncate">{m.matricule ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="text-[#1F1B2E] truncate">{m.parish?.nom ?? m.district?.nom ?? '—'}</div>
                        {isSentinelle && m.district && m.parish && (
                          <div className="text-[10px] text-[#6b6b78] truncate">{m.district.nom}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {adhesion ? (
                          <Pill variant={ADHESION_PILL[adhesion.statut] ?? 'gris'}>
                            {ADHESION_LABEL[adhesion.statut] ?? adhesion.statut}
                          </Pill>
                        ) : <span className="text-[10px] text-[#b0b0bc]">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <Pill variant={STATUT_PILL[m.statutProfil] ?? 'gris'}>
                          {STATUT_LABEL[m.statutProfil] ?? m.statutProfil}
                        </Pill>
                      </td>
                      <td className="px-3 py-2.5 text-[#6b6b78]">
                        {m.telephone && <div className="text-[11px]">{m.telephone}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CreateUserModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        defaultRole={targetRole}
      />
    </div>
  );
}
