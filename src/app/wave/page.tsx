'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useTopics } from '@/lib/topicContext';
import { addWaveModeSession, updateWaveModeSession, WaveModeSession } from '@/lib/db';
import { ChevronRight, Wind, Play, Square, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function WaveModePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { topics } = useTopics();
  const preselectedTopic = searchParams.get('topic');
  const topicId = preselectedTopic;

  const [phase, setPhase] = useState<'ready' | 'active' | 'done'>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [breathingUsed, setBreathingUsed] = useState(false);
  const [noteAfter, setNoteAfter] = useState('');
  const [session, setSession] = useState<WaveModeSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<number>(0);

  const activeTopic = topicId ? topics.find((t) => t.id === topicId) : null;
  const accentColor = activeTopic?.color || '#3B82F6';

  // Timer
  useEffect(() => {
    if (phase === 'active') {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setPhase('active');
    try {
      const s = await addWaveModeSession({
        primaryTopicId: topicId,
        startedAt: new Date().toISOString(),
        endedAt: null,
        durationSeconds: null,
        breathingUsed: false,
        noteAfter: '',
        cycleId: null,
      });
      setSession(s);
    } catch {
      // Continue without saving
    }
  };

  const handleStop = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');

    if (session) {
      try {
        await updateWaveModeSession({
          ...session,
          endedAt: new Date().toISOString(),
          durationSeconds: elapsed,
          breathingUsed,
        });
      } catch {
        // Continue
      }
    }
  };

  const handleSaveNote = async () => {
    if (session && noteAfter.trim()) {
      try {
        await updateWaveModeSession({
          ...session,
          noteAfter: noteAfter.trim(),
          endedAt: new Date().toISOString(),
          durationSeconds: elapsed,
          breathingUsed,
        });
      } catch {
        // Continue
      }
    }
    toast.success('הגל עבר. כל הכבוד 🌊');
    router.back();
  };

  return (
    <AppShell hideNav>
      {/* Minimal header */}
      <div className="app-container pt-4">
        <button onClick={() => router.back()} className="btn-icon hover:bg-white/60">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="app-container flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        {/* === READY === */}
        {phase === 'ready' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <p className="text-5xl mb-4">🌊</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">מצב גל</h1>
              <p className="text-gray-500">
                הגל תמיד עובר. בוא נעבור אותו יחד.
              </p>
              {activeTopic && (
                <p className="text-sm mt-2" style={{ color: activeTopic.color }}>
                  {activeTopic.icon} {activeTopic.name}
                </p>
              )}
            </div>
            <button
              onClick={handleStart}
              className="w-28 h-28 rounded-full mx-auto flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 press-effect"
              style={{ background: accentColor }}
            >
              <Play className="w-10 h-10 mr-[-4px]" />
            </button>
            <p className="text-sm text-gray-400">לחצו כשמתחיל הגל</p>
          </div>
        )}

        {/* === ACTIVE === */}
        {phase === 'active' && (
          <div className="space-y-8 animate-fade-in">
            {/* Breathing circle */}
            <div
              className="w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center transition-all"
              style={{
                background: `${accentColor}10`,
                border: `3px solid ${accentColor}40`,
                animation: 'breathe 6s ease-in-out infinite',
              }}
            >
              <p className="text-4xl font-bold font-mono" style={{ color: accentColor }}>
                {formatTime(elapsed)}
              </p>
              <p className="text-sm text-gray-500 mt-1">הגל עובר...</p>
            </div>

            {/* Breathing toggle */}
            <button
              onClick={() => setBreathingUsed(!breathingUsed)}
              className={`chip mx-auto transition-all ${
                breathingUsed
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              <Wind className="w-4 h-4" />
              {breathingUsed ? 'משתמש בנשימה ✓' : 'הפעל נשימה 4-7-8'}
            </button>

            {breathingUsed && (
              <div className="text-sm text-gray-500 animate-fade-in">
                <p className="font-medium mb-1">נשימה 4-7-8</p>
                <p>שאיפה 4 שניות → עצירה 7 שניות → נשיפה 8 שניות</p>
              </div>
            )}

            <button
              onClick={handleStop}
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-500 text-white shadow-lg transition-transform hover:scale-105 press-effect"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
            <p className="text-sm text-gray-400">לחצו כשהגל עובר</p>
          </div>
        )}

        {/* === DONE === */}
        {phase === 'done' && (
          <div className="space-y-6 animate-fade-in w-full max-w-sm">
            <div>
              <p className="text-5xl mb-4">✅</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">הגל עבר</h2>
              <p className="text-gray-500">
                {formatTime(elapsed)} — עברת את זה.
              </p>
            </div>

            <textarea
              value={noteAfter}
              onChange={(e) => setNoteAfter(e.target.value)}
              placeholder="מה למדת מהגל הזה? (אופציונלי)"
              className="writing-canvas min-h-[100px] text-center"
            />

            <button
              onClick={handleSaveNote}
              className="btn-primary w-full py-3"
              style={{ background: accentColor }}
            >
              <Check className="w-4 h-4" />
              סיום
            </button>
          </div>
        )}
      </div>

      {/* CSS for breathing animation */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </AppShell>
  );
}
