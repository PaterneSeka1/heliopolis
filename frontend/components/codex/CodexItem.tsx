'use client';
import type { Submission } from '@/types';
import { formatDateFr } from '@/lib/format';
import { Avatar, Pill } from '@/components/ui';

const CAT_VARIANTS: Record<string, 'rouge' | 'vert' | 'violet' | 'or'> = {
  PERSONNEL: 'rouge', COMMUNAUTAIRE: 'vert', SPIRITUEL: 'violet', LONG: 'or',
};
const CAT_LABELS: Record<string, string> = {
  PERSONNEL: 'Personnel', COMMUNAUTAIRE: 'Communautaire validé', SPIRITUEL: 'Spirituel', LONG: 'Défi long',
};
const CAT_BG: Record<string, string> = {
  PERSONNEL: 'from-[#C62828] to-[#7a1717]',
  COMMUNAUTAIRE: 'from-[#2E7D32] to-[#1a5021]',
  SPIRITUEL: 'from-[#6A1B9A] to-[#3d1163]',
  LONG: 'from-[#D9A441] to-[#8c6918]',
};

export function CodexItem({ submission, onReact }: { submission: Submission; onReact?: (id: string) => void }) {
  const g = submission.gardien;
  const cat = submission.challenge?.categorie ?? 'COMMUNAUTAIRE';
  const initials = g ? `${g.nom?.[0] ?? ''}${g.prenoms?.[0] ?? ''}`.toUpperCase() : '?';
  const reactCount = submission._count?.reactions ?? submission.reactions?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#ececf0] mb-3.5">
      {/* Head */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <Avatar initials={initials} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-[#1F1B2E]">{g?.prenoms} {g?.nom}</div>
          <div className="text-[11px] text-[#6b6b78] mt-0.5">
            {g?.parish?.nom ?? 'Paroisse'} · {formatDateFr(submission.submittedAt)}
          </div>
        </div>
      </div>

      {/* Photo placeholder */}
      <div className={`h-44 bg-gradient-to-br ${CAT_BG[cat]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
      </div>

      {/* Caption */}
      {submission.texte && (
        <p className="px-3.5 py-3 text-[13px] leading-relaxed text-[#1F1B2E]">« {submission.texte} »</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3.5 px-3.5 pb-3 text-[12px] text-[#6b6b78]">
        <button onClick={() => onReact?.(submission.id)} className="inline-flex items-center gap-1 hover:text-[#C62828] transition-colors">
          ❤️ {reactCount}
        </button>
        <Pill variant={CAT_VARIANTS[cat]}>{CAT_LABELS[cat]}</Pill>
      </div>
    </div>
  );
}
