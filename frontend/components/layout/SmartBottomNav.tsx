'use client';
import { useAuthStore } from '@/store/auth';
import { BottomNav } from './BottomNav';
import { isManagementRole } from '@/lib/roles';

export function SmartBottomNav() {
  const { user } = useAuthStore();
  if (!user) return <BottomNav variant="guest" />;
  if (isManagementRole(user.role)) return <BottomNav variant="guide" />;
  return <BottomNav variant="gardien" />;
}
