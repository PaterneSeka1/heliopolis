'use client';
import { use, useEffect, useState } from 'react';
import { campsApi, usersApi } from '@/lib/api';
import { getTerritoryLabel } from '@/lib/roles';
import { useAuthStore } from '@/store/auth';
import { InfoBanner, Avatar, Pill } from '@/components/ui';
import type { User, Camp, CampParticipant } from '@/types';

const STATUS_PILL: Record<string, { variant: 'vert' | 'or' | 'violet' | 'gris'; label: string }> = {
  A_JOUR:     { variant: 'vert',   label: 'À jour' },
  EN_ATTENTE: { variant: 'violet', label: 'En attente' },
  NON_A_JOUR: { variant: 'or',     label: 'Non à jour' },
};

export default function SelectionPage({ params }: { params: Promise<{ campId: string }> }) {
  const { campId } = use(params);
  const { user } = useAuthStore();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [routiers, setRoutiers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const params: Record<string, string> = { role: 'GARDIEN' };
    if (user.role === 'GUIDE') {
      if (!user.parish?.id) return;
      params.parishId = user.parish.id;
    }
    if (user.role === 'SENTINELLE') {
      if (!user.district?.id) return;
      params.districtId = user.district.id;
    }
    Promise.all([
      campsApi.get(campId),
      usersApi.list(params),
      campsApi.participants(campId),
    ]).then(([c, u, p]) => {
      setCamp(c.data);
      setRoutiers(u.data);
      const alreadySelected = new Set<string>((p.data as CampParticipant[]).map(pp => pp.userId));
      setSelected(alreadySelected);
    }).catch(() => {});
  }, [campId, user]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const selectedInScope = routiers.filter(r => selected.has(r.id));
      for (const gardien of selectedInScope) {
        await campsApi.selectParticipant(campId, gardien.id);
      }
      alert(`${selectedInScope.length} participant(s) transmis.`);
    } catch {
      alert('Erreur lors de la soumission.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = routiers.filter(r =>
    `${r.nom} ${r.prenoms} ${r.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#6A1B9A] to-[#4a1370] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <button onClick={() => history.back()} className="text-sm opacity-80 mb-2">‹ Retour</button>
        <h1 className="text-xl font-bold">Sélection</h1>
        <p className="text-xs opacity-85 mt-0.5">
          {camp?.nom ?? 'Camp'} · {getTerritoryLabel(user)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
        <InfoBanner icon="💡">
          Tu peux sélectionner même les routiers <strong>non à jour</strong> d&apos;adhésion (règle 5.4).
        </InfoBanner>

        <input
          className="w-full px-3.5 py-3 border border-[#e6e6ea] rounded-xl text-sm outline-none focus:border-[#6A1B9A] mb-3"
          placeholder="🔍 Rechercher un routier…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex gap-2 mb-3">
          <Pill variant="rouge" solid>Tous ({routiers.length})</Pill>
          <Pill variant="gris">Sélectionnés ({selected.size})</Pill>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-3">
        {filtered.map(r => {
          const adhesion = r.adhesions?.[0]?.statut ?? 'NON_A_JOUR';
          const pillProps = STATUS_PILL[adhesion] ?? STATUS_PILL.NON_A_JOUR;
          const isSelected = selected.has(r.id);
          const initials = `${r.nom[0]}${r.prenoms[0]}`.toUpperCase();

          return (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#ececf0] mb-2">
              <Avatar initials={initials} size={42} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1F1B2E]">{r.prenoms} {r.nom}</div>
                <div className="text-[11px] text-[#6b6b78] mt-0.5 flex items-center gap-1.5">
                  {r.matricule} ·
                  <Pill variant={pillProps.variant} className="text-[9px] px-1.5 py-0">{pillProps.label}</Pill>
                </div>
              </div>
              <button
                onClick={() => toggleSelect(r.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#6A1B9A] border-[#6A1B9A] text-white'
                    : 'border-[#e6e6ea] bg-white'
                }`}
              >
                {isSelected ? '✓' : ''}
              </button>
            </div>
          );
        })}

        </div>

        {filtered.length === 0 && !search && (
          <div className="text-center py-8 text-[#6b6b78] text-sm">
            <div className="text-3xl mb-2">👥</div>
            <p>Aucun routier dans votre territoire.</p>
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="text-center py-8 text-[#6b6b78] text-sm">
            <p>Aucun résultat pour « {search} »</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving || selected.size === 0}
          className="w-full mt-4 bg-[#6A1B9A] text-white font-bold text-sm py-3.5 rounded-xl disabled:opacity-50"
        >
          {saving ? '…' : `Transmettre à la Sentinelle (${selected.size}) →`}
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
}
