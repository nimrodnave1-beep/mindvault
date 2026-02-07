'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useTopics } from '@/lib/topicContext';
import { addGratitudeEntry, GratitudeItem } from '@/lib/db';
import { getToday } from '@/lib/utils';
import { ChevronRight, Heart, Plus, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function GratitudePage() {
  const params = useParams();
  const router = useRouter();
  const { topics } = useTopics();
  const topicId = params.id as string;
  const activeTopic = topics.find((t) => t.id === topicId);

  const [items, setItems] = useState<GratitudeItem[]>([
    { text: '', why: '', myContribution: '', category: null },
  ]);
  const [feeling, setFeeling] = useState('');
  const [memoryNote, setMemoryNote] = useState('');
  const [saving, setSaving] = useState(false);

  const accentColor = activeTopic?.color || '#E64E8A';

  const handleAddItem = () => {
    setItems([...items, { text: '', why: '', myContribution: '', category: null }]);
  };

  const handleUpdateItem = (index: number, field: keyof GratitudeItem, value: string | null) => {
    const newItems = [...items];
    (newItems[index] as Record<string, unknown>)[field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    const validItems = items.filter((item) => item.text.trim());
    if (validItems.length === 0) {
      toast.error('נא להזין לפחות פריט תודה אחד');
      return;
    }

    setSaving(true);
    try {
      await addGratitudeEntry({
        primaryTopicId: topicId,
        date: getToday(),
        type: validItems.length === 1 && !validItems[0].why ? 'quick' : 'deep',
        items: validItems,
        feeling,
        memoryNote,
        cycleId: null,
      });
      toast.success('הכרת תודה נשמרה ✨');
      router.back();
    } catch {
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}05)`,
          borderBottom: `1px solid ${accentColor}20`,
        }}
      >
        <div className="app-container py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-icon hover:bg-white/60">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5" style={{ color: accentColor }} />
              הכרת תודה
            </h1>
            {activeTopic && (
              <p className="text-xs text-gray-500">{activeTopic.icon} {activeTopic.name}</p>
            )}
          </div>
        </div>
      </header>

      <div className="app-container py-6 space-y-5">
        {/* Gratitude Items */}
        {items.map((item, index) => (
          <div key={index} className="card-premium p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                תודה #{index + 1}
              </span>
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="btn-icon w-7 h-7 hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <input
              type="text"
              value={item.text}
              onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
              placeholder="על מה אני אסיר/ת תודה?"
              className="input-premium"
              style={{ borderColor: `${accentColor}30` }}
              autoFocus={index === 0}
            />

            {/* Category */}
            <div className="flex gap-2">
              {[
                { id: 'person', label: 'אדם', emoji: '👤' },
                { id: 'event', label: 'אירוע', emoji: '🎯' },
                { id: 'self', label: 'עצמי', emoji: '💫' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleUpdateItem(index, 'category', item.category === cat.id ? null : cat.id)}
                  className={`chip text-xs transition-all ${
                    item.category === cat.id
                      ? 'border font-semibold'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                  style={
                    item.category === cat.id
                      ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}30` }
                      : {}
                  }
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Deep fields (optional) */}
            <input
              type="text"
              value={item.why}
              onChange={(e) => handleUpdateItem(index, 'why', e.target.value)}
              placeholder="למה זה חשוב לי? (אופציונלי)"
              className="input-premium text-sm"
            />
            <input
              type="text"
              value={item.myContribution}
              onChange={(e) => handleUpdateItem(index, 'myContribution', e.target.value)}
              placeholder="מה התרומה שלי? (אופציונלי)"
              className="input-premium text-sm"
            />
          </div>
        ))}

        {/* Add More */}
        <button
          onClick={handleAddItem}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-400 border border-dashed border-gray-300 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          עוד פריט תודה
        </button>

        {/* Overall Feeling */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            איך אני מרגיש אחרי? (אופציונלי)
          </label>
          <input
            type="text"
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="מילה אחת שמתארת..."
            className="input-premium"
          />
        </div>

        {/* Memory Note */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            זיכרון להיום (אופציונלי)
          </label>
          <input
            type="text"
            value={memoryNote}
            onChange={(e) => setMemoryNote(e.target.value)}
            placeholder="רגע אחד שווה לזכור..."
            className="input-premium"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !items.some((i) => i.text.trim())}
          className="btn-primary w-full py-3"
          style={{ background: accentColor }}
        >
          <Check className="w-4 h-4" />
          שמירה
        </button>
      </div>
    </AppShell>
  );
}
