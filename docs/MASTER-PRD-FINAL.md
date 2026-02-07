# MindVault — מסמך מאסטר סופי למפתחים

**גרסה:** 4.0 (Final Master PRD)  
**סטטוס:** מוכן לפיתוח  
**תאריך:** 7 בפברואר 2026  
**מאחד:** PRD-DEVELOPERS.md v3.0 + FEEDBACK-v1.1.md + TOPICS-SYSTEM-SPEC.md v1.1 + MASTER-SPEC.md v3.1 + CHANGELOG-v2-to-v3.md

> **מסמך זה הוא ה-Source of Truth היחיד.** כל מסמך אחר מיושן.

---

## תוכן עניינים

| # | פרק | תיאור |
|---|------|-------|
| 1 | [חזון ומטרה](#1-חזון-ומטרה) | מה זה, למי, ערך מפתח |
| 2 | [עקרונות ליבה](#2-עקרונות-ליבה) | טכניים, UX, מערכתיים — לא מתפשרים |
| 3 | [Stack טכנולוגי](#3-stack-טכנולוגי) | טכנולוגיות, ארכיטקטורה |
| 4 | [Topic System — שלד המערכת](#4-topic-system--שלד-המערכת) | Inbox Pattern, Visual Context, Privacy per Topic |
| 5 | [מודל נתונים מלא](#5-מודל-נתונים-מלא) | כל ה-Entities — Core + Topics + Therapeutic + Personal |
| 6 | [IndexedDB Schema](#6-indexeddb-schema) | כל ה-Stores + Indexes |
| 7 | [מסכים וניווט](#7-מסכים-וניווט) | IA, Bottom Nav, Home, Topics Home, Topic Detail |
| 8 | [מודולים — Core](#8-מודולים--core) | Today, Agenda, Therapy, Packet, Vault |
| 9 | [מודולים — טיפוליים](#9-מודולים--טיפוליים) | Insights, Gratitude, Goals, Tracking, Session Close, Therapy Questions, Trigger Log, Wins, Cycle Summary |
| 10 | [מודולים — אישיים](#10-מודולים--אישיים) | Wishes, Letters to Self, Strengths, Values, Media (Audio + Image) |
| 11 | [מודולים — פרוטוקולים (Wizards)](#11-מודולים--פרוטוקולים-wizards) | Urge Protocol, Trigger vs Hurt, Half Power |
| 12 | [מודולים — Topic-Specific](#12-מודולים--topic-specific) | שוק ההון, זוגיות, סטרס, שינה |
| 13 | [מודולים — Cross-Topic](#13-מודולים--cross-topic) | Ten Minutes Rule, One Sentence, Choice Log, Toolbox, Internal Validation |
| 14 | [Journey — מפרט מלא](#14-journey--מפרט-מלא) | Scope, Tabs, Cross-Topic View, Milestones |
| 15 | [עיצוב ו-UX](#15-עיצוב-ו-ux) | Design System, Components, UX Guidelines, Empty States, Micro-interactions, Onboarding |
| 16 | [אבטחה ופרטיות](#16-אבטחה-ופרטיות) | Threat Model, Encryption, Recovery Key, Privacy per Topic |
| 17 | [סדר בנייה — Roadmap](#17-סדר-בנייה--roadmap) | Phase A-F + Sprint Plan |
| 18 | [מדדי הצלחה](#18-מדדי-הצלחה) | KPIs |
| 19 | [שאלות פתוחות](#19-שאלות-פתוחות) | החלטות שנותרו |
| 20 | [מחוץ לסקופ](#20-מחוץ-לסקופ) | מה לא נעשה — לעולם / לא ב-MVP |
| 21 | [נספח: User Stories](#21-נספח-user-stories) | סיפורי משתמש |
| 22 | [נספח: סיכום כמותי](#22-נספח-סיכום-כמותי) | מספרים |
| 23 | [נספח: מעקב פידבק](#23-נספח-מעקב-פידבק) | כל נקודות הפידבק ואיפה טופלו |

---

## 1. חזון ומטרה

### מה זה MindVault?

**עוזר אישי לניהול תהליך טיפולי בין פגישות.**

פותר את "החור השחור": תובנות שנשכחות, אירועים שלא מגיעים לפגישה, סיכומים שמתפזרים.

### למי?

אדם שנמצא בתהליך טיפולי (פסיכולוגי, CBT, DBT, זוגי) ומחפש דרך מסודרת לנהל את מה שקורה **בין** הפגישות — בלי לאבד תובנות, בלי לשכוח מה רצה להגיד, ובלי שמישהו אחר יקרא את מה שכתב.

### ערך מפתח

> *"התובנות שלך הן שלך בלבד. שום אלגוריתם לא קורא אותן."*

### ארכיטקטורה — Topic-Centric

**Topics הופך לשלד של כל האפליקציה.** במקום אפליקציה "שטוחה" עם מודולים, המערכת עוברת למודל **Topic-centric**: כל דבר שייך לנושא טיפולי, וכל נושא מכיל את כל הכלים.

---

## 2. עקרונות ליבה

### עקרונות טכניים — לא מתפשרים

| עקרון | משמעות למפתח |
|-------|---------------|
| **Zero AI** | אסור שום קריאה ל-API של AI/LLM. אין תיוג/סיכום/ניתוח אוטומטי. אין תמלול הקלטות. אין OCR על תמונות |
| **Offline-first** | האפליקציה חייבת לעבוד בלי אינטרנט. IndexedDB = מקור האמת היחיד |
| **אפס אשמה** | אין streaks, אין "פספסת", אין התראות מעיקות, אין gamification שלילי |
| **פרטיות מלאה** | PIN + הצפנה + מצב דיסקרטי + Privacy per Topic. הכל מקומי |
| **פעולה אחת** | כל פעולה מרכזית — לחיצה אחת בלבד |
| **Manual Only** | כל תיוג, קטגוריזציה וארגון — ע"י המשתמש בלבד |

### עקרונות UX

| עקרון | יישום |
|-------|-------|
| **מינימום שורה אחת** | כל רובריקה עובדת עם שדה אחד חובה + "להעמיק" |
| **ברירת מחדל = חופשי** | הרובריקות הן כפתורים, לא שדות חובה |
| **Progressive disclosure** | מראים פשוט, מרחיבים רק למי שרוצה |
| **Mobile-first** | כל עיצוב מתחיל ממובייל (375px) |
| **Warm & Safe** | שפה עיצובית חמה, מזמינה, לא קלינית |

### עקרונות מערכתיים

| עקרון | משמעות |
|-------|--------|
| **Topic כקונטקסט** | כל פריט שייך לנושא. הנושא נותן הקשר טיפולי: כלים, פרוטוקול, היסטוריה |
| **שיטת המגירות (Inbox)** | כתיבה קודם, שיוך אחר כך. אם המשתמש לחוץ — הכל נכנס ל-Inbox |
| **פרוטוקולים כ-Wizards** | כל פרוטוקול טיפולי הוא תהליך שלב-אחר-שלב, לא טופס ארוך |
| **Visual Context** | לכל Topic צבע מוביל. כשנכנסים לנושא — ה-UI משתנה. שינוי סטייט תודעתי דרך ה-UI |

---

## 3. Stack טכנולוגי

| שכבה | טכנולוגיה | הערות |
|------|-----------|-------|
| Frontend | React + Next.js 14 | App Router. (שיקול: Vite עדיף ל-PWA pure — ראה שאלות פתוחות) |
| תצורה | PWA | Service Worker + Manifest |
| אחסון | IndexedDB (idb) | Offline-first, מקור אמת יחיד |
| הצפנה | AES-GCM + PBKDF2 | מפתח נגזר מ-PIN עם salt |
| UI | Tailwind CSS | Design Tokens מותאמים |
| חיפוש | FlexSearch (מומלץ) | Client-side full-text |
| מדיה | IndexedDB Blobs | Audio (WebM) + Image (compressed JPEG) |
| Cloud | **אין** ב-MVP | Phase 2: E2E encrypted sync |

---

## 4. Topic System — שלד המערכת

### 4.1 מהו Topic

Topic = נושא טיפולי שהמשתמש מגדיר. לכל Topic יש שם, אייקון (emoji), צבע, ו-Playbook אישי.

**דוגמאות:** שוק ההון, זוגיות, סטרס, שינה, עבודה, הורות, ביקורת עצמית, גבולות.

### 4.2 שיוך פריטים — Inbox Pattern

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

### 4.3 ניהול Topics

| פעולה | פירוט |
|-------|-------|
| יצירה | שם + אייקון (emoji) + צבע (מתוך פלטה קבועה) |
| עריכה | שינוי שם / אייקון / צבע |
| Archive | נושא לא פעיל — לא מופיע ברשימות, הנתונים נשמרים |
| Unarchive | החזרה לפעיל |
| מחיקה | **אין מחיקה.** רק Archive |
| סדר | Drag & drop לסדר ב-Topics Home |

### 4.4 מגבלות

| מגבלה | ערך | סוג |
|-------|-----|------|
| נושאים פעילים | 4–8 | **Soft limit** — הודעה ידידותית אחרי 8 |
| נושאים מקסימום (כולל archived) | 20 | **Hard limit** |
| אורך שם | 30 תווים | Hard limit |
| Secondary topics per item | 3 | Hard limit |

### 4.5 Visual Context — צבע מוביל

כשהמשתמש נכנס ל-Topic Detail Screen, ה-UI משתנה:

| רכיב | שינוי |
|------|-------|
| **Header background** | Gradient עדין מ-`topic.color` ל-transparent |
| **CTA buttons** | `topic.color` כ-accent |
| **Tab indicator** | `topic.color` underline |
| **Card borders** | `topic.color` בעוצמה 20% (subtle) |
| **Playbook Emergency button** | `topic.color` כ-background |

**טכנית:** CSS variable `--topic-accent` מוגדר ברמת ה-Topic Detail layout. Light variant: `--topic-accent-light` (20% opacity).

### 4.6 Privacy per Topic

| הגדרה | פירוט |
|-------|-------|
| `requirePin` | Topic דורש PIN מחדש בכל כניסה |
| `topicPin` | hash של PIN ייעודי (4 ספרות), או null = PIN גלובלי |
| `blurByDefault` | כרטיס מטושטש ב-Topics Home. נגישות רק דרך long-press |
| `hideFromJourney` | פריטים לא מופיעים ב-Journey "הכל" — רק ב-Journey של ה-Topic |

### 4.7 Topic מובנה: "כללי"

תמיד קיים, לא ניתן למחיקה/ארכוב. `id` קבוע בקוד (`GENERAL_TOPIC_ID`). שם: "כללי", אייקון: "📝", `isDefault: true`.

---

## 5. מודל נתונים מלא

### 5.0 Data Conventions

| נושא | סטנדרט |
|------|--------|
| **IDs** | UUID v4 בכל ה-stores. `sourceId` תמיד UUID — **אסור** ערכים חופשיים |
| **תאריכים (date)** | `YYYY-MM-DD` (local timezone) |
| **Timestamps** | ISO 8601 עם timezone: `2026-02-06T14:30:00+02:00` |
| **Soft Delete** | `deletedAt: string \| null` בכל entity |
| **Trash Policy** | פריט שנמחק נשמר 30 יום. אחרי 30 יום — נמחק לצמיתות. Trash UI: רשימת פריטים מחוקים עם כפתור "שחזר" |
| **Sync Readiness** | `updatedAt` + `deletedAt` בכל entity |
| **deviceId** | שדה אופציונלי `deviceId: string \| null` על כל entity — ריק ב-MVP, חוסך migration ב-Phase 2 (sync) |

---

### 5.1 Topic

```typescript
interface Topic {
  id: string;                    // UUID
  name: string;                  // מקסימום 30 תווים
  icon: string;                  // emoji
  color: string;                 // hex מתוך פלטה קבועה
  northStarSentence: string;     // "משפט הבית" — אופציונלי
  sortOrder: number;
  isDefault: boolean;            // true רק ל"כללי"
  isArchived: boolean;
  // --- Privacy ---
  requirePin: boolean;
  topicPin: string | null;       // hash של PIN ייעודי
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

### 5.2 TherapyCycle

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
- עריכת/מחיקת session → מחשב מחדש cycleIds + Toast "הסייקל עודכן, X פריטים הועברו"

### 5.3 Core Entities

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
  textSnapshot: string;          // העתק מקורי — freeze policy
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
  sourceId: string | null;       // תמיד UUID
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

### 5.4 Therapeutic Entities

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
  sourceRange: { startOffset: number; endOffset: number; snapshot: string; } | null;
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

interface TherapyQuestion {
  id: string;
  text: string;
  why: string | null;
  sourceId: string | null;
  sourceType: 'entry' | 'session' | 'insight' | null;
  status: 'open' | 'discussed';
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

interface TriggerLog {
  id: string;
  trigger: string;               // "מה הפעיל אותי"
  automaticResponse: string;     // מילה אחת: "נסיגה"
  alternative: string;           // מילה אחת: "לשאול"
  primaryTopicId: string | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface WinEntry {
  id: string;
  date: string;
  didWell: string;               // חובה
  facedChallenge: string | null;
  primaryTopicId: string | null;
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface CycleSummary {
  id: string;
  cycleId: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface SessionPlan {
  id: string;
  sessionId: string | null;
  goal: string;                  // "מה אני רוצה להשיג היום"
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface PacketSnapshot {
  id: string;
  generatedAt: string;
  cycleId: string;
  content: string;               // Markdown/JSON snapshot
  createdAt: string;
}
```

### 5.5 Personal/Emotional Entities

```typescript
interface Wish {
  id: string;
  text: string;                  // "אני מאחל לעצמי ש..."
  why: string | null;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

interface LetterToSelf {
  id: string;
  type: 'from_future' | 'from_past' | 'from_present';
  title: string;
  content: string;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Strength {
  id: string;
  text: string;                  // "אני טוב ב..."
  example: string | null;
  sourceType: 'entry' | 'session' | 'standalone' | null;
  sourceId: string | null;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

interface Value {
  id: string;
  name: string;                  // "כנות", "חירות", "משפחה"
  why: string | null;
  livingExample: string | null;
  conflictExample: string | null;
  tags: string[];
  primaryTopicId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// --- מדיה ---

interface AudioMemo {
  id: string;
  duration: number;              // שניות
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

interface ImageEntry {
  id: string;
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;
  tags: string[];
  cycleId: string;
  primaryTopicId: string | null;
  createdAt: string;
  deletedAt: string | null;
}
```

### 5.6 Topic Playbook & Tools

```typescript
interface TopicPlaybook {
  id: string;
  topicId: string;               // unique per topic (1:1)
  northStarSentence: string;     // "משפט הבית"
  rescueToolIds: string[];       // 1-3 כלים
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
  whenToUse: string;
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

### 5.7 Protocol Entities

```typescript
interface UrgeEvent {
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
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TriggerHurtEvent {
  id: string;
  primaryTopicId: string | null;
  secondaryTopicIds: string[];
  intensityLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  coolingEnforced: boolean;
  coolingDuration: number;
  type: 'trigger' | 'hurt';
  regulationDuration: number;
  draftMessage: string;
  boundaryRequest: string;
  boundaryDefinition: string;
  boundaryConsequence: string;
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

### 5.8 Topic-Specific Entities

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

interface RoutineStep { id: string; text: string; sortOrder: number; }

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

### 5.9 Cross-Topic Entities

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
```

---

## 6. IndexedDB Schema

```javascript
const DB_VERSION = 5;

// ===== Core Stores =====
db.createObjectStore('cycles',            { keyPath: 'id' });
db.createObjectStore('sessions',          { keyPath: 'id' });
db.createObjectStore('entries',           { keyPath: 'id' });
db.createObjectStore('highlights',        { keyPath: 'id' });
db.createObjectStore('agendaItems',       { keyPath: 'id' });
db.createObjectStore('actionItems',       { keyPath: 'id' });
db.createObjectStore('tags',              { keyPath: 'id' });
db.createObjectStore('settings',          { keyPath: 'key' });

// ===== Therapeutic Stores =====
db.createObjectStore('insights',          { keyPath: 'id' });
db.createObjectStore('gratitudeEntries',  { keyPath: 'id' });
db.createObjectStore('goals',             { keyPath: 'id' });
db.createObjectStore('goalCheckIns',      { keyPath: 'id' });
db.createObjectStore('trackers',          { keyPath: 'id' });
db.createObjectStore('trackerEntries',    { keyPath: 'id' });
db.createObjectStore('therapyQuestions',  { keyPath: 'id' });
db.createObjectStore('triggerLogs',       { keyPath: 'id' });
db.createObjectStore('winEntries',        { keyPath: 'id' });
db.createObjectStore('cycleSummaries',    { keyPath: 'id' });
db.createObjectStore('sessionPlans',      { keyPath: 'id' });
db.createObjectStore('packetSnapshots',   { keyPath: 'id' });

// ===== Personal/Emotional Stores =====
db.createObjectStore('wishes',            { keyPath: 'id' });
db.createObjectStore('lettersToSelf',     { keyPath: 'id' });
db.createObjectStore('strengths',         { keyPath: 'id' });
db.createObjectStore('values',            { keyPath: 'id' });
db.createObjectStore('audioMemos',        { keyPath: 'id' });
db.createObjectStore('imageEntries',      { keyPath: 'id' });
db.createObjectStore('mediaBlobs',        { keyPath: 'key' });

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
```

**סה"כ: 48 Stores, ~65 Indexes** (Indexes מפורטים ב-MASTER-SPEC.md v3.1 סעיף 5)

---

## 7. מסכים וניווט

### 7.1 Bottom Nav (5 טאבים)

| # | טאב | אייקון | תוכן |
|---|------|--------|------|
| 1 | **היום** | ✏️ | Quick actions + Recent + Inbox banner + כתיבה מהירה |
| 2 | **נושאים** | 🏷️ | Topics Home — grid של כל הנושאים |
| 3 | **מסע** | 🗺️ | Journey — Timeline כרונולוגי (עם Topic filter) |
| 4 | **אג'נדה** | 📋 | Agenda — נקודות לפגישה (עם Topic filter) |
| 5 | **עוד** | ≡ | Vault, Export, Settings, Therapy Vault (סיכומים) |

### 7.2 מסך "היום" (Hub)

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
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ פעולות מהירות ─────────────────────────────────────────┐ │
│  │  [✏️ כתיבה מהירה]  [🆘 דחיפות]  [🙏 תודה]  [⚡ חצי]  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ אחרונים ───────────────────────────────────────────────┐ │
│  │  רשומה (📊) — "החלטתי לא לבדוק..."          לפני 2 שע' │ │
│  │  הכרת תודה (💑) — "תודה לאור שהק..."        אתמול      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  [🟦 אני בפגישה עכשיו — הצג נקודות]                         │
│                                                               │
│  🔒 פרטי לגמרי • בלי AI • הכל נשאר אצלך                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Topics Home

Grid של כל הנושאים הפעילים. כל כרטיס: אייקון + שם + צבע רקע + סטטיסטיקה קצרה. Topics עם `blurByDefault` מטושטשים. ארכיון מתחת (collapsible).

### 7.4 Topic Detail Screen

Tabs בתוך Topic (scroll אופקי):

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
| Playbook | North Star + Rescue Kit + Sections |

3 הראשונים (סקירה, כתיבה, אג'נדה) תמיד נראים. השאר — גלילה אופקית.

כפתור 🆘 "מצב חירום — Playbook" נגיש תמיד בתוך Topic.

---

## 8. מודולים — Core

### 8.1 Today (כתיבה)

| Feature | Description |
|---------|-------------|
| Writing Canvas | שדה טקסט חופשי, נקי |
| Autosave | **Debounce 700-1200ms**, drafts store נפרד, flush on exit (page visibility change) |
| Save Indicator | "שומר..." → "נשמר ✓" (עם timestamp) → "טיוטה" |
| Text Selection | בחירת טקסט → Toolbar: אג'נדה / תובנה / הארה |
| Tags | בחירה ידנית מסט מוגדר (`tags: string[]` על DailyEntry) |
| Entry Type | free / thought / feeling / gratitude / win |
| Topic | Topic picker (ברירת מחדל: אחרון). "כתיבה מהירה" → Inbox |
| Multiple per day | אפשר ליצור מספר רשומות באותו יום |

### 8.2 Agenda (אג'נדה)

| Feature | Description |
|---------|-------------|
| **2 Tabs** | **"נושאים"** (AgendaItems) ו**"שאלות"** (TherapyQuestions) |
| Items List | AgendaItems עם סדר עדיפות, עם Topic badges (אייקון + צבע) |
| Source Link | קישור למקור (entry/session/insight) — תמיד UUID |
| Status | open / done |
| Priority | Drag & Drop |
| Topic Filter | סינון לפי Topic (chips אופקיים) |
| In-Room Mode | תצוגה גדולה ונקייה, font גדול, **read-only toggle** |
| Mark as Discussed | כפתור ליד כל פריט במצב בחדר |
| Hide Done Toggle | במצב בחדר |

### 8.3 Therapy (סיכומי טיפול)

| Feature | Description |
|---------|-------------|
| Session List | רשימת סיכומים לפי תאריך |
| Add Session | תאריך + סיכום + Topic |
| Session Plan | שדה אופציונלי **לפני** פגישה: "מה אני רוצה להשיג היום" |
| Search | FlexSearch — MVP: entries + sessions בלבד |
| Calendar View | תצוגת לוח שנה עם סימון ימי פגישות |
| Input | Paste text בלבד. PDF parsing ב-Phase 2 |
| Edit → Recalc | עריכת session → עדכון cycleIds רטרואקטיבי + Toast |

### 8.4 Packet (פקט לפגישה)

**תוכן:** 1) אג'נדה פתוחה עם Topic badges, 2) שאלות לטיפול פתוחות, 3) תובנות מוצמדות, 4) הארות מהסייקל, 5) Action Items פתוחים.

**פורמטים:** In-App View (תצוגת הדפסה) + Print to PDF (`window.print`) + Export Markdown.

**Packet Snapshot History:** כשמייצרים Packet → שומר PacketSnapshot. אפשר לראות "מה הבאתי לפגישה של 15 בינואר".

**Packet Quick View (Sprint 3+):** PWA Badge + Shortcut icon שפותח ישירות מצב "בחדר".

### 8.5 Vault (הגדרות)

| Feature | Description |
|---------|-------------|
| PIN | נעילה עם PIN 4-6 ספרות |
| Recovery Key | מפתח שחזור חד-פעמי ב-onboarding |
| Discrete Mode | טשטוש תוכן בלחיצה |
| Auto-lock | אחרי 5 דקות + tab blur (opt-in, grace period 3-5 שניות) |
| Export | JSON (`mindvault_export_v1.json` עם schema version) + Markdown לפי סייקלים |
| Export Toggle | "כולל פריטים מחוקים?" |
| Export Compat | Schema forward-compatible |
| Backup Reminder | באנר חודשי פנימי: "רוצה לגבות?" — אין push, אין guilt |
| Topic Privacy | ניהול PIN/blur/hide per Topic |
| Storage Usage | אינדיקטור שימוש באחסון (חשוב עם מדיה) |

---

## 9. מודולים — טיפוליים

### 9.1 Insights — Quick (~20 שניות): title + type. Deep: Full fields. Pin, Add to Agenda בלחיצה אחת.

### 9.2 Gratitude — Quick (~60 שניות): שדה אחד + Topic. Deep: 3 שדות + feeling + memoryNote. **Spotlight Presets** per Topic (זוגיות: "תודה אחת לאור", שינה: "דבר אחד שעזר להירדם"). אין streak.

### 9.3 Goals — title, why, horizon (weekly/monthly/open), status, pin. מטרה מוצמדת ב-Home.

### 9.4 Tracking — name, valueType (boolean/rating/count/duration/note), frequency. Quick Log UI.

### 9.5 Session Close — אופציונלי. 3 שדות: משפט אחד לקחת (→ Insight), דבר אחד לנסות (→ ActionItem), מה לא אמרתי וחבל (→ Agenda).

### 9.6 Therapy Questions — שאלה + למה זה חשוב + קישור למקור. Tab ייעודי באג'נדה. נכנס ל-Packet כסעיף נפרד.

### 9.7 Trigger Log — 3 שדות, 10 שניות: מה הפעיל / תגובה אוטומטית (מילה) / מה הייתי רוצה אחרת (מילה). Journey אייקון ⚡.

### 9.8 Wins — דבר אחד שעשיתי טוב (חובה) + דבר שהתמודדתי איתו (אופציונלי). Journey אייקון 🏅.

### 9.9 Cycle Summary — בסוף סייקל, הזמנה לכתוב "מה למדתי". לא חובה. אפס אשמה. Journey אייקון 📖.

---

## 10. מודולים — אישיים

### 10.1 Wishes ("מה אני מאחל לעצמי")

**מטרה:** בניית שפת רצון — לא רק שפת כאב. **אין סטטוס.** משאלה היא לא משימה, היא פשוט קיימת.

- שדה טקסט אחד חובה + "למה" אופציונלי
- מופיע ב-Journey (טאב "משאלות" + "הכל")
- יצירה ב-15 שניות

### 10.2 Letters to Self (מכתב לעצמי) — Sprint 3

3 סוגים: מהעתיד / מהעבר / מהיום. כותרת + כתיבה חופשית.

### 10.3 Strengths (כוחות שלי) — Sprint 3

"אני טוב ב..." — שדה אחד חובה. דוגמה אופציונלית. אפשר ליצור מתוך טקסט מסומן.

### 10.4 Values (ערכים שלי) — Sprint 3

ערך + "למה חשוב לי" + דוגמת חיים + דוגמת קונפליקט. Progressive disclosure.

### 10.5 Media (הקלטה + תמונה) — Sprint 2

**Zero AI:** אין תמלול, אין OCR. הקלטה/תמונה נשמרות כמו שהן + הערה ידנית.

- **הקלטה:** Record → Stop → Preview → Note → Save (WebM, IndexedDB blob)
- **תמונה:** Capture/Pick → Preview → Note → Save (compressed JPEG, IndexedDB blob)
- Storage usage indicator בהגדרות + באנר כשמתקרבים למגבלה

---

## 11. מודולים — פרוטוקולים (Wizards)

### 11.1 Urge Protocol — 4 שלבים

| # | שלב | מה קורה | חובה? |
|---|------|---------|-------|
| 1 | **זיהוי** | Topic + קטגוריית דחף (check/send/buy/react/avoid/custom) + טקסט | כן |
| 2 | **השהיה** | נשימה ויזואלית 10 שניות (expand 4s → hold 3s → shrink 3s) | אפשר לדלג |
| 3 | **מחיר** | "מה יקרה מחר אם אעשה את זה עכשיו?" | כן |
| 4 | **חלופה** | "מה אני בוחר במקום?" + כלי מ-Toolbox + "דחה 10 דק" | כן |

שלב 2: כפתור "הבא" מושבת 10 שניות, "דלג" תמיד זמין.  
שלב 4: כלים מ-TopicTools (Rescue Kit). "דחה 10 דקות" → TenMinuteDefer אוטומטית.  
Toast: "נרשם. אתה בוחר." `outcome` ניתן לעדכון מאוחר.

### 11.2 Trigger vs Hurt — Wizard עם מדחום רגשי

**שלב 1 — מדחום רגשי:** Slider 1-10. 
- 1-4: ירוק → ממשיך
- 5-7: כתום → המלצה לנשום, לא כפוי
- **8-10: אדום → Cooling כפוי 5 דקות, כפתור "סיימתי" נעול**

**שלב 2 — בחירת סוג:** 😤 טריגר / 💔 פגיעה  
**שלב 3 (טריגר):** טיימר ויסות 60-120 שניות → טיוטת הודעה (**לא נשלחת**)  
**שלב 3 (פגיעה):** תבנית גבול: מבקש + גבול + תוצאה  
**שלב 4:** סיכום + שמירה + "רוצה להוסיף לאג'נדה?"

### 11.3 Half Power — 3 רמות

| רמה | מה עושים | זמן | Template |
|-----|----------|------|---------|
| **1 — Emoji** | בחירת emoji: 😊😐😔😤😰🥱 | 2 שניות | `emoji_checkin` |
| **2 — Action Check** | "עמדתי בחוק?" כן/לא | 3 שניות | `action_check` |
| **3 — כתיבה מצומצמת** | לפי Topic template | 30-90 שניות | לפי Topic |

Templates רמה 3: סטרס=freeform_90s, שוק ההון=one_sentence (280 תווים), זוגיות=facts_only, אחר=custom.

**Emoji Check-in = פיצ'ר קריטי למניעת נטישה.** לחיצה אחת מספיקה. Toast: "נרשם. מספיק להיום."

---

## 12. מודולים — Topic-Specific

### 12.1 שוק ההון
- **Market Interrupt Plan:** שעת בדיקה + תנאי לפעולה + "לא עושה בין לבין". Plan אחד פעיל.
- **Cooling Window:** טיימר 30 דק / 1 שעה / 2 שעות / עד מחר / custom. Countdown ויזואלי.
- **Decision Log:** "פעולה שאני דוחה" + "למה". Quick entry.

### 12.2 זוגיות
- **Regulate then Communicate:** טיימר ויסות → טיוטת הודעה (**לא נשלחת**).
- **Boundary Drafts:** מבקש + גבול + תוצאה. נשמר כטיוטה.
- **Repair Note:** אחריות (חובה) + מבקש (חובה) + מעריך (אופציונלי). Journey אייקון 🤝.
- **Internal Validation:** כפתור "לא שולח עכשיו" → Overlay 10 שניות עם משפט אישור.

### 12.3 סטרס
- **Now Check-in:** גוף + דחיפות (1-5) + בחירה. 3 שדות.
- **Wave Mode:** מסך מלא, רקע כהה, **אין ניווט**. Stopwatch + נשימה 4-7-8.
- **Micro-Boundary:** חוק קטן להיום + self-report כן/לא/קשה.

### 12.4 שינה
- **Wind-down Routine:** 1-5 צעדים, drag & drop. Checklist יומי. **אין streak.**
- **Sleep Log Lite:** שעת שינה + קימה + איכות (1-5) + "מה הפריע". אחד ליום. Mini-graph 7 ימים.
- **Phone Rule:** סוג חוק + טיימר X דקות לפני שינה. **אין enforcement — רק תזכורת.**

---

## 13. מודולים — Cross-Topic

### 13.1 Ten Minutes Rule — "מה רציתי לעשות?" → Topic → טיימר 10 דק. **אין push notification.**
### 13.2 One Clean Sentence — 280 תווים, 4 prompts. Counter ויזואלי.
### 13.3 Choice Log — "מה בחרתי לא לעשות" + Topic + תאריך.
### 13.4 Toolbox per Topic — 2-5 כלים (שם + מתי + סימן). כפתור "הפעל" → ToolUsage.

---

## 14. Journey — מפרט מלא

### 14.1 שכבות ניווט

**Scope Filter:** `[הכל] [שוק ההון] [זוגיות] [סטרס] [שינה] [כללי]`  
**Cycle Filter:** ברירת מחדל = סייקל נוכחי. אפשרות "הכל" / סייקל ספציפי.  
**Scroll Position:** נשמר per-tab.

**Module Tabs:**

| Tab | מציג |
|-----|------|
| **הכל** | הכל (ברירת מחדל) |
| **רשומות** | DailyEntry, HalfPowerEntry, OneSentenceEntry, WinEntry, AudioMemo, ImageEntry |
| **פגישות** | Sessions |
| **תובנות** | Highlight, Insight |
| **מטרות** | Goals |
| **משאלות** | Wishes |
| **תודה** | GratitudeEntry |
| **כוחות** | Strengths |
| **מכתבים** | LettersToSelf |
| **ערכים** | Values |
| **אג'נדה** | AgendaItem, TherapyQuestion |
| **דחיפויות** | UrgeEvent, TriggerHurtEvent, TenMinuteDefer |
| **מעקב** | SleepLog, CoolingWindow, MicroBoundary, NowCheckin, WaveModeSession, ChoiceLog, DecisionLog, TriggerLog, TrackerEntries |
| **כלים** | ToolUsage |

### 14.2 Cross-Topic View ("מבט על")

Toggle ב-Journey כשה-Scope = "הכל". ימים מקובצים לפי Topics, כל Topic בצבע שלו. **אין ניתוח אוטומטי — Zero AI.**

### 14.3 Topic Milestones (computed, לא stored)

| Milestone | תצוגה |
|-----------|-------|
| 7 ימים ללא Urge | 🏆 "שבוע שלם בלי דחיפות!" |
| 3 Cooling Windows | 🏆 "3 פעמים עמדת בזה!" |
| 10 רשומות | 🏆 "10 רשומות — אתה כותב!" |
| 5 כלים | 🏆 "5 פעמים השתמשת בכלים שלך" |
| Repair Note ראשון | 🏆 "צעד ראשון בתיקון" |
| 30 Sleep Logs | 🏆 "חודש שלם של מעקב שינה" |

מקסימום 1 ליום. רק ב-Topic ספציפי. **אין "איבדת streak" — אפס אשמה.**

### 14.4 Entity Icons in Journey

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
| AudioMemo | 🎤 |
| ImageEntry | 📷 |
| Wish | 🌟 |
| LetterToSelf | ✉️ |
| Strength | 💪 |
| Value | 🧭 |

### 14.5 Empty States

**כל Empty State חייב 3 דברים:** 1) Illustration מינימלית (או emoji גדול), 2) כותרת מעודדת, 3) CTA ברור (כפתור, לא לינק).

| טאב | Empty State |
|-----|------------|
| הכל | "כאן יתחיל המסע שלך. כתוב את הרשומה הראשונה" |
| רשומות | "כתוב את הרשומה הראשונה" |
| פגישות | "הוסף סיכום מהפגישה האחרונה כדי לא לשכוח" |
| תובנות | "תובנות נוצרות מהכתיבה שלך, או שאפשר להוסיף ישירות" |
| מטרות | "מה חשוב לך לעבוד עליו? המטרה הראשונה מחכה" |
| משאלות | "מה אתה מאחל לעצמך?" |
| תודה | "על מה אתה מודה? אפילו דבר קטן" |
| כוחות | "מה אתה טוב בו?" |
| מכתבים | "כתוב מכתב לעצמך" |
| ערכים | "מה באמת חשוב לך?" |
| אג'נדה | "עוד לא הכנת נושאים. כשמשהו יעלה — הוא יחכה לך פה" |
| מעקב | "עקוב אחרי משהו לאורך זמן" |

---

## 15. עיצוב ו-UX

### 15.1 Design Tokens

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
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px;  --space-xl: 32px;  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-primary: 0 4px 16px rgba(107,78,230,0.25);

  /* Typography (RTL Hebrew) */
  --font-family: 'Heebo', 'Rubik', sans-serif;
  --font-size-hero: 28px;     /* line-height: 36px */
  --font-size-title: 20px;    /* line-height: 28px */
  --font-size-body: 16px;     /* line-height: 24px */
  --font-size-caption: 13px;  /* line-height: 18px */

  /* Topic Accent (dynamic per topic) */
  --topic-accent: var(--color-primary);
  --topic-accent-light: rgba(107,78,230,0.2);
}
```

### 15.2 Component Patterns

**Cards:** `card-premium`, `card-interactive` (hover lift 2px), `card-topic` (20% opacity background).  
**Buttons:** `btn-primary` (gradient purple, 48-56px), `btn-secondary`, `btn-ghost`, `btn-topic`.  
**Navigation:** Glass morphism bottom nav (max 56-64px), active state gradient + dot, `safe-area-inset-bottom`.

### 15.3 UX Guidelines

| Rule | Implementation |
|------|----------------|
| Mobile-first | Design from 375px up |
| Touch targets | Min 44x44px |
| Safe areas | Respect notch + home indicator |
| Max width | Content limited to 720px, centered |
| Empty states | Icon + warm message + CTA (see 14.5) |
| Loading | Skeleton screens, no spinners |
| Transitions | 200ms ease-out, no jarring |
| Toasts | Success/error with haptic feedback |
| Cards | Stack (לא side-by-side) במסכים < 640px |
| Contrast | WCAG AA: >= 4.5:1 for text |
| Virtualization | react-virtuoso ב-Journey |
| Snippets | 80-120 תווים ברשימות |

### 15.4 Micro-interactions

- Page transitions: fade-in-up 400ms
- Cards: hover lift 2px + shadow increase
- Buttons: scale 0.97 on press
- Selection toolbar: pop-in animation
- Save indicator: pulse on saving
- Skeleton screens בזמן טעינה
- Toast קצר אחרי שמירה
- Haptic vibration בפעולות

### 15.5 Warmth & Emotion

- **Gradient עדין** בראש מסכים (warm purple → soft peach)
- **ברכה אישית:** "ערב טוב, [שם]" עם תאריך עברי
- **Font עברי:** Heebo
- **Topic Visual Context:** צבע משתנה = שינוי תודעתי

### 15.6 Onboarding Flow

| # | מסך | תוכן |
|---|------|------|
| 1 | **ברוכים הבאים** | "MindVault — המרחב שלך בין הפגישות" |
| 2 | **Zero AI** | *"התובנות שלך הן שלך בלבד. שום אלגוריתם לא קורא אותן."* — **בידול שיווקי** |
| 3 | **הגדרת PIN** | 4-6 ספרות + Recovery Key (**חובה** לשמור) |
| 4 | **בחירת נושאים** | "על מה אתה עובד בטיפול?" — בחירה + "+ נושא חדש". מינימום 1, מקסימום 8 |
| 5 | **מוכן** | "הכל מוכן. מתחילים?" → מסך "היום" |

### 15.7 Definition of Done — מסך Home

1. CTA ראשי אחד ברור
2. Empty state של אג'נדה אינטראקטיבי
3. אין כפילות פעולות
4. Bottom nav מקסימום 5 טאבים
5. רספונסיבי: מובייל 1 עמודה, דסקטופ max-width 720px
6. Design tokens מיושמים
7. Font עברי (Heebo) מוטמע
8. מיקרוקופי מעודכן
9. נגישות: WCAG AA
10. Mobile: nav ≤ 56-64px + safe-area-inset-bottom
11. Mobile: cards stack < 640px
12. כפתור "אני בפגישה" כשיש נקודות באג'נדה

---

## 16. אבטחה ופרטיות

### 16.1 Threat Model

**מגנים מפני:** אדם זר שמשתמש במכשיר (PIN + Auto-lock), Shoulder surfing (Discrete Mode), אובדן נתונים (Export + Backup Reminder), צפייה בנושא רגיש (Privacy per Topic).

**לא מגנים מפני:** פריצה ממוקדת, Forensic analysis, Keyloggers/Malware.

### 16.2 Encryption

```typescript
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

### 16.3 Recovery Key Flow

1. User sets PIN → System generates 24-word Recovery Key
2. Screen: "שמור את המפתח הזה! בלעדיו לא נוכל לשחזר"
3. User confirms (copy / print / screenshot)
4. Recovery Key encrypts master key separately from PIN

### 16.4 Auto-lock

- Inactivity: 5 minutes (configurable)
- Tab blur: optional, grace period 3-5 seconds
- `visibilitychange` event + timestamp

### 16.5 Privacy per Topic

`requirePin` (PIN בכל כניסה), `topicPin` (PIN ייעודי), `blurByDefault` (CSS `filter: blur(10px)`), `hideFromJourney` (filter out ב-Journey "הכל").

---

## 17. סדר בנייה — Roadmap

### Phase A — שלד Topic System (חובה ראשון)

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
| A10 | Privacy per Topic | בינוני |

**Sprint 1 (במקביל):** Today (Writing + Autosave + Selection + Save indicator), Agenda (Items + Priority + In-room), Therapy (Summaries + Search), IndexedDB (Full schema + CRUD), UI (Design system + Tokens + Font עברי), Bottom Nav (5 tabs), Empty states, נגישות WCAG AA.

### Phase B — Playbook + כלים קריטיים

B1: Playbook | B2: Urge Protocol | B3: Now Check-in | B4: Wave Mode | B5: Ten Minutes Rule

**Sprint 2 (במקביל):** Journey full, Insights, Gratitude, Goals, Tracking, Therapy Questions, Trigger Log, Wins, Wishes, Audio Memos, Image Entries, Search (FlexSearch), Export, Vault (PIN + Recovery Key).

### Phase C — נושאים ייעודיים

C1: Market Interrupt | C2: Cooling Window | C3: Decision Log | C4: Trigger vs Hurt (Wizard + מדחום + Cooling כפוי) | C5: Regulate then Communicate | C6: Boundary Drafts | C7: Repair Note

### Phase D — Gratitude + הרחבות

D1: Gratitude per Topic | D2: Spotlight presets | D3: Half Power (3 רמות) | D4: Internal Validation | D5: One Sentence | D6: Choice Log

### Phase E — שינה + Toolbox

E1: Sleep Log | E2: Wind-down | E3: Phone Rule | E4: Micro-Boundary | E5: Toolbox per Topic | E6: ToolUsage

**Sprint 3 (כולל C-E):** Packet, Session Close, Session Plan, Cycle Summary, Letters, Strengths, Values, Onboarding, Backup Reminder, All topic-specific modules.

### Phase F — Journey Advanced

F1: Cross-Topic View ("מבט על") | F2: Topic Milestones (computed)

### Phase 2 (עתידי)

E2E Encrypted Sync, Decoy Mode, Collections, Saved Views, PDF Export, Dark Mode.

---

## 18. מדדי הצלחה

| Metric | Target |
|--------|--------|
| **Activation** | 5 פריטים בשבוע ראשון |
| **Retention** | כניסה שבועית לאורך 4 שבועות |
| **Prep KPI** | פתיחת Agenda/Packet לפני פגישה |
| **Reliability** | אפס מקרים של "איבדתי טקסט" |
| **Zero AI** | 0 קריאות ל-AI APIs |
| **Half Power** | שימוש ב-Emoji Check-in ביום "קשה" |

---

## 19. שאלות פתוחות

| # | שאלה | אפשרויות | החלטה |
|---|------|---------|--------|
| 1 | Highlight edit policy | Freeze snapshot / Update offsets | **Freeze** |
| 2 | Versioning for entries | None / Last edited / Full history | TBD |
| 3 | FlexSearch vs Fuse.js | FlexSearch (faster) / Fuse.js (simpler) | TBD |
| 4 | Dark mode | Sprint 2 / Phase 2 | TBD |
| 5 | Stack — Next.js vs Vite | Next.js (SSR) / Vite (lighter PWA) | **Next.js** (בשימוש) |
| 6 | Journey tabs visibility | כולם גלויים / משתמש מפעיל | **כולם גלויים** |
| 7 | Audio format | WebM / WAV / MP3 | TBD (WebM מומלץ) |
| 8 | Image compression | Original / 80% | TBD (דחיסה מומלצת) |
| 9 | מטרות naming | נפרדים / הכל תחת "מטרות" | **הכל תחת "מטרות"** עם horizon |

---

## 20. מחוץ לסקופ

**לעולם לא:**
- AI / LLM / ML של כל סוג
- תיוג אוטומטי / סיכום אוטומטי / ניתוח סנטימנט
- תמלול אוטומטי של הקלטות (Zero AI)
- OCR אוטומטי על תמונות (Zero AI)
- זיהוי דפוסים אוטומטי
- Streaks / Gamification (Milestones = חיובי בלבד)
- Push notifications מעיקות
- Social features
- Mood charts / graphs

**לא ב-MVP:**
- Cloud sync / Multi-device
- Voice-to-text / OCR / PDF parsing
- Collaboration / Therapist portal
- Decoy Mode
- Collections / Saved Views
- Full PDF export
- Dark mode (TBD)

---

## 21. נספח: User Stories

1. **כתיבה:** כמשתמש, אני רוצה לכתוב רשומה יומית ולראות שהיא נשמרת אוטומטית.
2. **כתיבה מהירה (Inbox):** כמשתמש לחוץ, אני רוצה לכתוב בלי לבחור נושא ולמיין אחר כך.
3. **סימון לטיפול:** אני רוצה לסמן קטע טקסט ולהוסיף אותו לאג'נדה בלחיצה אחת.
4. **אג'נדה:** אני רוצה לראות רשימה מסודרת עם Topic badges.
5. **תובנה:** אני רוצה לשמור "הבנתי ש..." ולחזור אליו בפגישה.
6. **הכרת תודה:** אני רוצה לכתוב 1-3 דברים שאני מודה עליהם — בהקשר של נושא.
7. **מטרה:** אני רוצה להגדיר מטרה ולראות אותה ב-Home.
8. **Packet:** אני רוצה מסמך אחד עם כל מה שהכנתי לפגישה — כולל כל הנושאים.
9. **פרטיות:** אני רוצה לנעול את האפליקציה ולטשטש נושאים רגישים.
10. **דחיפות:** אני רוצה פרוטוקול של 4 שלבים שעוזר לי לא לפעול מדחף.
11. **טריגר/פגיעה:** אני רוצה להבחין בין טריגר פנימי לפגיעה אמיתית.
12. **חצי כוח:** אני רוצה לחיצה אחת על emoji כדי לא לנתק רצף.
13. **Playbook:** אני רוצה לפתוח את ה"חוזה עם עצמי" ולראות מה לעשות עכשיו.
14. **Wave Mode:** אני רוצה מסך ריק עם טיימר ונשימה — בלי הסחות.
15. **Cooling Window:** אני רוצה טיימר שמונע ממני לבדוק את התיק.
16. **מסע:** אני רוצה לראות הכל מסונן לפי נושא ולפי סוג.
17. **הקלטה:** אני רוצה להקליט מחשבה קולית כשאין לי זמן לכתוב.
18. **תמונה:** אני רוצה לצלם דף שכתבתי ולשמור אותו עם הערה.
19. **משאלה:** אני רוצה לכתוב "אני מאחל לעצמי ש..." ולחזור אליו.
20. **מכתב לעצמי:** אני רוצה לכתוב מכתב לעצמי מפרספקטיבה אחרת.
21. **כוחות:** אני רוצה לשמור "אני טוב ב..." כדי לזכור מה עובד.
22. **ערכים:** אני רוצה להגדיר מה חשוב לי ולבדוק מולו החלטות.

---

## 22. נספח: סיכום כמותי

| קטגוריה | כמות |
|---------|------|
| **Entities (סה"כ)** | ~48 |
| **IndexedDB Stores** | 48 |
| **Indexes** | ~65 |
| **מסכים ראשיים** | 5 (Bottom Nav) + Topic Detail + Wizards + Onboarding |
| **Protocols (Wizards)** | 3 (Urge, Trigger/Hurt, Half Power) |
| **Therapeutic Modules** | 9 |
| **Personal/Emotional Modules** | 5 (Wishes, Letters, Strengths, Values, Media) |
| **Topic-Specific Features** | 13 (3 שוק ההון + 4 זוגיות + 3 סטרס + 3 שינה) |
| **Cross-Topic Features** | 5 |
| **Build Phases** | A-F + Phase 2 |
| **Journey Tabs** | 14 |

---

## 23. נספח: מעקב פידבק

כל 53 נקודות הפידבק מ-FEEDBACK-v1.1.md וסטטוס הטיפול:

| # | פידבק | סטטוס | איפה במסמך |
|---|-------|-------|-----------|
| 1 | Threat Model + Recovery Key | ✅ | סעיף 16 |
| 2 | cycles store חסר | ✅ | סעיף 5.2 — stored |
| 3 | Highlights ישברו בעריכה | ✅ | סעיף 5.3 — freeze + snapshot |
| 4 | Export PDF באופליין | ✅ | סעיף 8.4 — MVP=markdown+print |
| 5 | ID + timestamp format | ✅ | סעיף 5.0 — Data Conventions |
| 6 | Cycle open/edit/delete | ✅ | סעיף 5.2 — recalc + toast |
| 7 | Edit history + versioning | ✅ | סעיף 19 — שאלה פתוחה |
| 8 | Delete/Archive policy | ✅ | סעיף 5.0 — Soft Delete + Trash 30 יום |
| 9 | Performance — virtualization | ✅ | סעיף 15.3 — react-virtuoso |
| 10 | Sync readiness fields | ✅ | סעיף 5.0 — updatedAt + deletedAt + deviceId |
| 11 | Stack: Next.js vs Vite | ✅ | סעיף 19 — שאלה פתוחה |
| 12 | תאריך גרסה שגוי | ✅ | מתוקן — 2026 |
| 13 | Autosave debounce | ✅ | סעיף 8.1 — 700-1200ms + drafts + flush |
| 14 | Full-text search | ✅ | סעיף 8.3 — FlexSearch, MVP=entries+sessions |
| 15 | Therapy input PDF | ✅ | סעיף 8.3 — paste text, PDF Phase 2 |
| 16 | מצב בחדר שיפורים | ✅ | סעיף 8.2 — mark as discussed, hide done, read-only |
| 17 | sourceId consistency | ✅ | סעיף 5.0 — תמיד UUID |
| 18 | Tag join strategy | ✅ | סעיף 5.3 — `tags: string[]` |
| 19 | Search scope MVP | ✅ | סעיף 8.3 — entries+sessions בלבד |
| 20 | Export format | ✅ | סעיף 8.5 — schema versioned + toggle deleted |
| 21 | Locking PWA | ✅ | סעיף 16.4 — visibility + grace period |
| 22 | Save indicator | ✅ | סעיף 8.1 — שומר/נשמר ✓ |
| 23 | Multiple entries per day | ✅ | סעיף 8.1 |
| 24 | Quick-Capture מגוון | ✅ | סעיף 7.2 — 4 Quick Actions |
| 25 | Packet תצוגת הדפסה | ✅ | סעיף 8.4 |
| 26 | Session Plan | ✅ | סעיף 5.4 — SessionPlan entity |
| 27 | Pin the Cycle | ✅ | סעיף 14.1 — ברירת מחדל=סייקל נוכחי |
| 28 | Backup Reminder | ✅ | סעיף 8.5 |
| 29 | Read-only בחדר | ✅ | סעיף 8.2 |
| 30 | Open Questions | ✅ | סעיף 19 |
| 31 | Out of Scope | ✅ | סעיף 20 |
| 32 | Zero AI כ-Feature שיווקי | ✅ | סעיף 15.6 — Onboarding |
| 33 | Packet Quick View | ✅ | סעיף 8.4 |
| 34 | Packet Snapshot History | ✅ | סעיף 5.4 + 8.4 |
| 35 | Cycle Summary | ✅ | סעיף 9.9 |
| 36 | Insight Card | ✅ | סעיף 9.1 |
| 37 | Gratitude | ✅ | סעיף 9.2 |
| 38 | Views + Collections | ✅ | סעיף 20 — Phase 2 |
| 39 | Therapy Questions | ✅ | סעיף 9.6 |
| 40 | Homework Tracker | ✅ | סעיף 5.3 — ActionItem |
| 41 | Toolbox | ✅ | סעיף 13.4 |
| 42 | Trigger Log | ✅ | סעיף 9.7 |
| 43 | Boundary Drafts | ✅ | סעיף 12.2 |
| 44 | Wins | ✅ | סעיף 9.8 |
| 45 | Session Close | ✅ | סעיף 9.5 |
| 46 | UX/UI Overhaul | ✅ | סעיף 15 — Design System מלא |
| 47 | Journey Empty States | ✅ | סעיף 14.5 |
| 48 | Journey חסרים טאבים | ✅ | סעיף 14.1 — 14 טאבים |
| 49a-e | רובריקות חדשות | ✅ | סעיפים 10.1-10.4 |
| 50 | Journey סדר טאבים | ✅ | סעיף 14.1 |
| 51 | Home Redesign | ✅ | סעיף 7.2 |
| 52 | הקלטה + תמונה | ✅ | סעיף 10.5 |
| 53 | מינוח "מטרות" | ✅ | סעיף 19 — הכל תחת "מטרות" עם horizon |

**53/53 נקודות פידבק מטופלות.**

---

*מסמך מאסטר סופי v4.0. מאחד את כל המסמכים למפרט אחד מחייב. פברואר 2026.*
