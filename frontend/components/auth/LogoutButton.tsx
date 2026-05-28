'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/activation');
  };

  return (
    <button onClick={handleLogout} className={className} title="Se déconnecter">
      {children ?? '🚪'}
    </button>
  );
}
