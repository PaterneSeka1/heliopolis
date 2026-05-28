'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AdminMobileNav } from '@/components/layout/AdminMobileNav';
import { AdminRegionSidebar } from '@/components/layout/AdminRegionSidebar';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useAuthStore } from '@/store/auth';

const MOBILE_NAV = [
  { icon: '⛺', label: 'Camps',        href: '/dashboard/admin/camps' },
  { icon: '👥', label: 'Participants', href: '/dashboard/admin/participants' },
  { icon: '🛡️', label: 'Doyennés',    href: '/dashboard/admin/doyennes' },
  { icon: '⛪', label: 'Paroisses',    href: '/dashboard/admin/paroisses' },
  { icon: '🎯', label: 'Défis',        href: '/dashboard/admin/defis' },
  { icon: '🪶', label: 'Codex',        href: '/dashboard/admin/codex' },
  { icon: '📤', label: 'Exports',      href: '/dashboard/admin/export' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const currentSection = MOBILE_NAV.find(item =>
    item.href === '/dashboard/region'
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );

  return (
    <AuthGuard roles={['ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-[#f6f6fa]">

        {/* Sidebar desktop — partagée avec région */}
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
                {currentSection
                  ? `${currentSection.icon} ${currentSection.label}`
                  : pathname === '/dashboard/admin'
                    ? '🏠 Accueil'
                    : '🛡️ Administration'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user ? `${user.nom[0]}${user.prenoms[0]}` : '?'}
              </div>
            </div>
          </div>

          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

          {/* Espaceur + AdminMobileNav — mobile uniquement */}
          <div className="h-14 flex-shrink-0 lg:hidden" />
          <div className="lg:hidden">
            <AdminMobileNav />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
