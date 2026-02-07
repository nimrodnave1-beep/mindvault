'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { useTopics } from '@/lib/topicContext';
import {
  BookOpen,
  PenLine,
  Sparkles,
  Heart,
  Target,
  Star,
  Muscle,
  Mail,
  Compass,
  BarChart3,
  FolderHeart,
  Plus,
  Mic,
  Camera,
  Play,
  Pause,
} from 'lucide-react';
import {
  getAllEntries,
  getAllSessions,
  getAllHighlights,
  getAllGratitudeEntries,
  getAllGoals,
  getAllWishes,
  getAllStrengths,
  getAllLetters,
  getAllValues,
  getAllAudioMemos,
  getAllImageEntries,
  getMediaBlob,
  DailyEntry,
  Session,
  Highlight,
  GratitudeEntry,
  Goal,
  Wish,
  Strength,
  LetterToSelf,
  Value,
  AudioMemo,
  ImageEntry,
} from '@/lib/db';
import { formatDate } from '@/lib/utils';

type TabFilter = 'all' | 'entries' | 'sessions' | 'insights' | 'goals' | 'wishes' | 'gratitude' | 'strengths' | 'letters' | 'values' | 'tracking';

interface TimelineItem {
  id: string;
  date: string;
  type: TabFilter;
  content: string;
  topicId: string | null;
  subtype?: string;
  // media fields
  mediaBlobKey?: string;
  mediaType?: 'audio' | 'image';
  duration?: number;
}

const tabs: { value: TabFilter; label: string; icon: typeof PenLine; emptyTitle: string; emptyCta: string; ctaHref: string }[] = [
  { value: 'all', label: 'הכל', icon: FolderHeart, emptyTitle: 'כאן יתחיל המסע שלך', emptyCta: 'רשומה ראשונה', ctaHref: '/today' },
  { value: 'entries', label: 'רשומות', icon: PenLine, emptyTitle: 'כתוב את הרשומה הראשונה', emptyCta: 'רשומה חדשה', ctaHref: '/today' },
  { value: 'sessions', label: 'פגישות', icon: BookOpen, emptyTitle: 'הוסף סיכום מהפגישה האחרונה', emptyCta: 'הוסף סיכום', ctaHref: '/therapy/new' },
  { value: 'insights', label: 'תובנות', icon: Sparkles, emptyTitle: 'תובנות נוצרות מהכתיבה שלך', emptyCta: 'הוסף תובנה', ctaHref: '/today' },
  { value: 'goals', label: 'מטרות', icon: Target, emptyTitle: 'מה חשוב לך לעבוד עליו?', emptyCta: 'הגדר מטרה', ctaHref: '/goals/new' },
  { value: 'wishes', label: 'משאלות', icon: Star, emptyTitle: 'מה אתה מאחל לעצמך?', emptyCta: 'הוסף משאלה', ctaHref: '/wishes/new' },
  { value: 'gratitude', label: 'תודה', icon: Heart, emptyTitle: 'על מה אתה מודה?', emptyCta: 'הכרת תודה', ctaHref: '/gratitude/new' },
  { value: 'strengths', label: 'כוחות', icon: Muscle, emptyTitle: 'מה אתה טוב בו?', emptyCta: 'הוסף כוח', ctaHref: '/strengths/new' },
  { value: 'letters', label: 'מכתבים', icon: Mail, emptyTitle: 'כתוב מכתב לעצמך', emptyCta: 'מכתב חדש', ctaHref: '/letters/new' },
  { value: 'values', label: 'ערכים', icon: Compass, emptyTitle: 'מה באמת חשוב לך?', emptyCta: 'הוסף ערך', ctaHref: '/values/new' },
  { value: 'tracking', label: 'מעקב', icon: BarChart3, emptyTitle: 'עקוב אחרי משהו לאורך זמן', emptyCta: 'מעקב חדש', ctaHref: '/tracking' },
];

