'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  Plus, 
  Lightbulb, 
  Pin, 
  PinOff,
  ListTodo,
  Edit3,
  Trash2,
  Filter,
  ChevronDown
} from 'lucide-react';
import {
  getAllInsights,
  addInsight,
  updateInsight,
  deleteInsight,
  addInsightToAgenda,
  getAllCycles,
  getAsyncCurrentCycleId,
  type Insight,
  type InsightType,
  type TherapyCycle,
} from '@/lib/db';

const insightTypes: { value: InsightType; label: string; color: string }[] = [
  { value: 'pattern', label: 'דפוס', color: 'bg-purple-100 text-purple-700' },
  { value: 'boundary', label: 'גבול', color: 'bg-red-100 text-red-700' },
  { value: 'tool', label: 'כלי', color: 'bg-green-100 text-green-700' },
  { value: 'thought', label: 'מחשבה', color: 'bg-blue-100 text-blue-700' },
  { value: 'emotion', label: 'רגש', color: 'bg-amber-100 text-amber-700' },
  { value: 'other', label: 'אחר', color: 'bg-gray-100 text-gray-700' },
];

function getTypeInfo(type: InsightType) {
  return insightTypes.find(t => t.value === type) || insightTypes[5];
}

interface InsightFormData {
  title: string;
  body: string;
  type: InsightType;
  pinned: boolean;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cycles, setCycles] = useState<TherapyCycle[]>([]);
  const [currentCycleId, setCurrentCycleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsightFormData>({
    title: '',
    body: '',
    type: 'thought',
    pinned: false,
  });
  
  const [filterType, setFilterType] = useState<InsightType | 'all'>('all');
  const [filterCycle, setFilterCycle] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allInsights, allCycles, cycleId] = await Promise.all([
        getAllInsights(),
        getAllCycles(),
        getAsyncCurrentCycleId(),
      ]);
      setInsights(allInsights);
      setCycles(allCycles);
      setCurrentCycleId(cycleId);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInsights = insights.filter(insight => {
    if (filterType !== 'all' && insight.type !== filterType) return false;
    if (filterCycle !== 'all' && insight.cycleId !== filterCycle) return false;
    return true;
  });

  const pinnedInsights = filteredInsights.filter(i => i.pinned);
  const unpinnedInsights = filteredInsights.filter(i => !i.pinned);

  function resetForm() {
    setFormData({ title: '', body: '', type: 'thought', pinned: false });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      toast.error('נא להזין כותרת');
      return;
    }

    try {
      if (editingId) {
        const existing = insights.find(i => i.id === editingId);
        if (existing) {
          const updated = await updateInsight({
            ...existing,
            title: formData.title.trim(),
            body: formData.body.trim() || null,
            type: formData.type,
            pinned: formData.pinned,
          });
          setInsights(insights.map(i => i.id === editingId ? updated : i));
          toast.success('התובנה עודכנה');
        }
      } else {
        const newInsight = await addInsight({
          title: formData.title.trim(),
          body: formData.body.trim() || null,
          type: formData.type,
          tags: [],
          sourceType: null,
          sourceId: null,
          sourceRange: null,
          pinned: formData.pinned,
        });
        setInsights([newInsight, ...insights]);
        toast.success('התובנה נוספה');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast.error('שגיאה בשמירה');
    }
  }

  function handleEdit(insight: Insight) {
    setFormData({
      title: insight.title,
      body: insight.body || '',
      type: insight.type,
      pinned: insight.pinned,
    });
    setEditingId(insight.id);
    setShowForm(true);
  }

  async function handleTogglePin(insight: Insight) {
    try {
      const updated = await updateInsight({ ...insight, pinned: !insight.pinned });
      setInsights(insights.map(i => i.id === insight.id ? updated : i));
      toast.success(updated.pinned ? 'הוצמד' : 'בוטל הצמדה');
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }

  async function handleAddToAgenda(insight: Insight) {
    try {
      await addInsightToAgenda(insight.id);
      toast.success('נוסף לאג\'נדה');
    } catch (error) {
      console.error('Failed to add to agenda:', error);
      toast.error('שגיאה');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteInsight(id);
      setInsights(insights.filter(i => i.id !== id));
      toast.success('התובנה נמחקה');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  function InsightCard({ insight }: { insight: Insight }) {
    const typeInfo = getTypeInfo(insight.type);
    
    return (
      <div className={`card-premium p-4 ${insight.pinned ? 'border-purple-200 bg-purple-50/30' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
            <Lightbulb className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`chip text-xs ${typeInfo.color}`}>{typeInfo.label}</span>
              {insight.pinned && (
                <Pin className="w-3 h-3 text-purple-500" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
            {insight.body && (
              <p className="text-sm text-gray-600 line-clamp-2">{insight.body}</p>
            )}
            {insight.sourceType && (
              <p className="text-xs text-gray-400 mt-2">
                מקור: {insight.sourceType === 'entry' ? 'רשומה' : 'פגישה'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleAddToAgenda(insight)}
            className="btn-icon text-purple-600 hover:bg-purple-50"
            title="הוסף לאג'נדה"
          >
            <ListTodo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTogglePin(insight)}
            className={`btn-icon ${insight.pinned ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title={insight.pinned ? 'בטל הצמדה' : 'הצמד'}
          >
            {insight.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleEdit(insight)}
            className="btn-icon text-gray-400 hover:bg-gray-100"
            title="עריכה"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(insight.id)}
            className="btn-icon text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="מחיקה"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="תובנות"
        subtitle={`${insights.length} תובנות`}
        icon="💡"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            חדש
          </button>
        }
      />

      <div className="px-4 space-y-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Filter className="w-4 h-4" />
          סינון
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="card-premium p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">סוג</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`chip ${filterType === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  הכל
                </button>
                {insightTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className={`chip ${filterType === type.value ? type.color : 'bg-gray-100 text-gray-600'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">מחזור טיפול</label>
              <select
                value={filterCycle}
                onChange={(e) => setFilterCycle(e.target.value)}
                className="input-premium text-sm"
              >
                <option value="all">כל המחזורים</option>
                <option value={currentCycleId}>מחזור נוכחי</option>
                {cycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>
                    {new Date(cycle.startDate).toLocaleDateString('he-IL')}
                    {cycle.endDate ? ` - ${new Date(cycle.endDate).toLocaleDateString('he-IL')}` : ' (נוכחי)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {showForm && (
          <div className="card-premium p-4 space-y-4 border-purple-200 bg-purple-50/30">
            <h3 className="font-semibold text-gray-900">
              {editingId ? 'עריכת תובנה' : 'תובנה חדשה'}
            </h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">כותרת *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="תובנה קצרה..."
                className="input-premium"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">פירוט (אופציונלי)</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="הרחבה..."
                className="input-premium min-h-[100px] resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">סוג</label>
              <div className="flex flex-wrap gap-2">
                {insightTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`chip transition-all ${formData.type === type.value ? type.color + ' ring-2 ring-offset-1' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">הצמד למעלה</span>
            </label>
            
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="btn-primary flex-1 py-2.5">
                {editingId ? 'שמור שינויים' : 'הוסף תובנה'}
              </button>
              <button onClick={resetForm} className="btn-secondary py-2.5 px-4">
                ביטול
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <EmptyState
            icon="💡"
            title="עוד אין תובנות"
            description="תובנות עוזרות לך לזהות דפוסים ולזכור מה למדת"
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3">
                <Plus className="w-5 h-5" />
                תובנה ראשונה
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {pinnedInsights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  מוצמדות
                </h3>
                {pinnedInsights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
            
            {unpinnedInsights.length > 0 && (
              <div className="space-y-3">
                {pinnedInsights.length > 0 && (
                  <h3 className="text-sm font-semibold text-gray-400">אחרות</h3>
                )}
                {unpinnedInsights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
