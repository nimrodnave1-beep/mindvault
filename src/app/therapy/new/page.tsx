'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Calendar, Save } from 'lucide-react';
import { addSession } from '@/lib/db';
import { getToday } from '@/lib/utils';

export default function NewSessionPage() {
  const router = useRouter();
  const [date, setDate] = useState(getToday());
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!summary.trim()) {
      toast.error('יש להזין סיכום');
      return;
    }

    setSaving(true);
    try {
      await addSession({
        date,
        summary: summary.trim(),
      });
      toast.success('הסיכום נשמר');
      router.push('/therapy');
    } catch (error) {
      console.error('Failed to save session:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="סיכום פגישה חדש"
        showBack
        action={
          <button
            onClick={handleSave}
            disabled={saving || !summary.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-4 pt-1">
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline-block ml-1" />
            תאריך הפגישה
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-premium"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סיכום הפגישה
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="הדבק או כתוב את סיכום הפגישה..."
            className="writing-canvas min-h-[300px]"
          />
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-teal-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-teal-700">טיפ:</strong> אחרי השמירה, תוכלו לסמן קטעים מהסיכום ולהוסיף אותם לאג'נדה לפגישה הבאה
          </p>
        </div>
      </div>
    </AppShell>
  );
}
