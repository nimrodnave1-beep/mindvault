'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  Plus, 
  Heart, 
  Sparkles,
  Edit3,
  Trash2,
  Check,
  X,
  Calendar
} from 'lucide-react';
import {
  getAllGratitudeEntries,
  addGratitudeEntry,
  updateGratitudeEntry,
  deleteGratitudeEntry,
  getTodayGratitude,
  getToday,
  type GratitudeEntry,
} from '@/lib/db';

export default function GratitudePage() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [todayExists, setTodayExists] = useState(false);
  
  // Form state - each input maps to a GratitudeItem.text
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [note, setNote] = useState('');
  const [formDate, setFormDate] = useState(getToday());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allEntries, today] = await Promise.all([
        getAllGratitudeEntries(),
        getTodayGratitude(),
      ]);
      setEntries(allEntries);
      setTodayExists(!!today);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setItem1('');
    setItem2('');
    setItem3('');
    setNote('');
    setFormDate(getToday());
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    const rawItems = [item1, item2, item3].filter(i => i.trim());
    
    if (rawItems.length === 0) {
      toast.error('נא להזין לפחות דבר אחד');
      return;
    }

    // Convert strings to GratitudeItem objects
    const gratitudeItems = rawItems.map(text => ({
      text: text.trim(),
      why: '',
      myContribution: '',
      category: null as 'person' | 'event' | 'self' | null,
    }));

    try {
      if (editingId) {
        const existing = entries.find(e => e.id === editingId);
        if (existing) {
          const updated = await updateGratitudeEntry({
            ...existing,
            items: gratitudeItems,
            memoryNote: note.trim(),
            date: formDate,
          });
          setEntries(entries.map(e => e.id === editingId ? updated : e));
          toast.success('עודכן בהצלחה');
        }
      } else {
        const newEntry = await addGratitudeEntry({
          date: formDate,
          type: 'quick',
          items: gratitudeItems,
          feeling: '',
          memoryNote: note.trim(),
          primaryTopicId: null,
          cycleId: null,
        });
        setEntries([newEntry, ...entries]);
        if (formDate === getToday()) {
          setTodayExists(true);
        }
        toast.success('נשמר בהצלחה 💜');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('שגיאה בשמירה');
    }
  }

  function handleEdit(entry: GratitudeEntry) {
    setItem1(entry.items[0]?.text || '');
    setItem2(entry.items[1]?.text || '');
    setItem3(entry.items[2]?.text || '');
    setNote(entry.memoryNote || '');
    setFormDate(entry.date);
    setEditingId(entry.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    try {
      const entry = entries.find(e => e.id === id);
      await deleteGratitudeEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      if (entry?.date === getToday()) {
        setTodayExists(false);
      }
      toast.success('נמחק');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  function QuickAddForm() {
    return (
      <div className="card-premium p-5 space-y-4 border-pink-200 bg-gradient-to-br from-pink-50/50 to-purple-50/50">
        <div className="flex items-center gap-2 text-pink-600">
          <Heart className="w-5 h-5" />
          <h3 className="font-semibold">
            {editingId ? 'עריכה' : 'על מה אני מודה היום?'}
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">1</span>
            <input
              type="text"
              value={item1}
              onChange={(e) => setItem1(e.target.value)}
              placeholder="דבר ראשון..."
              className="input-premium flex-1"
              autoFocus
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">2</span>
            <input
              type="text"
              value={item2}
              onChange={(e) => setItem2(e.target.value)}
              placeholder="דבר שני (אופציונלי)..."
              className="input-premium flex-1"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">3</span>
            <input
              type="text"
              value={item3}
              onChange={(e) => setItem3(e.target.value)}
              placeholder="דבר שלישי (אופציונלי)..."
              className="input-premium flex-1"
            />
          </div>
        </div>
        
        <div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="הערה קצרה (אופציונלי)..."
            className="input-premium text-sm"
          />
        </div>
        
        {editingId && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="input-premium text-sm flex-1"
            />
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Check className="w-5 h-5" />
            {editingId ? 'שמור' : 'שמור תודה'}
          </button>
          <button onClick={resetForm} className="btn-secondary py-2.5 px-4">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  function GratitudeCard({ entry }: { entry: GratitudeEntry }) {
    const isToday = entry.date === getToday();
    
    return (
      <div className={`card-premium p-4 ${isToday ? 'border-pink-200 bg-pink-50/30' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💜</span>
            <div>
              <p className="font-medium text-gray-900">
                {new Date(entry.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {isToday && <span className="text-xs text-pink-600">היום</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(entry)}
              className="btn-icon text-gray-400 hover:bg-gray-100"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              className="btn-icon text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <ul className="space-y-2">
          {entry.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        
        {entry.memoryNote && (
          <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">
            {entry.memoryNote}
          </p>
        )}
      </div>
    );
  }

  // Group entries by month
  const entriesByMonth = entries.reduce((acc, entry) => {
    const monthKey = entry.date.slice(0, 7);
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, GratitudeEntry[]>);

  const sortedMonths = Object.keys(entriesByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <AppShell>
      <PageHeader
        title="הכרת תודה"
        subtitle={entries.length > 0 ? `${entries.length} רגעים של תודה` : 'רגעי שמחה קטנים'}
        icon="💜"
        action={
          !showForm && !todayExists && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary py-2 px-4 text-sm bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Plus className="w-4 h-4" />
              תודה של היום
            </button>
          )
        }
      />

      <div className="px-4 space-y-4">
        {showForm && <QuickAddForm />}
        
        {!showForm && !todayExists && !loading && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full card-premium p-6 text-center bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300 transition-colors"
          >
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">על מה תודה היום?</p>
            <p className="text-sm text-gray-500 mt-1">לוקח רק רגע 💜</p>
          </button>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 && !showForm ? (
          <EmptyState
            icon="💜"
            title="מקום להכרת תודה"
            description="רגעים קטנים של שמחה יכולים לעשות שינוי גדול"
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500">
                <Heart className="w-5 h-5" />
                התחל עכשיו
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            {sortedMonths.map(monthKey => {
              const monthEntries = entriesByMonth[monthKey];
              const monthDate = new Date(monthKey + '-01');
              const monthName = monthDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
              
              return (
                <div key={monthKey}>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">{monthName}</h3>
                  <div className="space-y-3">
                    {monthEntries.map(entry => (
                      <GratitudeCard key={entry.id} entry={entry} />
                    ))}
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
