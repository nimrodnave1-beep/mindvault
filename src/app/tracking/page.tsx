'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  Plus, 
  Activity,
  Edit3,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Hash,
  ToggleLeft,
  FileText
} from 'lucide-react';
import {
  getAllTrackers,
  addTracker,
  updateTracker,
  deleteTracker,
  getTrackerEntriesByTracker,
  addTrackerEntry,
  getTodayTrackerEntry,
  getToday,
  type Tracker,
  type TrackerEntry,
  type TrackerValueType,
  type TrackerFrequency,
} from '@/lib/db';

const valueTypeOptions: { value: TrackerValueType; label: string; icon: React.ReactNode }[] = [
  { value: 'boolean', label: 'כן/לא', icon: <ToggleLeft className="w-4 h-4" /> },
  { value: 'rating_1_5', label: 'דירוג 1-5', icon: <Star className="w-4 h-4" /> },
  { value: 'rating_1_10', label: 'דירוג 1-10', icon: <Star className="w-4 h-4" /> },
  { value: 'count', label: 'ספירה', icon: <Hash className="w-4 h-4" /> },
  { value: 'duration_minutes', label: 'דקות', icon: <Clock className="w-4 h-4" /> },
  { value: 'note_only', label: 'הערה בלבד', icon: <FileText className="w-4 h-4" /> },
];

const frequencyOptions: { value: TrackerFrequency; label: string }[] = [
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: null, label: 'לפי צורך' },
];

interface TrackerFormData {
  name: string;
  valueType: TrackerValueType;
  frequency: TrackerFrequency;
  unit: string;
}

