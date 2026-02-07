'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Star } from 'lucide-react';
import { addWish } from '@/lib/db';

export default function NewWishPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [why, setWhy] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!text.trim()) {
      toast.error('יש להזין משאלה');
      return;
    }

    setSaving(true);
    try {
      await addWish({
        text: text.trim(),
        why: why.trim() || null,
        tags: [],
        cycleId: null,
      });
      toast.success('המשאלה נשמרה ⭐');
      router.push('/wishes');
    } catch (error) {
      console.error('Failed to save wish:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="משאלה חדשה"
        showBack
        icon="⭐"
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
        {/* Wish text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="w-4 h-4 inline-block ml-1" />
            אני מאחל לעצמי ש...
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="אני מאחל לעצמי שאוכל לנוח בלי אשמה..."
            className="writing-canvas min-h-[120px]"
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

        {/* Tips */}
        <div className="card-premium p-4 bg-amber-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-amber-700">💡</strong> משאלות עוזרות להבין מה באמת חסר לנו.
            אל תצנזר — כאן המקום לחלום.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
