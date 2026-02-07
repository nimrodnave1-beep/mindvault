'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Check, 
  Trash2, 
  Plus,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  getAllAgendaItems,
  addAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
  reorderAgendaItems,
  AgendaItem,
  Topic,
} from '@/lib/db';
import { useTopics } from '@/lib/topicContext';
import { TopicPicker } from '@/components/TopicPicker';

interface SortableItemProps {
  item: AgendaItem;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  inRoomMode: boolean;
}

function SortableItem({ item, index, onToggle, onDelete, inRoomMode }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`agenda-item ${item.status === 'done' ? 'agenda-item-done' : ''} ${inRoomMode ? 'p-6' : ''}`}
    >
      {!inRoomMode && (
        <button
          className="touch-target flex items-center justify-center text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={onToggle}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-200 ${
          item.status === 'done' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
        }`}
      >
        {item.status === 'done' ? <Check className="w-4 h-4" /> : index + 1}
      </button>
      
      <p className={`flex-1 text-sm leading-relaxed ${inRoomMode ? 'text-xl' : ''} ${item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {item.text}
      </p>
      
      {!inRoomMode && item.status !== 'done' && (
        <button
          onClick={onDelete}
          className="btn-icon w-8 h-8 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function AgendaPage() {
  const { topics } = useTopics();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [newItemTopicId, setNewItemTopicId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inRoomMode, setInRoomMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const allItems = await getAllAgendaItems();
      setItems(allItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      await reorderAgendaItems(newItems);
    }
  }

  async function handleAddItem() {
    if (!newItemText.trim()) return;

    try {
      const newItem = await addAgendaItem({
        text: newItemText.trim(),
        priority: items.length,
        sourceId: null,
        sourceType: 'manual',
        status: 'open',
        cycleId: null,
        primaryTopicId: newItemTopicId,
      });
      setItems([...items, newItem]);
      setNewItemText('');
      setNewItemTopicId(null);
      setShowInput(false);
      toast.success('נוסף לאג\'נדה');
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('שגיאה');
    }
  }

  async function handleToggleItem(item: AgendaItem) {
    const newStatus = item.status === 'open' ? 'done' : 'open';
    try {
      await updateAgendaItem({ ...item, status: newStatus });
      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await deleteAgendaItem(id);
      setItems(items.filter(i => i.id !== id));
      toast.success('נמחק');
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }

  const openItems = items.filter(i => i.status === 'open');
  const doneItems = items.filter(i => i.status === 'done');

  return (
    <AppShell hideNav={inRoomMode}>
      <PageHeader
        title="אג'נדה"
        subtitle={`${openItems.length} נקודות פתוחות`}
        icon="📋"
        action={
          <button
            onClick={() => setInRoomMode(!inRoomMode)}
            className={`btn-icon ${inRoomMode ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-100 text-gray-500'}`}
            title={inRoomMode ? 'יציאה ממצב בחדר' : 'מצב בחדר'}
          >
            {inRoomMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        }
      />

      <div className={`app-container space-y-4 pt-1 ${inRoomMode ? 'in-room-mode' : ''}`}>
        {/* In-Room Mode Banner */}
        {inRoomMode && (
          <div className="rounded-xl p-3 text-center bg-teal-50 border border-teal-100 animate-fade-in">
            <p className="text-teal-700 font-medium text-sm">מצב בחדר — תצוגה נקייה לפגישה</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : openItems.length === 0 && doneItems.length === 0 ? (
          <EmptyState
            icon="📋"
            title="עוד לא הכנת נושאים"
            description="זה בסדר. כשמשהו יעלה — הוא יחכה לך פה."
            action={
              <button
                onClick={() => setShowInput(true)}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                הוסף נושא
              </button>
            }
          />
        ) : (
          <>
            {/* Open Items */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={openItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {openItems.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      index={index}
                      onToggle={() => handleToggleItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      inRoomMode={inRoomMode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Done Items */}
            {doneItems.length > 0 && !inRoomMode && (
              <div className="pt-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">הושלמו ({doneItems.length})</h3>
                <div className="space-y-2">
                  {doneItems.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      index={index}
                      onToggle={() => handleToggleItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      inRoomMode={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Add New Item */}
        {!inRoomMode && (openItems.length > 0 || doneItems.length > 0) && (
          showInput ? (
            <div className="card-premium p-4 animate-fade-in space-y-3">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="נקודה חדשה..."
                className="input-premium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') setShowInput(false);
                }}
              />
              <TopicPicker value={newItemTopicId} onChange={setNewItemTopicId} compact />
              <div className="flex gap-2">
                <button onClick={handleAddItem} className="btn-primary flex-1 py-2.5 text-sm">
                  הוספה
                </button>
                <button onClick={() => setShowInput(false)} className="btn-secondary py-2.5 px-4 text-sm">
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-400 border border-dashed border-gray-300 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              הוסף נושא
            </button>
          )
        )}
      </div>
    </AppShell>
  );
}
