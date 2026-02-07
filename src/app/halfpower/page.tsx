'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { TopicPicker } from '@/components/TopicPicker';
import { useTopics } from '@/lib/topicContext';
import { addHalfPowerEntry } from '@/lib/db';
import { ChevronRight, Zap, Check, Smile } from 'lucide-react';
import { toast } from 'sonner';

const EMOJI_MOODS = ['😊', '😐', '😔', '😤', '😰', '😴', '🤯', '💪', '🥺', '😌'];

type Level = 'emoji' | 'action' | 'write';

export default function HalfPowerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { topics } = useTopics();
  const preselectedTopic = searchParams.get('topic');

  const [topicId, setTopicId] = useState<string | null>(preselectedTopic);
  const [level, setLevel] = useState<Level>('emoji');
  const [emojiMood, setEmojiMood] = useState<string | null>(null);
  const [actionCheckText, setActionCheckText] = useState('');
  const [actionCheckResult, setActionCheckResult] = useState<boolean | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const activeTopic = topicId ? topics.find((t) => t.id === topicId) : null;
  const accentColor = activeTopic?.color || '#6B4EE6';

  const handleSave = async () => {
    setSaving(true);
    try {
      let templateType: 'emoji_checkin' | 'action_check' | 'freeform_90s' | 'one_sentence' | 'facts_only' | 'custom' = 'custom';
      if (level === 'emoji') templateType = 'emoji_checkin';
      else if (level === 'action') templateType = 'action_check';
      else templateType = 'freeform_90s';

      await addHalfPowerEntry({
        primaryTopicId: topicId,
        content: content.trim(),
        templateType,
        emojiMood: level === 'emoji' ? emojiMood : null,
        actionCheckText: level === 'action' ? actionCheckText : null,
        actionCheckResult: level === 'action' ? actionCheckResult : null,
        cycleId: null,
      });
      toast.success('נשמר! 💪');
      router.back();
    } catch {
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const canSave = () => {
    if (level === 'emoji') return emojiMood !== null;
    if (level === 'action') return actionCheckText.trim() && actionCheckResult !== null;
    return content.trim().length > 0;
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
              <Zap className="w-5 h-5" style={{ color: accentColor }} />
              חצי כוח
            </h1>
            <p className="text-xs text-gray-500">גם קצת זה הרבה</p>
          </div>
        </div>
      </header>

      <div className="app-container py-6 space-y-6">
        <TopicPicker value={topicId} onChange={setTopicId} showInbox={false} />

        {/* Level Selector */}
        <div className="view-toggle">
          <button
            onClick={() => setLevel('emoji')}
            className={level === 'emoji' ? 'view-toggle-item-active' : 'view-toggle-item'}
          >
            😊 אמוג׳י
          </button>
          <button
            onClick={() => setLevel('action')}
            className={level === 'action' ? 'view-toggle-item-active' : 'view-toggle-item'}
          >
            ✅ בדיקת פעולה
          </button>
          <button
            onClick={() => setLevel('write')}
            className={level === 'write' ? 'view-toggle-item-active' : 'view-toggle-item'}
          >
            ✏️ כתיבה קצרה
          </button>
        </div>

        {/* === LEVEL 1: EMOJI CHECK-IN === */}
        {level === 'emoji' && (
          <div className="space-y-5 animate-fade-in text-center">
            <p className="text-gray-500">איך אני מרגיש עכשיו?</p>
            <div className="flex flex-wrap justify-center gap-3">
              {EMOJI_MOODS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setEmojiMood(emoji)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    emojiMood === emoji
                      ? 'ring-2 ring-offset-2 scale-110 bg-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={emojiMood === emoji ? { ringColor: accentColor } : {}}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {emojiMood && (
              <p className="text-lg font-semibold text-gray-900 animate-fade-in">
                {emojiMood} — תודה שבדקת.
              </p>
            )}
          </div>
        )}

        {/* === LEVEL 2: ACTION CHECK === */}
        {level === 'action' && (
          <div className="space-y-5 animate-fade-in">
            <p className="text-gray-500 text-center">האם עמדת בחוק הקטן של היום?</p>

            <input
              type="text"
              value={actionCheckText}
              onChange={(e) => setActionCheckText(e.target.value)}
              placeholder="מה החוק? (למשל: לא בדקתי תיק)"
              className="input-premium"
              autoFocus
            />

            {actionCheckText.trim() && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <button
                  onClick={() => setActionCheckResult(true)}
                  className={`card-premium p-4 text-center transition-all ${
                    actionCheckResult === true
                      ? 'border-green-300 bg-green-50 ring-1 ring-green-200'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <Check className="w-8 h-8 mx-auto mb-1 text-green-500" />
                  <p className="font-semibold text-gray-900">עמדתי בזה</p>
                </button>
                <button
                  onClick={() => setActionCheckResult(false)}
                  className={`card-premium p-4 text-center transition-all ${
                    actionCheckResult === false
                      ? 'border-gray-400 bg-gray-50 ring-1 ring-gray-300'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <Smile className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                  <p className="font-semibold text-gray-900">לא הפעם</p>
                  <p className="text-xs text-gray-500">וזה בסדר</p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* === LEVEL 3: WRITE === */}
        {level === 'write' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-gray-500 text-center">90 שניות כתיבה. מה שעולה.</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="..."
              className="writing-canvas min-h-[150px]"
              style={{ borderColor: `${accentColor}40` }}
              autoFocus
            />
            {content && (
              <p className="text-xs text-gray-400 text-center">
                {content.length} תווים
              </p>
            )}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !canSave()}
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
