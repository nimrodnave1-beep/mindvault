'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Compass, Plus, Trash2 } from 'lucide-react';
import { getAllValues, deleteValue, Value } from '@/lib/db';
import { formatRelativeDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ValuesPage() {
  const [values, setValues] = useState<Value[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValues();
  }, []);

  async function loadValues() {
    try {
      const data = await getAllValues();
      setValues(data);
    } catch (error) {
      console.error('Failed to load values:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteValue(id);
      await loadValues();
      toast.success('נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="הערכים שלי"
        icon="🧭"
        showBack
        action={
          <Link href="/values/new" className="btn-primary px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            חדש
          </Link>
        }
      />

      <div className="app-container pt-1 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : values.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-12 h-12 text-teal-300" />}
            title="מה באמת חשוב לך?"
            description="ערכים הם המצפן הפנימי שלך — הם מנחים את הבחירות שאתה עושה."
            action={
              <Link href="/values/new" className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                ערך ראשון
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {values.map((v) => (
              <div key={v.id} className="card-premium p-4 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{v.name}</p>
                    {v.why && (
                      <p className="text-sm text-gray-500 mt-1">למה: {v.why}</p>
                    )}
                    {v.livingExample && (
                      <p className="text-sm text-gray-400 mt-0.5">✓ {v.livingExample}</p>
                    )}
                    {v.conflictExample && (
                      <p className="text-sm text-gray-400 mt-0.5">✗ {v.conflictExample}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1.5">{formatRelativeDate(v.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(v.id)}
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
