'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isManagementRole } from '@/lib/roles';
import { useAuthStore } from '@/store/auth';

interface NavItem { href: string; icon: string; label: string; }

const GUEST_ITEMS: NavItem[] = [
  { href: '/', icon: '🏠', label: 'Accueil' },
  { href: '/camps', icon: '⛺', label: 'Camps' },
  { href: '/codex', icon: '🪶', label: 'Codex' },
  { href: '/rejoindre', icon: '✨', label: 'Rejoindre' },
];

const GARDIEN_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: '🤝', label: 'Profil' },
  { href: '/missions', icon: '🎯', label: 'Missions' },
  { href: '/messages', icon: '💬', label: 'Messages' },
  { href: '/codex', icon: '🪶', label: 'Codex' },
  { href: '/artefacts', icon: '🏅', label: 'Artefacts' },
];

const GUIDE_BASE_ITEMS: NavItem[] = [
  { href: '/guide', icon: '📖', label: 'Guide' },
  { href: '/camps', icon: '⛺', label: 'Camps' },
  { href: '/messages', icon: '💬', label: 'Messages' },
  { href: '/codex', icon: '🪶', label: 'Codex' },
];

export function BottomNav({ variant = 'guest' }: { variant?: 'guest' | 'gardien' | 'guide' }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const effectiveVariant =
    variant === 'gardien' && isManagementRole(user?.role) ? 'guide' : variant;
  const guideItems =
    user?.role === 'ADMIN' || user?.role === 'REGION'
      ? [...GUIDE_BASE_ITEMS, { href: '/region', icon: '📊', label: 'Region' }]
      : user?.role === 'SENTINELLE'
        ? [...GUIDE_BASE_ITEMS, { href: '/admin/export', icon: '📤', label: 'Export' }]
        : [...GUIDE_BASE_ITEMS, { href: '/', icon: '🏠', label: 'Accueil' }];
  const items =
    effectiveVariant === 'guest'
      ? GUEST_ITEMS
      : effectiveVariant === 'guide'
        ? guideItems
        : GARDIEN_ITEMS;

  return (
    <nav className="flex-shrink-0 bg-white border-t border-[#e6e6ea] flex justify-around pb-safe">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2 flex-1 text-[10px] transition-colors ${active ? 'text-[#C62828]' : 'text-[#6b6b78]'}`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
