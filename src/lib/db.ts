import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================
// CONSTANTS
// ============================================

export const GENERAL_TOPIC_ID = '__general__';

export const TOPIC_COLORS = [
  '#6B4EE6', // סגול
  '#E64E8A', // ורוד
  '#E6854E', // כתום
  '#E6C84E', // צהוב
  '#4EE66B', // ירוק
  '#4EB8E6', // תכלת
  '#4E6BE6', // כחול
  '#8A4EE6', // סגול כהה
  '#E64E4E', // אדום
  '#6B7280', // אפור — ל"כללי"
] as const;

// ============================================
// CORE DATA TYPES
// ============================================

export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  northStarSentence: string;
  sortOrder: number;
  isDefault: boolean;
  isArchived: boolean;
  requirePin: boolean;
  topicPin: string | null;
  blurByDefault: boolean;
  hideFromJourney: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Session {
  id: string;
  date: string;
  summary: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface DailyEntry {
  id: string;
  date: string;
  content: string;
  cycleId: string | null;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Highlight {
  id: string;
  text: string;
  sourceEntryId: string | null;
  sourceType: 'entry' | 'summary';
  cycleId: string | null;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface AgendaItem {
  id: string;
  text: string;
  priority: number;
  sourceId: string | null;
  sourceType: 'entry' | 'summary' | 'manual';
  status: 'open' | 'done';
  cycleId: string | null;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  frequency: 'daily' | 'weekly' | 'once';
  targetDate: string | null;
  status: 'pending' | 'tried' | 'skipped' | 'hard';
  cycleId: string | null;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  key: string;
  value: unknown;
}

export interface Recording {
  id: string;
  entryId: string | null;
  audioBlob: Blob;
  mimeType: string;
  transcript: string;
  duration: number;
  createdAt: string;
}

// ============================================
// NEW TOPIC-CENTRIC ENTITIES
// ============================================

export interface TopicPlaybook {
  id: string;
  topicId: string;
  northStarSentence: string;
  rescueToolIds: string[];
  sections: PlaybookSection[];
  updatedAt: string;
  isDeleted: boolean;
}

export interface PlaybookSection {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

export interface UrgeEvent {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  urgeText: string;
  urgeCategory: 'check' | 'send' | 'buy' | 'react' | 'avoid' | 'custom' | null;
  pauseDuration: number;
  breathingUsed: boolean;
  costText: string;
  alternativeText: string;
  suggestedToolId: string | null;
  usedSuggestedTool: boolean;
  outcome: 'resisted' | 'acted' | null;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface TriggerHurtEvent {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  intensityLevel: number; // 1-10
  coolingEnforced: boolean;
  coolingDuration: number;
  type: 'trigger' | 'hurt';
  regulationDuration: number;
  draftMessage: string;
  boundaryRequest: string;
  boundaryDefinition: string;
  boundaryConsequence: string;
  note: string;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface HalfPowerEntry {
  id: string;
  primaryTopicId: string | null;
  content: string;
  templateType: 'emoji_checkin' | 'action_check' | 'freeform_90s' | 'one_sentence' | 'facts_only' | 'custom';
  emojiMood: string | null;
  actionCheckText: string | null;
  actionCheckResult: boolean | null;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface GratitudeEntry {
  id: string;
  primaryTopicId: string | null;
  date: string;
  type: 'quick' | 'deep';
  items: GratitudeItem[];
  feeling: string;
  memoryNote: string;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface GratitudeItem {
  text: string;
  why: string;
  myContribution: string;
  category: 'person' | 'event' | 'self' | null;
}

export interface NowCheckin {
  id: string;
  primaryTopicId: string | null;
  body: string;
  urgeLevel: number; // 1-5
  choice: string;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface WaveModeSession {
  id: string;
  primaryTopicId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  breathingUsed: boolean;
  noteAfter: string;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface MicroBoundary {
  id: string;
  primaryTopicId: string | null;
  text: string;
  date: string;
  kept: boolean | null;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface TopicTool {
  id: string;
  topicId: string;
  name: string;
  whenToUse: string;
  signal: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ToolUsage {
  id: string;
  toolId: string;
  topicId: string;
  entryId: string | null;
  note: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface DecisionLog {
  id: string;
  primaryTopicId: string | null;
  action: string;
  reason: string;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface RepairNote {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  responsibility: string;
  request: string;
  appreciation: string;
  linkedTriggerHurtId: string | null;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ChoiceLog {
  id: string;
  primaryTopicId: string | null;
  didNotDo: string;
  cycleId: string | null;
  date: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface OneSentenceEntry {
  id: string;
  primaryTopicId: string | null;
  sentence: string;
  prompt: 'decision' | 'feeling' | 'choice' | 'custom';
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface TenMinuteDefer {
  id: string;
  primaryTopicId: string | null;
  urgeDescription: string;
  deferredAt: string;
  expiresAt: string;
  didActAfter: boolean | null;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface CoolingWindow {
  id: string;
  primaryTopicId: string | null;
  startedAt: string;
  endsAt: string;
  reason: string;
  completed: boolean;
  createdAt: string;
  isDeleted: boolean;
}

export interface MarketInterruptPlan {
  id: string;
  primaryTopicId: string | null;
  checkTime: string;
  actionCondition: string;
  doNotList: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface SleepLog {
  id: string;
  primaryTopicId: string | null;
  date: string;
  bedTime: string;
  wakeTime: string;
  quality: number; // 1-5
  disturbance: string;
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface InternalValidation {
  id: string;
  primaryTopicId: string | null;
  triggeredAt: string;
  affirmationShown: string;
  durationSeconds: number;
  didSendAfter: boolean | null;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

// ============================================
// AUDIO MEMO (v3.0 — standalone recording)
// ============================================

export interface AudioMemo {
  id: string;
  duration: number; // seconds
  blobKey: string; // key into mediaBlobs store
  note: string | null;
  tags: string[];
  primaryTopicId: string | null;
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

// ============================================
// NEW RUBRICS (v3.0)
// ============================================

export interface Goal {
  id: string;
  title: string;
  why: string | null;
  horizon: 'weekly' | 'monthly' | 'open';
  targetDate: string | null;
  status: 'active' | 'paused' | 'done' | 'archived';
  progressStage: 'start' | 'middle' | 'advanced' | null;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  cycleId: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Wish {
  id: string;
  text: string;
  why: string | null;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface LetterToSelf {
  id: string;
  type: 'from_future' | 'from_past' | 'from_present';
  title: string;
  content: string;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  cycleId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Strength {
  id: string;
  text: string;
  example: string | null;
  sourceType: 'entry' | 'session' | 'standalone' | null;
  sourceId: string | null;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface Value {
  id: string;
  name: string;
  why: string | null;
  livingExample: string | null;
  conflictExample: string | null;
  tags: string[];
  primaryTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ImageEntry {
  id: string;
  blobKey: string;
  note: string | null;
  tags: string[];
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  cycleId: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface MediaBlob {
  key: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

// ============================================
// RECORDING (existing feature, preserved)
// ============================================

export interface Recording {
  id: string;
  entryId: string;
  audioBlob: Blob;
  mimeType: string;
  transcript: string;
  duration: number;
  createdAt: string;
}

// ============================================
// DATABASE SCHEMA (v2 — Topics System)
// ============================================

interface MindVaultDB extends DBSchema {
  topics: {
    key: string;
    value: Topic;
    indexes: {
      'by-archived': string;
      'by-sortOrder': number;
    };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: {
      'by-date': string;
      'by-primaryTopicId': string;
    };
  };
  entries: {
    key: string;
    value: DailyEntry;
    indexes: {
      'by-date': string;
      'by-cycle': string;
      'by-primaryTopicId': string;
    };
  };
  highlights: {
    key: string;
    value: Highlight;
    indexes: {
      'by-cycle': string;
      'by-primaryTopicId': string;
    };
  };
  agendaItems: {
    key: string;
    value: AgendaItem;
    indexes: {
      'by-cycle': string;
      'by-status': string;
      'by-primaryTopicId': string;
    };
  };
  actionItems: {
    key: string;
    value: ActionItem;
    indexes: {
      'by-cycle': string;
      'by-primaryTopicId': string;
    };
  };
  tags: {
    key: string;
    value: Tag;
  };
  settings: {
    key: string;
    value: Settings;
  };
  topicPlaybooks: {
    key: string;
    value: TopicPlaybook;
    indexes: { 'by-topicId': string };
  };
  urgeEvents: {
    key: string;
    value: UrgeEvent;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
      'by-createdAt': string;
    };
  };
  triggerHurtEvents: {
    key: string;
    value: TriggerHurtEvent;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  halfPowerEntries: {
    key: string;
    value: HalfPowerEntry;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  gratitudeEntries: {
    key: string;
    value: GratitudeEntry;
    indexes: {
      'by-topicId': string;
      'by-date': string;
      'by-cycleId': string;
    };
  };
  nowCheckins: {
    key: string;
    value: NowCheckin;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  waveModeSessions: {
    key: string;
    value: WaveModeSession;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  microBoundaries: {
    key: string;
    value: MicroBoundary;
    indexes: {
      'by-topicId': string;
      'by-date': string;
    };
  };
  topicTools: {
    key: string;
    value: TopicTool;
    indexes: { 'by-topicId': string };
  };
  toolUsages: {
    key: string;
    value: ToolUsage;
    indexes: {
      'by-toolId': string;
      'by-topicId': string;
    };
  };
  decisionLogs: {
    key: string;
    value: DecisionLog;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  repairNotes: {
    key: string;
    value: RepairNote;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  choiceLogs: {
    key: string;
    value: ChoiceLog;
    indexes: {
      'by-topicId': string;
      'by-date': string;
    };
  };
  oneSentenceEntries: {
    key: string;
    value: OneSentenceEntry;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  tenMinuteDefers: {
    key: string;
    value: TenMinuteDefer;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  coolingWindows: {
    key: string;
    value: CoolingWindow;
    indexes: {
      'by-topicId': string;
      'by-endsAt': string;
    };
  };
  marketInterruptPlans: {
    key: string;
    value: MarketInterruptPlan;
    indexes: { 'by-topicId': string };
  };
  sleepLogs: {
    key: string;
    value: SleepLog;
    indexes: {
      'by-topicId': string;
      'by-date': string;
    };
  };
  internalValidations: {
    key: string;
    value: InternalValidation;
    indexes: {
      'by-topicId': string;
      'by-cycleId': string;
    };
  };
  recordings: {
    key: string;
    value: Recording;
    indexes: { 'by-entry': string };
  };
  // ---- v4: New Rubrics + Audio Memos ----
  audioMemos: {
    key: string;
    value: AudioMemo;
    indexes: {
      'by-primaryTopicId': string;
      'by-cycleId': string;
      'by-createdAt': string;
    };
  };
  goals: {
    key: string;
    value: Goal;
    indexes: {
      'by-status': string;
      'by-primaryTopicId': string;
      'by-pinned': string;
    };
  };
  wishes: {
    key: string;
    value: Wish;
    indexes: {
      'by-primaryTopicId': string;
      'by-cycleId': string;
    };
  };
  lettersToSelf: {
    key: string;
    value: LetterToSelf;
    indexes: {
      'by-type': string;
      'by-primaryTopicId': string;
    };
  };
  strengths: {
    key: string;
    value: Strength;
    indexes: {
      'by-primaryTopicId': string;
      'by-cycleId': string;
    };
  };
  values: {
    key: string;
    value: Value;
    indexes: {
      'by-primaryTopicId': string;
    };
  };
  imageEntries: {
    key: string;
    value: ImageEntry;
    indexes: {
      'by-primaryTopicId': string;
      'by-cycleId': string;
    };
  };
  mediaBlobs: {
    key: string;
    value: MediaBlob;
  };
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

const DB_NAME = 'mindvault';
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<MindVaultDB>> | null = null;

function createStoreWithIndex(
  db: IDBPDatabase<MindVaultDB>,
  name: string,
  indexes: Array<{ name: string; keyPath: string; options?: IDBIndexParameters }>
) {
  if (!db.objectStoreNames.contains(name as never)) {
    const store = db.createObjectStore(name as never, { keyPath: 'id' } as never);
    for (const idx of indexes) {
      (store as unknown as IDBObjectStore).createIndex(idx.name, idx.keyPath, idx.options);
    }
  }
}

export async function getDB(): Promise<IDBPDatabase<MindVaultDB>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in browser');
  }

  if (!dbPromise) {
    dbPromise = openDB<MindVaultDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // ---- V1 stores (original) ----
        if (oldVersion < 1) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'date');

          const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
          entryStore.createIndex('by-date', 'date');
          entryStore.createIndex('by-cycle', 'cycleId');

          const highlightStore = db.createObjectStore('highlights', { keyPath: 'id' });
          highlightStore.createIndex('by-cycle', 'cycleId');

          const agendaStore = db.createObjectStore('agendaItems', { keyPath: 'id' });
          agendaStore.createIndex('by-cycle', 'cycleId');
          agendaStore.createIndex('by-status', 'status');

          const actionStore = db.createObjectStore('actionItems', { keyPath: 'id' });
          actionStore.createIndex('by-cycle', 'cycleId');

          db.createObjectStore('tags', { keyPath: 'id' });
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // ---- V2: Topics System ----
        if (oldVersion < 2) {
          // Topics store
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('by-archived', 'isArchived');
          topicStore.createIndex('by-sortOrder', 'sortOrder');

          // Add topic indexes to existing stores
          const existingStores = ['sessions', 'entries', 'highlights', 'agendaItems', 'actionItems'] as const;
          for (const storeName of existingStores) {
            const tx = (db as unknown as { transaction: (s: string, m: string) => IDBTransaction }).transaction;
            try {
              const store = (tx as unknown as (s: string, m: string) => { objectStore: (n: string) => IDBObjectStore })(storeName, 'readwrite').objectStore(storeName);
              if (!store.indexNames.contains('by-primaryTopicId')) {
                store.createIndex('by-primaryTopicId', 'primaryTopicId');
              }
            } catch {
              // Store may already have been created in this upgrade
            }
          }

          // New stores
          createStoreWithIndex(db, 'topicPlaybooks', [
            { name: 'by-topicId', keyPath: 'topicId' },
          ]);
          createStoreWithIndex(db, 'urgeEvents', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
            { name: 'by-createdAt', keyPath: 'createdAt' },
          ]);
          createStoreWithIndex(db, 'triggerHurtEvents', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'halfPowerEntries', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'gratitudeEntries', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-date', keyPath: 'date' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'nowCheckins', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'waveModeSessions', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'microBoundaries', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-date', keyPath: 'date' },
          ]);
          createStoreWithIndex(db, 'topicTools', [
            { name: 'by-topicId', keyPath: 'topicId' },
          ]);
          createStoreWithIndex(db, 'toolUsages', [
            { name: 'by-toolId', keyPath: 'toolId' },
            { name: 'by-topicId', keyPath: 'topicId' },
          ]);
          createStoreWithIndex(db, 'decisionLogs', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'repairNotes', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'choiceLogs', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-date', keyPath: 'date' },
          ]);
          createStoreWithIndex(db, 'oneSentenceEntries', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'tenMinuteDefers', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'coolingWindows', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-endsAt', keyPath: 'endsAt' },
          ]);
          createStoreWithIndex(db, 'marketInterruptPlans', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
          ]);
          createStoreWithIndex(db, 'sleepLogs', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-date', keyPath: 'date' },
          ]);
          createStoreWithIndex(db, 'internalValidations', [
            { name: 'by-topicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
        }

        // ---- V3: Audio Recordings ----
        if (oldVersion < 3) {
          createStoreWithIndex(db, 'recordings', [
            { name: 'by-entry', keyPath: 'entryId' },
          ]);
        }

        // ---- V4: New Rubrics + Audio Memos + Images ----
        if (oldVersion < 4) {
          createStoreWithIndex(db, 'audioMemos', [
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
            { name: 'by-createdAt', keyPath: 'createdAt' },
          ]);
          createStoreWithIndex(db, 'goals', [
            { name: 'by-status', keyPath: 'status' },
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
            { name: 'by-pinned', keyPath: 'pinned' },
          ]);
          createStoreWithIndex(db, 'wishes', [
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'lettersToSelf', [
            { name: 'by-type', keyPath: 'type' },
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
          ]);
          createStoreWithIndex(db, 'strengths', [
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          createStoreWithIndex(db, 'values', [
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
          ]);
          createStoreWithIndex(db, 'imageEntries', [
            { name: 'by-primaryTopicId', keyPath: 'primaryTopicId' },
            { name: 'by-cycleId', keyPath: 'cycleId' },
          ]);
          if (!db.objectStoreNames.contains('mediaBlobs' as never)) {
            db.createObjectStore('mediaBlobs' as never, { keyPath: 'key' } as never);
          }
        }
      },
    });
  }

  return dbPromise;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentCycleId(sessions: Session[]): string | null {
  if (sessions.length === 0) return null;
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedSessions[0].id;
}

// ============================================
// TOPICS CRUD
// ============================================

export async function ensureDefaultTopic(): Promise<Topic> {
  const db = await getDB();
  let general = await db.get('topics', GENERAL_TOPIC_ID);
  if (!general) {
    const now = new Date().toISOString();
    general = {
      id: GENERAL_TOPIC_ID,
      name: 'כללי',
      icon: '📝',
      color: '#6B7280',
      northStarSentence: '',
      sortOrder: 999,
      isDefault: true,
      isArchived: false,
      requirePin: false,
      topicPin: null,
      blurByDefault: false,
      hideFromJourney: false,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    await db.put('topics', general);
  }
  return general;
}

export async function getAllTopics(): Promise<Topic[]> {
  const db = await getDB();
  await ensureDefaultTopic();
  const topics = await db.getAll('topics');
  return topics
    .filter((t) => !t.isDeleted)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveTopics(): Promise<Topic[]> {
  const all = await getAllTopics();
  return all.filter((t) => !t.isArchived);
}

export async function getArchivedTopics(): Promise<Topic[]> {
  const all = await getAllTopics();
  return all.filter((t) => t.isArchived && !t.isDefault);
}

export async function getTopic(id: string): Promise<Topic | undefined> {
  const db = await getDB();
  return db.get('topics', id);
}

export async function addTopic(
  topic: Pick<Topic, 'name' | 'icon' | 'color'>
): Promise<Topic> {
  const db = await getDB();
  const allTopics = await getAllTopics();
  const now = new Date().toISOString();
  const newTopic: Topic = {
    id: generateId(),
    name: topic.name,
    icon: topic.icon,
    color: topic.color,
    northStarSentence: '',
    sortOrder: allTopics.length,
    isDefault: false,
    isArchived: false,
    requirePin: false,
    topicPin: null,
    blurByDefault: false,
    hideFromJourney: false,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('topics', newTopic);

  // Create empty playbook for the topic
  const playbook: TopicPlaybook = {
    id: generateId(),
    topicId: newTopic.id,
    northStarSentence: '',
    rescueToolIds: [],
    sections: [],
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('topicPlaybooks', playbook);

  return newTopic;
}

export async function updateTopic(topic: Topic): Promise<Topic> {
  const db = await getDB();
  topic.updatedAt = new Date().toISOString();
  await db.put('topics', topic);
  return topic;
}

export async function archiveTopic(id: string): Promise<void> {
  const topic = await getTopic(id);
  if (topic && !topic.isDefault) {
    topic.isArchived = true;
    await updateTopic(topic);
  }
}

export async function unarchiveTopic(id: string): Promise<void> {
  const topic = await getTopic(id);
  if (topic) {
    topic.isArchived = false;
    await updateTopic(topic);
  }
}

export async function reorderTopics(orderedIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('topics', 'readwrite');
  for (let i = 0; i < orderedIds.length; i++) {
    const topic = await tx.store.get(orderedIds[i]);
    if (topic) {
      topic.sortOrder = i;
      topic.updatedAt = new Date().toISOString();
      await tx.store.put(topic);
    }
  }
  await tx.done;
}

// ============================================
// SESSIONS CRUD
// ============================================

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  return sessions
    .filter((s) => !s.isDeleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function addSession(
  session: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<Session> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newSession: Session = {
    ...session,
    id: generateId(),
    primaryTopicId: session.primaryTopicId ?? null,
    secondaryTopicIds: session.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('sessions', newSession);
  return newSession;
}

export async function updateSession(session: Session): Promise<Session> {
  const db = await getDB();
  session.updatedAt = new Date().toISOString();
  await db.put('sessions', session);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  const session = await db.get('sessions', id);
  if (session) {
    session.isDeleted = true;
    session.updatedAt = new Date().toISOString();
    await db.put('sessions', session);
  }
}

// ============================================
// ENTRIES CRUD
// ============================================

export async function getAllEntries(): Promise<DailyEntry[]> {
  const db = await getDB();
  const entries = await db.getAll('entries');
  return entries
    .filter((e) => !e.isDeleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getEntry(id: string): Promise<DailyEntry | undefined> {
  const db = await getDB();
  return db.get('entries', id);
}

export async function getEntryByDate(date: string): Promise<DailyEntry | undefined> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('entries', 'by-date', date);
  return entries.find((e) => !e.isDeleted);
}

export async function getTodayEntry(): Promise<DailyEntry | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return getEntryByDate(today);
}

export async function addEntry(
  entry: Omit<DailyEntry, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<DailyEntry> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newEntry: DailyEntry = {
    ...entry,
    id: generateId(),
    primaryTopicId: entry.primaryTopicId ?? null,
    secondaryTopicIds: entry.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('entries', newEntry);
  return newEntry;
}

export async function updateEntry(entry: DailyEntry): Promise<DailyEntry> {
  const db = await getDB();
  entry.updatedAt = new Date().toISOString();
  await db.put('entries', entry);
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (entry) {
    entry.isDeleted = true;
    entry.updatedAt = new Date().toISOString();
    await db.put('entries', entry);
  }
}

// ============================================
// HIGHLIGHTS CRUD
// ============================================

export async function getAllHighlights(): Promise<Highlight[]> {
  const db = await getDB();
  const highlights = await db.getAll('highlights');
  return highlights
    .filter((h) => !h.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addHighlight(
  highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<Highlight> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newHighlight: Highlight = {
    ...highlight,
    id: generateId(),
    primaryTopicId: highlight.primaryTopicId ?? null,
    secondaryTopicIds: highlight.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('highlights', newHighlight);
  return newHighlight;
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = await getDB();
  const h = await db.get('highlights', id);
  if (h) {
    h.isDeleted = true;
    h.updatedAt = new Date().toISOString();
    await db.put('highlights', h);
  }
}

// ============================================
// AGENDA ITEMS CRUD
// ============================================

export async function getAllAgendaItems(): Promise<AgendaItem[]> {
  const db = await getDB();
  const items = await db.getAll('agendaItems');
  return items.filter((i) => !i.isDeleted).sort((a, b) => a.priority - b.priority);
}

export async function getOpenAgendaItems(): Promise<AgendaItem[]> {
  const all = await getAllAgendaItems();
  return all.filter((i) => i.status === 'open');
}

export async function addAgendaItem(
  item: Omit<AgendaItem, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<AgendaItem> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newItem: AgendaItem = {
    ...item,
    id: generateId(),
    primaryTopicId: item.primaryTopicId ?? null,
    secondaryTopicIds: item.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('agendaItems', newItem);
  return newItem;
}

export async function updateAgendaItem(item: AgendaItem): Promise<AgendaItem> {
  const db = await getDB();
  item.updatedAt = new Date().toISOString();
  await db.put('agendaItems', item);
  return item;
}

export async function deleteAgendaItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('agendaItems', id);
  if (item) {
    item.isDeleted = true;
    item.updatedAt = new Date().toISOString();
    await db.put('agendaItems', item);
  }
}

export async function reorderAgendaItems(items: AgendaItem[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('agendaItems', 'readwrite');
  await Promise.all(
    items.map((item, index) => {
      item.priority = index;
      item.updatedAt = new Date().toISOString();
      return tx.store.put(item);
    })
  );
  await tx.done;
}

// ============================================
// ACTION ITEMS CRUD
// ============================================

export async function getAllActionItems(): Promise<ActionItem[]> {
  const db = await getDB();
  const items = await db.getAll('actionItems');
  return items.filter((i) => !i.isDeleted);
}

export async function addActionItem(
  item: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<ActionItem> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newItem: ActionItem = {
    ...item,
    id: generateId(),
    primaryTopicId: item.primaryTopicId ?? null,
    secondaryTopicIds: item.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('actionItems', newItem);
  return newItem;
}

export async function updateActionItem(item: ActionItem): Promise<ActionItem> {
  const db = await getDB();
  item.updatedAt = new Date().toISOString();
  await db.put('actionItems', item);
  return item;
}

export async function deleteActionItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('actionItems', id);
  if (item) {
    item.isDeleted = true;
    item.updatedAt = new Date().toISOString();
    await db.put('actionItems', item);
  }
}

// ============================================
// TAGS CRUD
// ============================================

export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB();
  return db.getAll('tags');
}

export async function addTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
  const db = await getDB();
  const newTag: Tag = { ...tag, id: generateId() };
  await db.put('tags', newTag);
  return newTag;
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tags', id);
}

// ============================================
// SETTINGS CRUD
// ============================================

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const setting = await db.get('settings', key);
  return setting?.value as T | undefined;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// ============================================
// TOPIC PLAYBOOK CRUD
// ============================================

export async function getPlaybookByTopic(topicId: string): Promise<TopicPlaybook | undefined> {
  const db = await getDB();
  const playbooks = await db.getAllFromIndex('topicPlaybooks', 'by-topicId', topicId);
  return playbooks.find((p) => !p.isDeleted);
}

export async function updatePlaybook(playbook: TopicPlaybook): Promise<TopicPlaybook> {
  const db = await getDB();
  playbook.updatedAt = new Date().toISOString();
  await db.put('topicPlaybooks', playbook);
  return playbook;
}

// ============================================
// URGE EVENTS CRUD
// ============================================

export async function addUrgeEvent(
  event: Omit<UrgeEvent, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
): Promise<UrgeEvent> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newEvent: UrgeEvent = {
    ...event,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('urgeEvents', newEvent);
  return newEvent;
}

export async function getAllUrgeEvents(): Promise<UrgeEvent[]> {
  const db = await getDB();
  const events = await db.getAll('urgeEvents');
  return events
    .filter((e) => !e.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ============================================
// GRATITUDE ENTRIES CRUD
// ============================================

export async function addGratitudeEntry(
  entry: Omit<GratitudeEntry, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
): Promise<GratitudeEntry> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newEntry: GratitudeEntry = {
    ...entry,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('gratitudeEntries', newEntry);
  return newEntry;
}

export async function getAllGratitudeEntries(): Promise<GratitudeEntry[]> {
  const db = await getDB();
  const entries = await db.getAll('gratitudeEntries');
  return entries
    .filter((e) => !e.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ============================================
// HALF POWER ENTRIES CRUD
// ============================================

export async function addHalfPowerEntry(
  entry: Omit<HalfPowerEntry, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
): Promise<HalfPowerEntry> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newEntry: HalfPowerEntry = {
    ...entry,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('halfPowerEntries', newEntry);
  return newEntry;
}

// ============================================
// NOW CHECKINS CRUD
// ============================================

export async function addNowCheckin(
  checkin: Omit<NowCheckin, 'id' | 'createdAt' | 'isDeleted'>
): Promise<NowCheckin> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newCheckin: NowCheckin = {
    ...checkin,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('nowCheckins', newCheckin);
  return newCheckin;
}

// ============================================
// WAVE MODE SESSIONS CRUD
// ============================================

export async function addWaveModeSession(
  session: Omit<WaveModeSession, 'id' | 'createdAt' | 'isDeleted'>
): Promise<WaveModeSession> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newSession: WaveModeSession = {
    ...session,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('waveModeSessions', newSession);
  return newSession;
}

export async function updateWaveModeSession(session: WaveModeSession): Promise<WaveModeSession> {
  const db = await getDB();
  await db.put('waveModeSessions', session);
  return session;
}

// ============================================
// TOPIC TOOLS CRUD
// ============================================

export async function getToolsByTopic(topicId: string): Promise<TopicTool[]> {
  const db = await getDB();
  const tools = await db.getAllFromIndex('topicTools', 'by-topicId', topicId);
  return tools.filter((t) => !t.isDeleted).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addTopicTool(
  tool: Omit<TopicTool, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
): Promise<TopicTool> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newTool: TopicTool = {
    ...tool,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('topicTools', newTool);
  return newTool;
}

export async function addToolUsage(
  usage: Omit<ToolUsage, 'id' | 'createdAt' | 'isDeleted'>
): Promise<ToolUsage> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newUsage: ToolUsage = {
    ...usage,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('toolUsages', newUsage);
  return newUsage;
}

// ============================================
// MICRO BOUNDARIES CRUD
// ============================================

export async function addMicroBoundary(
  boundary: Omit<MicroBoundary, 'id' | 'createdAt' | 'isDeleted'>
): Promise<MicroBoundary> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newBoundary: MicroBoundary = {
    ...boundary,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('microBoundaries', newBoundary);
  return newBoundary;
}

export async function getTodayMicroBoundary(): Promise<MicroBoundary | undefined> {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  const boundaries = await db.getAllFromIndex('microBoundaries', 'by-date', today);
  return boundaries.find((b) => !b.isDeleted);
}

// ============================================
// CHOICE LOG CRUD
// ============================================

export async function addChoiceLog(
  log: Omit<ChoiceLog, 'id' | 'createdAt' | 'isDeleted'>
): Promise<ChoiceLog> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newLog: ChoiceLog = {
    ...log,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('choiceLogs', newLog);
  return newLog;
}

// ============================================
// DECISION LOG CRUD
// ============================================

export async function addDecisionLog(
  log: Omit<DecisionLog, 'id' | 'createdAt' | 'isDeleted'>
): Promise<DecisionLog> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newLog: DecisionLog = {
    ...log,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('decisionLogs', newLog);
  return newLog;
}

// ============================================
// REPAIR NOTES CRUD
// ============================================

export async function addRepairNote(
  note: Omit<RepairNote, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
): Promise<RepairNote> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newNote: RepairNote = {
    ...note,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('repairNotes', newNote);
  return newNote;
}

// ============================================
// COOLING WINDOWS CRUD
// ============================================

export async function addCoolingWindow(
  window_: Omit<CoolingWindow, 'id' | 'createdAt' | 'isDeleted'>
): Promise<CoolingWindow> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newWindow: CoolingWindow = {
    ...window_,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('coolingWindows', newWindow);
  return newWindow;
}

// ============================================
// TEN MINUTE DEFERS CRUD
// ============================================

export async function addTenMinuteDefer(
  defer: Omit<TenMinuteDefer, 'id' | 'createdAt' | 'isDeleted'>
): Promise<TenMinuteDefer> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newDefer: TenMinuteDefer = {
    ...defer,
    id: generateId(),
    createdAt: now,
    isDeleted: false,
  };
  await db.put('tenMinuteDefers', newDefer);
  return newDefer;
}

// ============================================
// INBOX HELPERS
// ============================================

export async function getInboxCount(): Promise<number> {
  const entries = await getAllEntries();
  const highlights = await getAllHighlights();
  const agendaItems = await getAllAgendaItems();
  const inboxEntries = entries.filter((e) => e.primaryTopicId === null);
  const inboxHighlights = highlights.filter((h) => h.primaryTopicId === null);
  const inboxAgenda = agendaItems.filter((a) => a.primaryTopicId === null);
  return inboxEntries.length + inboxHighlights.length + inboxAgenda.length;
}

export async function getInboxItems(): Promise<Array<{
  type: 'entry' | 'highlight' | 'agenda';
  id: string;
  text: string;
  date: string;
}>> {
  const entries = await getAllEntries();
  const highlights = await getAllHighlights();
  const agendaItems = await getAllAgendaItems();

  const items: Array<{ type: 'entry' | 'highlight' | 'agenda'; id: string; text: string; date: string }> = [];

  for (const e of entries.filter((x) => x.primaryTopicId === null)) {
    items.push({ type: 'entry', id: e.id, text: e.content.slice(0, 120), date: e.createdAt });
  }
  for (const h of highlights.filter((x) => x.primaryTopicId === null)) {
    items.push({ type: 'highlight', id: h.id, text: h.text.slice(0, 120), date: h.createdAt });
  }
  for (const a of agendaItems.filter((x) => x.primaryTopicId === null)) {
    items.push({ type: 'agenda', id: a.id, text: a.text.slice(0, 120), date: a.createdAt });
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function assignTopicToItem(
  type: 'entry' | 'highlight' | 'agenda',
  id: string,
  topicId: string
): Promise<void> {
  const db = await getDB();
  if (type === 'entry') {
    const entry = await db.get('entries', id);
    if (entry) {
      entry.primaryTopicId = topicId;
      entry.updatedAt = new Date().toISOString();
      await db.put('entries', entry);
    }
  } else if (type === 'highlight') {
    const highlight = await db.get('highlights', id);
    if (highlight) {
      highlight.primaryTopicId = topicId;
      highlight.updatedAt = new Date().toISOString();
      await db.put('highlights', highlight);
    }
  } else if (type === 'agenda') {
    const item = await db.get('agendaItems', id);
    if (item) {
      item.primaryTopicId = topicId;
      item.updatedAt = new Date().toISOString();
      await db.put('agendaItems', item);
    }
  }
}

// ============================================
// TOPIC STATS
// ============================================

export async function getTopicStats(topicId: string): Promise<{
  openAgenda: number;
  totalEntries: number;
  lastActivity: string | null;
}> {
  const agendaItems = await getAllAgendaItems();
  const entries = await getAllEntries();

  const topicAgenda = agendaItems.filter(
    (a) => a.primaryTopicId === topicId && a.status === 'open'
  );
  const topicEntries = entries.filter((e) => e.primaryTopicId === topicId);

  const allDates = [
    ...topicAgenda.map((a) => a.createdAt),
    ...topicEntries.map((e) => e.updatedAt),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return {
    openAgenda: topicAgenda.length,
    totalEntries: topicEntries.length,
    lastActivity: allDates[0] || null,
  };
}

// ============================================
// RECORDINGS CRUD
// ============================================

export async function getRecordingsByEntry(entryId: string): Promise<Recording[]> {
  const db = await getDB();
  const recordings = await db.getAllFromIndex('recordings', 'by-entry', entryId);
  return recordings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addRecording(
  recording: Omit<Recording, 'id' | 'createdAt'>
): Promise<Recording> {
  const db = await getDB();
  const newRecording: Recording = {
    ...recording,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await db.put('recordings', newRecording);
  return newRecording;
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('recordings', id);
}

// ============================================
// GOALS CRUD
// ============================================

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDB();
  const goals = await db.getAll('goals');
  return goals
    .filter((g) => !g.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getGoal(id: string): Promise<Goal | undefined> {
  const db = await getDB();
  return db.get('goals', id);
}

export async function getPinnedGoal(): Promise<Goal | undefined> {
  const all = await getAllGoals();
  return all.find((g) => g.pinned && g.status === 'active');
}

export async function addGoal(
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<Goal> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    primaryTopicId: goal.primaryTopicId ?? null,
    secondaryTopicIds: goal.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('goals', newGoal);
  return newGoal;
}

export async function updateGoal(goal: Goal): Promise<Goal> {
  const db = await getDB();
  goal.updatedAt = new Date().toISOString();
  await db.put('goals', goal);
  return goal;
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB();
  const goal = await db.get('goals', id);
  if (goal) {
    goal.isDeleted = true;
    goal.updatedAt = new Date().toISOString();
    await db.put('goals', goal);
  }
}

// ============================================
// WISHES CRUD
// ============================================

export async function getAllWishes(): Promise<Wish[]> {
  const db = await getDB();
  const wishes = await db.getAll('wishes');
  return wishes
    .filter((w) => !w.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addWish(
  wish: Omit<Wish, 'id' | 'createdAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<Wish> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newWish: Wish = {
    ...wish,
    id: generateId(),
    primaryTopicId: wish.primaryTopicId ?? null,
    secondaryTopicIds: wish.secondaryTopicIds ?? [],
    createdAt: now,
    isDeleted: false,
  };
  await db.put('wishes', newWish);
  return newWish;
}

export async function deleteWish(id: string): Promise<void> {
  const db = await getDB();
  const wish = await db.get('wishes', id);
  if (wish) {
    wish.isDeleted = true;
    await db.put('wishes', wish);
  }
}

// ============================================
// LETTERS TO SELF CRUD
// ============================================

export async function getAllLetters(): Promise<LetterToSelf[]> {
  const db = await getDB();
  const letters = await db.getAll('lettersToSelf');
  return letters
    .filter((l) => !l.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addLetter(
  letter: Omit<LetterToSelf, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<LetterToSelf> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newLetter: LetterToSelf = {
    ...letter,
    id: generateId(),
    primaryTopicId: letter.primaryTopicId ?? null,
    secondaryTopicIds: letter.secondaryTopicIds ?? [],
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('lettersToSelf', newLetter);
  return newLetter;
}

export async function updateLetter(letter: LetterToSelf): Promise<LetterToSelf> {
  const db = await getDB();
  letter.updatedAt = new Date().toISOString();
  await db.put('lettersToSelf', letter);
  return letter;
}

export async function deleteLetter(id: string): Promise<void> {
  const db = await getDB();
  const letter = await db.get('lettersToSelf', id);
  if (letter) {
    letter.isDeleted = true;
    letter.updatedAt = new Date().toISOString();
    await db.put('lettersToSelf', letter);
  }
}

// ============================================
// STRENGTHS CRUD
// ============================================

export async function getAllStrengths(): Promise<Strength[]> {
  const db = await getDB();
  const strengths = await db.getAll('strengths');
  return strengths
    .filter((s) => !s.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addStrength(
  strength: Omit<Strength, 'id' | 'createdAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<Strength> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newStrength: Strength = {
    ...strength,
    id: generateId(),
    primaryTopicId: strength.primaryTopicId ?? null,
    secondaryTopicIds: strength.secondaryTopicIds ?? [],
    createdAt: now,
    isDeleted: false,
  };
  await db.put('strengths', newStrength);
  return newStrength;
}

export async function deleteStrength(id: string): Promise<void> {
  const db = await getDB();
  const s = await db.get('strengths', id);
  if (s) {
    s.isDeleted = true;
    await db.put('strengths', s);
  }
}

// ============================================
// VALUES CRUD
// ============================================

export async function getAllValues(): Promise<Value[]> {
  const db = await getDB();
  const values = await db.getAll('values');
  return values
    .filter((v) => !v.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addValue(
  value: Omit<Value, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'primaryTopicId'> & {
    primaryTopicId?: string | null;
  }
): Promise<Value> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newValue: Value = {
    ...value,
    id: generateId(),
    primaryTopicId: value.primaryTopicId ?? null,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };
  await db.put('values', newValue);
  return newValue;
}

export async function updateValue(value: Value): Promise<Value> {
  const db = await getDB();
  value.updatedAt = new Date().toISOString();
  await db.put('values', value);
  return value;
}

export async function deleteValue(id: string): Promise<void> {
  const db = await getDB();
  const v = await db.get('values', id);
  if (v) {
    v.isDeleted = true;
    v.updatedAt = new Date().toISOString();
    await db.put('values', v);
  }
}

// ============================================
// IMAGE ENTRIES CRUD
// ============================================

export async function getAllImageEntries(): Promise<ImageEntry[]> {
  const db = await getDB();
  const images = await db.getAll('imageEntries');
  return images
    .filter((i) => !i.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addImageEntry(
  entry: Omit<ImageEntry, 'id' | 'createdAt' | 'isDeleted' | 'primaryTopicId' | 'secondaryTopicIds'> & {
    primaryTopicId?: string | null;
    secondaryTopicIds?: string[];
  }
): Promise<ImageEntry> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newEntry: ImageEntry = {
    ...entry,
    id: generateId(),
    primaryTopicId: entry.primaryTopicId ?? null,
    secondaryTopicIds: entry.secondaryTopicIds ?? [],
    createdAt: now,
    isDeleted: false,
  };
  await db.put('imageEntries', newEntry);
  return newEntry;
}

export async function deleteImageEntry(id: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get('imageEntries', id);
  if (entry) {
    entry.isDeleted = true;
    await db.put('imageEntries', entry);
    // Also delete the blob
    try { await db.delete('mediaBlobs', entry.blobKey); } catch { /* ok */ }
  }
}

// ============================================
// AUDIO MEMOS CRUD
// ============================================

export async function getAllAudioMemos(): Promise<AudioMemo[]> {
  const db = await getDB();
  const memos = await db.getAll('audioMemos');
  return memos
    .filter((m) => !m.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addAudioMemo(
  memo: Omit<AudioMemo, 'id' | 'createdAt' | 'isDeleted' | 'primaryTopicId'> & {
    primaryTopicId?: string | null;
  }
): Promise<AudioMemo> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newMemo: AudioMemo = {
    ...memo,
    id: generateId(),
    primaryTopicId: memo.primaryTopicId ?? null,
    createdAt: now,
    isDeleted: false,
  };
  await db.put('audioMemos', newMemo);
  return newMemo;
}

export async function deleteAudioMemo(id: string): Promise<void> {
  const db = await getDB();
  const memo = await db.get('audioMemos', id);
  if (memo) {
    memo.isDeleted = true;
    await db.put('audioMemos', memo);
    // Also delete the blob
    try { await db.delete('mediaBlobs', memo.blobKey); } catch { /* ok */ }
  }
}

// ============================================
// MEDIA BLOBS CRUD
// ============================================

export async function saveMediaBlob(blob: Blob, mimeType: string): Promise<string> {
  const db = await getDB();
  const key = generateId();
  const media: MediaBlob = {
    key,
    blob,
    mimeType,
    createdAt: new Date().toISOString(),
  };
  await db.put('mediaBlobs', media);
  return key;
}

export async function getMediaBlob(key: string): Promise<MediaBlob | undefined> {
  const db = await getDB();
  return db.get('mediaBlobs', key);
}

export async function deleteMediaBlob(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('mediaBlobs', key);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export async function exportAllData(): Promise<{
  topics: Topic[];
  sessions: Session[];
  entries: DailyEntry[];
  highlights: Highlight[];
  agendaItems: AgendaItem[];
  actionItems: ActionItem[];
  tags: Tag[];
}> {
  const db = await getDB();
  return {
    topics: await db.getAll('topics'),
    sessions: await db.getAll('sessions'),
    entries: await db.getAll('entries'),
    highlights: await db.getAll('highlights'),
    agendaItems: await db.getAll('agendaItems'),
    actionItems: await db.getAll('actionItems'),
    tags: await db.getAll('tags'),
  };
}

export async function exportToMarkdown(startDate?: string, endDate?: string): Promise<string> {
  const data = await exportAllData();
  const topics = data.topics.filter((t) => !t.isDeleted);

  let md = `# MindVault Export\n\n`;
  md += `**תאריך יצוא:** ${new Date().toLocaleDateString('he-IL')}\n\n`;

  const filterByDate = (date: string) => {
    if (!startDate && !endDate) return true;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  // Sessions
  const filteredSessions = data.sessions.filter((s) => !s.isDeleted && filterByDate(s.date));
  if (filteredSessions.length > 0) {
    md += `## סיכומי פגישות\n\n`;
    for (const session of filteredSessions) {
      const topic = topics.find((t) => t.id === session.primaryTopicId);
      const topicLabel = topic ? ` [${topic.icon} ${topic.name}]` : '';
      md += `### ${new Date(session.date).toLocaleDateString('he-IL')}${topicLabel}\n\n`;
      md += `${session.summary}\n\n---\n\n`;
    }
  }

  // Entries
  const filteredEntries = data.entries.filter((e) => !e.isDeleted && filterByDate(e.date));
  if (filteredEntries.length > 0) {
    md += `## רשומות יומיות\n\n`;
    for (const entry of filteredEntries) {
      const topic = topics.find((t) => t.id === entry.primaryTopicId);
      const topicLabel = topic ? ` [${topic.icon} ${topic.name}]` : ' [📥 Inbox]';
      md += `### ${new Date(entry.date).toLocaleDateString('he-IL')}${topicLabel}\n\n`;
      if (entry.tags.length > 0) {
        md += `**תגיות:** ${entry.tags.join(', ')}\n\n`;
      }
      md += `${entry.content}\n\n---\n\n`;
    }
  }

  // Highlights
  const highlights = data.highlights.filter((h) => !h.isDeleted);
  if (highlights.length > 0) {
    md += `## הארות\n\n`;
    for (const highlight of highlights) {
      const topic = topics.find((t) => t.id === highlight.primaryTopicId);
      const topicLabel = topic ? ` (${topic.icon} ${topic.name})` : '';
      md += `- ${highlight.text}${topicLabel}\n`;
    }
    md += `\n`;
  }

  // Agenda Items
  const openItems = data.agendaItems.filter((i) => !i.isDeleted && i.status === 'open');
  if (openItems.length > 0) {
    md += `## אג'נדה לפגישה הבאה\n\n`;
    for (const item of openItems.sort((a, b) => a.priority - b.priority)) {
      const topic = topics.find((t) => t.id === item.primaryTopicId);
      const topicLabel = topic ? ` [${topic.icon}]` : '';
      md += `${item.priority + 1}. ${item.text}${topicLabel}\n`;
    }
    md += `\n`;
  }

  return md;
}
