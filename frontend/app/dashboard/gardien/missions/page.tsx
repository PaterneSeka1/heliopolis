'use client';
import { useEffect, useState } from 'react';
import { challengesApi } from '@/lib/api';
import { Pill } from '@/components/ui';
import type { Challenge, ChallengeCategory, Submission } from '@/types';

const CAT_COLORS: Record<ChallengeCategory, { border: string; pill: 'rouge' | 'vert' | 'violet' | 'or' }> = {
  PERSONNEL:     { border: 'border-l-[#C62828]', pill: 'rouge' },
  COMMUNAUTAIRE: { border: 'border-l-[#2E7D32]', pill: 'vert' },
  SPIRITUEL:     { border: 'border-l-[#6A1B9A]', pill: 'violet' },
  LONG:          { border: 'border-l-[#D9A441]', pill: 'or' },
};
const CAT_LABELS: Record<ChallengeCategory, string> = {
  PERSONNEL: 'Personnel', COMMUNAUTAIRE: 'Communautaire', SPIRITUEL: 'Spirituel', LONG: 'Défi long',
};

const FILTERS: { label: string; value: ChallengeCategory | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Personnel', value: 'PERSONNEL' },
  { label: 'Communautaire', value: 'COMMUNAUTAIRE' },
  { label: 'Spirituel', value: 'SPIRITUEL' },
  { label: 'Long', value: 'LONG' },
];

export default function MissionsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<ChallengeCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([challengesApi.list(), challengesApi.mySubmissions()])
      .then(([challengeRes, submissionRes]) => {
        setChallenges(challengeRes.data);
        setSubmissions(submissionRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? challenges : challenges.filter(c => c.categorie === filter);

  const latestSubmissionByChallenge = new Map<string, Submission>();
  for (const submission of submissions) {
    if (!latestSubmissionByChallenge.has(submission.challengeId)) {
      latestSubmissionByChallenge.set(submission.challengeId, submission);
    }
  }

  const handleSubmit = async (challenge: Challenge) => {
    setSubmitting(challenge.id);
    try {
      const { data } = await challengesApi.submit(challenge.id, { texte: "Preuve soumise depuis l'app" });
      setSubmissions(prev => [{ ...data, challenge }, ...prev]);
      alert('Preuve soumise ! En attente de validation par ton Guide.');
    } catch {
      alert('Erreur lors de la soumission.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-[#C62828] to-[#8e1a1a] text-white px-4 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Mes missions</h1>
        <p className="text-xs opacity-85 mt-0.5">Défis des Gardiens</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === f.value
                  ? 'bg-[#C62828] text-white'
                  : 'bg-[#f3f3f5] text-[#6b6b78]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10 text-[#6b6b78] text-sm">Chargement…</div>}

        <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map(c => {
          const cat = c.categorie as ChallengeCategory;
          const style = CAT_COLORS[cat];
          const submission = latestSubmissionByChallenge.get(c.id);
          const canSubmit = !submission || ['REJETE', 'CORRECTION_DEMANDEE'].includes(submission.statut);
          const statusLabel = submission?.statut === 'VALIDE'
            ? 'Validé'
            : submission?.statut === 'EN_ATTENTE'
              ? 'En attente'
              : submission?.statut === 'REJETE'
                ? 'À reprendre'
                : submission?.statut === 'CORRECTION_DEMANDEE'
                  ? 'Correction'
                  : null;
          return (
            <div key={c.id}
              className={`bg-white rounded-2xl p-3.5 mb-2.5 border border-[#ececf0] border-l-4 ${style.border}`}>
              <h4 className="font-bold text-sm text-[#1F1B2E] mb-1">{c.titre}</h4>
              <p className="text-xs text-[#6b6b78] leading-relaxed mb-2.5">{c.description}</p>
              {c.preuveDemandee && (
                <p className="text-[11px] text-[#6b6b78] italic mb-2">📸 {c.preuveDemandee}</p>
              )}
              <div className="flex justify-between items-center">
                <Pill variant={style.pill}>{CAT_LABELS[cat]}</Pill>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#9c7218]">+{c.points} pts</span>
                  {statusLabel && (
                    <Pill variant={submission?.statut === 'VALIDE' ? 'vert' : 'or'}>
                      {statusLabel}
                    </Pill>
                  )}
                  {canSubmit && (
                    <button
                      onClick={() => handleSubmit(c)}
                      disabled={submitting === c.id}
                      className="text-xs bg-[#C62828] text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {submitting === c.id ? '…' : submission ? 'Renvoyer' : 'Soumettre'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-[#6b6b78] text-sm">
            <div className="text-3xl mb-2">🎯</div>
            <p>Aucun défi dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
