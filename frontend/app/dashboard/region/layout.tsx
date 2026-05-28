'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={['ADMIN', 'REGION']}>
      <div className="min-h-screen bg-[#f6f6fa]">
        {children}
      </div>
    </AuthGuard>
  );
}
