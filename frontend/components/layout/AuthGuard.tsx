'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getHomeForRole } from '@/lib/roles';
import type { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/activation');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(getHomeForRole(user.role));
    }
  }, [user, router, roles]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🛡️</div>
        <p className="text-sm text-[#6b6b78]">Vérification…</p>
      </div>
    </div>
  );

  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