export default function TrackingPage() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [trackerEntries, setTrackerEntries] = useState<Record<string, TrackerEntry[]>>({});
  const [todayEntries, setTodayEntries] = useState<Record<string, TrackerEntry | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedTracker, setExpandedTracker] = useState<string | null>(null);
  const [logValue, setLogValue] = useState<Record<string, string | number | boolean>>({});
  const [logNote, setLogNote] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TrackerFormData>({
    name: '',
    valueType: 'boolean',
    frequency: 'daily',
    unit: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allTrackers = await getAllTrackers();
      setTrackers(allTrackers);
      
      const todayMap: Record<string, TrackerEntry | undefined> = {};
      for (const tracker of allTrackers) {
        todayMap[tracker.id] = await getTodayTrackerEntry(tracker.id);
      }
      setTodayEntries(todayMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrackerHistory(trackerId: string) {
    try {
      const entries = await getTrackerEntriesByTracker(trackerId);
      setTrackerEntries(prev => ({ ...prev, [trackerId]: entries }));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  function resetForm() {
    setFormData({ name: '', valueType: 'boolean', frequency: 'daily', unit: '' });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!formData.name.trim()) {
      toast.error('נא להזין שם');
      return;
    }

    try {
      if (editingId) {
        const existing = trackers.find(t => t.id === editingId);
        if (existing) {
          const updated = await updateTracker({
            ...existing,
            name: formData.name.trim(),
            valueType: formData.valueType,
            frequency: formData.frequency,
            unit: formData.unit.trim() || null,
          });
          setTrackers(trackers.map(t => t.id === editingId ? updated : t));
          toast.success('המעקב עודכן');
        }
      } else {
        const newTracker = await addTracker({
          name: formData.name.trim(),
          valueType: formData.valueType,
          frequency: formData.frequency,
          unit: formData.unit.trim() || null,
          tags: [],
          isActive: true,
        });
        setTrackers([...trackers, newTracker]);
        toast.success('המעקב נוסף');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save tracker:', error);
      toast.error('שגיאה בשמירה');
    }
  }

  function handleEdit(tracker: Tracker) {
    setFormData({
      name: tracker.name,
      valueType: tracker.valueType,
      frequency: tracker.frequency,
      unit: tracker.unit || '',
    });
    setEditingId(tracker.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteTracker(id);
      setTrackers(trackers.filter(t => t.id !== id));
      toast.success('המעקב נמחק');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  async function handleLogEntry(tracker: Tracker) {
    const value = logValue[tracker.id];
    if (value === undefined || value === '') {
      toast.error('נא להזין ערך');
      return;
    }

    try {
      const entry = await addTrackerEntry({
        trackerId: tracker.id,
        date: getToday(),
        value,
        note: logNote[tracker.id] || null,
      });
      setTodayEntries(prev => ({ ...prev, [tracker.id]: entry }));
      setLogValue(prev => ({ ...prev, [tracker.id]: '' }));
      setLogNote(prev => ({ ...prev, [tracker.id]: '' }));
      toast.success('נשמר!');
      
      if (expandedTracker === tracker.id) {
        loadTrackerHistory(tracker.id);
      }
    } catch (error: unknown) {
      console.error('Failed to log entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירה';
      toast.error(errorMessage);
    }
  }

  function toggleExpanded(trackerId: string) {
    if (expandedTracker === trackerId) {
      setExpandedTracker(null);
    } else {
      setExpandedTracker(trackerId);
      if (!trackerEntries[trackerId]) {
        loadTrackerHistory(trackerId);
      }
    }
  }

  function ValueInput({ tracker }: { tracker: Tracker }) {
    const value = logValue[tracker.id];
    const todayEntry = todayEntries[tracker.id];
    
    if (todayEntry) {
      return (
        <div className="text-sm text-green-600 flex items-center gap-1">
          <Check className="w-4 h-4" />
          נרשם היום: {formatValue(todayEntry.value, tracker.valueType, tracker.unit)}
        </div>
      );
    }
    
    switch (tracker.valueType) {
      case 'boolean':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => setLogValue(prev => ({ ...prev, [tracker.id]: true }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                value === true ? 'bg-green-100 text-green-700 ring-2 ring-green-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              כן ✓
            </button>
            <button
              onClick={() => setLogValue(prev => ({ ...prev, [tracker.id]: false }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                value === false ? 'bg-red-100 text-red-700 ring-2 ring-red-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              לא ✗
            </button>
          </div>
        );
      
      case 'rating_1_5':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setLogValue(prev => ({ ...prev, [tracker.id]: n }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  value === n ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        );
      
      case 'rating_1_10':
        return (
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setLogValue(prev => ({ ...prev, [tracker.id]: n }))}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  value === n ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        );
      
      case 'count':
      case 'duration_minutes':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={value as number || ''}
              onChange={(e) => setLogValue(prev => ({ ...prev, [tracker.id]: parseInt(e.target.value) || 0 }))}
              placeholder={tracker.valueType === 'duration_minutes' ? 'דקות' : 'מספר'}
              className="input-premium flex-1"
            />
            {tracker.unit && <span className="text-sm text-gray-500">{tracker.unit}</span>}
          </div>
        );
      
      case 'note_only':
        return (
          <textarea
            value={logNote[tracker.id] || ''}
            onChange={(e) => {
              setLogNote(prev => ({ ...prev, [tracker.id]: e.target.value }));
              setLogValue(prev => ({ ...prev, [tracker.id]: e.target.value }));
            }}
            placeholder="הערה..."
            className="input-premium min-h-[60px] resize-none"
          />
        );
    }
  }

  function formatValue(value: boolean | number | string, valueType: TrackerValueType, unit?: string | null): string {
    switch (valueType) {
      case 'boolean':
        return value ? 'כן ✓' : 'לא ✗';
      case 'rating_1_5':
      case 'rating_1_10':
        return `${value}`;
      case 'count':
        return `${value}${unit ? ` ${unit}` : ''}`;
      case 'duration_minutes':
        return `${value} דקות`;
      case 'note_only':
        return String(value).slice(0, 30) + (String(value).length > 30 ? '...' : '');
      default:
        return String(value);
    }
  }

  function TrackerCard({ tracker }: { tracker: Tracker }) {
    const typeInfo = valueTypeOptions.find(v => v.value === tracker.valueType);
    const isExpanded = expandedTracker === tracker.id;
    const entries = trackerEntries[tracker.id] || [];
    const todayEntry = todayEntries[tracker.id];
    
    return (
      <div className="card-premium overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                todayEntry ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {todayEntry ? <Check className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{tracker.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {typeInfo?.icon}
                  <span>{typeInfo?.label}</span>
                  {tracker.frequency && (
                    <>
                      <span>•</span>
                      <span>{frequencyOptions.find(f => f.value === tracker.frequency)?.label}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(tracker)}
                className="btn-icon text-gray-400 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tracker.id)}
                className="btn-icon text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <ValueInput tracker={tracker} />
            
            {!todayEntries[tracker.id] && tracker.valueType !== 'note_only' && (
              <input
                type="text"
                value={logNote[tracker.id] || ''}
                onChange={(e) => setLogNote(prev => ({ ...prev, [tracker.id]: e.target.value }))}
                placeholder="הערה (אופציונלי)"
                className="input-premium text-sm"
              />
            )}
            
            {!todayEntries[tracker.id] && logValue[tracker.id] !== undefined && logValue[tracker.id] !== '' && (
              <button
                onClick={() => handleLogEntry(tracker)}
                className="w-full btn-primary py-2 text-sm"
              >
                שמור
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => toggleExpanded(tracker.id)}
          className="w-full px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <span>היסטוריה</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-100 max-h-[200px] overflow-y-auto">
            {entries.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">אין נתונים עדיין</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {entries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="px-4 py-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(entry.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-medium text-gray-700">
                      {formatValue(entry.value, tracker.valueType, tracker.unit)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const activeTrackers = trackers.filter(t => t.isActive);

  return (
    <AppShell>
      <PageHeader
        title="מעקב"
        subtitle={`${activeTrackers.length} מעקבים פעילים`}
        icon="📊"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            מעקב חדש
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {showForm && (
          <div className="card-premium p-4 space-y-4 border-purple-200 bg-purple-50/30">
            <h3 className="font-semibold text-gray-900">
              {editingId ? 'עריכת מעקב' : 'מעקב חדש'}
            </h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">שם המעקב *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="לדוגמה: שינה, מצב רוח, ספורט..."
                className="input-premium"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">סוג ערך</label>
              <div className="grid grid-cols-2 gap-2">
                {valueTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, valueType: opt.value })}
                    className={`p-3 rounded-xl text-sm flex items-center gap-2 transition-all ${
                      formData.valueType === opt.value
                        ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">תדירות</label>
                <div className="flex flex-col gap-2">
                  {frequencyOptions.map(opt => (
                    <button
                      key={opt.value ?? 'null'}
                      onClick={() => setFormData({ ...formData, frequency: opt.value })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        formData.frequency === opt.value
                          ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">יחידה (אופציונלי)</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="כוסות, פעמים..."
                  className="input-premium"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="btn-primary flex-1 py-2.5">
                {editingId ? 'שמור שינויים' : 'צור מעקב'}
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
              <div key={i} className="skeleton h-40 rounded-xl" />
            ))}
          </div>
        ) : activeTrackers.length === 0 && !showForm ? (
          <EmptyState
            icon="📊"
            title="עוד אין מעקבים"
            description="מעקבים עוזרים לך לראות דפוסים ושינויים לאורך זמן"
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3">
                <Activity className="w-5 h-5" />
                מעקב ראשון
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {activeTrackers.map(tracker => (
              <TrackerCard key={tracker.id} tracker={tracker} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
