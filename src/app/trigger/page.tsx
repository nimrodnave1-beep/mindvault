'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useTopics } from '@/lib/topicContext';
import { TopicPicker } from '@/components/TopicPicker';
import { addUrgeEvent } from '@/lib/db';
import { getDB, generateId, TriggerHurtEvent } from '@/lib/db';
import { ChevronRight, ArrowRight, Heart, Shield, Thermometer, Wind, Check } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'thermometer' | 'cooling' | 'classify' | 'respond';

export default function TriggerHurtPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { topics } = useTopics();
  const preselectedTopic = searchParams.get('topic');

  const [step, setStep] = useState<Step>('thermometer');
  const [topicId, setTopicId] = useState<string | null>(preselectedTopic);
  const [intensity, setIntensity] = useState(5);
  const [coolingTimer, setCoolingTimer] = useState(300); // 5 min in seconds
  const [type, setType] = useState<'trigger' | 'hurt' | null>(null);
  const [note, setNote] = useState('');

  // Trigger fields
  const [draftMessage, setDraftMessage] = useState('');

  // Hurt fields
  const [boundaryRequest, setBoundaryRequest] = useState('');
  const [boundaryDefinition, setBoundaryDefinition] = useState('');
  const [boundaryConsequence, setBoundaryConsequence] = useState('');

  const [saving, setSaving] = useState(false);

  const activeTopic = topicId ? topics.find((t) => t.id === topicId) : null;
  const accentColor = activeTopic?.color || '#E64E8A';

  // Cooling timer
  useEffect(() => {
    if (step === 'cooling' && coolingTimer > 0) {
      const timer = setTimeout(() => setCoolingTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, coolingTimer]);

  const needsCooling = intensity >= 8;
  const stepNumber = step === 'thermometer' ? 1 : step === 'cooling' ? 2 : step === 'classify' ? (needsCooling ? 3 : 2) : (needsCooling ? 4 : 3);
  const totalSteps = needsCooling ? 4 : 3;

  const formatCoolingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (level: number) => {
    if (level <= 3) return '#22C55E';
    if (level <= 5) return '#EAB308';
    if (level <= 7) return '#F97316';
    return '#EF4444';
  };

  const getIntensityLabel = (level: number) => {
    if (level <= 2) return 'שקט';
    if (level <= 4) return 'קצת מופעל';
    if (level <= 6) return 'מופעל';
    if (level <= 8) return 'סערה';
    return 'הצפה';
  };

  const handleAfterThermometer = () => {
    if (needsCooling) {
      setStep('cooling');
    } else {
      setStep('classify');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      const event: TriggerHurtEvent = {
        id: generateId(),
        primaryTopicId: topicId,
        secondaryTopicIds: [],
        intensityLevel: intensity,
        coolingEnforced: needsCooling,
        coolingDuration: needsCooling ? 300 - coolingTimer : 0,
        type: type || 'trigger',
        regulationDuration: 0,
        draftMessage: type === 'trigger' ? draftMessage : '',
        boundaryRequest: type === 'hurt' ? boundaryRequest : '',
        boundaryDefinition: type === 'hurt' ? boundaryDefinition : '',
        boundaryConsequence: type === 'hurt' ? boundaryConsequence : '',
        note,
        cycleId: null,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      };
      await db.put('triggerHurtEvents', event);
      toast.success('נשמר בהצלחה');
      router.back();
    } catch {
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell hideNav>
      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}05)`,
          borderBottom: `1px solid ${accentColor}20`,
        }}
      >
        <div className="app-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="btn-icon hover:bg-white/60">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: accentColor }} />
                טריגר או פגיעה?
              </h1>
              <p className="text-xs text-gray-500">שלב {stepNumber} מתוך {totalSteps}</p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(stepNumber / totalSteps) * 100}%`, background: accentColor }}
          />
        </div>
      </header>

      <div className="app-container py-6 space-y-6">
        {/* === STEP 1: THERMOMETER === */}
        {step === 'thermometer' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <p className="text-3xl mb-3">🌡️</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">מדחום רגשי</h2>
              <p className="text-gray-500 text-sm">כמה חזקה ההרגשה עכשיו?</p>
            </div>

            <TopicPicker value={topicId} onChange={setTopicId} showInbox={false} label="נושא" />

            {/* Intensity Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">עוצמת ההרגשה</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: getIntensityColor(intensity) }}
                >
                  {intensity}/10 — {getIntensityLabel(intensity)}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to left, ${getIntensityColor(intensity)}, ${getIntensityColor(intensity)}40)`,
                }}
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>שקט</span>
                <span>הצפה</span>
              </div>
            </div>

            {/* Warning for high intensity */}
            {needsCooling && (
              <div className="rounded-xl p-4 bg-red-50 border border-red-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <p className="font-semibold text-red-700 text-sm">עוצמה גבוהה ({intensity}/10)</p>
                </div>
                <p className="text-red-600 text-sm">
                  ב-8 ומעלה, האפליקציה תפעיל 5 דקות נשימה לפני שנמשיך. זה חשוב.
                </p>
              </div>
            )}

            <button
              onClick={handleAfterThermometer}
              className="btn-primary w-full py-3"
              style={{ background: accentColor }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              המשך
            </button>
          </div>
        )}

        {/* === STEP 2 (optional): COOLING === */}
        {step === 'cooling' && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="py-6">
              <p className="text-4xl mb-4">🫁</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">נשימה לפני פעולה</h2>
              <p className="text-gray-500 text-sm">
                העוצמה גבוהה. 5 דקות נשימה לפני שכותבים.
              </p>
            </div>

            {/* Breathing Circle */}
            <div
              className="w-44 h-44 rounded-full mx-auto flex flex-col items-center justify-center"
              style={{
                background: `${accentColor}10`,
                border: `3px solid ${accentColor}30`,
                animation: 'breathe 6s ease-in-out infinite',
              }}
            >
              {coolingTimer > 0 ? (
                <>
                  <p className="text-3xl font-bold font-mono" style={{ color: accentColor }}>
                    {formatCoolingTime(coolingTimer)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">נשמים...</p>
                </>
              ) : (
                <Check className="w-12 h-12 text-green-500" />
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p className="font-medium">נשימה 4-7-8</p>
              <p>שאיפה 4 שניות → עצירה 7 → נשיפה 8</p>
            </div>

            {coolingTimer <= 0 ? (
              <button
                onClick={() => setStep('classify')}
                className="btn-primary w-full py-3"
                style={{ background: accentColor }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                עכשיו בוא נסווג
              </button>
            ) : (
              <button
                onClick={() => { setCoolingTimer(0); }}
                className="btn-ghost text-sm py-2"
              >
                דלג (לא מומלץ)
              </button>
            )}
          </div>
        )}

        {/* === STEP 3: CLASSIFY === */}
        {step === 'classify' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">מה קרה?</h2>
              <p className="text-gray-500 text-sm">ההבחנה הכי חשובה בזוגיות</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setType('trigger'); setStep('respond'); }}
                className={`card-premium p-5 text-right transition-all hover:border-orange-300 ${
                  type === 'trigger' ? 'border-orange-400 bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-bold text-gray-900">טריגר פנימי</h3>
                </div>
                <p className="text-sm text-gray-600">
                  משהו שהאדם השני עשה הפעיל תגובה ישנה שלי. הכאב הוא יותר שלי.
                </p>
              </button>

              <button
                onClick={() => { setType('hurt'); setStep('respond'); }}
                className={`card-premium p-5 text-right transition-all hover:border-rose-300 ${
                  type === 'hurt' ? 'border-rose-400 bg-rose-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💔</span>
                  <h3 className="text-lg font-bold text-gray-900">פגיעה אמיתית</h3>
                </div>
                <p className="text-sm text-gray-600">
                  גבול שלי נפרץ. צריך לתקשר בצורה ברורה מה אני צריך.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* === STEP 4: RESPOND === */}
        {step === 'respond' && (
          <div className="space-y-5 animate-fade-in">
            {type === 'trigger' ? (
              <>
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">⚡</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">ויסות ותגובה</h2>
                  <p className="text-gray-500 text-sm">קודם ויסות, אחר כך תקשורת</p>
                </div>

                <div className="card-premium p-4 bg-orange-50/50">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>תזכורת:</strong> אם זה טריגר פנימי, לא חייבים לשלוח הודעה.
                    לפעמים מספיק לכתוב טיוטה ולא לשלוח.
                  </p>
                </div>

                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder="טיוטת הודעה (לא חייבים לשלוח)..."
                  className="writing-canvas min-h-[120px]"
                  autoFocus
                />
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">💔</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">ניסוח גבול</h2>
                  <p className="text-gray-500 text-sm">3 משפטים ברורים</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      מה אני מבקש?
                    </label>
                    <input
                      type="text"
                      value={boundaryRequest}
                      onChange={(e) => setBoundaryRequest(e.target.value)}
                      placeholder="אני צריך ש..."
                      className="input-premium"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      מה הגבול שלי?
                    </label>
                    <input
                      type="text"
                      value={boundaryDefinition}
                      onChange={(e) => setBoundaryDefinition(e.target.value)}
                      placeholder="הגבול שלי הוא..."
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      מה יקרה אם הגבול לא נשמר?
                    </label>
                    <input
                      type="text"
                      value={boundaryConsequence}
                      onChange={(e) => setBoundaryConsequence(e.target.value)}
                      placeholder="אם זה ימשיך, אני..."
                      className="input-premium"
                    />
                  </div>
                </div>
              </>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="הערה אישית (אופציונלי)..."
              className="writing-canvas min-h-[80px]"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full py-3"
              style={{ background: accentColor }}
            >
              <Check className="w-4 h-4" />
              שמירה
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </AppShell>
  );
}
