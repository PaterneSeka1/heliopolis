'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useAuthStore } from '@/store/auth';

const NAV = [
  { icon: '📊', label: 'Vue régionale',      href: '/dashboard/region' },
  { icon: '⛺', label: 'Camps régionaux',    href: '/dashboard/region/camps' },
  { icon: '👥', label: 'Participants',        href: '/dashboard/region/participants' },
  { icon: '🛡️', label: 'Doyennés',           href: '/dashboard/region/doyennes' },
  { icon: '⛪', label: 'Paroisses',           href: '/dashboard/region/paroisses' },
  { icon: '🎯', label: 'Défis & soumissions', href: '/dashboard/region/defis' },
  { icon: '🪶', label: 'Mur du Codex',       href: '/dashboard/region/codex' },
  { icon: '💬', label: 'Messagerie',          href: '/dashboard/admin/messages' },
  { icon: '📋', label: 'Rapports régionaux',  href: '/dashboard/region/rapports' },
  { icon: '📤', label: 'Exports Excel',       href: '/dashboard/admin/export' },
];

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <AuthGuard roles={['ADMIN', 'REGION']}>
      <div className="min-h-screen bg-[#f6f6fa] flex">
        {/* Sidebar fixe */}
        <aside className="w-60 bg-gradient-to-b from-[#1F1B2E] to-[#3a1d4d] text-white flex flex-col fixed top-0 left-0 h-screen z-10">
          <div className="flex items-center gap-2.5 p-4 border-b border-white/10 flex-shrink-0">
            <GardiensBlazon size={42} />
            <div>
              <div className="text-[10px] tracking-widest opacity-70 uppercase">Région d&apos;Abidjan</div>
              <div className="text-sm font-bold leading-tight mt-0.5">Conseil<br/>d&apos;Héliopolis</div>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            {NAV.map(item => {
              const active = item.href === '/dashboard/region'
                ? pathname === '/dashboard/region'
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#F58A4B]/30 to-[#C62828]/30 font-semibold text-white'
                      : 'text-white/75 hover:bg-white/8 hover:text-white'
                  }`}>
                  <span className="w-5 text-center text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer sidebar : user + logout */}
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user ? `${user.nom[0]}${user.prenoms[0]}` : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.prenoms} {user?.nom}</div>
                <div className="text-[10px] opacity-60">{user?.role}</div>
              </div>
              <LogoutButton className="text-white/60 hover:text-white text-sm transition-colors" />
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 ml-60 overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
