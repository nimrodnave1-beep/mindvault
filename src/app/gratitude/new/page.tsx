'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Save, Heart, Plus, X } from 'lucide-react';
import { addGratitudeEntry } from '@/lib/db';
import { getToday } from '@/lib/utils';

export default function NewGratitudePage() {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  async function handleSave() {
    const validItems = items.filter((i) => i.trim());
    if (validItems.length === 0) {
      toast.error('יש להזין לפחות דבר אחד');
      return;
    }

    setSaving(true);
    try {
      await addGratitudeEntry({
        primaryTopicId: null,
        date: getToday(),
        type: 'manual',
        items: validItems.map((text) => ({
          text: text.trim(),
          why: '',
          myContribution: '',
          category: null,
        })),
        feeling: '',
        memoryNote: '',
        cycleId: null,
      });
      toast.success('נשמר! 🙏');
      router.push('/journey?tab=gratitude');
    } catch (error) {
      console.error('Failed to save gratitude:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="הכרת תודה"
        showBack
        icon="🙏"
        action={
          <button
            onClick={handleSave}
            disabled={saving || items.every((i) => !i.trim())}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        <p className="text-sm text-gray-500">על מה אני מודה היום?</p>

        {/* Gratitude items */}
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Heart className="w-4 h-4 text-pink-400 mt-3 flex-shrink-0" />
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`דבר ${index + 1} שאני מודה עליו...`}
                className="input-premium flex-1"
                dir="rtl"
                autoFocus={index === 0}
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium flex items-center justify-center gap-2 hover:border-pink-200 hover:text-pink-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          עוד דבר
        </button>

        {/* Tips */}
        <div className="card-premium p-4 bg-pink-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-pink-700">💡</strong> אפילו דבר קטן מספיק.
            המוח שלנו זוכר יותר את מה שכותבים.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
