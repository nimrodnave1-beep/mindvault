'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { getAllStrengths, deleteStrength, Strength } from '@/lib/db';
import { formatRelativeDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function StrengthsPage() {
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrengths();
  }, []);

  async function loadStrengths() {
    try {
      const data = await getAllStrengths();
      setStrengths(data);
    } catch (error) {
      console.error('Failed to load strengths:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStrength(id);
      await loadStrengths();
      toast.success('נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="הכוחות שלי"
        icon="💪"
        showBack
        action={
          <Link href="/strengths/new" className="btn-primary px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            חדש
          </Link>
        }
      />

      <div className="app-container pt-1 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : strengths.length === 0 ? (
          <EmptyState
            icon={<Zap className="w-12 h-12 text-green-300" />}
            title="מה אתה טוב בו?"
            description="כאן תאסוף את הכוחות שלך — דברים שאתה עושה טוב."
            action={
              <Link href="/strengths/new" className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                כוח ראשון
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {strengths.map((s) => (
              <div key={s.id} className="card-premium p-4 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{s.text}</p>
                    {s.example && (
                      <p className="text-sm text-gray-500 mt-1">למשל: {s.example}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1.5">{formatRelativeDate(s.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="w-8 h-8 rounded-lg text-gray-300 flex items-center justify-center hover:bg-red-50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
