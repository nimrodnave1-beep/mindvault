'use client';

import { Topic } from '@/lib/db';
import { ChevronLeft, Archive } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  stats?: {
    openAgenda: number;
    totalEntries: number;
    lastActivity: string | null;
  };
}

export function TopicCard({ topic, stats }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${topic.id}`}
      className="card-interactive p-4 flex items-center gap-3 group"
    >
      {/* Icon circle with topic accent */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: `${topic.color}18` }}
      >
        {topic.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 truncate">{topic.name}</h3>
          {topic.isArchived && (
            <Archive className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
        {topic.northStarSentence && (
          <p className="text-sm text-gray-500 truncate mt-0.5">
            &ldquo;{topic.northStarSentence}&rdquo;
          </p>
        )}
        {stats && (
          <div className="flex items-center gap-3 mt-1">
            {stats.openAgenda > 0 && (
              <span className="text-xs text-purple-600 font-medium">
                {stats.openAgenda} לאג׳נדה
              </span>
            )}
            {stats.totalEntries > 0 && (
              <span className="text-xs text-gray-400">
                {stats.totalEntries} רשומות
              </span>
            )}
            {stats.lastActivity && (
              <span className="text-xs text-gray-400">
                {formatRelativeDate(stats.lastActivity)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ChevronLeft
        className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors"
      />
    </Link>
  );
}