// Inline audio player component
function InlineAudioPlayer({ blobKey, duration }: { blobKey: string; duration?: number }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const formatDur = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const loadAndToggle = async () => {
    if (!audioUrl) {
      try {
        const media = await getMediaBlob(blobKey);
        if (media) {
          const url = URL.createObjectURL(media.blob);
          setAudioUrl(url);
          const audio = new Audio(url);
          audio.onended = () => setPlaying(false);
          audioElRef.current = audio;
          audio.play();
          setPlaying(true);
        }
      } catch { /* ok */ }
      return;
    }

    if (audioElRef.current) {
      if (playing) {
        audioElRef.current.pause();
        setPlaying(false);
      } else {
        audioElRef.current.play();
        setPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioElRef.current) audioElRef.current.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); loadAndToggle(); }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors mt-1.5"
    >
      {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      <Mic className="w-3 h-3" />
      {duration ? formatDur(duration) : 'הקלטה'}
    </button>
  );
}

// Inline image preview component
function InlineImagePreview({ blobKey }: { blobKey: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    async function load() {
      try {
        const media = await getMediaBlob(blobKey);
        if (media) {
          url = URL.createObjectURL(media.blob);
          setImageUrl(url);
        }
      } catch { /* ok */ }
    }
    load();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [blobKey]);

  if (!imageUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="w-full max-h-32 object-cover rounded-lg mt-2"
    />
  );
}

