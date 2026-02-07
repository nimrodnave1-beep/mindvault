'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Target, Plus, ChevronLeft, MoreVertical, Check, Pause } from 'lucide-react';
import { getAllGoals, updateGoal, deleteGoal, Goal } from '@/lib/db';
import { formatRelativeDate } from '@/lib/utils';
import { toast } from 'sonner';

type FilterStatus = 'active' | 'paused' | 'done' | 'all';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('active');

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const data = await getAllGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredGoals = filter === 'all'
    ? goals
    : goals.filter((g) => g.status === filter);

  const handleStatusChange = async (goal: Goal, newStatus: Goal['status']) => {
    try {
      await updateGoal({ ...goal, status: newStatus });
      await loadGoals();
      toast.success(newStatus === 'done' ? 'כל הכבוד! 🎉' : 'עודכן');
    } catch {
      toast.error('שגיאה בעדכון');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      await loadGoals();
      toast.success('נמחק');
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: 'פעילה', className: 'bg-green-50 text-green-700' },
      paused: { label: 'מושהית', className: 'bg-amber-50 text-amber-700' },
      done: { label: 'הושגה', className: 'bg-purple-50 text-purple-700' },
      archived: { label: 'בארכיון', className: 'bg-gray-50 text-gray-500' },
    };
    return map[status] || map.active;
  };

  return (
    <AppShell>
      <PageHeader
        title="המטרות שלי"
        icon="🎯"
        showBack
        action={
          <Link href="/goals/new" className="btn-primary px-3 py-2 text-sm">
            <Plus className="w-4 h-4" />
            חדשה
          </Link>
        }
      />

      <div className="app-container pt-1 space-y-3">
        {/* Filter chips */}
        <div className="flex gap-2">
          {(['active', 'done', 'paused', 'all'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? 'bg-white shadow-sm text-purple-600 font-semibold'
                  : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              {s === 'active' ? 'פעילות' : s === 'done' ? 'הושגו' : s === 'paused' ? 'מושהות' : 'הכל'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : filteredGoals.length === 0 ? (
          <EmptyState
            icon={<Target className="w-12 h-12 text-purple-300" />}
            title={filter === 'all' ? 'מה חשוב לך לעבוד עליו?' : 'אין מטרות כאן'}
            description="הגדר מטרה שתלווה אותך."
            action={
              <Link href="/goals/new" className="btn-primary px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" />
                מטרה חדשה
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filteredGoals.map((goal) => {
              const badge = getStatusBadge(goal.status);
              return (
                <div key={goal.id} className="card-premium p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{goal.title}</p>
                        {goal.pinned && (
                          <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">📌</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-gray-400">
                          {goal.horizon === 'weekly' ? 'שבועית' : goal.horizon === 'monthly' ? 'חודשית' : 'פתוחה'}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{formatRelativeDate(goal.createdAt)}</span>
                      </div>
                      {goal.why && (
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{goal.why}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {goal.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(goal, 'done')}
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"
                            title="סיימתי"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(goal, 'paused')}
                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100"
                            title="השהה"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {goal.status === 'paused' && (
                        <button
                          onClick={() => handleStatusChange(goal, 'active')}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"
                          title="הפעל"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
