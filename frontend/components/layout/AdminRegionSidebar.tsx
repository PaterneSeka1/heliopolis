'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GardiensBlazon } from '@/components/layout/GardiensBlazon';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { useAuthStore } from '@/store/auth';

const NAV_GROUPS = [
  {
    label: 'Administration',
    items: [
      { href: '/dashboard/admin',              icon: '🏠', label: 'Accueil' },
      { href: '/dashboard/admin/camps',        icon: '⛺', label: 'Gérer les camps' },
      { href: '/dashboard/admin/codex',        icon: '🪶', label: 'Modération' },
      { href: '/dashboard/admin/messages',     icon: '💬', label: 'Messagerie' },
      { href: '/dashboard/admin/export',       icon: '📤', label: 'Exports' },
    ],
  },
  {
    label: 'Région',
    items: [
      { href: '/dashboard/admin/participants', icon: '👥', label: 'Participants' },
      { href: '/dashboard/admin/gardiens',     icon: '🤝', label: 'Gardiens' },
      { href: '/dashboard/admin/guides',       icon: '📖', label: 'Encadrants' },
      { href: '/dashboard/admin/region',       icon: '🌍', label: 'Membres région' },
      { href: '/dashboard/admin/doyennes',     icon: '🛡️', label: 'Doyennés' },
      { href: '/dashboard/admin/paroisses',    icon: '⛪', label: 'Paroisses' },
      { href: '/dashboard/admin/defis',        icon: '🎯', label: 'Défis & soumissions' },
    ],
  },
];

interface AdminRegionSidebarProps {
  onProfileClick?: () => void;
}

export function AdminRegionSidebar({ onProfileClick }: AdminRegionSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 bg-gradient-to-b from-[#1F1B2E] to-[#3a1d4d] text-white flex-shrink-0">

      {/* En-tête */}
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

      {/* Navigation groupée */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 px-3 mb-1">
              {group.label}
            </p>
            {group.items.map(item => {
              const active =
                item.href === '/dashboard/admin' || item.href === '/dashboard/region'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#F58A4B]/30 to-[#C62828]/30 font-semibold text-white'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className="text-sm w-5 text-center">{item.icon}</span>
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pied de page */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 flex-1 min-w-0 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left"
            title="Modifier mon profil"
          >
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              initials={user ? `${user.nom[0]}${user.prenoms[0]}` : '?'}
              sizeClass="w-8 h-8"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user?.prenoms} {user?.nom}</div>
              <div className="text-[10px] opacity-60">{user?.role}</div>
            </div>
          </button>
          <LogoutButton className="text-white/60 hover:text-white transition-colors flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
