'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { useTopics } from '@/lib/topicContext';
import {
  getInboxItems,
  assignTopicToItem,
  Topic,
} from '@/lib/db';
import {
  Inbox,
  Check,
  ChevronLeft,
  PenLine,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InboxItem {
  type: 'entry' | 'highlight' | 'agenda';
  id: string;
  text: string;
  date: string;
}

export default function InboxPage() {
  const { topics } = useTopics();
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const inboxItems = await getInboxItems();
      setItems(inboxItems);
    } catch (error) {
      console.error('Failed to load inbox:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const currentItem = items[currentIndex];

  const handleAssign = async (topicId: string) => {
    if (!currentItem) return;
    try {
      await assignTopicToItem(currentItem.type, currentItem.id, topicId);
      toast.success('שויך בהצלחה');

      // Remove from list and move to next
      const newItems = items.filter((_, i) => i !== currentIndex);
      setItems(newItems);
      if (currentIndex >= newItems.length && newItems.length > 0) {
        setCurrentIndex(newItems.length - 1);
      }
      setSelectedTopicId(null);

      if (newItems.length === 0) {
        toast.success('כל הפריטים שויכו! 🎉');
      }
    } catch {
      toast.error('שגיאה בשיוך');
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setSelectedTopicId(null);
  };

  const getTypeIcon = (type: InboxItem['type']) => {
    switch (type) {
      case 'entry': return <PenLine className="w-4 h-4 text-purple-500" />;
      case 'highlight': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'agenda': return <ListChecks className="w-4 h-4 text-teal-500" />;
    }
  };

  const getTypeLabel = (type: InboxItem['type']) => {
    switch (type) {
      case 'entry': return 'רשומה';
      case 'highlight': return 'הארה';
      case 'agenda': return 'אג׳נדה';
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="מיון מגירה" icon={<Inbox className="w-6 h-6 text-amber-500" />} showBack />
        <div className="app-container py-8">
          <div className="skeleton h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="מיון מגירה" icon={<Inbox className="w-6 h-6 text-amber-500" />} showBack />
        <div className="app-container py-8">
          <EmptyState
            icon={<Check className="w-12 h-12 text-green-400" />}
            title="הכל מסודר!"
            description="אין פריטים שממתינים לשיוך נושא"
            action={
              <button
                onClick={() => router.push('/topics')}
                className="btn-primary px-6 py-2.5"
              >
                חזרה לנושאים
              </button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="מיון מגירה"
        subtitle={`${currentIndex + 1} מתוך ${items.length}`}
        icon={<Inbox className="w-6 h-6 text-amber-500" />}
        showBack
      />

      <div className="app-container py-6 space-y-6">
        {/* Progress */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{
              width: `${((items.length - items.length + currentIndex) / Math.max(items.length, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Current Item Card */}
        {currentItem && (
          <div className="card-premium p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              {getTypeIcon(currentItem.type)}
              <span className="text-sm font-medium text-gray-500">
                {getTypeLabel(currentItem.type)}
              </span>
            </div>
            <p className="text-gray-900 text-lg leading-relaxed">
              {currentItem.text || '(ריק)'}
            </p>
          </div>
        )}

        {/* Topic Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            לאיזה נושא שייך?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {topics
              .filter((t) => !t.isArchived)
              .map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleAssign(topic.id)}
                  className={`
                    card-premium p-3 flex items-center gap-2.5 text-right
                    transition-all duration-200 hover:border-gray-300
                    press-effect-soft
                  `}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: `${topic.color}18` }}
                  >
                    {topic.icon}
                  </div>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {topic.name}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="btn-ghost w-full py-3 text-sm"
        >
          דלג — אשייך אחר כך
        </button>
      </div>
    </AppShell>
  );
}
