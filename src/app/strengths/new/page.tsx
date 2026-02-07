'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Zap } from 'lucide-react';
import { addStrength } from '@/lib/db';

export default function NewStrengthPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [example, setExample] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!text.trim()) {
      toast.error('יש להזין כוח');
      return;
    }

    setSaving(true);
    try {
      await addStrength({
        text: text.trim(),
        example: example.trim() || null,
        sourceType: 'standalone',
        sourceId: null,
        tags: [],
        cycleId: null,
      });
      toast.success('הכוח נשמר 💪');
      router.push('/strengths');
    } catch (error) {
      console.error('Failed to save strength:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="כוח חדש"
        showBack
        icon="💪"
        action={
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        {/* Strength text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline-block ml-1" />
            אני טוב ב...
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="הקשבה, סבלנות, יצירתיות..."
            className="input-premium"
            dir="rtl"
            autoFocus
          />
        </div>

        {/* Example */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            דוגמה ממשית
          </label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="מתי ראיתי את זה? (אופציונלי)"
            className="input-premium min-h-[80px]"
            dir="rtl"
          />
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-green-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-green-700">💡</strong> לפעמים קשה לראות את הכוחות שלנו.
            חשוב על מה אחרים אומרים שאתה טוב בו, או על רגע שעשית משהו שאתה גאה בו.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
