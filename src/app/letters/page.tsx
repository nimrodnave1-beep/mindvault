'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Mail, Plus, Trash2 } from 'lucide-react';
import { getAllLetters, deleteLetter, LetterToSelf } from '@/lib/db';
import { formatRelativeDate } from '@/lib/utils';
import { toast } from 'sonner';

const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
  from_future: { label: 'מהעתיד', color: 'text-purple-700', bg: 'bg-purple-50' },
  from_past: { label: 'מהעבר', color: 'text-teal-700', bg: 'bg-teal-50' },
  from_present: { label: 'מההווה', color: 'text-amber-700', bg: 'bg-amber-50' },
};

export default function LettersPage() {
  const [letters, setLetters] = useState<LetterToSelf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

  async function loadLetters() {
    try {
      const data = await getAllLetters();
      setLetters(data);
    } catch (error) {
      console.error('Failed to load letters:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLetter(id);
      await loadLetters();
      toast.success('נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="מכתבים לעצמי"
        icon="💌"
        showBack
        action={
          <Link href="/letters/new" className="btn-primary px-3 py-2 text-sm">
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
        ) : letters.length === 0 ? (
          <EmptyState
            icon={<Mail className="w-12 h-12 text-violet-300" />}
            title="כתוב מכתב לעצמך"
            description="מכתב מהעתיד, מהעבר או מההווה — סוג אחר של שיחה עם עצמך."
            action={
              <Link href="/letters/new" className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                מכתב ראשון
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {letters.map((letter) => {
              const tl = typeLabels[letter.type] || typeLabels.from_present;
              return (
                <div key={letter.id} className="card-premium p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{letter.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tl.color} ${tl.bg}`}>
                          {tl.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{letter.content}</p>
                      <p className="text-xs text-gray-300 mt-1.5">{formatRelativeDate(letter.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="w-8 h-8 rounded-lg text-gray-300 flex items-center justify-center hover:bg-red-50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
