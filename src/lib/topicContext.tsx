'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Topic, getActiveTopics, ensureDefaultTopic, GENERAL_TOPIC_ID } from './db';

interface TopicContextValue {
  topics: Topic[];
  activeTopicId: string | null;
  activeTopic: Topic | null;
  setActiveTopicId: (id: string | null) => void;
  refreshTopics: () => Promise<void>;
  loading: boolean;
}

const TopicContext = createContext<TopicContextValue>({
  topics: [],
  activeTopicId: null,
  activeTopic: null,
  setActiveTopicId: () => {},
  refreshTopics: async () => {},
  loading: true,
});

export function TopicProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTopics = useCallback(async () => {
    try {
      await ensureDefaultTopic();
      const active = await getActiveTopics();
      setTopics(active);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTopics();
  }, [refreshTopics]);

  const activeTopic = activeTopicId
    ? topics.find((t) => t.id === activeTopicId) || null
    : null;

  return (
    <TopicContext.Provider
      value={{
        topics,
        activeTopicId,
        activeTopic,
        setActiveTopicId,
        refreshTopics,
        loading,
      }}
    >
      {children}
    </TopicContext.Provider>
  );
}

export function useTopics() {
  return useContext(TopicContext);
}

/**
 * Returns the CSS accent variables for a given topic color.
 * Used to apply Visual Context (dynamic theming per topic).
 */
export function getTopicAccentStyles(color: string): Record<string, string> {
  return {
    '--topic-accent': color,
    '--topic-accent-light': `${color}20`,
    '--topic-accent-medium': `${color}40`,
  } as Record<string, string>;
}
