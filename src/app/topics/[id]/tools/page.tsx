'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { useTopics } from '@/lib/topicContext';
import {
  getToolsByTopic,
  addTopicTool,
  TopicTool,
  getPlaybookByTopic,
  updatePlaybook,
  TopicPlaybook,
} from '@/lib/db';
import { ChevronRight, Plus, Wrench, Star, StarOff, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function TopicToolsPage() {
  const params = useParams();
  const router = useRouter();
  const { topics } = useTopics();
  const topicId = params.id as string;
  const activeTopic = topics.find((t) => t.id === topicId);

  const [tools, setTools] = useState<TopicTool[]>([]);
  const [playbook, setPlaybook] = useState<TopicPlaybook | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWhen, setNewWhen] = useState('');
  const [newSignal, setNewSignal] = useState('');
  const [loading, setLoading] = useState(true);

  const accentColor = activeTopic?.color || '#6B4EE6';

  const loadData = useCallback(async () => {
    try {
      const [topicTools, pb] = await Promise.all([
        getToolsByTopic(topicId),
        getPlaybookByTopic(topicId),
      ]);
      setTools(topicTools);
      setPlaybook(pb || null);
    } catch {
      console.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('נא להזין שם כלי');
      return;
    }
    try {
      await addTopicTool({
        topicId,
        name: newName.trim(),
        whenToUse: newWhen.trim(),
        signal: newSignal.trim(),
        sortOrder: tools.length,
      });
      setNewName('');
      setNewWhen('');
      setNewSignal('');
      setShowAdd(false);
      toast.success('הכלי נוסף');
      await loadData();
    } catch {
      toast.error('שגיאה');
    }
  };

  const toggleRescue = async (toolId: string) => {
    if (!playbook) return;
    try {
      const newRescueIds = playbook.rescueToolIds.includes(toolId)
        ? playbook.rescueToolIds.filter((id) => id !== toolId)
        : [...playbook.rescueToolIds, toolId];
      await updatePlaybook({ ...playbook, rescueToolIds: newRescueIds });
      await loadData();
      toast.success(
        newRescueIds.includes(toolId) ? 'נוסף לערכת חירום' : 'הוסר מערכת חירום'
      );
    } catch {
      toast.error('שגיאה');
    }
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
        <div className="app-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="btn-icon hover:bg-white/60">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wrench className="w-5 h-5" style={{ color: accentColor }} />
                ארגז כלים
              </h1>
              {activeTopic && (
                <p className="text-xs text-gray-500">{activeTopic.icon} {activeTopic.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary px-3 py-2 text-sm"
            style={{ background: accentColor }}
          >
            <Plus className="w-4 h-4" />
            כלי חדש
          </button>
        </div>
      </header>

      <div className="app-container py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : tools.length > 0 ? (
          <div className="space-y-3">
            {tools.map((tool) => {
              const isRescue = playbook?.rescueToolIds.includes(tool.id);
              return (
                <div key={tool.id} className="card-premium p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    {tool.whenToUse && (
                      <p className="text-sm text-gray-500 mt-0.5">מתי: {tool.whenToUse}</p>
                    )}
                    {tool.signal && (
                      <p className="text-sm text-gray-500">סימן: {tool.signal}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleRescue(tool.id)}
                    className={`btn-icon w-9 h-9 transition-colors ${
                      isRescue ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:bg-gray-50'
                    }`}
                    title={isRescue ? 'הסר מערכת חירום' : 'הוסף לערכת חירום'}
                  >
                    {isRescue ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Wrench className="w-12 h-12 text-gray-300" />}
            title="אין כלים עדיין"
            description="הוסיפו 2-5 כלים שעוזרים לכם בנושא הזה. למשל: הליכה, נשימה, שיחה עם חבר."
            action={
              <button
                onClick={() => setShowAdd(true)}
                className="btn-primary px-6 py-2.5"
                style={{ background: accentColor }}
              >
                <Plus className="w-4 h-4" />
                הוספת כלי ראשון
              </button>
            }
          />
        )}
      </div>

      {/* Add Tool Modal */}
      {showAdd && (
        <>
          <div className="sheet-overlay" onClick={() => setShowAdd(false)} />
          <div className="bottom-sheet animate-slide-up">
            <div className="sheet-handle" />
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">כלי חדש</h2>
                <button onClick={() => setShowAdd(false)} className="btn-icon hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">שם הכלי *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="למשל: הליכה של 10 דקות"
                  className="input-premium"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  מתי להשתמש (אופציונלי)
                </label>
                <input
                  type="text"
                  value={newWhen}
                  onChange={(e) => setNewWhen(e.target.value)}
                  placeholder="כשאני מרגיש סטרס עולה"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  סימן שצריך אותו (אופציונלי)
                </label>
                <input
                  type="text"
                  value={newSignal}
                  onChange={(e) => setNewSignal(e.target.value)}
                  placeholder="כשאני נכנס ללופ מחשבות"
                  className="input-premium"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="btn-primary w-full py-3"
                style={{ background: accentColor }}
              >
                <Check className="w-4 h-4" />
                הוספה
              </button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
