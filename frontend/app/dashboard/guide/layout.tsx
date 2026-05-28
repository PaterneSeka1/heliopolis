'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useAuthStore } from '@/store/auth';

const NAV_BASE = [
  { href: '/dashboard/guide',           icon: '📖', label: 'Accueil' },
  { href: '/dashboard/guide/camps',     icon: '⛺', label: 'Camps' },
  { href: '/dashboard/guide/messages',  icon: '💬', label: 'Messages' },
  { href: '/dashboard/guide/codex',     icon: '🪶', label: 'Codex' },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const nav = NAV_BASE;

  return (
    <AuthGuard roles={['GUIDE', 'SENTINELLE']}>
      <div className="flex h-screen overflow-hidden bg-[#fafafa]">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden lg:flex lg:flex-col w-56 bg-gradient-to-b from-[#6A1B9A] to-[#4a1370] text-white flex-shrink-0">
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="text-base font-bold">📖 Guide</div>
            <div className="text-[11px] opacity-75 mt-0.5">{user?.parish?.nom ?? user?.district?.nom ?? 'Mon territoire'}</div>
          </div>

          <nav className="flex-1 p-2 overflow-y-auto">
            {nav.map(item => {
              const active = item.href === '/dashboard/guide'
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    active ? 'bg-white/20 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}>
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/20 flex-shrink-0">
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {user ? `${user.nom[0]}${user.prenoms[0]}` : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.prenoms} {user?.nom}</div>
                <div className="text-[10px] opacity-60">{user?.role}</div>
              </div>
              <LogoutButton className="text-white/60 hover:text-white transition-colors" />
            </div>
          </div>
        </aside>

        {/* ── Contenu principal ── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
          <div className="lg:hidden flex-shrink-0">
            <BottomNav variant="guide" />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
