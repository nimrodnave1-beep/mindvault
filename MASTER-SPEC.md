# MindVault — מסמך מאסטר סופי למפתחים

**גרסה:** 3.1 (Master — Reviewed)  
**סטטוס:** מוכן לפיתוח  
**עדכון אחרון:** 6 בפברואר 2026  
**מאחד:** PRD-DEVELOPERS.md v2.0 + FEEDBACK-v1.1.md + TOPICS-SYSTEM-SPEC.md v1.1

---

## תוכן עניינים

| # | פרק | תיאור |
|---|------|-------|
| 1 | [סקירה מהירה](#1-סקירה-מהירה) | מה זה, למי, Stack |
| 2 | [עקרונות ליבה](#2-עקרונות-ליבה) | עקרונות טכניים, UX, ו-Topic-centric |
| 3 | [Topic System — שלד המערכת](#3-topic-system--שלד-המערכת) | Inbox Pattern, Visual Context, Privacy per Topic |
| 4 | [מודל נתונים מלא](#4-מודל-נתונים-מלא) | כל ה-Entities — Core + Topics + Therapeutic |
| 5 | [IndexedDB Schema](#5-indexeddb-schema) | כל ה-Stores + Indexes |
| 6 | [מסכים וניווט](#6-מסכים-וניווט) | IA, Bottom Nav, Topics Home, Topic Detail |
| 7 | [מודולים — Core](#7-מודולים--core) | Today, Agenda, Therapy, Journey, Packet, Vault |
| 8 | [מודולים — טיפוליים](#8-מודולים--טיפוליים) | Insights, Gratitude, Goals, Tracking, Session Close, Therapy Questions, Trigger Log, Wins, Cycle Summary |
| 9 | [מודולים — פרוטוקולים (Wizards)](#9-מודולים--פרוטוקולים-wizards) | Urge Protocol, Trigger vs Hurt, Half Power |
| 10 | [מודולים — Topic-Specific](#10-מודולים--topic-specific) | שוק ההון, זוגיות, סטרס, שינה |
| 11 | [מודולים — Cross-Topic](#11-מודולים--cross-topic) | Ten Minutes Rule, One Sentence, Choice Log, Toolbox, Internal Validation |
| 12 | [Journey — מפרט מלא](#12-journey--מפרט-מלא) | Scope, Tabs, Cross-Topic View, Milestones |
| 13 | [עיצוב ו-UX](#13-עיצוב-ו-ux) | Design System, Component Patterns, UX Guidelines, Empty States |
| 14 | [אבטחה ופרטיות](#14-אבטחה-ופרטיות) | Threat Model, Encryption, Recovery Key, Privacy per Topic |
| 15 | [סדר בנייה — Roadmap](#15-סדר-בנייה--roadmap) | Phase A-F + Sprint Plan |
| 16 | [מדדי הצלחה](#16-מדדי-הצלחה) | KPIs |
| 17 | [שאלות פתוחות](#17-שאלות-פתוחות) | החלטות שנותרו |
| 18 | [מחוץ לסקופ](#18-מחוץ-לסקופ) | מה לא נעשה |
| 19 | [נספח: User Stories](#19-נספח-user-stories) | סיפורי משתמש |

---

## 1. סקירה מהירה

### מה זה MindVault?

**עוזר אישי לניהול תהליך טיפולי בין פגישות.**

פותר את "החור השחור": תובנות שנשכחות, אירועים שלא מגיעים לפגישה, סיכומים שמתפזרים.

### ערך מפתח

> *"התובנות שלך הן שלך בלבד. שום אלגוריתם לא קורא אותן."*

### ארכיטקטורה — Topic-Centric

**Topics הופך לשלד של כל האפליקציה.** במקום אפליקציה "שטוחה" עם מודולים (Today, Agenda, Journey...), המערכת עוברת למודל **Topic-centric**: כל דבר שייך לנושא, וכל נושא מכיל את כל המודולים.

### Stack טכנולוגי

| שכבה | טכנולוגיה | הערות |
|------|-----------|-------|
| Frontend | React + Next.js 14 | App Router |
| תצורה | PWA | Service Worker + Manifest |
| אחסון | IndexedDB (idb) | Offline-first |
| הצפנה | AES-GCM + PBKDF2 | מפתח מ-PIN |
| UI | Tailwind CSS | Design Tokens מותאמים |
| חיפוש | FlexSearch (מומלץ) | Client-side full-text |
| Cloud | **אין** ב-MVP | Phase 2: E2E encrypted sync |

---

## 2. עקרונות ליבה

### עקרונות טכניים לא מתפשרים

| עקרון | משמעות למפתח |
|-------|---------------|
| **Zero AI** | אסור שום קריאה ל-API של AI/LLM. אין תיוג/סיכום/ניתוח אוטומטי |
| **Offline-first** | האפליקציה חייבת לעבוד בלי אינטרנט. IndexedDB = מקור האמת |
| **אפס אשמה** | אין streaks, אין "פספסת", אין התראות מעיקות |
| **פרטיות מלאה** | PIN + הצפנה + מצב דיסקרטי. הכל מקומי |
| **פעולה אחת** | כל פעולה מרכזית — לחיצה אחת בלבד |
| **Manual Only** | כל תיוג, קטגוריזציה וארגון — ע"י המשתמש בלבד |

### עקרונות UX

| עקרון | יישום |
|-------|-------|
| **מינימום שורה אחת** | כל רובריקה עובדת עם שדה אחד חובה + "להעמיק" |
| **ברירת מחדל = חופשי** | הרובריקות הן כפתורים, לא שדות חובה |
| **Progressive disclosure** | מראים פשוט, מרחיבים רק למי שרוצה |
| **Mobile-first** | כל עיצוב מתחיל ממובייל |
| **Warm & Safe** | שפה עיצובית חמה, מזמינה, לא קלינית |

### עקרונות מערכתיים (חדשים)

| עקרון | משמעות |
|-------|--------|
| **Topic כקונטקסט** | כל פריט שייך לנושא. הנושא נותן הקשר טיפולי: כלים, פרוטוקול, היסטוריה |
| **שיטת המגירות (Inbox)** | כתיבה קודם, שיוך אחר כך. אם המשתמש לחוץ — הכל נכנס ל-Inbox |
| **פרוטוקולים כ-Wizards** | כל פרוטוקול טיפולי הוא תהליך שלב-אחר-שלב, לא טופס ארוך |
| **Visual Context** | לכל Topic צבע מוביל. כשנכנסים לנושא — ה-UI משתנה. שינוי סטייט תודעתי דרך ה-UI |

---

## 3. Topic System — שלד המערכת

### 3.1 מהו Topic

Topic = נושא טיפולי שהמשתמש מגדיר. לכל Topic יש שם, אייקון (emoji), צבע, ו-Playbook אישי.

**דוגמאות:** שוק ההון, זוגיות, סטרס, שינה, עבודה, הורות, ביקורת עצמית, גבולות.

### 3.2 שיוך פריטים — Inbox Pattern

**כל entity במערכת** מקבל שיוך ל-Topic:

| שדה | סוג | חובה? | תיאור |
|-----|------|-------|-------|
| `primaryTopicId` | `string (UUID) \| null` | **לא** | הנושא הראשי. `null` = **Inbox** (לא שויך) |
| `secondaryTopicIds` | `string[]` | לא | נושאים נוספים (0-3 מומלץ) |

**ברירת מחדל:** ה-Topic האחרון שהמשתמש השתמש בו (שמור ב-`settings` store, key: `lastActiveTopicId`).  
**Inbox default:** כתיבה מהירה בלי Topic → `primaryTopicId = null`.

#### The Global Inbox

**בעיה:** בחירת Topic בזמן סערה רגשית = חיכוך שמעכב כתיבה.

**פתרון:** כפתור "כתיבה מהירה" תמיד זמין, ללא חובת שיוך. פריטים ללא Topic נכנסים ל-**Inbox**.

**"למיין את המגירה" Flow:**
1. כשיש 3+ פריטים ב-Inbox → באנר עדין במסך "היום": "יש לך X פריטים ללא נושא. רוצה למיין?"
2. לחיצה → מסך מיון מהיר (Tinder-style או רשימה): פריט + chips של Topics
3. כפתור "דלג" (נשאר ב-Inbox)
4. Toast "מסודר! X פריטים שויכו."

**חוקי Inbox:**

| כלל | פירוט |
|-----|-------|
| תדירות באנר | פעם ביום מקסימום |
| אין Inbox enforcement | פריטים יכולים להישאר ב-Inbox לנצח — **אפס אשמה** |
| Journey | פריטי Inbox מופיעים עם badge "📥 לא שויך" |
| Agenda | פריטי Inbox **כן** מופיעים באג'נדה הכללית |
| חיפוש | Inbox נכלל בחיפוש כללי |

### 3.3 ניהול Topics

| פעולה | פירוט |
|-------|-------|
| יצירה | שם + אייקון (emoji) + צבע (מתוך פלטה קבועה) |
| עריכה | שינוי שם / אייקון / צבע |
| Archive | נושא לא פעיל — לא מופיע ברשימות, הנתונים נשמרים |
| Unarchive | החזרה לפעיל |
| מחיקה | **אין מחיקה.** רק Archive |
| סדר | Drag & drop לסדר ב-Topics Home |

### 3.4 מגבלות

| מגבלה | ערך | סוג |
|-------|-----|------|
| נושאים פעילים | 4–8 | **Soft limit** — הודעה ידידותית אחרי 8 |
| נושאים מקסימום (כולל archived) | 20 | **Hard limit** |
| אורך שם | 30 תווים | Hard limit |
| Secondary topics per item | 3 | Hard limit |

### 3.5 Visual Context — צבע מוביל

כשהמשתמש נכנס ל-Topic Detail Screen, ה-UI משתנה:

| רכיב | שינוי |
|------|-------|
| **Header background** | Gradient עדין מ-`topic.color` ל-transparent |
| **CTA buttons** | `topic.color` כ-accent |
| **Tab indicator** | `topic.color` underline |
| **Card borders** | `topic.color` בעוצמה 20% (subtle) |
| **Playbook Emergency button** | `topic.color` כ-background |

**טכנית:** CSS variable `--topic-accent` מוגדר ברמת ה-Topic Detail layout. Light variant: `--topic-accent-light` (20% opacity).

### 3.6 Privacy per Topic

| הגדרה | פירוט |
|-------|-------|
| `requirePin` | Topic דורש PIN מחדש בכל כניסה |
| `blurByDefault` | כרטיס מטושטש ב-Topics Home. נגישות רק דרך long-press |
| `hideFromJourney` | פריטים לא מופיעים ב-Journey "הכל" — רק ב-Journey של ה-Topic |

### 3.7 Topic מובנה: "כללי"

תמיד קיים, לא ניתן למחיקה/ארכוב. `id` קבוע בקוד (`GENERAL_TOPIC_ID`). שם: "כללי", אייקון: "📝", `isDefault: true`.

---

## 4. מודל נתונים מלא

### 4.0 Data Conventions

| נושא | סטנדרט |
|------|--------|
| **IDs** | UUID v4 בכל ה-stores. `sourceId` תמיד UUID — **אסור** ערכים חופשיים כמו "sessionSummary" |
| **תאריכים (date)** | `YYYY-MM-DD` (local timezone) |
| **Timestamps** | ISO 8601 עם timezone: `2026-02-06T14:30:00+02:00` |
| **Soft Delete** | `deletedAt: string \| null` בכל entity |
| **Trash Policy** | פריט שנמחק (deletedAt !== null) נשמר 30 יום. אחרי 30 יום — נמחק לצמיתות. Trash UI: רשימת פריטים מחוקים עם כפתור "שחזר" |
| **Sync Readiness** | `updatedAt` + `deletedAt` בכל entity |
| **deviceId** | שדה אופציונלי `deviceId: string \| null` על כל entity — מזהה מקור. ריק ב-MVP, חוסך migration כואבת ב-Phase 2 (sync) |

---

### 4.1 Topic

```typescript
interface Topic {
  id: string;                    // UUID
  name: string;                  // מקסימום 30 תווים
  icon: string;                  // emoji
  color: string;                 // hex מתוך פלטה קבועה
  northStarSentence: string;     // "משפט הבית" — חוזה עם עצמי (אופציונלי)
  sortOrder: number;
  isDefault: boolean;            // true רק ל"כללי"
  isArchived: boolean;
  // --- Privacy ---
  requirePin: boolean;
  topicPin: string | null;       // hash של PIN ייעודי (null = PIN גלובלי)
  blurByDefault: boolean;
  hideFromJourney: boolean;
  // --- Meta ---
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

**Color palette:**
```
#6B4EE6  (סגול)      #E64E8A  (ורוד)      #E6854E  (כתום)
#E6C84E  (צהוב)      #4EE66B  (ירוק)      #4EB8E6  (תכלת)
#4E6BE6  (כחול)      #8A4EE6  (סגול כהה)  #E64E4E  (אדום)
#6B7280  (אפור — ל"כללי")
```

---

### 4.2 TherapyCycle

**מוחלט: Cycles נשמרים ב-IndexedDB** (לא computed).

```typescript
interface TherapyCycle {
  id: string;
  startDate: string;             // YYYY-MM-DD (תאריך פגישה)
  endDate: string | null;        // null = סייקל פתוח
  createdAt: string;
}
```

**לוגיקת סייקלים:**
- סייקל חדש נפתח בכל session חדשה
- סייקל פתוח (endDate=null) כשאין פגישה הבאה
- אם אין sessions בכלל → סייקל אחד פתוח מהתקנה
- עריכת/מחיקת session → מחשב מחדש cycleIds

---

### 4.3 Core Entities

```typescript
interface Session {
  id: string;
  date: string;
  summary: string;
  cycleId: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface DailyEntry {
  id: string;
  date: string;
  content: string;
  cycleId: string;
  tags: string[];
  entryType?: 'free' | 'thought' | 'feeling' | 'gratitude' | 'win';
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Highlight {
  id: string;
  text: string;
  textSnapshot: string;
  startOffset: number;
  endOffset: number;
  sourceEntryId: string | null;
  sourceType: 'entry' | 'session' | 'manual';
  cycleId: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  deletedAt: string | null;
}

interface AgendaItem {
  id: string;
  text: string;
  priority: number;
  sourceId: string | null;
  sourceType: 'entry' | 'session' | 'insight' | 'gratitude' | 'goal' | 'manual';
  status: 'open' | 'done';
  cycleId: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ActionItem {
  id: string;
  text: string;
  frequency: 'daily' | 'weekly' | 'once';
  targetDate: string | null;
  status: 'pending' | 'tried' | 'skipped' | 'hard';
  cycleId: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}
```

---

### 4.4 Therapeutic Entities

```typescript
interface Insight {
  id: string;
  title: string;                 // חובה — משפט אחד
  body: string | null;
  type: 'pattern' | 'boundary' | 'tool' | 'thought' | 'emotion' | 'other';
  tags: string[];
  cycleId: string;
  sourceType: 'entry' | 'session' | 'standalone' | null;
  sourceId: string | null;
  sourceRange: {
    startOffset: number;
    endOffset: number;
    snapshot: string;
  } | null;
  pinned: boolean;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GratitudeEntry {
  id: string;
  date: string;
  type: 'quick' | 'deep';
  items: GratitudeItem[];        // 1-3 פריטים
  feeling: string | null;
  memoryNote: string | null;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GratitudeItem {
  text: string;
  why: string | null;
  myContribution: string | null;
  category: 'person' | 'event' | 'self' | null;
}

interface Goal {
  id: string;
  title: string;
  why: string | null;
  horizon: 'weekly' | 'monthly' | 'open';
  targetDate: string | null;
  status: 'active' | 'paused' | 'done' | 'archived';
  progressStage: 'start' | 'middle' | 'advanced' | null;
  tags: string[];
  cycleId: string | null;
  pinned: boolean;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GoalCheckIn {
  id: string;
  goalId: string;
  date: string;
  status: 'on_track' | 'stuck' | 'hard' | 'good';
  note: string | null;
  createdAt: string;
}

interface Tracker {
  id: string;
  name: string;
  valueType: 'boolean' | 'rating_1_5' | 'rating_1_10' | 'count' | 'duration_minutes' | 'note_only';
  frequency: 'daily' | 'weekly' | null;
  unit: string | null;
  tags: string[];
  isActive: boolean;
  primaryTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TrackerEntry {
  id: string;
  trackerId: string;
  date: string;
  value: boolean | number | string;
  note: string | null;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

---

### 4.5 Topic Playbook & Tools

```typescript
interface TopicPlaybook {
  id: string;
  topicId: string;               // unique per topic (1:1)
  northStarSentence: string;     // "משפט הבית"
  rescueToolIds: string[];       // UUID[] של TopicTools — 1-3 כלים
  sections: PlaybookSection[];
  updatedAt: string;
  deletedAt: string | null;
}

interface PlaybookSection {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

interface TopicTool {
  id: string;
  topicId: string;
  name: string;                  // "נשימה 4-7-8"
  whenToUse: string;             // "כשאני מרגיש לחץ"
  signal: string;                // "כשהלסת נועלת"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ToolUsage {
  id: string;
  toolId: string;
  topicId: string;
  entryId: string | null;
  note: string | null;
  createdAt: string;
  deletedAt: string | null;
}
```

---

### 4.6 Protocol Entities

```typescript
interface UrgeEvent {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  // Step 1: זיהוי
  urgeText: string;
  urgeCategory: 'check' | 'send' | 'buy' | 'react' | 'avoid' | 'custom' | null;
  // Step 2: השהיה
  pauseDuration: number;         // שניות
  breathingUsed: boolean;
  // Step 3: מחיר
  costText: string;
  // Step 4: חלופה
  alternativeText: string;
  suggestedToolId: string | null;
  usedSuggestedTool: boolean;
  // Outcome
  outcome: 'resisted' | 'acted' | null;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TriggerHurtEvent {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  // מדחום רגשי
  intensityLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  coolingEnforced: boolean;
  coolingDuration: number;
  // בחירת סוג
  type: 'trigger' | 'hurt';
  // אם trigger:
  regulationDuration: number;
  draftMessage: string;
  // אם hurt:
  boundaryRequest: string;
  boundaryDefinition: string;
  boundaryConsequence: string;
  // Meta
  note: string;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface HalfPowerEntry {
  id: string;
  primaryTopicId: string | null;
  content: string;
  templateType: 'emoji_checkin' | 'action_check' | 'freeform_90s' | 'one_sentence' | 'facts_only' | 'custom';
  emojiMood: string | null;
  actionCheckText: string | null;
  actionCheckResult: boolean | null;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface InternalValidation {
  id: string;
  primaryTopicId: string;
  triggeredAt: string;
  affirmationShown: string;
  durationSeconds: number;
  didSendAfter: boolean | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface ValidationAffirmation {
  id: string;
  text: string;
  primaryTopicId: string | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  deletedAt: string | null;
}
```

---

### 4.7 Topic-Specific Entities

```typescript
// === שוק ההון ===

interface MarketInterruptPlan {
  id: string;
  primaryTopicId: string;
  checkTime: string;             // "09:00"
  actionCondition: string;
  doNotList: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface CoolingWindow {
  id: string;
  primaryTopicId: string;
  startedAt: string;
  endsAt: string;
  reason: string;
  completed: boolean;
  createdAt: string;
  deletedAt: string | null;
}

interface DecisionLog {
  id: string;
  primaryTopicId: string;
  action: string;
  reason: string;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// === זוגיות ===

interface RepairNote {
  id: string;
  primaryTopicId: string;
  secondaryTopicIds: string[];
  responsibility: string;
  request: string;
  appreciation: string;
  linkedTriggerHurtId: string | null;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface BoundaryDraft {
  id: string;
  request: string;
  boundary: string;
  consequence: string;
  targetPerson: string | null;
  status: 'draft' | 'practiced' | 'used';
  primaryTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// === סטרס ===

interface NowCheckin {
  id: string;
  primaryTopicId: string;
  body: string;
  urgeLevel: 1 | 2 | 3 | 4 | 5;
  choice: string;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface WaveModeSession {
  id: string;
  primaryTopicId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  breathingUsed: boolean;
  noteAfter: string;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface MicroBoundary {
  id: string;
  primaryTopicId: string;
  text: string;
  date: string;
  kept: boolean | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// === שינה ===

interface SleepLog {
  id: string;
  primaryTopicId: string;
  date: string;
  bedTime: string;               // "23:30"
  wakeTime: string;              // "07:15"
  quality: 1 | 2 | 3 | 4 | 5;
  disturbance: string;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface WindDownRoutine {
  id: string;
  primaryTopicId: string;
  steps: RoutineStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface RoutineStep {
  id: string;
  text: string;
  sortOrder: number;
}

interface PhoneRule {
  id: string;
  primaryTopicId: string;
  ruleType: 'other_room' | 'face_down' | 'silent' | 'custom';
  customText: string;
  timerMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

---

### 4.8 Cross-Topic Entities

```typescript
interface TenMinuteDefer {
  id: string;
  primaryTopicId: string;
  urgeDescription: string;
  deferredAt: string;
  expiresAt: string;
  didActAfter: boolean | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface OneSentenceEntry {
  id: string;
  primaryTopicId: string;
  sentence: string;              // מקסימום 280 תווים
  prompt: 'decision' | 'feeling' | 'choice' | 'custom';
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface ChoiceLog {
  id: string;
  primaryTopicId: string;
  didNotDo: string;
  cycleId: string;
  date: string;
  createdAt: string;
  deletedAt: string | null;
}

// === שאלות לטיפול (נפרד מאג'נדה) ===

interface TherapyQuestion {
  id: string;
  text: string;                  // נוסח השאלה
  why: string | null;            // למה זה חשוב — הקשר קצר
  sourceId: string | null;       // קישור ל-entry / insight / session
  sourceType: 'entry' | 'session' | 'insight' | null;
  status: 'open' | 'discussed';
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

// === Trigger Log מינימלי (3 שדות, 10 שניות) ===

interface TriggerLog {
  id: string;
  trigger: string;               // "מה הפעיל אותי" — ביקורת מהבוס
  automaticResponse: string;     // "תגובה אוטומטית" — מילה אחת: נסיגה
  alternative: string;           // "מה הייתי רוצה לעשות אחרת" — מילה אחת: לשאול
  primaryTopicId: string | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// === Wins — ניצחונות יומיים ===

interface WinEntry {
  id: string;
  date: string;
  didWell: string;               // "דבר אחד שעשיתי טוב"
  facedChallenge: string | null; // "דבר אחד שהתמודדתי איתו"
  primaryTopicId: string | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// === Cycle Summary (ידני, סוף סייקל) ===

interface CycleSummary {
  id: string;
  cycleId: string;
  summary: string;               // "מה למדתי בתקופה הזו"
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// === Session Plan (לפני פגישה) ===

interface SessionPlan {
  id: string;
  sessionId: string | null;      // מקושר ל-Session (אופציונלי)
  goal: string;                  // "מה אני רוצה להשיג היום" — משפט אחד
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// === Packet Snapshot (היסטוריית פקטים) ===

interface PacketSnapshot {
  id: string;
  generatedAt: string;           // מתי הופק
  cycleId: string;
  content: string;               // Markdown/JSON snapshot של הפקט
  createdAt: string;
}

// Collections & Views (Phase 2-3)
interface Collection {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

interface SavedView {
  id: string;
  name: string;
  filters: {
    tags?: string[];
    entryTypes?: string[];
    cycleId?: string;
    search?: string;
  };
  createdAt: string;
}
```

---

## 5. IndexedDB Schema

```javascript
const DB_VERSION = 4;

// ===== Core Stores =====
db.createObjectStore('cycles',            { keyPath: 'id' });
db.createObjectStore('sessions',          { keyPath: 'id' });
db.createObjectStore('entries',           { keyPath: 'id' });
db.createObjectStore('highlights',        { keyPath: 'id' });
db.createObjectStore('agendaItems',       { keyPath: 'id' });
db.createObjectStore('actionItems',       { keyPath: 'id' });
db.createObjectStore('tags',             { keyPath: 'id' });
db.createObjectStore('settings',          { keyPath: 'key' });

// ===== Therapeutic Stores =====
db.createObjectStore('insights',          { keyPath: 'id' });
db.createObjectStore('gratitudeEntries',  { keyPath: 'id' });
db.createObjectStore('goals',            { keyPath: 'id' });
db.createObjectStore('goalCheckIns',      { keyPath: 'id' });
db.createObjectStore('trackers',          { keyPath: 'id' });
db.createObjectStore('trackerEntries',    { keyPath: 'id' });

// ===== Topic Stores =====
db.createObjectStore('topics',            { keyPath: 'id' });
db.createObjectStore('topicPlaybooks',    { keyPath: 'id' });
db.createObjectStore('topicTools',        { keyPath: 'id' });
db.createObjectStore('toolUsages',        { keyPath: 'id' });

// ===== Protocol Stores =====
db.createObjectStore('urgeEvents',        { keyPath: 'id' });
db.createObjectStore('triggerHurtEvents', { keyPath: 'id' });
db.createObjectStore('halfPowerEntries',  { keyPath: 'id' });
db.createObjectStore('internalValidations', { keyPath: 'id' });
db.createObjectStore('validationAffirmations', { keyPath: 'id' });

// ===== Topic-Specific Stores =====
db.createObjectStore('marketInterruptPlans', { keyPath: 'id' });
db.createObjectStore('coolingWindows',    { keyPath: 'id' });
db.createObjectStore('decisionLogs',      { keyPath: 'id' });
db.createObjectStore('repairNotes',       { keyPath: 'id' });
db.createObjectStore('boundaryDrafts',    { keyPath: 'id' });
db.createObjectStore('nowCheckins',       { keyPath: 'id' });
db.createObjectStore('waveModeSessions',  { keyPath: 'id' });
db.createObjectStore('microBoundaries',   { keyPath: 'id' });
db.createObjectStore('sleepLogs',         { keyPath: 'id' });
db.createObjectStore('windDownRoutines',  { keyPath: 'id' });
db.createObjectStore('phoneRules',        { keyPath: 'id' });

// ===== Cross-Topic Stores =====
db.createObjectStore('tenMinuteDefers',   { keyPath: 'id' });
db.createObjectStore('oneSentenceEntries', { keyPath: 'id' });
db.createObjectStore('choiceLogs',        { keyPath: 'id' });

// ===== Additional Stores =====
db.createObjectStore('therapyQuestions',  { keyPath: 'id' });
db.createObjectStore('triggerLogs',       { keyPath: 'id' });
db.createObjectStore('winEntries',        { keyPath: 'id' });
db.createObjectStore('cycleSummaries',    { keyPath: 'id' });
db.createObjectStore('sessionPlans',      { keyPath: 'id' });
db.createObjectStore('packetSnapshots',   { keyPath: 'id' });

// ===== Indexes =====

// Core
entries.createIndex('by-date', 'date');
entries.createIndex('by-cycleId', 'cycleId');
entries.createIndex('by-primaryTopicId', 'primaryTopicId');
sessions.createIndex('by-date', 'date');
sessions.createIndex('by-primaryTopicId', 'primaryTopicId');
highlights.createIndex('by-cycleId', 'cycleId');
highlights.createIndex('by-primaryTopicId', 'primaryTopicId');
agendaItems.createIndex('by-cycleId', 'cycleId');
agendaItems.createIndex('by-status', 'status');
agendaItems.createIndex('by-priority', 'priority');
agendaItems.createIndex('by-primaryTopicId', 'primaryTopicId');
actionItems.createIndex('by-primaryTopicId', 'primaryTopicId');

// Therapeutic
insights.createIndex('by-cycleId', 'cycleId');
insights.createIndex('by-type', 'type');
insights.createIndex('by-createdAt', 'createdAt');
gratitudeEntries.createIndex('by-date', 'date');
gratitudeEntries.createIndex('by-cycleId', 'cycleId');
gratitudeEntries.createIndex('by-primaryTopicId', 'primaryTopicId');
goals.createIndex('by-status', 'status');
goals.createIndex('by-horizon', 'horizon');
goals.createIndex('by-cycleId', 'cycleId');
trackers.createIndex('by-isActive', 'isActive');
trackerEntries.createIndex('by-trackerId', 'trackerId');
trackerEntries.createIndex('by-date', 'date');
trackerEntries.createIndex('by-cycleId', 'cycleId');

// Topics
topics.createIndex('by-archived', 'isArchived');
topics.createIndex('by-sortOrder', 'sortOrder');
topicPlaybooks.createIndex('by-topicId', 'topicId', { unique: true });
topicTools.createIndex('by-topicId', 'topicId');
toolUsages.createIndex('by-toolId', 'toolId');
toolUsages.createIndex('by-topicId', 'topicId');

// Protocols
urgeEvents.createIndex('by-topicId', 'primaryTopicId');
urgeEvents.createIndex('by-cycleId', 'cycleId');
urgeEvents.createIndex('by-createdAt', 'createdAt');
triggerHurtEvents.createIndex('by-topicId', 'primaryTopicId');
triggerHurtEvents.createIndex('by-cycleId', 'cycleId');
triggerHurtEvents.createIndex('by-type', 'type');
halfPowerEntries.createIndex('by-topicId', 'primaryTopicId');
halfPowerEntries.createIndex('by-cycleId', 'cycleId');

// Topic-Specific
marketInterruptPlans.createIndex('by-topicId', 'primaryTopicId');
coolingWindows.createIndex('by-topicId', 'primaryTopicId');
coolingWindows.createIndex('by-endsAt', 'endsAt');
decisionLogs.createIndex('by-topicId', 'primaryTopicId');
decisionLogs.createIndex('by-cycleId', 'cycleId');
repairNotes.createIndex('by-topicId', 'primaryTopicId');
repairNotes.createIndex('by-cycleId', 'cycleId');
nowCheckins.createIndex('by-topicId', 'primaryTopicId');
nowCheckins.createIndex('by-cycleId', 'cycleId');
waveModeSessions.createIndex('by-topicId', 'primaryTopicId');
waveModeSessions.createIndex('by-cycleId', 'cycleId');
microBoundaries.createIndex('by-topicId', 'primaryTopicId');
microBoundaries.createIndex('by-date', 'date');
sleepLogs.createIndex('by-topicId', 'primaryTopicId');
sleepLogs.createIndex('by-date', 'date');
windDownRoutines.createIndex('by-topicId', 'primaryTopicId');
phoneRules.createIndex('by-topicId', 'primaryTopicId');

// Cross-Topic
tenMinuteDefers.createIndex('by-topicId', 'primaryTopicId');
tenMinuteDefers.createIndex('by-cycleId', 'cycleId');
oneSentenceEntries.createIndex('by-topicId', 'primaryTopicId');
oneSentenceEntries.createIndex('by-cycleId', 'cycleId');
choiceLogs.createIndex('by-topicId', 'primaryTopicId');
choiceLogs.createIndex('by-date', 'date');

// Additional
therapyQuestions.createIndex('by-cycleId', 'cycleId');
therapyQuestions.createIndex('by-status', 'status');
therapyQuestions.createIndex('by-topicId', 'primaryTopicId');
triggerLogs.createIndex('by-topicId', 'primaryTopicId');
triggerLogs.createIndex('by-cycleId', 'cycleId');
winEntries.createIndex('by-date', 'date');
winEntries.createIndex('by-topicId', 'primaryTopicId');
cycleSummaries.createIndex('by-cycleId', 'cycleId');
sessionPlans.createIndex('by-sessionId', 'sessionId');
packetSnapshots.createIndex('by-cycleId', 'cycleId');
packetSnapshots.createIndex('by-generatedAt', 'generatedAt');
```

**סיכום: 41 Stores, ~60 Indexes**

---

## 6. מסכים וניווט

### 6.1 Bottom Nav (5 טאבים)

| # | טאב | אייקון | תוכן |
|---|------|--------|------|
| 1 | **היום** | ✏️ | Quick actions + Recent + Inbox banner + כתיבה מהירה |
| 2 | **נושאים** | 🏷️ | Topics Home — grid של כל הנושאים |
| 3 | **מסע** | 🗺️ | Journey — Timeline כרונולוגי (עם Topic filter) |
| 4 | **אג'נדה** | 📋 | Agenda — נקודות לפגישה (עם Topic filter) |
| 5 | **עוד** | ≡ | Vault, Export, Settings, Therapy Vault (סיכומים) |

### 6.2 מסך "היום" (Hub)

```
┌─────────────────────────────────────────────────────────────┐
│  ערב טוב, [שם]                                  6 בפברואר  │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─ 📥 Inbox (3 פריטים ממתינים) ─────────── [למיין →] ────┐ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ הכנה לפגישה ──────────────────────────────────────────┐ │
│  │  📋 3 נקודות באג'נדה                    [הוסף נקודה →] │ │
│  │  • 📊 שוק ההון — "לדבר על הדחף לבדוק"                 │ │
│  │  • 💑 זוגיות — "ההודעה מאתמול"                         │ │
│  │  • 😤 סטרס — "מצב הלחץ בעבודה"                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ פעולות מהירות ─────────────────────────────────────────┐ │
│  │  [✏️ כתיבה מהירה]  [🆘 דחיפות]  [🙏 תודה]  [⚡ חצי]  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ אחרונים ───────────────────────────────────────────────┐ │
│  │  רשומה (📊) — "החלטתי לא לבדוק..."          לפני 2 שע' │ │
│  │  הכרת תודה (💑) — "תודה לאור שהק..."        אתמול      │ │
│  │  ⚡ Emoji Check-in (😤) — סטרס              אתמול      │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**כשיש נקודות באג'נדה:** כפתור בולט: **"אני בפגישה עכשיו — הצג נקודות"**

### 6.3 Topics Home

```
┌─────────────────────────────────────────────────────────────┐
│  הנושאים שלי                                    [+ נושא חדש] │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 📊 שוק ההון  │  │ 💑 זוגיות    │  │ 😤 סטרס      │        │
│  │  3 פתוחים    │  │  1 פתוח      │  │  2 פתוחים    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ 🌙 שינה      │  │ 📝 כללי      │                          │
│  └──────────────┘  └──────────────┘                          │
│                                                               │
│  ─── ארכיון (2 נושאים) ───                         [הצג ▾]  │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Topic Detail Screen

```
┌─────────────────────────────────────────────────────────────┐
│  ← חזרה     📊 שוק ההון                          [⚙️ ערוך]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Tabs (horizontal scroll) ────────────────────────────┐  │
│  │ [סקירה] [כתיבה] [אג'נדה] [הארות] [מעקב] [יעדים]     │  │
│  │ [מסע] [כלים] [Playbook]                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  (תוכן משתנה לפי Tab נבחר)                                    │
│                                                               │
│  [🆘 מצב חירום — Playbook]     ← כפתור נגיש תמיד בתוך Topic │
└─────────────────────────────────────────────────────────────┘
```

**Tabs בתוך Topic:**

| Tab | תוכן |
|-----|------|
| סקירה | סיכום מהיר: אג'נדה פתוחה + אחרון שנכתב + כלים מהירים |
| כתיבה | כמו Today, pre-filtered ל-Topic |
| אג'נדה | נקודות לפגישה של ה-Topic |
| הארות | הארות שסומנו בנושא |
| מעקב | SleepLog / CoolingWindow / MicroBoundary — לפי רלוונטיות |
| יעדים | ActionItems / Goals של הנושא |
| מסע | Timeline של הנושא בלבד |
| כלים | TopicTools + קיצורים ל-Protocols |
| Playbook | דף הפעולה — North Star + Rescue Kit + Sections |

**3 הראשונים (סקירה, כתיבה, אג'נדה) תמיד נראים.** השאר — גלילה אופקית.

### 6.5 Topic Picker Component

בכל מסך יצירה, השדה הראשון הוא Topic:

- Dropdown / Bottom Sheet עם כל ה-Topics הפעילים
- אייקון + צבע + שם
- "כללי" תמיד ראשון
- "+ נושא חדש" בתחתית
- ברירת מחדל: Topic אחרון שנבחר

---

## 7. מודולים — Core

### 7.1 Today (כתיבה)

| Feature | Description |
|---------|-------------|
| Writing Canvas | שדה טקסט חופשי, נקי |
| Autosave | Debounce 700-1200ms, drafts store, flush on exit |
| Save Indicator | "שומר..." → "נשמר ✓" → "טיוטה" |
| Text Selection | בחירת טקסט → Toolbar: אג'נדה / תובנה / הארה |
| Tags | בחירה ידנית מסט מוגדר |
| Entry Type | free / thought / feeling / gratitude / win |
| Topic | Topic picker (ברירת מחדל: אחרון) |

**AC:**
- [ ] טקסט נשמר אוטומטית עם debounce
- [ ] אינדיקטור שמירה ויזואלי ברור
- [ ] Selection toolbar מופיע על בחירת טקסט
- [ ] אפשר ליצור מספר רשומות באותו יום
- [ ] "כתיבה מהירה" (ללא Topic) שומרת ל-Inbox

### 7.2 Agenda (אג'נדה)

| Feature | Description |
|---------|-------------|
| Items List | AgendaItems עם סדר עדיפות |
| **Tabs** | **"נושאים"** (AgendaItems) ו**"שאלות"** (TherapyQuestions) — 2 טאבים באג'נדה |
| Source Link | קישור למקור (entry/session/insight) |
| Status | open / done |
| Priority | Drag & Drop |
| Topic Filter | סינון לפי Topic (chips אופקיים) |
| In-Room Mode | תצוגה גדולה ונקייה, font גדול, **read-only toggle** |
| Mark as Discussed | כפתור ליד כל פריט במצב בחדר |
| Hide Done Toggle | במצב בחדר |

**AC:**
- [ ] רשימה מסודרת לפי priority
- [ ] לכל נקודה: badge של Topic (אייקון + צבע)
- [ ] **2 טאבים: "נושאים" ו"שאלות"** — שאלות מנוהלות כ-TherapyQuestion
- [ ] מצב "בחדר" — מסך מלא, טקסט גדול, read-only אופציונלי עם toggle "ערוך"
- [ ] פריטי Inbox מופיעים עם badge 📥

### 7.3 Therapy (סיכומי טיפול)

| Feature | Description |
|---------|-------------|
| Session List | רשימת סיכומים לפי תאריך |
| Add Session | תאריך + סיכום + Topic |
| **Session Plan** | שדה אופציונלי **לפני** פגישה: "מה אני רוצה להשיג היום" — משפט אחד (SessionPlan entity) |
| Search | חיפוש בסיכומים (MVP: entries + sessions בלבד. שאר ה-entities: חיפוש פשוט ב-text field) |
| Calendar View | תצוגת לוח שנה עם סימון ימי פגישות |
| Input | Paste text בלבד. קובץ מצורף כ-attachment (ללא OCR/פרסור). PDF parsing ב-Phase 2 |

**AC:**
- [ ] CRUD מלא ל-Sessions
- [ ] חיפוש טקסט מלא (FlexSearch מומלץ) — MVP: entries + sessions בלבד
- [ ] עריכת session → עדכון cycleIds רטרואקטיבי + Toast "הסייקל עודכן, X פריטים הועברו"
- [ ] Session Plan מוצג ליד Session אם קיים

### 7.4 Packet (פקט לפגישה)

**תוכן:**
1. אג'נדה פתוחה (בסדר עדיפות), עם Topic badges
2. שאלות לטיפול פתוחות (TherapyQuestions)
3. תובנות מוצמדות
4. הארות מהסייקל
5. Action Items פתוחים

**פורמטים:**
- תצוגה באפליקציה (In-App View) — "תצוגת הדפסה" מסודרת
- Print to PDF (window.print)
- Export Markdown

**Packet Quick View (Sprint 3+):**
- **PWA Badge** עם מספר הנקודות הפתוחות באג'נדה
- **Shortcut icon** בטלפון שפותח ישירות מצב "בחדר"
- **מסך "3 הנקודות הכי חשובות"** — deep link ישיר (בלי ניווט)

**Packet Snapshot History:**
- כשמייצרים Packet → שומר PacketSnapshot עם תאריך
- אפשר לראות "מה הבאתי לפגישה של 15 בינואר" גם אחרי שהאג'נדה עודכנה
- רשימת snapshots נגישה מ-Therapy tab

### 7.5 Vault (הגדרות)

| Feature | Description |
|---------|-------------|
| PIN | נעילה עם PIN 4-6 ספרות |
| Recovery Key | מפתח שחזור חד-פעמי ב-onboarding |
| Discrete Mode | טשטוש תוכן בלחיצה |
| Auto-lock | אחרי 5 דקות + tab blur (opt-in, grace period 3-5 שניות) |
| Export | JSON (`mindvault_export_v1.json` עם schema version) + Markdown מאורגן לפי סייקלים |
| Export Toggle | "כולל פריטים מחוקים?" — toggle ב-UI |
| Export Compat | Schema forward-compatible — שדות חדשים לא ישברו import ישן |
| Backup Reminder | באנר חודשי פנימי: "רוצה לגבות?" — אין push, אין guilt |
| Topic Privacy | ניהול PIN/blur/hide per Topic |

---

## 8. מודולים — טיפוליים

### 8.1 Insights (תובנות)

**Quick Mode (~20 שניות):** title + type  
**Deep Mode (כפתור "להעמיק"):** Full fields

| Feature | Description |
|---------|-------------|
| Create | From scratch או from selection |
| Types | pattern, boundary, tool, thought, emotion, other |
| Pin | הצגה בולטת |
| Add to Agenda | בלחיצה אחת |
| Topic | שיוך ל-Topic |

**AC:**
- [ ] יצירת תובנה מתוך טקסט מסומן
- [ ] Quick mode ב-20 שניות
- [ ] הוספה לאג'נדה בלחיצה אחת
- [ ] פילטור לפי type, cycle, Topic

### 8.2 Gratitude (הכרת תודה)

**Quick (~60 שניות):** שדה אחד: "דבר קטן שטוב שהיה" + Topic  
**Deep (כפתור "להעמיק"):** 3 שדות + feeling + memoryNote

**Spotlight Presets (קיצורי דרך):**

| Topic | Prompt |
|-------|--------|
| זוגיות | "תודה אחת לאור" |
| שינה | "דבר אחד שעזר להירדם" |
| כללי | "משהו אחד שעשיתי טוב" |

**AC:**
- [ ] Quick = שדה אחד + Topic + שמור (3 לחיצות)
- [ ] אין streak, אין "פספסת", אין reminder
- [ ] Gratitude מופיעה ב-Journey עם אייקון 🙏

### 8.3 Goals (מטרות)

| Feature | Description |
|---------|-------------|
| Create | title, why, horizon, targetDate, status |
| Horizons | weekly, monthly, open |
| Statuses | active, paused, done, archived |
| Pin | מטרה מוצמדת מופיעה ב-Home |
| Progress | start / middle / advanced (אופציונלי) |
| Topic | שיוך ל-Topic |

**AC:**
- [ ] CRUD מלא
- [ ] סינון לפי status, Topic
- [ ] מטרה מוצמדת ב-Home

### 8.4 Tracking (מעקב)

| Feature | Description |
|---------|-------------|
| Create Tracker | name, valueType, frequency, Topic |
| Value Types | boolean, rating_1_5, rating_1_10, count, duration_minutes, note_only |
| Quick Log | UI מהיר ל-trackers פעילים |
| Validation | ערכים בטווח תקין |

### 8.5 Session Close (סיום פגישה)

**אופציונלי. 3 שדות בלבד:**

| שדה | תיאור | לאן הולך |
|-----|-------|----------|
| משפט אחד לקחת | התובנה המרכזית | נשמר כ-Insight |
| דבר אחד לנסות | עד הפעם הבאה | נשמר כ-ActionItem |
| מה לא אמרתי וחבל | דבר שפספסתי | **נכנס אוטומטית ל-Agenda** |

### 8.6 Therapy Questions (שאלות לטיפול)

**מטרה:** שאלה היא לא "נושא לדבר עליו" — היא "מה אני רוצה לבדוק".

| שדה | חובה? |
|-----|-------|
| שאלה (נוסח) | כן |
| למה זה חשוב (הקשר קצר) | לא |
| קישור למקור (entry/insight/session) | לא |

**מוצרית:** במסך Agenda — 2 טאבים: **"נושאים"** (AgendaItems) ו**"שאלות"** (TherapyQuestions).

**AC:**
- [ ] CRUD מלא
- [ ] Tab ייעודי באג'נדה
- [ ] נכנס ל-Packet כסעיף נפרד
- [ ] אפשר ליצור מתוך Insight (כפתור "שאלה לטיפול")

### 8.7 Trigger Log מינימלי

**מטרה:** לא טבלת מעקב מעיקה. כפתור "טריגר" → 3 שדות, 10 שניות.

| שדה | דוגמה |
|-----|-------|
| מה הפעיל אותי | "ביקורת מהבוס" |
| תגובה אוטומטית (מילה אחת) | "נסיגה" |
| מה הייתי רוצה לעשות אחרת (מילה אחת) | "לשאול" |

**חשוב:** שונה מ-TriggerHurtEvent (שהוא Wizard מלא לזוגיות). Trigger Log הוא **מהיר ופשוט** לכל Topic.

**AC:**
- [ ] 3 שדות, שמירה ב-10 שניות
- [ ] מופיע ב-Journey עם אייקון ⚡
- [ ] נגיש מ-Quick Actions ומתוך כל Topic

### 8.8 Wins (ניצחונות)

**מטרה:** קטגוריה שמאזנת נטייה למיקוד בבעיה.

| שדה | חובה? |
|-----|-------|
| דבר אחד שעשיתי טוב | כן |
| דבר אחד שהתמודדתי איתו | לא |

**AC:**
- [ ] מופיע ב-Journey עם אייקון 🏅
- [ ] אפשר לשמור כ-Highlight
- [ ] נגיש מ-Quick Actions

### 8.9 Cycle Summary (סיכום סייקל — ידני)

**מטרה:** בסוף סייקל (אחרי פגישה), הזמנה לכתוב "מה למדתי בתקופה הזו". לא חובה, לא AI, רק הזמנה.

**UX Flow:**
1. משתמש מוסיף session חדשה → סייקל קודם נסגר
2. Toast/באנר עדין: "הסייקל הסתיים. רוצה לסכם מה למדת?"
3. לחיצה → שדה טקסט חופשי (CycleSummary)
4. אם לא → נעלם, **אפס אשמה**

**AC:**
- [ ] הזמנה אחרי סגירת סייקל (לא כפוי)
- [ ] שדה טקסט חופשי אחד
- [ ] מופיע ב-Journey כ-event מיוחד (📖)

---

## 9. מודולים — פרוטוקולים (Wizards)

### 9.1 Urge Protocol — Wizard (4 שלבים)

**מטרה:** לתפוס רגע של דחיפות ולשים עליו מסגרת.

| # | שלב | מה קורה | חובה? |
|---|------|---------|-------|
| 1 | **זיהוי** | Topic + קטגוריית דחף (check/send/buy/react/avoid/custom) + טקסט חופשי | כן |
| 2 | **השהיה** | נשימה ויזואלית 10 שניות (animation expand 4s → hold 3s → shrink 3s) | אפשר לדלג |
| 3 | **מחיר** | "מה יקרה מחר אם אעשה את זה עכשיו?" | כן |
| 4 | **חלופה** | "מה אני בוחר במקום?" + כלי מה-Toolbox + "דחה 10 דק" | כן |

**AC:**
- [ ] 4 שלבים, שלב בכל מסך, progress indicator
- [ ] שלב 2: כפתור "הבא" מושבת 10 שניות, "דלג" תמיד זמין
- [ ] שלב 4: כלים מ-TopicTools של הנושא (Rescue Kit)
- [ ] שלב 4: "דחה 10 דקות" → TenMinuteDefer אוטומטית
- [ ] Toast "נרשם. אתה בוחר."
- [ ] `outcome` ניתן לעדכון מאוחר

### 9.2 Trigger vs Hurt — Wizard עם מדחום רגשי (4 שלבים)

**מטרה:** הבחנה בין פגיעה אמיתית לטריגר פנימי.

**שלב 1 — מדחום רגשי:**
- Slider 1-10
- 1-4 (ירוק) → ממשיך
- 5-7 (כתום) → המלצה לנשום, לא כפוי
- **8-10 (אדום) → Cooling כפוי: מסך נשימה 5 דקות, כפתור "סיימתי" נעול**

**שלב 2 — בחירת סוג:**
- 😤 טריגר פנימי ("זה יותר שלי")
- 💔 פגיעה אמיתית ("פגעו בי באמת")

**שלב 3 (טריגר):** טיימר ויסות 60-120 שניות → טיוטת הודעה (אופציונלי, **לא נשלחת**)  
**שלב 3 (פגיעה):** תבנית גבול: מבקש + גבול + תוצאה

**שלב 4:** סיכום + שמירה + "רוצה להוסיף לאג'נדה?"

**AC:**
- [ ] מדחום slider 1-10 — חובה
- [ ] Cooling כפוי ב-8+: 5 דקות, כפתור נעול
- [ ] טיוטת הודעה נשמרת, **לא נשלחת**
- [ ] Journey: 😤 לטריגר, 💔 לפגיעה, נקודת צבע לפי intensity

### 9.3 Half Power — 3 רמות

**מטרה:** כשאין כוח — מגבלה ידידותית. ברמה הנמוכה: **לחיצה אחת מספיקה**.

| רמה | מה עושים | זמן | Template |
|-----|----------|------|---------|
| **1 — Emoji** | בחירת emoji: 😊😐😔😤😰🥱 | 2 שניות | `emoji_checkin` |
| **2 — Action Check** | "עמדתי בחוק?" כן/לא | 3 שניות | `action_check` |
| **3 — כתיבה מצומצמת** | לפי Topic template | 30-90 שניות | לפי Topic |

**Templates לרמה 3:**

| Topic | Template | מגבלה |
|-------|----------|-------|
| סטרס | `freeform_90s` | טיימר 90 שניות → שמירה אוטומטית |
| שוק ההון | `one_sentence` | שדה אחד, 280 תווים |
| זוגיות | `facts_only` | 3 שדות "עובדה", 140 תווים כל אחד |
| אחר | `custom` | טקסט חופשי |

**AC:**
- [ ] Emoji Check-in: 6 emojis, לחיצה אחת שומרת
- [ ] Action Check: MicroBoundary של היום + כן/לא. "לא עמדתי — וזה בסדר"
- [ ] כתיבה מצומצמת: מגבלה ויזואלית (טיימר / counter)
- [ ] Toast "נרשם. מספיק להיום."

---

## 10. מודולים — Topic-Specific

### 10.1 שוק ההון

#### Market Interrupt Plan
- שעת בדיקה + תנאי לפעולה + "מה אני לא עושה בין לבין"
- Plan אחד פעיל בלבד

#### Cooling Window
- טיימר: 30 דק / 1 שעה / 2 שעות / עד מחר / custom
- Countdown ויזואלי + משפט מעודד
- `completed: boolean` — האם הגיע לסוף

#### Decision Log
- שני שדות: "פעולה שאני דוחה" + "למה"
- Quick entry מ-Topic Overview

### 10.2 זוגיות

#### Regulate then Communicate
- טיימר ויסות 60/120/180 שניות
- אחרי טיימר: שדה כתיבת טיוטה
- **הטיוטה נשמרת, לא נשלחת**

#### Boundary Drafts
- 3 שדות: "מה אני מבקש" + "מה הגבול" + "מה אני עושה אם לא מכובד"
- נשמר כטיוטה — אפשר לחזור ולערוך

#### Repair Note (אחרי קונפליקט)
- "מה אני לוקח אחריות" (חובה)
- "מה אני מבקש" (חובה)
- "מה אני מעריך" (אופציונלי)
- אפשר לקשר ל-TriggerHurtEvent

#### Internal Validation
- כפתור "לא שולח עכשיו"
- Overlay 10 שניות: משפט אישור גדול + countdown bar
- אחרי 10 שניות: "איך אתה מרגיש?" (אופציונלי)
- משפטי ברירת מחדל: "אני מספיק גם בלי תגובה עכשיו", "זה לא דחוף", "אני בוחר לא לשלוח"

### 10.3 סטרס

#### Now Check-in
- 3 שדות: גוף ("איפה זה יושב?") + דחיפות (slider 1-5) + בחירה ("מה אני בוחר?")

#### Wave Mode (מצב גל)
- מסך מלא, רקע כהה, **אין ניווט**
- טיימר עולה (stopwatch)
- כפתור "נשימה" (animation 4-7-8)
- "סיימתי" → optional note → שמור

#### Micro-Boundary (חוק קטן להיום)
- שדה אחד + תאריך (ברירת מחדל: היום)
- Self-report בסוף היום: "שמרתי? כן/לא/קשה"
- מוצג ב-Topic Overview: "החוק שלי להיום: ..."

### 10.4 שינה

#### Wind-down Routine
- 1-5 צעדים (drag & drop)
- Checklist יומי ב-Topic Overview
- **אין streak / tracking** — מתאפס יומי

#### Sleep Log Lite
- שעת שינה + קימה + איכות (1-5) + "מה הפריע"
- SleepLog אחד ליום (edit, לא duplicate)
- Mini-graph ב-Topic Overview: 7 ימים אחרונים

#### Phone Rule
- סוג: חדר אחר / הפוך / שקט / custom
- טיימר: X דקות לפני שינה
- **אין enforcement — רק תזכורת ויזואלית**

---

## 11. מודולים — Cross-Topic

### 11.1 Ten Minutes Rule
- "מה רציתי לעשות?" → Topic → טיימר 10 דקות
- **אין push notification** — רק in-app
- Self-report אופציונלי

### 11.2 One Clean Sentence
- 280 תווים מקסימום, counter ויזואלי
- Prompts: "מה החלטתי לא לעשות?" / "איך אני?" / "מה בחרתי אחרת?" / חופשי

### 11.3 Choice Log
- שדה אחד: "מה בחרתי לא לעשות" + Topic + תאריך
- ב-Topic Overview: "הבחירה של היום: ..."

### 11.4 Toolbox per Topic
- 2-5 כלים לכל נושא (שם + מתי להשתמש + סימן)
- כפתור "הפעל כלי" → ToolUsage עם timestamp
- Drag & drop לסידור

---

## 12. Journey — מפרט מלא

### 12.1 שכבות ניווט

**Scope Filter (שורת chips אופקית):**  
`[הכל] [שוק ההון] [זוגיות] [סטרס] [שינה] [כללי]`

**Cycle Filter:** ברירת מחדל = **סייקל נוכחי** (לא כל ההיסטוריה). אפשרות לעבור ל-"הכל" או לבחור סייקל ספציפי.

**Scroll Position:** נשמר per-tab — כשהמשתמש חוזר לטאב, ממשיך מאיפה שעצר.

**Module Tabs (מתחת ל-Scope):**

| Tab | מציג |
|-----|------|
| **הכל** | הכל (ברירת מחדל) |
| **רשומות** | DailyEntry, HalfPowerEntry, OneSentenceEntry, WinEntry |
| **אג'נדה** | AgendaItem, TherapyQuestion |
| **הארות** | Highlight, Insight |
| **הכרת תודה** | GratitudeEntry |
| **דחיפויות** | UrgeEvent, TriggerHurtEvent, TenMinuteDefer |
| **מעקב** | SleepLog, CoolingWindow, MicroBoundary, NowCheckin, WaveModeSession, ChoiceLog, DecisionLog, TriggerLog |
| **כלים** | ToolUsage |

### 12.2 Cross-Topic View ("מבט על")

Toggle ב-Journey כשה-Scope = "הכל". ימים מקובצים לפי Topics, כל Topic בצבע שלו. **אין ניתוח אוטומטי — Zero AI.**

### 12.3 Topic Milestones (ציוני דרך)

**Computed, לא stored.** מוצגים כבאנר עדין ב-Timeline:

| Milestone | חישוב | תצוגה |
|-----------|-------|-------|
| 7 ימים ללא Urge | אין UrgeEvent ב-7 ימים | 🏆 "שבוע שלם בלי דחיפות!" |
| 3 Cooling Windows | 3 completed=true | 🏆 "3 פעמים עמדת בזה!" |
| 10 רשומות | ספירת entries | 🏆 "10 רשומות — אתה כותב!" |
| 5 כלים | ספירת ToolUsage | 🏆 "5 פעמים השתמשת בכלים שלך" |
| Repair Note ראשון | קיום 1+ | 🏆 "צעד ראשון בתיקון" |
| 30 Sleep Logs | 30 SleepLogs | 🏆 "חודש שלם של מעקב שינה" |

**כללים:**
- מוצגים רק ב-Journey של Topic ספציפי (לא ב-"הכל")
- מקסימום 1 milestone ליום
- **אין "איבדת streak" — אפס אשמה**

### 12.4 Entity Display in Journey

כל entity מוצג כ-card עם: אייקון + Topic badge + Snippet (80-120 תווים) + Timestamp

**אייקונים:**

| Entity | אייקון |
|--------|--------|
| DailyEntry | ✏️ |
| HalfPowerEntry (emoji) | ⚡ + emoji |
| OneSentenceEntry | 💬 |
| Session | 📌 |
| Highlight / Insight | 💡 |
| AgendaItem | 📋 |
| GratitudeEntry | 🙏 |
| UrgeEvent | 🆘 |
| TriggerHurtEvent (trigger) | 😤 |
| TriggerHurtEvent (hurt) | 💔 |
| RepairNote | 🤝 |
| NowCheckin | 📍 |
| WaveModeSession | 🌊 |
| MicroBoundary | 🛡️ |
| CoolingWindow | ❄️ |
| DecisionLog / ChoiceLog | ✋ |
| SleepLog | 🌙 |
| ToolUsage | 🔧 |
| TenMinuteDefer | ⏱️ |
| InternalValidation | 🧘 |
| TherapyQuestion | ❓ |
| TriggerLog | ⚡ |
| WinEntry | 🏅 |
| CycleSummary | 📖 |
| Milestone | 🏆 |
| Inbox item | 📥 |

---

## 13. עיצוב ו-UX

### 13.1 Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #6B4EE6;          /* סגול ראשי (WCAG AA compliant) */
  --color-primary-light: #EDE8FF;
  --color-teal: #0D9488;
  --color-warm: #F5A623;
  --color-pink: #EC4899;
  --color-surface: #FAFAF8;          /* לא לבן טהור */
  --color-surface-elevated: #FFFFFF;
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-success: #34D399;
  --color-gentle-border: #E5E7EB;

  /* Spacing (4px grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-primary: 0 4px 16px rgba(107,78,230,0.25);

  /* Typography (RTL Hebrew) */
  --font-family: 'Heebo', 'Rubik', sans-serif;
  --font-size-hero: 28px;    /* line-height: 36px */
  --font-size-title: 20px;   /* line-height: 28px */
  --font-size-body: 16px;    /* line-height: 24px */
  --font-size-caption: 13px; /* line-height: 18px */

  /* Topic Accent (dynamic per topic) */
  --topic-accent: var(--color-primary);
  --topic-accent-light: rgba(107,78,230,0.2);
}
```

### 13.2 Component Patterns

**Cards:**
- `card-premium` — white card with subtle gradient, border fallback
- `card-interactive` — clickable with hover lift 2px + shadow increase
- `card-topic` — Topic color variants (20% opacity background)

**Buttons:**
- `btn-primary` — gradient purple, main CTAs (48-56px height)
- `btn-secondary` — white with border
- `btn-ghost` — no background
- `btn-topic` — dynamic topic.color

**Navigation:**
- Glass morphism bottom nav (max 56-64px height)
- Active state: gradient background + dot indicator
- `safe-area-inset-bottom` for iPhone

### 13.3 UX Guidelines

| Rule | Implementation |
|------|----------------|
| Mobile-first | Design from 375px up |
| Touch targets | Min 44x44px |
| Safe areas | Respect notch + home indicator |
| Max width | Content limited to 720px, centered |
| Empty states | Icon + warm message + CTA (see 13.5) |
| Loading | Skeleton screens, no spinners |
| Transitions | 200ms ease-out, no jarring |
| Toasts | Success/error with haptic feedback |
| Cards | Stack (לא side-by-side) במסכים < 640px |
| Contrast | WCAG AA: >= 4.5:1 for text, >= 3:1 for large text |
| Virtualization | react-virtuoso ב-Journey |
| Snippets | 80-120 תווים ברשימות |

### 13.4 Micro-interactions

- Page transitions: fade-in-up 400ms
- Cards: hover lift 2px + shadow increase
- Buttons: scale 0.97 on press
- Selection toolbar: pop-in animation
- Save indicator: pulse on saving
- Skeleton screens בזמן טעינה
- Toast קצר אחרי שמירה: "נוסף לאג'נדה ✓"
- Haptic vibration בפעולות

### 13.5 Empty States

**כל empty state צריך 3 דברים:**
1. Illustration מינימלית (או emoji גדול)
2. כותרת מעודדת (לא "אין כלום" אלא "הכל מתחיל פה")
3. CTA ברור (כפתור, לא לינק)

| מסך | Empty State |
|-----|------------|
| Home - Agenda | "הפגישה הבאה מחכה. מה תרצה להעלות?" + "הוסף נושא" |
| Journey | "כאן יתחיל המסע שלך. כתוב את הרשומה הראשונה" + כפתור |
| Therapy | "הוסף סיכום מהפגישה האחרונה כדי לא לשכוח" + כפתור |
| Agenda | "עוד לא הכנת נושאים. זה בסדר. כשמשהו יעלה — הוא יחכה לך פה" |
| Playbook | "בנה את הפרוטוקול שלך — מה עושים כשזה מגיע?" |
| North Star ריק | placeholder: *"מה המשפט שמחזיר אותי למקום?"* |

### 13.6 מיקרוקופי (עברית חדה)

| לפני | אחרי |
|------|-------|
| "להוסיף סיכום" | **"הוסף סיכום טיפול"** |
| "לכתוב" | **"רשומה חדשה"** |
| "עוד אין נקודות" + "להתחיל לכתוב" | **"אין עדיין נקודות. הוסף נקודה שתרצה להביא לפגישה."** |
| "המרחב הבטוח שלך בין הפגישות" | **"הכנה לפגישה הבאה"** (דינמי) |

### 13.7 Warmth & Emotion

- **Gradient עדין** בראש מסכים (warm purple → soft peach)
- **ברכה אישית:** "ערב טוב, [שם]" עם תאריך עברי
- **Font עברי איכותי:** Heebo כברירת מחדל
- **Topic Visual Context:** צבע משתנה מייצר שינוי תודעתי

### 13.8 Playbook — Design

```
┌─────────────────────────────────────────────────────────────┐
│  📖 Playbook: [שם נושא]                          [✏️ ערוך]   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ⭐ "משפט הבית"                                          │ │
│  │  (font 24px+, ממורכז, בולט)                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  🆘 כלי חירום:                                                │
│  [🔧 כלי 1]  [🔧 כלי 2]  [🔧 כלי 3]                        │
│                                                               │
│  ▸ סקשן 1 — כותרת + תוכן                                    │
│  ▸ סקשן 2 — כותרת + תוכן                                    │
│  ▸ סקשן 3 — כותרת + תוכן                                    │
└─────────────────────────────────────────────────────────────┘
```

**דוגמאות Playbook:**

| נושא | North Star | Rescue Kit |
|------|-----------|-----------|
| שוק ההון | "אני פועל לפי תוכנית, לא לפי מחיר." | Market Interrupt, Decision Log, Cooling Window |
| זוגיות | "הקשר חשוב יותר מהצדק שלי." | Repair Note, Boundary Draft, Regulation Timer |
| סטרס | "הגל תמיד עובר." | Now Check-in, 4-7-8 Breathing, Wave Mode |
| שינה | "שינה היא לא מותרות, היא תשתית." | Wind-down Routine, Phone Rule |

---

### 13.9 Onboarding Flow

**מטרה:** להכניס את המשתמש למוצר בלי להציף אותו.

**שלבים:**

| # | מסך | תוכן |
|---|------|------|
| 1 | **ברוכים הבאים** | "MindVault — המרחב שלך בין הפגישות" + ערך מפתח |
| 2 | **Zero AI** | *"התובנות שלך הן שלך בלבד. שום אלגוריתם לא קורא אותן."* — **זה Feature של אמון, לא רק החלטה טכנית** |
| 3 | **הגדרת PIN** | 4-6 ספרות + Recovery Key (חובה לשמור) |
| 4 | **בחירת נושאים** | "על מה אתה עובד בטיפול?" — בחירה מרשימה מוצעת + "+ נושא חדש". מינימום 1, מקסימום 8 |
| 5 | **מוכן** | "הכל מוכן. מתחילים?" → מסך "היום" |

**AC:**
- [ ] Onboarding רק בפעם הראשונה (flag ב-settings)
- [ ] Recovery Key חובה — אי אפשר לדלג
- [ ] אפשר לדלג על בחירת נושאים (ברירת מחדל: "כללי")
- [ ] משפט Zero AI ברור ובולט — בידול שיווקי

### 13.10 Definition of Done — מסך Home

| # | קריטריון |
|---|----------|
| 1 | Home מציג **CTA ראשי אחד** ברור: "הוספת נקודה לפגישה הבאה" |
| 2 | Empty state של אג'נדה הוא **אינטראקטיבי** ומוסיף ערך |
| 3 | **אין כפילות** של פעולות (לכתוב / פלוס / להתחיל לכתוב) — אם FAB קיים, הוא **לא** משכפל CTA במסך |
| 4 | Bottom nav **מקסימום 5 טאבים**, מסודר לפי שימוש |
| 5 | פריסה רספונסיבית: מובייל 1 עמודה, דסקטופ container `max-width: 720px` |
| 6 | Design tokens מיושמים על כל הרכיבים |
| 7 | Font עברי (Heebo) מוטמע |
| 8 | מיקרוקופי מעודכן בכל המסך |
| 9 | **נגישות:** כל טקסט סגול על לבן >= WCAG AA (contrast >= 4.5:1) |
| 10 | **Mobile:** Bottom nav לא עולה על 56-64px + `safe-area-inset-bottom` |
| 11 | **Mobile:** כרטיסים ב-stack (לא side-by-side) במסכים < 640px |
| 12 | כשיש נקודות באג'נדה: כפתור **"אני בפגישה"** מוצג ב-Home |

---

## 14. אבטחה ופרטיות

### 14.1 Threat Model

**מגנים מפני:**
- אדם זר שמשתמש במכשיר (PIN + Auto-lock)
- Shoulder surfing (Discrete Mode)
- אובדן נתונים (Export + Backup Reminder)
- צפייה בנושא רגיש (Privacy per Topic: PIN + blur + hide)

**לא מגנים מפני:**
- פריצה ממוקדת למכשיר
- Forensic analysis
- Keyloggers / Malware

### 14.2 Encryption

```typescript
// Key Derivation
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  pinKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);

// salt: stored in IndexedDB (unencrypted)
// Recovery Key: generated once, user must save
// Data: encrypted with AES-GCM
```

### 14.3 Recovery Key Flow

1. User sets PIN during onboarding
2. System generates 24-word Recovery Key
3. Screen: "שמור את המפתח הזה! בלעדיו לא נוכל לשחזר"
4. User confirms (copy / print / screenshot)
5. Recovery Key encrypts master key separately from PIN

### 14.4 Auto-lock

- Inactivity timeout: 5 minutes (configurable)
- Tab blur: optional, with 3-5 second grace period
- `visibilitychange` event + timestamp

### 14.5 Privacy per Topic

| הגדרה | תיאור |
|-------|-------|
| `requirePin` | PIN בכל כניסה ל-Topic |
| `topicPin` | PIN ייעודי (4 ספרות), או null = PIN גלובלי |
| `blurByDefault` | כרטיס מטושטש ב-Topics Home (CSS `filter: blur(10px)`) |
| `hideFromJourney` | לא מופיע ב-Journey "הכל" |

---

## 15. סדר בנייה — Roadmap

### Phase A — שלד (חובה ראשון)

| # | משימה | מאמץ |
|---|-------|------|
| A1 | Topic entity + CRUD (כולל privacy) | בינוני |
| A2 | Topic Picker component (כולל Inbox) | קטן |
| A3 | הוספת `primaryTopicId` + `secondaryTopicIds` לכל entity | בינוני |
| A4 | Migration: entities קיימים → Inbox | קטן |
| A5 | Topics Home screen (כולל blur) | בינוני |
| A6 | Topic Detail screen + tabs + Visual Context | גדול |
| A7 | Journey — Scope filter + Module tabs | בינוני |
| A8 | מסך "היום" — עדכון עם Topics + Inbox | בינוני |
| A9 | "למיין את המגירה" — Inbox Sort flow | בינוני |
| A10 | Privacy per Topic — PIN + blur + hideFromJourney | בינוני |

**Sprint 1 (במקביל ל-Phase A):**
- Today: Writing + Autosave + Selection + Save indicator
- Agenda: Items + Priority + Source + In-room mode
- Therapy: Summaries + Search
- IndexedDB: Full schema + CRUD
- UI: Design system + Design tokens + Components + Font עברי
- Bottom Nav: 5 טאבים + active states
- Empty states מעודדים בכל מסך
- נגישות: WCAG AA, safe-area-inset

### Phase B — Playbook + כלים קריטיים

| # | משימה | מאמץ |
|---|-------|------|
| B1 | Topic Playbook (North Star + Rescue Kit + Sections) | בינוני |
| B2 | Urge Protocol — Wizard 4 שלבים | גדול |
| B3 | Now Check-in (סטרס) | קטן |
| B4 | Wave Mode (סטרס) | בינוני |
| B5 | Ten Minutes Rule | קטן |

**Sprint 2 (במקביל ל-Phase B):**
- Journey: Timeline + Tabs + Filters + Default to current cycle + Scroll position saved
- Insights: Full module
- Gratitude: Full module
- Goals: Full module
- Tracking: Full module
- Therapy Questions: Entity + Tab in Agenda
- Trigger Log: Quick 3-field capture
- Wins: Daily wins module
- Search: Full-text (FlexSearch) — MVP: entries + sessions בלבד
- Export: JSON (schema versioned) + Markdown (by cycles) + Print + "Include deleted?" toggle
- Vault: PIN + Auto-lock + Discrete + Recovery Key

### Phase C — נושאים ייעודיים

| # | משימה | מאמץ |
|---|-------|------|
| C1 | Market Interrupt Plan | קטן |
| C2 | Cooling Window | בינוני |
| C3 | Decision Log | קטן |
| C4 | Trigger vs Hurt — Wizard + מדחום + Cooling כפוי | גדול |
| C5 | Regulate then Communicate | בינוני |
| C6 | Boundary Drafts | קטן |
| C7 | Repair Note | קטן |

### Phase D — Gratitude + הרחבות

| # | משימה | מאמץ |
|---|-------|------|
| D1 | Gratitude per Topic | בינוני |
| D2 | Spotlight presets | קטן |
| D3 | Half Power — 3 רמות (Emoji + Action Check + כתיבה) | גדול |
| D4 | Internal Validation | בינוני |
| D5 | One Clean Sentence | קטן |
| D6 | Choice Log | קטן |

### Phase E — שינה + Toolbox

| # | משימה | מאמץ |
|---|-------|------|
| E1 | Sleep Log Lite | קטן |
| E2 | Wind-down Routine | קטן |
| E3 | Phone Rule | קטן |
| E4 | Micro-Boundary (סטרס) | קטן |
| E5 | Toolbox per Topic | בינוני |
| E6 | ToolUsage tracking | קטן |

**Sprint 3 (כולל Phase C-E):**
- Packet: Full module + Quick View + Snapshot History
- Session Close
- Session Plan
- Cycle Summary
- Onboarding Flow
- Backup Reminder: Monthly banner
- All topic-specific modules

### Phase F — Journey Advanced

| # | משימה | מאמץ |
|---|-------|------|
| F1 | Cross-Topic View ("מבט על") | בינוני |
| F2 | Topic Milestones (computed) | בינוני |

### Phase 2 (עתידי)

- E2E Encrypted Sync (opt-in)
- Decoy Mode
- Collections
- Saved Views
- PDF Export ייעודי
- Dark Mode

---

## 16. מדדי הצלחה

| Metric | Target |
|--------|--------|
| **Activation** | 5 פריטים בשבוע ראשון |
| **Retention** | כניסה שבועית לאורך 4 שבועות |
| **Prep KPI** | פתיחת Agenda/Packet לפני פגישה |
| **Reliability** | אפס מקרים של "איבדתי טקסט" |
| **Zero AI** | 0 קריאות ל-AI APIs |
| **Half Power** | שימוש ב-Emoji Check-in ביום "קשה" (מניעת נטישה) |

---

## 17. שאלות פתוחות

| # | שאלה | אפשרויות | החלטה |
|---|------|---------|--------|
| 1 | Highlight edit policy | Freeze snapshot / Update offsets | **Freeze** |
| 2 | Versioning for entries | None / Last edited / Full history | TBD |
| 3 | FlexSearch vs Fuse.js | FlexSearch (faster) / Fuse.js (simpler) | TBD |
| 4 | Dark mode | Sprint 2 / Phase 2 | TBD |
| 5 | Stack — Next.js vs Vite | Next.js (SSR) / Vite (lighter PWA) | **Next.js** (בשימוש) |

---

## 18. מחוץ לסקופ

**לעולם לא:**
- AI / LLM / ML של כל סוג
- תיוג אוטומטי / סיכום אוטומטי / ניתוח סנטימנט
- זיהוי דפוסים אוטומטי
- Streaks / Gamification (Milestones = חיובי בלבד, אפס אשמה)
- Push notifications מעיקות
- Social features
- Mood charts / graphs (Anti-pattern)

**לא ב-MVP:**
- Cloud sync / Multi-device
- Voice input / OCR / PDF parsing
- Collaboration / Therapist portal
- Decoy Mode
- Collections / Saved Views
- Full PDF export

---

## 19. נספח: User Stories

1. **כתיבה:** כמשתמש, אני רוצה לכתוב רשומה יומית ולראות שהיא נשמרת אוטומטית.
2. **כתיבה מהירה (Inbox):** כמשתמש לחוץ, אני רוצה לכתוב בלי לבחור נושא ולמיין אחר כך.
3. **סימון לטיפול:** כמשתמש, אני רוצה לסמן קטע טקסט ולהוסיף אותו לאג'נדה בלחיצה אחת.
4. **אג'נדה:** כמשתמש, אני רוצה לראות רשימה מסודרת של כל מה שהכנתי לפגישה, עם Topic badges.
5. **תובנה:** כמשתמש, אני רוצה לשמור "הבנתי ש..." ולחזור אליו בפגישה.
6. **הכרת תודה:** כמשתמש, אני רוצה לכתוב 1-3 דברים שאני מודה עליהם — בהקשר של נושא.
7. **מטרה:** כמשתמש, אני רוצה להגדיר מטרה ולראות אותה ב-Home.
8. **Packet:** כמשתמש, אני רוצה לראות מסמך אחד עם כל מה שהכנתי לפגישה — כולל כל הנושאים.
9. **פרטיות:** כמשתמש, אני רוצה לנעול את האפליקציה ב-PIN ולטשטש נושאים רגישים.
10. **דחיפות:** כמשתמש, אני רוצה לעבור פרוטוקול של 4 שלבים שעוזר לי לא לפעול מדחף.
11. **טריגר/פגיעה:** כמשתמש בזוגיות, אני רוצה להבחין בין טריגר פנימי לפגיעה אמיתית ולפעול בהתאם.
12. **חצי כוח:** כמשתמש עייף, אני רוצה לחיצה אחת על emoji כדי לא לנתק את הרצף.
13. **Playbook:** כמשתמש בגל, אני רוצה לפתוח את ה"חוזה עם עצמי" ולראות מה לעשות עכשיו.
14. **Wave Mode:** כמשתמש בסטרס, אני רוצה מסך ריק עם טיימר ונשימה — בלי הסחות.
15. **Cooling Window:** כמשקיע, אני רוצה טיימר שמונע ממני לבדוק את התיק.
16. **מסע:** כמשתמש, אני רוצה לראות את כל ההיסטוריה שלי מסוננת לפי נושא ולפי סוג.

---

## סיכום כמותי

| קטגוריה | כמות |
|---------|------|
| **Entities (סה"כ)** | ~41 |
| **IndexedDB Stores** | 41 |
| **Indexes** | ~60 |
| **מסכים ראשיים** | 5 (Bottom Nav) + Topic Detail + Wizards + Onboarding |
| **Protocols (Wizards)** | 3 (Urge, Trigger/Hurt, Half Power) |
| **Therapeutic Modules** | 9 (Insights, Gratitude, Goals, Tracking, Session Close, Therapy Questions, Trigger Log, Wins, Cycle Summary) |
| **Topic-Specific Features** | 12 (3 שוק ההון + 4 זוגיות + 3 סטרס + 3 שינה) |
| **Cross-Topic Features** | 5 |
| **Build Phases** | A-F + Phase 2 |

---

*מסמך מאסטר סופי. מאחד את כל המסמכים למפרט אחד מחייב. גרסה 3.1 (אחרי ביקורת מלאה) — פברואר 2026.*
