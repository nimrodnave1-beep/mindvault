'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Compass } from 'lucide-react';
import { addValue } from '@/lib/db';

export default function NewValuePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [why, setWhy] = useState('');
  const [livingExample, setLivingExample] = useState('');
  const [conflictExample, setConflictExample] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error('יש להזין שם לערך');
      return;
    }

    setSaving(true);
    try {
      await addValue({
        name: name.trim(),
        why: why.trim() || null,
        livingExample: livingExample.trim() || null,
        conflictExample: conflictExample.trim() || null,
        tags: [],
      });
      toast.success('הערך נשמר 🧭');
      router.push('/values');
    } catch (error) {
      console.error('Failed to save value:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="ערך חדש"
        showBack
        icon="🧭"
        action={
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        {/* Value name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Compass className="w-4 h-4 inline-block ml-1" />
            מה הערך?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="כנות, חופש, משפחה, חמלה..."
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
            className="input-premium min-h-[60px]"
            dir="rtl"
          />
        </div>

        {/* Living example */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✓ מתי אני חי את הערך הזה?
          </label>
          <textarea
            value={livingExample}
            onChange={(e) => setLivingExample(e.target.value)}
            placeholder="כשאני... (אופציונלי)"
            className="input-premium min-h-[60px]"
            dir="rtl"
          />
        </div>

        {/* Conflict example */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✗ מתי אני מתנגש עם הערך הזה?
          </label>
          <textarea
            value={conflictExample}
            onChange={(e) => setConflictExample(e.target.value)}
            placeholder="כשאני... (אופציונלי)"
            className="input-premium min-h-[60px]"
            dir="rtl"
          />
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-teal-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-teal-700">💡</strong> ערכים הם לא מטרות — הם הכיוון.
            הוסף דוגמאות כדי שהערך יהפוך ממילה למשהו חי.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
