'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PenLine,
  ListChecks,
  Route,
  Shield,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'בית' },
  { href: '/today', icon: PenLine, label: 'כתיבה' },
  { href: '/agenda', icon: ListChecks, label: 'אג\'נדה' },
  { href: '/journey', icon: Route, label: 'מסע' },
  { href: '/vault', icon: Shield, label: 'הגדרות' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav no-print">
      <div className="flex items-center justify-around max-w-[720px] mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
            >
              <div className={isActive ? 'nav-icon-wrap' : ''}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
