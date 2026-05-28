'use client';
import { useAuthStore } from '@/store/auth';
import { ROLE_LABEL } from '@/lib/roles';

export function CodexHeaderBadge() {
  const { user } = useAuthStore();

  if (user) {
    return (
      <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
        🛡️ {ROLE_LABEL[user.role] ?? user.role}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
      🔍 Invité
    </span>
  );
}
