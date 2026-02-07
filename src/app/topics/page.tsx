'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { TopicCard } from '@/components/TopicCard';
import { EmptyState } from '@/components/EmptyState';
import { useTopics } from '@/lib/topicContext';
import {
  Topic,
  getActiveTopics,
  getArchivedTopics,
  addTopic,
  getTopicStats,
  getInboxCount,
  TOPIC_COLORS,
  GENERAL_TOPIC_ID,
} from '@/lib/db';
import {
  Plus,
  FolderHeart,
  Inbox,
  Archive,
  ChevronDown,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const TOPIC_ICONS = ['📊', '💑', '😤', '😴', '👨‍👩‍👧', '💼', '🏃', '🎯', '📚', '🧘', '❤️', '🧠', '🎨', '🌱', '💰', '🏠'];

export default function TopicsPage() {
  const { refreshTopics } = useTopics();
  const [activeTopics, setActiveTopics] = useState<Topic[]>([]);
  const [archivedTopics, setArchivedTopics] = useState<Topic[]>([]);
  const [topicStatsMap, setTopicStatsMap] = useState<Record<string, { openAgenda: number; totalEntries: number; lastActivity: string | null }>>({});
  const [inboxCount, setInboxCount] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New topic form
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📊');
  const [newColor, setNewColor] = useState(TOPIC_COLORS[0]);

  const loadData = useCallback(async () => {
    try {
      const [active, archived, inbox] = await Promise.all([
        getActiveTopics(),
        getArchivedTopics(),
        getInboxCount(),
      ]);
      setActiveTopics(active);
      setArchivedTopics(archived);
      setInboxCount(inbox);

      // Load stats for each topic
      const statsMap: Record<string, { openAgenda: number; totalEntries: number; lastActivity: string | null }> = {};
      for (const topic of active) {
        statsMap[topic.id] = await getTopicStats(topic.id);
      }
      setTopicStatsMap(statsMap);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTopic = async () => {
    if (!newName.trim()) {
      toast.error('יש להזין שם נושא');
      return;
    }

    const activeLimitCheck = activeTopics.filter((t) => t.id !== GENERAL_TOPIC_ID);
    if (activeLimitCheck.length >= 8) {
      toast.error('מקסימום 8 נושאים פעילים. העבר נושאים ישנים לארכיון.');
      return;
    }

    try {
      await addTopic({ name: newName.trim(), icon: newIcon, color: newColor });
      setShowAddModal(false);
      setNewName('');
      setNewIcon('📊');
      setNewColor(TOPIC_COLORS[0]);
      await refreshTopics();
      await loadData();
      toast.success('הנושא נוסף בהצלחה');
    } catch (error) {
      console.error('Failed to add topic:', error);
      toast.error('שגיאה ביצירת נושא');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="נושאים"
        icon={<FolderHeart className="w-6 h-6 text-purple-500" />}
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            נושא חדש
          </button>
        }
      />

      <div className="app-container py-4 space-y-4">
        {/* Inbox Banner */}
        {inboxCount > 0 && (
          <Link
            href="/inbox"
            className="card-premium p-4 flex items-center gap-3 border-amber-200 bg-gradient-to-l from-amber-50 to-white"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {inboxCount} פריטים ממתינים לשיוך
              </p>
              <p className="text-sm text-gray-500">לחצו למיין את המגירה</p>
            </div>
          </Link>
        )}

        {/* Active Topics */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : activeTopics.length > 0 ? (
          <div className="space-y-3">
            {activeTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                stats={topicStatsMap[topic.id]}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderHeart className="w-12 h-12 text-purple-300" />}
            title="עדיין אין נושאים"
            description="נושאים מארגנים את כל מה שכותבים לפי תחומי חיים — סטרס, זוגיות, שינה ועוד"
            action={
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary px-6 py-2.5"
              >
                <Plus className="w-4 h-4" />
                יצירת נושא ראשון
              </button>
            }
          />
        )}

        {/* Archived Topics */}
        {archivedTopics.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-sm text-gray-500 font-medium py-2"
            >
              <Archive className="w-4 h-4" />
              נושאים בארכיון ({archivedTopics.length})
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`}
              />
            </button>
            {showArchived && (
              <div className="space-y-3 mt-2">
                {archivedTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <>
          <div
            className="sheet-overlay"
            onClick={() => setShowAddModal(false)}
          />
          <div className="bottom-sheet max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sheet-handle" />
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">נושא חדש</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-icon hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  שם הנושא
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="למשל: שוק ההון, זוגיות, סטרס..."
                  className="input-premium"
                  autoFocus
                />
              </div>

              {/* Icon Picker */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  אייקון
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        newIcon === icon
                          ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  צבע
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="card-premium p-4 flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${newColor}18` }}
                >
                  {newIcon}
                </div>
                <span className="font-bold text-gray-900">
                  {newName || 'שם הנושא...'}
                </span>
              </div>

              <button
                onClick={handleAddTopic}
                disabled={!newName.trim()}
                className="btn-primary w-full py-3"
              >
                יצירת נושא
              </button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
