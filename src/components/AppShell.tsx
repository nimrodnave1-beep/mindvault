'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  /** Hide bottom nav (e.g. in-room mode) */
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen min-h-[100dvh]">
      <main className={hideNav ? '' : 'pb-nav'}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
