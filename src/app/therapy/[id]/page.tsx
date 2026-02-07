'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { 
  Trash2, 
  ListTodo, 
  Sparkles,
  Calendar 
} from 'lucide-react';
import {
  getSession,
  deleteSession,
  addAgendaItem,
  addHighlight,
  getOpenAgendaItems,
  Session,
} from '@/lib/db';
import { formatDate } from '@/lib/utils';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    async function loadSession() {
      if (typeof params.id !== 'string') return;
      
      try {
        const data = await getSession(params.id);
        if (data) {
          setSession(data);
        } else {
          router.push('/therapy');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [params.id, router]);

  async function handleDelete() {
    if (!session || !confirm('למחוק את הסיכום?')) return;
    
    try {
      await deleteSession(session.id);
      toast.success('הסיכום נמחק');
      router.push('/therapy');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('שגיאה');
    }
  }

  const handleSelection = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 3) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({ text: selectedText, rect });
      }
    } else {
      setSelection(null);
    }
  };

  const addToAgenda = async () => {
    if (!selection || !session) return;
    
    try {
      const items = await getOpenAgendaItems();
      await addAgendaItem({
        text: selection.text,
        priority: items.length,
        sourceId: session.id,
        sourceType: 'summary',
        status: 'open',
        cycleId: null,
      });
      toast.success('נוסף לאג\'נדה');
      setSelection(null);
    } catch (error) {
      console.error('Failed to add to agenda:', error);
      toast.error('שגיאה');
    }
  };

  const addToHighlights = async () => {
    if (!selection || !session) return;
    
    try {
      await addHighlight({
        text: selection.text,
        sourceEntryId: session.id,
        sourceType: 'summary',
        cycleId: null,
      });
      toast.success('נשמר כהארה');
      setSelection(null);
    } catch (error) {
      console.error('Failed to add highlight:', error);
      toast.error('שגיאה');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="טוען..." showBack />
        <div className="app-container space-y-4 pt-1">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!session) return null;

  return (
    <AppShell>
      <PageHeader
        title="סיכום פגישה"
        showBack
        action={
          <button
            onClick={handleDelete}
            className="btn-icon hover:bg-red-50 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        }
      />

      <div className="app-container space-y-4 pt-1">
        {/* Date Badge */}
        <div className="session-pin inline-flex">
          <Calendar className="w-4 h-4" />
          {formatDate(session.date)}
        </div>

        {/* Summary Content */}
        <div
          className="card-premium p-5"
          onMouseUp={handleSelection}
          onTouchEnd={handleSelection}
        >
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
            {session.summary}
          </p>
        </div>

        {/* Selection Toolbar */}
        {selection && (
          <div
            className="selection-toolbar animate-fade-in"
            style={{
              top: selection.rect.bottom + window.scrollY + 8,
              left: Math.max(16, Math.min(selection.rect.left, window.innerWidth - 250)),
            }}
          >
            <button
              onClick={addToAgenda}
              className="selection-toolbar-btn text-purple-600 hover:bg-purple-50"
            >
              <ListTodo className="w-4 h-4" />
              להביא לטיפול
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={addToHighlights}
              className="selection-toolbar-btn text-amber-600 hover:bg-amber-50"
            >
              <Sparkles className="w-4 h-4" />
              הארה
            </button>
          </div>
        )}

        {/* Tips — only show briefly */}
        <div className="rounded-xl p-4 bg-purple-50/40 border border-purple-100/50">
          <p className="text-sm text-gray-500">
            <strong className="text-purple-700">טיפ:</strong> סמנו טקסט כדי להוסיף אותו לאג&apos;נדה לפגישה הבאה
          </p>
        </div>
      </div>
    </AppShell>
  );
}
