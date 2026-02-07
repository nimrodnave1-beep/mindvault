'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useTopics } from '@/lib/topicContext';
import { TopicPicker } from '@/components/TopicPicker';
import {
  addUrgeEvent,
  getToolsByTopic,
  addToolUsage,
  TopicTool,
} from '@/lib/db';
import { Flame, Wind, DollarSign, ArrowRight, Check, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'identify' | 'pause' | 'cost' | 'alternative';

const URGE_CATEGORIES = [
  { id: 'check' as const, label: 'לבדוק', icon: '👀', desc: 'לבדוק תיק, הודעות, חדשות' },
  { id: 'send' as const, label: 'לשלוח', icon: '✉️', desc: 'לשלוח הודעה, להגיב' },
  { id: 'buy' as const, label: 'לקנות', icon: '💳', desc: 'לבצע רכישה, פעולה פיננסית' },
  { id: 'react' as const, label: 'להגיב', icon: '💥', desc: 'להגיב בכעס, בתסכול' },
  { id: 'avoid' as const, label: 'להימנע', icon: '🏃', desc: 'לברוח, להתחמק מהמצב' },
  { id: 'custom' as const, label: 'אחר', icon: '✏️', desc: 'משהו אחר' },
];

export default function UrgeProtocolPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { topics } = useTopics();
  const preselectedTopic = searchParams.get('topic');

  const [step, setStep] = useState<Step>('identify');
  const [topicId, setTopicId] = useState<string | null>(preselectedTopic);
  const [urgeText, setUrgeText] = useState('');
  const [urgeCategory, setUrgeCategory] = useState<string | null>(null);
  const [breathingDone, setBreathingDone] = useState(false);
  const [breathingTimer, setBreathingTimer] = useState(10);
  const [costText, setCostText] = useState('');
  const [alternativeText, setAlternativeText] = useState('');
  const [suggestedTool, setSuggestedTool] = useState<TopicTool | null>(null);
  const [topicTools, setTopicTools] = useState<TopicTool[]>([]);
  const [saving, setSaving] = useState(false);

  // Load topic tools when topic changes
  useEffect(() => {
    if (topicId) {
      getToolsByTopic(topicId).then(setTopicTools);
    }
  }, [topicId]);

  // Breathing timer
  useEffect(() => {
    if (step === 'pause' && breathingTimer > 0 && !breathingDone) {
      const timer = setTimeout(() => setBreathingTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (step === 'pause' && breathingTimer === 0) {
      setBreathingDone(true);
    }
  }, [step, breathingTimer, breathingDone]);

  const handleFinish = async (outcome: 'resisted' | 'acted' | null) => {
    setSaving(true);
    try {
      await addUrgeEvent({
        primaryTopicId: topicId,
        secondaryTopicIds: [],
        urgeText,
        urgeCategory: urgeCategory as UrgeCategory,
        pauseDuration: 10,
        breathingUsed: breathingDone,
        costText,
        alternativeText,
        suggestedToolId: suggestedTool?.id || null,
        usedSuggestedTool: false,
        outcome,
        cycleId: null,
      });

      if (suggestedTool && topicId) {
        await addToolUsage({
          toolId: suggestedTool.id,
          topicId,
          entryId: null,
          note: 'שימוש דרך Urge Protocol',
        });
      }

      toast.success('הדחיפות נשמרה. כל הכבוד! 💪');
      router.back();
    } catch {
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  type UrgeCategory = 'check' | 'send' | 'buy' | 'react' | 'avoid' | 'custom' | null;

  const activeTopic = topicId ? topics.find((t) => t.id === topicId) : null;

  const stepNumber = step === 'identify' ? 1 : step === 'pause' ? 2 : step === 'cost' ? 3 : 4;

  return (
    <AppShell hideNav>
      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: activeTopic
            ? `linear-gradient(135deg, ${activeTopic.color}15, ${activeTopic.color}05)`
            : 'linear-gradient(135deg, #F97316 15%, #EA580C05)',
          borderBottom: `1px solid ${activeTopic ? `${activeTopic.color}20` : '#FED7AA'}`,
        }}
      >
        <div className="app-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="btn-icon hover:bg-white/60">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                פרוטוקול דחיפות
              </h1>
              <p className="text-xs text-gray-500">שלב {stepNumber} מתוך 4</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-orange-400 transition-all duration-500"
            style={{ width: `${stepNumber * 25}%` }}
          />
        </div>
      </header>

      <div className="app-container py-6 space-y-6">
        {/* === STEP 1: IDENTIFY === */}
        {step === 'identify' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🔥</p>
              <h2 className="text-xl font-bold text-gray-900">מה הדחף?</h2>
              <p className="text-gray-500 text-sm mt-1">מה אתה רוצה לעשות עכשיו?</p>
            </div>

            <TopicPicker value={topicId} onChange={setTopicId} showInbox={false} />

            <div className="grid grid-cols-2 gap-2">
              {URGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setUrgeCategory(cat.id)}
                  className={`card-premium p-3 text-right flex items-center gap-2 transition-all ${
                    urgeCategory === cat.id
                      ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <textarea
              value={urgeText}
              onChange={(e) => setUrgeText(e.target.value)}
              placeholder="תאר את הדחיפות במילים שלך..."
              className="writing-canvas min-h-[100px]"
            />

            <button
              onClick={() => setStep('pause')}
              disabled={!urgeText.trim()}
              className="btn-primary w-full py-3"
              style={activeTopic ? { background: activeTopic.color } : {}}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              המשך להשהיה
            </button>
          </div>
        )}

        {/* === STEP 2: PAUSE (Breathing) === */}
        {step === 'pause' && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="py-8">
              <p className="text-4xl mb-4">🫁</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">עוצרים לרגע</h2>
              <p className="text-gray-500">10 שניות של נשימה לפני שממשיכים</p>
            </div>

            {/* Breathing Animation */}
            <div className="flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-1000 ${
                  breathingDone
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600 animate-pulse'
                }`}
              >
                {breathingDone ? (
                  <Check className="w-12 h-12" />
                ) : (
                  breathingTimer
                )}
              </div>
            </div>

            {breathingDone && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-green-600 font-semibold">מצוין. נשמת. עכשיו בוא נחשוב.</p>
                <button
                  onClick={() => setStep('cost')}
                  className="btn-primary w-full py-3"
                  style={activeTopic ? { background: activeTopic.color } : {}}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  המשך
                </button>
              </div>
            )}

            {!breathingDone && (
              <button
                onClick={() => { setBreathingDone(true); setBreathingTimer(0); }}
                className="btn-ghost text-sm py-2"
              >
                דלג
              </button>
            )}
          </div>
        )}

        {/* === STEP 3: COST === */}
        {step === 'cost' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-4">
              <p className="text-2xl mb-2">💰</p>
              <h2 className="text-xl font-bold text-gray-900">מה המחיר?</h2>
              <p className="text-gray-500 text-sm mt-1">מה יקרה מחר אם אעשה את זה עכשיו?</p>
            </div>

            <textarea
              value={costText}
              onChange={(e) => setCostText(e.target.value)}
              placeholder="מה אני אפסיד? מה ירגיש מחר בבוקר?"
              className="writing-canvas min-h-[120px]"
              autoFocus
            />

            <button
              onClick={() => {
                setStep('alternative');
                // Suggest a random tool from this topic
                if (topicTools.length > 0) {
                  const randomTool = topicTools[Math.floor(Math.random() * topicTools.length)];
                  setSuggestedTool(randomTool);
                }
              }}
              disabled={!costText.trim()}
              className="btn-primary w-full py-3"
              style={activeTopic ? { background: activeTopic.color } : {}}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              המשך לחלופה
            </button>
          </div>
        )}

        {/* === STEP 4: ALTERNATIVE === */}
        {step === 'alternative' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🔄</p>
              <h2 className="text-xl font-bold text-gray-900">מה בחירה אחרת?</h2>
              <p className="text-gray-500 text-sm mt-1">מה אני בוחר לעשות במקום ב-10 הדקות הקרובות?</p>
            </div>

            {/* Suggested Tool */}
            {suggestedTool && (
              <div
                className="card-premium p-4 text-center"
                style={{ borderColor: activeTopic ? `${activeTopic.color}30` : '#E5E7EB' }}
              >
                <p className="text-xs text-gray-500 mb-1">כלי מומלץ מארגז הכלים שלך:</p>
                <p className="font-bold text-gray-900">{suggestedTool.name}</p>
                {suggestedTool.whenToUse && (
                  <p className="text-sm text-gray-500 mt-1">{suggestedTool.whenToUse}</p>
                )}
              </div>
            )}

            <textarea
              value={alternativeText}
              onChange={(e) => setAlternativeText(e.target.value)}
              placeholder="מה אני עושה במקום? (הליכה, נשימה, כוס מים...)"
              className="writing-canvas min-h-[100px]"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleFinish('resisted')}
                disabled={saving}
                className="btn-primary py-3 text-sm"
                style={activeTopic ? { background: activeTopic.color } : { background: '#22C55E' }}
              >
                <Check className="w-4 h-4" />
                עמדתי בזה
              </button>
              <button
                onClick={() => handleFinish('acted')}
                disabled={saving}
                className="btn-secondary py-3 text-sm"
              >
                עשיתי את זה
              </button>
            </div>
            <button
              onClick={() => handleFinish(null)}
              disabled={saving}
              className="btn-ghost w-full py-2 text-sm"
            >
              שמור בלי תוצאה
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
