'use client';

import { useState } from 'react';
import { Topic, GENERAL_TOPIC_ID } from '@/lib/db';
import { useTopics } from '@/lib/topicContext';
import { ChevronDown, Inbox } from 'lucide-react';

interface TopicPickerProps {
  value: string | null;
  onChange: (topicId: string | null) => void;
  showInbox?: boolean;
  compact?: boolean;
  label?: string;
}

export function TopicPicker({
  value,
  onChange,
  showInbox = true,
  compact = false,
  label = 'נושא',
}: TopicPickerProps) {
  const { topics } = useTopics();
  const [isOpen, setIsOpen] = useState(false);

  const selectedTopic = value ? topics.find((t) => t.id === value) : null;

  return (
    <div className="relative">
      {!compact && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 w-full text-right
          ${compact
            ? 'px-3 py-1.5 rounded-full text-sm'
            : 'px-4 py-3 rounded-xl text-base'
          }
          bg-white border transition-all duration-200
          ${isOpen ? 'border-purple-400 ring-2 ring-purple-500/20' : 'border-gray-200'}
        `}
      >
        {selectedTopic ? (
          <>
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
              style={{ backgroundColor: `${selectedTopic.color}20` }}
            >
              {selectedTopic.icon}
            </span>
            <span className="flex-1 font-medium text-gray-900">
              {selectedTopic.name}
            </span>
          </>
        ) : (
          <>
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm bg-gray-100">
              <Inbox className="w-3.5 h-3.5 text-gray-500" />
            </span>
            <span className="flex-1 text-gray-400">
              {showInbox ? 'Inbox (ללא נושא)' : 'בחירת נושא...'}
            </span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
            {showInbox && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-4 py-3 text-right transition-colors
                  ${value === null ? 'bg-purple-50' : 'hover:bg-gray-50'}
                `}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm bg-gray-100">
                  <Inbox className="w-3.5 h-3.5 text-gray-500" />
                </span>
                <span className="text-gray-600">Inbox (ללא נושא)</span>
              </button>
            )}
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  onChange(topic.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-4 py-3 text-right transition-colors
                  ${value === topic.id ? 'bg-purple-50' : 'hover:bg-gray-50'}
                `}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${topic.color}20` }}
                >
                  {topic.icon}
                </span>
                <span className="flex-1 font-medium text-gray-900">
                  {topic.name}
                </span>
                {topic.id === GENERAL_TOPIC_ID && (
                  <span className="text-xs text-gray-400">ברירת מחדל</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