export default function JourneyPage() {
  const { topics } = useTopics();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [entries, sessions, highlights, gratitude, goals, wishes, strengths, letters, values, audioMemos, imageEntries] = await Promise.all([
          getAllEntries(),
          getAllSessions(),
          getAllHighlights(),
          getAllGratitudeEntries(),
          getAllGoals(),
          getAllWishes(),
          getAllStrengths(),
          getAllLetters(),
          getAllValues(),
          getAllAudioMemos(),
          getAllImageEntries(),
        ]);

        const combined: TimelineItem[] = [
          ...entries.map((e) => ({
            id: e.id, date: e.date, type: 'entries' as TabFilter,
            content: e.content, topicId: e.primaryTopicId,
          })),
          ...sessions.map((s) => ({
            id: s.id, date: s.date, type: 'sessions' as TabFilter,
            content: s.summary, topicId: s.primaryTopicId,
          })),
          ...highlights.map((h) => ({
            id: h.id, date: h.createdAt.split('T')[0], type: 'insights' as TabFilter,
            content: h.text, topicId: h.primaryTopicId,
          })),
          ...gratitude.map((g) => ({
            id: g.id, date: g.date, type: 'gratitude' as TabFilter,
            content: g.items.map((i) => i.text).join(', '), topicId: g.primaryTopicId,
          })),
          ...goals.map((g) => ({
            id: g.id, date: g.createdAt.split('T')[0], type: 'goals' as TabFilter,
            content: g.title, topicId: g.primaryTopicId, subtype: g.status,
          })),
          ...wishes.map((w) => ({
            id: w.id, date: w.createdAt.split('T')[0], type: 'wishes' as TabFilter,
            content: w.text, topicId: w.primaryTopicId,
          })),
          ...strengths.map((s) => ({
            id: s.id, date: s.createdAt.split('T')[0], type: 'strengths' as TabFilter,
            content: s.text, topicId: s.primaryTopicId,
          })),
          ...letters.map((l) => ({
            id: l.id, date: l.createdAt.split('T')[0], type: 'letters' as TabFilter,
            content: l.title, topicId: l.primaryTopicId,
            subtype: l.type,
          })),
          ...values.map((v) => ({
            id: v.id, date: v.createdAt.split('T')[0], type: 'values' as TabFilter,
            content: v.name, topicId: v.primaryTopicId,
          })),
          ...audioMemos.map((a) => ({
            id: a.id, date: a.createdAt.split('T')[0], type: 'entries' as TabFilter,
            content: a.note || 'הקלטה קולית', topicId: a.primaryTopicId,
            mediaBlobKey: a.blobKey, mediaType: 'audio' as const,
            duration: a.duration,
          })),
          ...imageEntries.map((img) => ({
            id: img.id, date: img.createdAt.split('T')[0], type: 'entries' as TabFilter,
            content: img.note || 'תמונה', topicId: img.primaryTopicId,
            mediaBlobKey: img.blobKey, mediaType: 'image' as const,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setItems(combined);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((i) => i.type === activeTab);

  // Group by month
  const itemsByMonth = filteredItems.reduce((acc, item) => {
    const month = item.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const getTypeInfo = (type: TabFilter) => {
    const tab = tabs.find((t) => t.value === type);
    if (!tab) return { label: type, icon: FolderHeart, className: 'bg-gray-50 text-gray-700 border-gray-100' };

    const colorMap: Record<string, string> = {
      entries: 'bg-purple-50 text-purple-700 border-purple-100',
      sessions: 'bg-teal-50 text-teal-700 border-teal-100',
      insights: 'bg-amber-50 text-amber-700 border-amber-100',
      gratitude: 'bg-rose-50 text-rose-700 border-rose-100',
      goals: 'bg-purple-50 text-purple-700 border-purple-100',
      wishes: 'bg-amber-50 text-amber-700 border-amber-100',
      strengths: 'bg-green-50 text-green-700 border-green-100',
      letters: 'bg-violet-50 text-violet-700 border-violet-100',
      values: 'bg-teal-50 text-teal-700 border-teal-100',
      tracking: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };

    return {
      label: tab.label,
      icon: tab.icon,
      className: colorMap[type] || 'bg-gray-50 text-gray-700 border-gray-100',
    };
  };

  const currentTabConfig = tabs.find((t) => t.value === activeTab) || tabs[0];

  return (
    <AppShell>
      <PageHeader
        title="המסע שלי"
        subtitle={`${filteredItems.length} פריטים`}
        icon="🗺️"
      />

      <div className="app-container pt-1 space-y-3">
        {/* Scrollable Tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-white shadow-sm text-purple-600 font-semibold'
                    : 'text-gray-500 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<currentTabConfig.icon className="w-12 h-12 text-purple-300" />}
            title={currentTabConfig.emptyTitle}
            description="הכל מתחיל בצעד אחד קטן."
            action={
              <Link href={currentTabConfig.ctaHref} className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                {currentTabConfig.emptyCta}
              </Link>
            }
          />
        ) : (
          <div className="space-y-6 pt-2">
            {Object.entries(itemsByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthItems]) => (
                <div key={month}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 sticky top-14 bg-background/90 backdrop-blur-sm py-2 z-10">
                    {new Date(month + '-01').toLocaleDateString('he-IL', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>

                  <div className="relative">
                    <div className="timeline-line" />
                    <div className="space-y-3">
                      {monthItems.map((item) => {
                        const info = getTypeInfo(item.type);
                        const Icon = info.icon;
                        const topic = item.topicId ? topics.find((t) => t.id === item.topicId) : null;

                        return (
                          <div key={item.id} className="timeline-item block">
                            <div className="absolute right-5 mt-2">
                              {topic ? (
                                <div
                                  className="w-3 h-3 rounded-full ring-4"
                                  style={{
                                    backgroundColor: topic.color,
                                    boxShadow: `0 0 0 4px ${topic.color}20`,
                                  }}
                                />
                              ) : (
                                <div className="timeline-dot" />
                              )}
                            </div>

                            <div className="card-premium p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${info.className}`}>
                                      <Icon className="w-3 h-3" />
                                      {info.label}
                                    </span>
                                    {topic && (
                                      <span
                                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                        style={{
                                          backgroundColor: `${topic.color}12`,
                                          color: topic.color,
                                        }}
                                      >
                                        {topic.icon}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {formatDate(item.date, { day: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                    {item.content}
                                  </p>
                                  {/* Media preview */}
                                  {item.mediaType === 'audio' && item.mediaBlobKey && (
                                    <InlineAudioPlayer blobKey={item.mediaBlobKey} duration={item.duration} />
                                  )}
                                  {item.mediaType === 'image' && item.mediaBlobKey && (
                                    <InlineImagePreview blobKey={item.mediaBlobKey} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
