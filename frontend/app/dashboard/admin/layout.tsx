'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { useAuthStore } from '@/store/auth';

const NAV = [
  { href: '/dashboard/admin',           icon: '🏠', label: 'Accueil' },
  { href: '/dashboard/admin/camps',     icon: '⛺', label: 'Camps' },
  { href: '/dashboard/admin/codex',     icon: '🪶', label: 'Modération' },
  { href: '/dashboard/admin/messages',  icon: '💬', label: 'Messages' },
  { href: '/dashboard/admin/export',    icon: '📤', label: 'Exports' },
  { href: '/dashboard/region',          icon: '📊', label: 'Vue régionale' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <AuthGuard roles={['ADMIN', 'REGION']}>
      <div className="flex h-screen overflow-hidden bg-[#fafafa]">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden lg:flex lg:flex-col w-60 bg-gradient-to-b from-[#1F1B2E] to-[#3a1d4d] text-white flex-shrink-0">
          <div className="flex items-center gap-2.5 p-4 border-b border-white/10 flex-shrink-0">
            <GardiensBlazon size={42} />
            <div>
              <div className="text-[10px] tracking-widest opacity-70 uppercase">
                {user?.region?.nom ?? "Région d'Abidjan"}
              </div>
              <div className="text-sm font-bold leading-tight mt-0.5">
                Conseil<br />d&apos;Héliopolis
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            {NAV.map(item => {
              const active = item.href === '/dashboard/admin'
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#F58A4B]/30 to-[#C62828]/30 font-semibold text-white'
                      : 'text-white/75 hover:bg-white/8 hover:text-white'
                  }`}>
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
            <BottomNav variant="admin" />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
