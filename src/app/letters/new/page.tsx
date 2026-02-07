'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Mail } from 'lucide-react';
import { addLetter } from '@/lib/db';

type LetterType = 'from_future' | 'from_past' | 'from_present';

const typeOptions: { value: LetterType; label: string; description: string }[] = [
  { value: 'from_future', label: 'מהעתיד', description: 'מה הייתי אומר לעצמי מעוד שנה?' },
  { value: 'from_past', label: 'מהעבר', description: 'מה הייתי אומר לעצמי הקטן?' },
  { value: 'from_present', label: 'מההווה', description: 'מה אני צריך לשמוע עכשיו?' },
];

export default function NewLetterPage() {
  const router = useRouter();
  const [type, setType] = useState<LetterType>('from_future');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error('יש להזין כותרת ותוכן');
      return;
    }

    setSaving(true);
    try {
      await addLetter({
        type,
        title: title.trim(),
        content: content.trim(),
        tags: [],
        cycleId: null,
      });
      toast.success('המכתב נשמר 💌');
      router.push('/letters');
    } catch (error) {
      console.error('Failed to save letter:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="מכתב חדש לעצמי"
        showBack
        icon="💌"
        action={
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סוג המכתב
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`p-3 rounded-xl text-center transition-all ${
                  type === opt.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm font-medium block">{opt.label}</span>
                <span className={`text-[10px] block mt-0.5 ${type === opt.value ? 'text-white/80' : 'text-gray-400'}`}>
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline-block ml-1" />
            כותרת
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לי שלעוד שנה, ליובל בן ה-8..."
            className="input-premium"
            dir="rtl"
            autoFocus
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תוכן המכתב
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="אני כותב לך כי..."
            className="writing-canvas min-h-[200px]"
            dir="rtl"
          />
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-violet-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-violet-700">💡</strong> מכתב לעצמך הוא דרך עוצמתית ליצור דיאלוג פנימי.
            אין תשובה נכונה — כתוב מה שעולה.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
