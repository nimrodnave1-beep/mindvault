'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Star, Plus, Trash2 } from 'lucide-react';
import { getAllWishes, deleteWish, Wish } from '@/lib/db';
import { formatRelativeDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishes();
  }, []);

  async function loadWishes() {
    try {
      const data = await getAllWishes();
      setWishes(data);
    } catch (error) {
      console.error('Failed to load wishes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWish(id);
      await loadWishes();
      toast.success('נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="מה אני מאחל לעצמי"
        icon="⭐"
        showBack
        action={
          <Link href="/wishes/new" className="btn-primary px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            חדשה
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
        ) : wishes.length === 0 ? (
          <EmptyState
            icon={<Star className="w-12 h-12 text-amber-300" />}
            title="מה אתה מאחל לעצמך?"
            description="כתוב את המשאלות שלך — הן כוח."
            action={
              <Link href="/wishes/new" className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                משאלה ראשונה
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {wishes.map((wish) => (
              <div key={wish.id} className="card-premium p-4 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm leading-relaxed">{wish.text}</p>
                    {wish.why && (
                      <p className="text-xs text-gray-400 mt-1">כי: {wish.why}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1.5">{formatRelativeDate(wish.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(wish.id)}
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
