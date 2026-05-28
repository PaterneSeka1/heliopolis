import { SmartBottomNav } from '@/components/layout/SmartBottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <SmartBottomNav />
    </div>
  );
}
