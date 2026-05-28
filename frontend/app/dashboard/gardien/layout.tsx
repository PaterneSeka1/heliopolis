'use client';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { BottomNav } from '@/components/layout/BottomNav';

export default function GardienLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={['GARDIEN']}>
      <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        <BottomNav variant="gardien" />
      </div>
    </AuthGuard>
  );
}
