'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Target } from 'lucide-react';
import { addGoal } from '@/lib/db';

export default function NewGoalPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [horizon, setHorizon] = useState<'weekly' | 'monthly' | 'open'>('open');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      toast.error('יש להזין כותרת למטרה');
      return;
    }

    setSaving(true);
    try {
      await addGoal({
        title: title.trim(),
        why: why.trim() || null,
        horizon,
        targetDate: null,
        status: 'active',
        progressStage: 'start',
        tags: [],
        pinned,
        cycleId: null,
      });
      toast.success('המטרה נשמרה! 🎯');
      router.push('/goals');
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="מטרה חדשה"
        showBack
        icon="🎯"
        action={
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline-block ml-1" />
            מה המטרה?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל: לתרגל גבולות בריאים"
            className="input-premium"
            dir="rtl"
            autoFocus
          />
        </div>

        {/* Why */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            למה זה חשוב לי?
          </label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="כי... (אופציונלי)"
            className="input-premium min-h-[80px]"
            dir="rtl"
          />
        </div>

        {/* Horizon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            אופק זמן
          </label>
          <div className="flex gap-2">
            {(['weekly', 'monthly', 'open'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  horizon === h
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {h === 'weekly' ? 'שבועית' : h === 'monthly' ? 'חודשית' : 'פתוחה'}
              </button>
            ))}
          </div>
        </div>

        {/* Pin */}
        <div className="card-premium p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">📌 הצמד לעמוד הבית</p>
              <p className="text-xs text-gray-400">המטרה תופיע בראש מסך הבית</p>
            </div>
          </label>
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-purple-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-purple-700">טיפ:</strong> מטרה אחת ברורה עדיפה על עשר מעורפלות.
            התחל קטן ותמיד תוכל להוסיף עוד.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
