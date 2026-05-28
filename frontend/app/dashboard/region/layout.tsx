'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AdminMobileNav } from '@/components/layout/AdminMobileNav';
import { AdminRegionSidebar } from '@/components/layout/AdminRegionSidebar';

const NAV_FLAT = [
  { icon: '📊', label: 'Vue régionale',      href: '/dashboard/region' },
  { icon: '⛺', label: 'Camps régionaux',    href: '/dashboard/region/camps' },
  { icon: '👥', label: 'Participants',        href: '/dashboard/region/participants' },
  { icon: '🛡️', label: 'Doyennés',           href: '/dashboard/region/doyennes' },
  { icon: '⛪', label: 'Paroisses',           href: '/dashboard/region/paroisses' },
  { icon: '🎯', label: 'Défis & soumissions', href: '/dashboard/region/defis' },
  { icon: '🪶', label: 'Mur du Codex',       href: '/dashboard/region/codex' },
  { icon: '💬', label: 'Messagerie',          href: '/dashboard/admin/messages' },
  { icon: '📤', label: 'Exports Excel',       href: '/dashboard/admin/export' },
];

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentPage = NAV_FLAT.find(item =>
    item.href === '/dashboard/region'
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );

  return (
    <AuthGuard roles={['REGION']}>
      <div className="flex h-screen overflow-hidden bg-[#f6f6fa]">

        {/* Sidebar desktop — identique à l'admin */}
        <AdminRegionSidebar />

        {/* Contenu principal */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Top bar mobile */}
          <div className="lg:hidden bg-gradient-to-r from-[#1F1B2E] to-[#3a1d4d] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <Link
              href="/dashboard/admin"
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold flex-shrink-0"
            >
              ‹
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] opacity-70 uppercase tracking-wider">Conseil d&apos;Héliopolis</div>
              <div className="text-sm font-bold truncate">
                {currentPage ? `${currentPage.icon} ${currentPage.label}` : '📊 Vue régionale'}
              </div>
            </div>
          </div>

          {/* Contenu des pages */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>

          {/* Espaceur + AdminMobileNav — même nav que l'admin pour cohérence */}
          <div className="h-14 flex-shrink-0 lg:hidden" />
          <div className="lg:hidden">
            <AdminMobileNav />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
