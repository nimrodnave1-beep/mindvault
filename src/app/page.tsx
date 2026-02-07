'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AddActionSheet } from '@/components/AddActionSheet';
import {
  Plus,
  Lock,
  Target,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import {
  getPinnedGoal,
  getOpenAgendaItems,
  addGratitudeEntry,
  Goal,
  AgendaItem,
} from '@/lib/db';
import { getGreeting, getHebrewDateString } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const [pinnedGoal, setPinnedGoal] = useState<Goal | null>(null);
  const [agendaCount, setAgendaCount] = useState(0);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [goal, agendaItems] = await Promise.all([
          getPinnedGoal(),
          getOpenAgendaItems(),
        ]);
        setPinnedGoal(goal || null);
        setAgendaCount(agendaItems.length);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveGratitude = async () => {
    if (!gratitudeText.trim()) return;
    try {
      await addGratitudeEntry({
        primaryTopicId: null,
        date: new Date().toISOString().split('T')[0],
        type: 'quick',
        items: [{ text: gratitudeText.trim(), why: '', myContribution: '', category: null }],
        feeling: '',
        memoryNote: '',
        cycleId: null,
      });
      setGratitudeText('');
      setGratitudeSaved(true);
      toast.success('נשמר!');
      setTimeout(() => setGratitudeSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save gratitude:', error);
      toast.error('שגיאה בשמירה');
    }
  };

  return (
    <AppShell>
      <div className="app-container pt-6 pb-4 space-y-6">
        {/* ========== Header ========== */}
        <div className="flex items-start justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-0.5">{getGreeting()} 👋</p>
            <h1 className="text-2xl font-bold text-gray-900">MindVault</h1>
            <p className="text-xs text-gray-400 mt-0.5">{getHebrewDateString()}</p>
          </div>
          <Link
            href="/vault"
            className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mt-1"
          >
            <Lock className="w-4 h-4 text-purple-500" />
          </Link>
        </div>

        {/* ========== Add Button — Primary CTA ========== */}
        <button
          onClick={() => setShowActionSheet(true)}
          className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 rounded-2xl shadow-lg"
        >
          <Plus className="w-5 h-5" />
          הוספה
        </button>

        {/* ========== Pinned Goal ========== */}
        <section>
          <h2 className="section-title mb-2.5">
            <Target className="w-5 h-5 text-purple-500" />
            המטרה שלי
          </h2>
          {loading ? (
            <div className="skeleton h-20 w-full rounded-2xl" />
          ) : pinnedGoal ? (
            <Link href="/goals" className="card-interactive p-4 block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {pinnedGoal.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pinnedGoal.status === 'active' ? '● פעילה' : pinnedGoal.status}
                    {pinnedGoal.horizon !== 'open' && ` · ${pinnedGoal.horizon === 'weekly' ? 'שבועית' : 'חודשית'}`}
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ) : (
            <Link href="/goals/new" className="card-interactive p-5 text-center block">
              <p className="text-gray-400 text-sm mb-2">
                הגדר מטרה שתלווה אותך
              </p>
              <span className="text-purple-600 font-semibold text-sm">
                + מטרה חדשה
              </span>
            </Link>
          )}
        </section>

        {/* ========== Gratitude Quick Input ========== */}
        <section>
          <h2 className="section-title mb-2.5">
            <span className="text-pink-500">🙏</span>
            על מה תודה היום?
          </h2>
          <div className="card-premium p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGratitude()}
                placeholder="דבר קטן שטוב שהיה..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-300 outline-none py-2 px-1"
                dir="rtl"
              />
              <button
                onClick={handleSaveGratitude}
                disabled={!gratitudeText.trim()}
                className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-100 transition-colors"
              >
                {gratitudeSaved ? '✓ נשמר' : 'שמור'}
              </button>
            </div>
          </div>
        </section>

        {/* ========== "I'm in a session" — only when agenda has items ========== */}
        {agendaCount > 0 && (
          <Link
            href="/agenda?inroom=true"
            className="block w-full py-3.5 rounded-2xl bg-gradient-to-l from-teal-500 to-teal-600 text-white text-center font-bold shadow-lg hover:opacity-95 transition-opacity"
          >
            <Eye className="w-5 h-5 inline-block ml-2" />
            אני בפגישה עכשיו
          </Link>
        )}

        {/* ========== Privacy Footer ========== */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-gray-300 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            פרטי לגמרי · בלי AI · הכל נשאר אצלך
          </p>
        </div>
      </div>

      {/* ========== Action Sheet ========== */}
      <AddActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
      />
    </AppShell>
  );
}
