'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in-up">
      <div className="empty-state-icon" aria-hidden>{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
