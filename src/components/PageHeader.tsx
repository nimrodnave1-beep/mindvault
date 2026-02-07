'use client';

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  showBack?: boolean;
  action?: ReactNode;
  /** Use warm gradient background instead of glass */
  warm?: boolean;
}

export function PageHeader({ title, subtitle, icon, showBack, action, warm }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className={warm ? 'header-hero' : 'header-sticky'}>
      <div className="app-container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="btn-icon hover:bg-gray-100/60"
                aria-label="חזרה"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {icon && (
              <div className="text-2xl" aria-hidden>{icon}</div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && (
            <div className="flex items-center">{action}</div>
          )}
        </div>
      </div>
    </header>
  );
}
