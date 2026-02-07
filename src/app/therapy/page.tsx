'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { 
  Plus, 
  Search, 
  BookOpen,
  ChevronLeft
} from 'lucide-react';
import { getAllSessions, Session } from '@/lib/db';
import { formatDate, formatRelativeDate } from '@/lib/utils';

export default function TherapyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    async function loadSessions() {
      try {
        const allSessions = await getAllSessions();
        setSessions(allSessions);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(session =>
    session.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by month for calendar view
  const sessionsByMonth = filteredSessions.reduce((acc, session) => {
    const month = session.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <AppShell>
      <PageHeader
        title="סיכומי טיפול"
        subtitle={`${sessions.length} פגישות`}
        icon="📖"
        action={
          <Link href="/therapy/new" className="btn-primary px-3.5 py-2 text-sm rounded-xl">
            <Plus className="w-4 h-4" />
            סיכום חדש
          </Link>
        }
      />

      <div className="app-container space-y-4 pt-1">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש בסיכומים..."
            className="input-premium pr-11 text-sm"
          />
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'view-toggle-item-active' : 'view-toggle-item'}
          >
            רשימה
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'view-toggle-item-active' : 'view-toggle-item'}
          >
            לוח שנה
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            icon="📖"
            title={searchQuery ? 'לא נמצאו תוצאות' : 'הוסף סיכום מהפגישה האחרונה'}
            description={searchQuery ? 'נסו לחפש מילים אחרות' : 'כדי לא לשכוח מה דיברתם, הוסיפו את הסיכום כאן.'}
            action={
              !searchQuery ? (
                <Link href="/therapy/new" className="btn-primary px-5 py-2.5 text-sm">
                  <Plus className="w-4 h-4" />
                  הוסף סיכום טיפול
                </Link>
              ) : undefined
            }
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <Link
                key={session.id}
                href={`/therapy/${session.id}`}
                className="card-interactive p-4 block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                        <BookOpen className="w-3 h-3" />
                        {formatDate(session.date, { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeDate(session.date)}
                      </span>
                    </div>
                    <p className="text-gray-700 line-clamp-3 text-sm leading-relaxed">
                      {session.summary}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sessionsByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthSessions]) => (
                <div key={month}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    {new Date(month + '-01').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {monthSessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/therapy/${session.id}`}
                        className="aspect-square flex items-center justify-center bg-teal-50 rounded-lg text-teal-700 font-semibold text-sm border border-teal-100 hover:bg-teal-100 transition-colors"
                      >
                        {new Date(session.date).getDate()}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
