'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { getTopicAccentStyles } from '@/lib/topicContext';
import {
  Topic,
  getTopic,
  updateTopic,
  archiveTopic,
  unarchiveTopic,
  getAllEntries,
  getAllHighlights,
  getAllAgendaItems,
  getOpenAgendaItems,
  getAllUrgeEvents,
  getAllGratitudeEntries,
  getToolsByTopic,
  getPlaybookByTopic,
  addEntry,
  addAgendaItem,
  addHighlight,
  updateAgendaItem,
  DailyEntry,
  Highlight,
  AgendaItem,
  UrgeEvent,
  GratitudeEntry,
  TopicTool,
  TopicPlaybook,
} from '@/lib/db';
import {
  ChevronRight,
  PenLine,
  ListChecks,
  Sparkles,
  Route,
  Wrench,
  BookOpen,
  Heart,
  Archive,
  ArchiveRestore,
  Plus,
  X,
  Send,
  Check,
  Target,
  Flame,
  Shield,
} from 'lucide-react';
import { formatRelativeDate, getToday } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

type TabId = 'today' | 'agenda' | 'insights' | 'journey' | 'tools' | 'playbook' | 'gratitude';

const TABS: { id: TabId; label: string; icon: typeof PenLine }[] = [
  { id: 'today', label: 'היום', icon: PenLine },
  { id: 'agenda', label: 'אג׳נדה', icon: ListChecks },
  { id: 'insights', label: 'הארות', icon: Sparkles },
  { id: 'gratitude', label: 'תודה', icon: Heart },
  { id: 'tools', label: 'כלים', icon: Wrench },
  { id: 'playbook', label: 'חוזה', icon: BookOpen },
  { id: 'journey', label: 'מסע', icon: Route },
];

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [loading, setLoading] = useState(true);

  // Data per tab
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [urgeEvents, setUrgeEvents] = useState<UrgeEvent[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [tools, setTools] = useState<TopicTool[]>([]);
  const [playbook, setPlaybook] = useState<TopicPlaybook | null>(null);

  // Quick entry form
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntryText, setQuickEntryText] = useState('');

  // Quick agenda form
  const [showQuickAgenda, setShowQuickAgenda] = useState(false);
  const [quickAgendaText, setQuickAgendaText] = useState('');

  const loadData = useCallback(async () => {
    try {
      const t = await getTopic(topicId);
      if (!t || t.isDeleted) {
        router.push('/topics');
        return;
      }
      setTopic(t);

      const [allEntries, allHighlights, allAgenda, allUrge, allGratitude, topicTools, topicPlaybook] =
        await Promise.all([
          getAllEntries(),
          getAllHighlights(),
          getAllAgendaItems(),
          getAllUrgeEvents(),
          getAllGratitudeEntries(),
          getToolsByTopic(topicId),
          getPlaybookByTopic(topicId),
        ]);

      setEntries(allEntries.filter((e) => e.primaryTopicId === topicId));
      setHighlights(allHighlights.filter((h) => h.primaryTopicId === topicId));
      setAgendaItems(allAgenda.filter((a) => a.primaryTopicId === topicId));
      setUrgeEvents(allUrge.filter((u) => u.primaryTopicId === topicId));
      setGratitudeEntries(allGratitude.filter((g) => g.primaryTopicId === topicId));
      setTools(topicTools);
      setPlaybook(topicPlaybook || null);
    } catch (error) {
      console.error('Failed to load topic data:', error);
    } finally {
      setLoading(false);
    }
  }, [topicId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickEntry = async () => {
    if (!quickEntryText.trim()) return;
    try {
      await addEntry({
        date: getToday(),
        content: quickEntryText.trim(),
        cycleId: null,
        tags: [],
        primaryTopicId: topicId,
      });
      setQuickEntryText('');
      setShowQuickEntry(false);
      toast.success('הרשומה נשמרה');
      await loadData();
    } catch {
      toast.error('שגיאה בשמירה');
    }
  };

  const handleQuickAgenda = async () => {
    if (!quickAgendaText.trim()) return;
    try {
      await addAgendaItem({
        text: quickAgendaText.trim(),
        priority: agendaItems.length,
        sourceId: null,
        sourceType: 'manual',
        status: 'open',
        cycleId: null,
        primaryTopicId: topicId,
      });
      setQuickAgendaText('');
      setShowQuickAgenda(false);
      toast.success('נוסף לאג׳נדה');
      await loadData();
    } catch {
      toast.error('שגיאה בשמירה');
    }
  };

  const handleToggleAgenda = async (item: AgendaItem) => {
    try {
      await updateAgendaItem({
        ...item,
        status: item.status === 'open' ? 'done' : 'open',
      });
      await loadData();
    } catch {
      toast.error('שגיאה');
    }
  };

  const handleArchive = async () => {
    if (!topic) return;
    if (topic.isArchived) {
      await unarchiveTopic(topicId);
      toast.success('הנושא הוחזר מהארכיון');
    } else {
      await archiveTopic(topicId);
      toast.success('הנושא הועבר לארכיון');
    }
    await loadData();
  };

  if (loading || !topic) {
    return (
      <AppShell>
        <div className="app-container py-8 space-y-4">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      </AppShell>
    );
  }

  const accentStyles = getTopicAccentStyles(topic.color);

  return (
    <AppShell>
      {/* Topic Header with Visual Context */}
      <header
        className="sticky top-0 z-30 pt-safe-top"
        style={{
          background: `linear-gradient(135deg, ${topic.color}12 0%, ${topic.color}06 100%)`,
          borderBottom: `1px solid ${topic.color}20`,
        }}
      >
        <div className="app-container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/topics')}
                className="btn-icon hover:bg-white/60"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${topic.color}20` }}
              >
                {topic.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{topic.name}</h1>
                {topic.northStarSentence && (
                  <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                    &ldquo;{topic.northStarSentence}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleArchive}
              className="btn-icon hover:bg-white/60"
              title={topic.isArchived ? 'הוצאה מארכיון' : 'העברה לארכיון'}
            >
              {topic.isArchived ? (
                <ArchiveRestore className="w-5 h-5 text-gray-500" />
              ) : (
                <Archive className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="app-container pb-2">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar -mx-4 px-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                  style={isActive ? { color: topic.color } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <div className="app-container py-4" style={accentStyles}>
        {/* === TODAY TAB === */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {/* Quick Write */}
            {showQuickEntry ? (
              <div className="card-premium p-4 animate-fade-in">
                <textarea
                  value={quickEntryText}
                  onChange={(e) => setQuickEntryText(e.target.value)}
                  placeholder="מה עובר עליך היום?"
                  className="writing-canvas min-h-[120px]"
                  style={{ borderColor: `${topic.color}40` }}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setShowQuickEntry(false); setQuickEntryText(''); }}
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleQuickEntry}
                    disabled={!quickEntryText.trim()}
                    className="btn-primary px-4 py-2 text-sm"
                    style={{ background: topic.color }}
                  >
                    <Send className="w-4 h-4" />
                    שמירה
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowQuickEntry(true)}
                className="card-premium p-4 w-full text-right flex items-center gap-3 hover:border-gray-300 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${topic.color}15` }}
                >
                  <PenLine className="w-5 h-5" style={{ color: topic.color }} />
                </div>
                <span className="text-gray-400">כתיבה מהירה...</span>
              </button>
            )}

            {/* Recent Entries */}
            {entries.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500">רשומות אחרונות</h3>
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="card-premium p-4">
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                      {entry.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatRelativeDate(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<PenLine className="w-10 h-10 text-gray-300" />}
                title="עדיין אין רשומות"
                description="התחילו לכתוב כדי לבנות את המסע בנושא הזה"
              />
            )}
          </div>
        )}

        {/* === AGENDA TAB === */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            {/* Add agenda item */}
            {showQuickAgenda ? (
              <div className="card-premium p-4 animate-fade-in">
                <input
                  type="text"
                  value={quickAgendaText}
                  onChange={(e) => setQuickAgendaText(e.target.value)}
                  placeholder="נושא לפגישה הבאה..."
                  className="input-premium"
                  style={{ borderColor: `${topic.color}40` }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAgenda();
                  }}
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setShowQuickAgenda(false); setQuickAgendaText(''); }}
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleQuickAgenda}
                    disabled={!quickAgendaText.trim()}
                    className="btn-primary px-4 py-2 text-sm"
                    style={{ background: topic.color }}
                  >
                    <Plus className="w-4 h-4" />
                    הוספה
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowQuickAgenda(true)}
                className="card-premium p-4 w-full text-right flex items-center gap-3 hover:border-gray-300 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${topic.color}15` }}
                >
                  <Plus className="w-5 h-5" style={{ color: topic.color }} />
                </div>
                <span className="text-gray-400">הוספה לאג׳נדה...</span>
              </button>
            )}

            {/* Open items */}
            {agendaItems.filter((a) => a.status === 'open').length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500">פתוחים</h3>
                {agendaItems
                  .filter((a) => a.status === 'open')
                  .map((item, i) => (
                    <div key={item.id} className="agenda-item">
                      <button
                        onClick={() => handleToggleAgenda(item)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:border-green-500"
                        style={{ borderColor: `${topic.color}60` }}
                      >
                      </button>
                      <p className="flex-1 text-gray-900 text-sm">{item.text}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListChecks className="w-10 h-10 text-gray-300" />}
                title="אין פריטים פתוחים"
                description="הוסיפו נקודות לפגישה הבאה בנושא הזה"
              />
            )}

            {/* Done items */}
            {agendaItems.filter((a) => a.status === 'done').length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">הושלמו</h3>
                {agendaItems
                  .filter((a) => a.status === 'done')
                  .map((item) => (
                    <div key={item.id} className="agenda-item agenda-item-done">
                      <button
                        onClick={() => handleToggleAgenda(item)}
                        className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </button>
                      <p className="flex-1 text-gray-500 text-sm line-through">{item.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* === INSIGHTS TAB === */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {highlights.length > 0 ? (
              highlights.map((h) => (
                <div key={h.id} className="card-premium p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    &ldquo;{h.text}&rdquo;
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatRelativeDate(h.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Sparkles className="w-10 h-10 text-amber-300" />}
                title="אין הארות עדיין"
                description="הארות מגיעות כשמסמנים טקסט חשוב ברשומות"
              />
            )}
          </div>
        )}

        {/* === GRATITUDE TAB === */}
        {activeTab === 'gratitude' && (
          <div className="space-y-4">
            <Link
              href={`/topics/${topicId}/gratitude`}
              className="card-premium p-4 w-full text-right flex items-center gap-3 hover:border-gray-300 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${topic.color}15` }}
              >
                <Heart className="w-5 h-5" style={{ color: topic.color }} />
              </div>
              <span className="text-gray-400">הכרת תודה חדשה...</span>
            </Link>
            {gratitudeEntries.length > 0 ? (
              gratitudeEntries.map((g) => (
                <div key={g.id} className="card-premium p-4">
                  <div className="space-y-1.5">
                    {g.items.map((item, i) => (
                      <p key={i} className="text-gray-700 text-sm">
                        ✨ {item.text}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatRelativeDate(g.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Heart className="w-10 h-10 text-rose-300" />}
                title="אין רשומות תודה עדיין"
                description="הכרת תודה ממוקדת בנושא — מה טוב כאן?"
              />
            )}
          </div>
        )}

        {/* === TOOLS TAB === */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <Link
              href={`/topics/${topicId}/tools`}
              className="card-premium p-4 w-full text-right flex items-center gap-3 hover:border-gray-300 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${topic.color}15` }}
              >
                <Plus className="w-5 h-5" style={{ color: topic.color }} />
              </div>
              <span className="text-gray-400">ניהול כלים...</span>
            </Link>

            {/* Quick Protocols */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/urge?topic=${topicId}`}
                className="card-premium p-4 flex flex-col items-center gap-2 text-center hover:border-gray-300 transition-colors"
              >
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="font-semibold text-sm text-gray-900">דחיפות</span>
                <span className="text-xs text-gray-500">Urge Protocol</span>
              </Link>
              <Link
                href={`/wave?topic=${topicId}`}
                className="card-premium p-4 flex flex-col items-center gap-2 text-center hover:border-gray-300 transition-colors"
              >
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-sm text-gray-900">גל</span>
                <span className="text-xs text-gray-500">Wave Mode</span>
              </Link>
            </div>

            {tools.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500">ארגז הכלים שלי</h3>
                {tools.map((tool) => (
                  <div key={tool.id} className="card-premium p-4">
                    <h4 className="font-semibold text-gray-900 text-sm">{tool.name}</h4>
                    {tool.whenToUse && (
                      <p className="text-xs text-gray-500 mt-1">מתי: {tool.whenToUse}</p>
                    )}
                    {tool.signal && (
                      <p className="text-xs text-gray-500">סימן: {tool.signal}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Wrench className="w-10 h-10 text-gray-300" />}
                title="אין כלים עדיין"
                description="הוסיפו 2-5 כלים שעוזרים לכם בנושא הזה"
              />
            )}
          </div>
        )}

        {/* === PLAYBOOK TAB === */}
        {activeTab === 'playbook' && (
          <div className="space-y-4">
            {/* North Star */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: `linear-gradient(135deg, ${topic.color}10, ${topic.color}05)` }}
            >
              <Target className="w-8 h-8 mx-auto mb-2" style={{ color: topic.color }} />
              <h3 className="font-bold text-gray-900 mb-1">משפט הבית</h3>
              {playbook?.northStarSentence || topic.northStarSentence ? (
                <p className="text-gray-700 text-lg font-medium">
                  &ldquo;{playbook?.northStarSentence || topic.northStarSentence}&rdquo;
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  לחצו לכתוב את משפט ה-North Star שלכם
                </p>
              )}
            </div>

            {/* Rescue Kit */}
            {playbook?.rescueToolIds && playbook.rescueToolIds.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">ערכת חירום</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tools
                    .filter((t) => playbook.rescueToolIds.includes(t.id))
                    .map((tool) => (
                      <div
                        key={tool.id}
                        className="card-premium p-3 text-center"
                      >
                        <p className="font-semibold text-sm text-gray-900">{tool.name}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Playbook Sections */}
            {playbook?.sections && playbook.sections.length > 0 ? (
              <div className="space-y-3">
                {playbook.sections
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => (
                    <div key={section.id} className="card-premium p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {section.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="w-10 h-10 text-gray-300" />}
                title="אין פרקים ב-Playbook"
                description="בנו את החוזה האישי שלכם — מה עושים כשמגיע גל?"
              />
            )}
          </div>
        )}

        {/* === JOURNEY TAB === */}
        {activeTab === 'journey' && (
          <div className="space-y-4">
            {entries.length > 0 || urgeEvents.length > 0 ? (
              <div className="relative">
                <div className="timeline-line" />
                <div className="space-y-6">
                  {/* Combine and sort all events by date */}
                  {[
                    ...entries.map((e) => ({
                      type: 'entry' as const,
                      id: e.id,
                      date: e.createdAt,
                      content: e.content,
                    })),
                    ...urgeEvents.map((u) => ({
                      type: 'urge' as const,
                      id: u.id,
                      date: u.createdAt,
                      content: u.urgeText,
                    })),
                    ...highlights.map((h) => ({
                      type: 'insight' as const,
                      id: h.id,
                      date: h.createdAt,
                      content: h.text,
                    })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((event) => (
                      <div key={event.id} className="timeline-item">
                        <div className="absolute right-[18px] top-1">
                          <div
                            className="w-3 h-3 rounded-full ring-4"
                            style={{
                              backgroundColor: topic.color,
                              ringColor: `${topic.color}20`,
                            }}
                          />
                        </div>
                        <div className="card-premium p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-400">
                              {event.type === 'entry' && '📝 רשומה'}
                              {event.type === 'urge' && '🔥 דחיפות'}
                              {event.type === 'insight' && '✨ הארה'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeDate(event.date)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {event.content}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Route className="w-10 h-10 text-gray-300" />}
                title="המסע עדיין ריק"
                description="כל רשומה, הארה ופעולה ייראו כאן כציר זמן"
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
