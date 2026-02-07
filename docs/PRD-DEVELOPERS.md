# MindVault — אפיון מוצר למפתחים

**גרסה:** 3.0  
**סטטוס:** מוכן לפיתוח  
**עדכון אחרון:** 7 בפברואר 2026

---

## תוכן עניינים

1. [סקירה מהירה](#1-סקירה-מהירה)
2. [עקרונות ליבה](#2-עקרונות-ליבה)
3. [מודל נתונים](#3-מודל-נתונים) — כולל entities חדשים: Wish, AudioMemo, ImageEntry, LetterToSelf, Strength, Value
4. [מסכים וניווט](#4-מסכים-וניווט) — Home מחודש, Journey עם 11 טאבים
5. [מפרט מודולים](#5-מפרט-מודולים) — 5.0 Home | 5.1-5.9 Core | 5.10-5.14 New
6. [עיצוב ו-UX](#6-עיצוב-ו-ux)
7. [אבטחה ופרטיות](#7-אבטחה-ופרטיות)
8. [MVP ו-Roadmap](#8-mvp-ו-roadmap) — Sprint plan מעודכן
9. [מדדי הצלחה](#9-מדדי-הצלחה)
10. [שאלות פתוחות](#10-שאלות-פתוחות) — 9 שאלות
11. [מחוץ לסקופ](#11-מחוץ-לסקופ)

---

## 1. סקירה מהירה

### מה זה MindVault?

**עוזר אישי לניהול תהליך טיפולי בין פגישות.**

פותר את "החור השחור": תובנות שנשכחות, אירועים שלא מגיעים לפגישה, סיכומים שמתפזרים.

### ערך מפתח

> *"התובנות שלך הן שלך בלבד. שום אלגוריתם לא קורא אותן."*

### Stack טכנולוגי

| שכבה | טכנולוגיה | הערות |
|------|-----------|-------|
| Frontend | React + Next.js 14 | App Router |
| תצורה | PWA | Service Worker + Manifest |
| אחסון | IndexedDB (idb) | Offline-first |
| הצפנה | AES-GCM + PBKDF2 | מפתח מ-PIN |
| UI | Tailwind CSS | Design Tokens מותאמים |
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

---

## 3. מודל נתונים

### 3.0 Data Conventions

| נושא | סטנדרט |
|------|--------|
| **IDs** | UUID v4 בכל ה-stores |
| **תאריכים (date)** | `YYYY-MM-DD` (local timezone) |
| **Timestamps** | ISO 8601 עם timezone: `2026-02-06T14:30:00+02:00` |
| **Soft Delete** | `deletedAt: string \| null` בכל entity |
| **Sync Readiness** | `updatedAt` + `deletedAt` בכל entity |

### 3.1 TherapyCycle (סייקל טיפולי)

**מוחלט: Cycles נשמרים ב-IndexedDB** (לא computed).

```typescript
interface TherapyCycle {
  id: string;                    // UUID
  startDate: string;             // YYYY-MM-DD (תאריך פגישה)
  endDate: string | null;        // YYYY-MM-DD או null (פתוח)
  createdAt: string;             // ISO timestamp
}
```

**לוגיקת סייקלים:**
- סייקל חדש נפתח בכל session חדשה
- סייקל פתוח (endDate=null) כשאין פגישה הבאה
- אם אין sessions בכלל → סייקל אחד פתוח מהתקנה
- עריכת/מחיקת session → מחשב מחדש cycleIds

### 3.2 Entities קיימים

```typescript
interface Session {
  id: string;
  date: string;                  // YYYY-MM-DD
  summary: string;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface DailyEntry {
  id: string;
  date: string;                  // YYYY-MM-DD
  content: string;
  cycleId: string;
  tags: string[];
  entryType?: 'free' | 'thought' | 'feeling' | 'gratitude' | 'win';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Highlight {
  id: string;
  text: string;
  textSnapshot: string;          // העתק של הטקסט המקורי
  startOffset: number;           // מיקום תחילת הסימון
  endOffset: number;             // מיקום סוף הסימון
  sourceEntryId: string | null;
  sourceType: 'entry' | 'session' | 'manual';
  cycleId: string;
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

### 3.3 Entities חדשים (v2.0)

```typescript
interface Insight {
  id: string;
  title: string;                 // חובה - משפט אחד
  body: string | null;           // אופציונלי - הרחבה
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GratitudeEntry {
  id: string;
  date: string;                  // YYYY-MM-DD
  items: string[];               // 1-3 פריטים
  note: string | null;           // הערה אופציונלית
  tags: string[];
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Goal {
  id: string;
  title: string;
  why: string | null;
  horizon: 'weekly' | 'monthly' | 'open';
  targetDate: string | null;     // YYYY-MM-DD
  status: 'active' | 'paused' | 'done' | 'archived';
  progressStage: 'start' | 'middle' | 'advanced' | null;
  tags: string[];
  cycleId: string | null;        // יכול להיות גלובלי
  pinned: boolean;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TrackerEntry {
  id: string;
  trackerId: string;
  date: string;                  // YYYY-MM-DD
  value: boolean | number | string;
  note: string | null;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// --- מדיה (Sprint 2) ---

interface AudioMemo {
  id: string;
  duration: number;              // שניות
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;           // הערת טקסט אופציונלית
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

interface ImageEntry {
  id: string;
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;           // הערת טקסט אופציונלית
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// --- רובריקות טיפוליות (Sprint 2) ---

interface Wish {
  id: string;
  text: string;                  // "אני מאחל לעצמי ש..."
  why: string | null;
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}
```

### 3.4 Entities מתקדמים (Sprint 3+)

```typescript
// מכתב לעצמי
interface LetterToSelf {
  id: string;
  type: 'from_future' | 'from_past' | 'from_present';
  title: string;                 // "לי בעוד שנה"
  content: string;
  tags: string[];
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// כוחות שלי
interface Strength {
  id: string;
  text: string;                  // "אני טוב ב..."
  example: string | null;        // "כמו כשהצלחתי..."
  sourceType: 'entry' | 'session' | 'standalone' | null;
  sourceId: string | null;
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// ערכים שלי
interface Value {
  id: string;
  name: string;                  // "כנות", "חירות", "משפחה"
  why: string | null;
  livingExample: string | null;  // "כשאמרתי לה את האמת"
  conflictExample: string | null; // "כשהסתרתי כי פחדתי"
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Toolbox - כלים אישיים
interface Tool {
  id: string;
  name: string;                  // "נשימה 4-7-8"
  whenToUse: string;             // "כשאני מרגיש לחץ"
  signal: string;                // "כשהלסת נועלת"
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ToolUsage {
  id: string;
  toolId: string;
  entryId: string | null;
  note: string | null;
  createdAt: string;
}

// Collections - פרקים בטיפול
interface Collection {
  id: string;
  name: string;                  // "הצבת גבולות"
  color: string | null;
  createdAt: string;
}

// Saved Views - פילטרים שמורים
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

// Boundary Drafts
interface BoundaryDraft {
  id: string;
  request: string;               // "אני צריך שלא תתקשר אחרי 22:00"
  boundary: string;              // "זה הזמן שלי למנוחה"
  consequence: string;           // "אני מכבה את הטלפון"
  targetPerson: string | null;
  status: 'draft' | 'practiced' | 'used';
  createdAt: string;
  updatedAt: string;
}
```

### 3.5 IndexedDB Schema

```javascript
const DB_VERSION = 4;

// --- Core ---
db.createObjectStore('cycles', { keyPath: 'id' });
db.createObjectStore('sessions', { keyPath: 'id' });
db.createObjectStore('entries', { keyPath: 'id' });
db.createObjectStore('highlights', { keyPath: 'id' });
db.createObjectStore('agendaItems', { keyPath: 'id' });
db.createObjectStore('actionItems', { keyPath: 'id' });
db.createObjectStore('tags', { keyPath: 'id' });

// --- Modules (Sprint 1-2) ---
db.createObjectStore('insights', { keyPath: 'id' });
db.createObjectStore('gratitudeEntries', { keyPath: 'id' });
db.createObjectStore('goals', { keyPath: 'id' });
db.createObjectStore('goalCheckIns', { keyPath: 'id' });
db.createObjectStore('trackers', { keyPath: 'id' });
db.createObjectStore('trackerEntries', { keyPath: 'id' });
db.createObjectStore('wishes', { keyPath: 'id' });

// --- מדיה ---
db.createObjectStore('audioMemos', { keyPath: 'id' });
db.createObjectStore('imageEntries', { keyPath: 'id' });
db.createObjectStore('mediaBlobs', { keyPath: 'key' });  // blob storage

// --- Modules (Sprint 3+) ---
db.createObjectStore('lettersToSelf', { keyPath: 'id' });
db.createObjectStore('strengths', { keyPath: 'id' });
db.createObjectStore('values', { keyPath: 'id' });
db.createObjectStore('tools', { keyPath: 'id' });
db.createObjectStore('toolUsages', { keyPath: 'id' });

// --- System ---
db.createObjectStore('settings', { keyPath: 'key' });

// Indexes
// entries: date, cycleId
// sessions: date
// insights: cycleId, type, createdAt
// gratitudeEntries: date, cycleId
// goals: status, horizon, cycleId
// trackers: isActive
// trackerEntries: trackerId, date, cycleId
// agendaItems: cycleId, status, priority
// highlights: cycleId
// wishes: cycleId, createdAt
// audioMemos: cycleId, createdAt
// imageEntries: cycleId, createdAt
// lettersToSelf: type, cycleId
// strengths: cycleId
// values: createdAt
```

---

## 4. מסכים וניווט

### Navigation Structure

**Bottom Nav (5 items max):**

| # | Tab | Icon | Route | Description |
|---|-----|------|-------|-------------|
| 1 | בית | Home | `/` | כפתור הוספה + מטרה + תודה |
| 2 | כתיבה | PenLine | `/today` | Daily Entry |
| 3 | אג'נדה | ListTodo | `/agenda` | Session Prep |
| 4 | מסע | Route | `/journey` | Timeline — כל הרובריקות |
| 5 | הגדרות | Shield | `/vault` | Settings + Privacy |

**Additional Pages (accessible from tabs / Add Action Sheet):**
- `/therapy` - Session summaries list
- `/therapy/new` - Add new session
- `/therapy/[id]` - View session
- `/insights` - Insights list
- `/insights/new` - Add new insight
- `/gratitude` - Gratitude entries
- `/gratitude/new` - Add new gratitude
- `/goals` - Goals management
- `/goals/new` - Add new goal
- `/tracking` - Trackers & entries
- `/wishes` - Wishes list
- `/wishes/new` - Add new wish
- `/letters` - Letters to self
- `/letters/new` - Write new letter
- `/strengths` - Strengths list
- `/strengths/new` - Add new strength
- `/values` - Values list
- `/values/new` - Add new value
- `/packet` - Pre-session packet
- `/record` - Audio recording
- `/capture` - Image capture

### Information Architecture

```
Home (/)
├── Header (greeting + date + lock icon)
├── Add Button (opens Action Sheet with ALL content types)
│   ├── כתיבה: רשומה חדשה
│   ├── מדיה: הקלטה / תמונה
│   ├── טיפול: סיכום פגישה / נקודה לאג'נדה
│   ├── תובנות: תובנה / הארה
│   ├── רגש: הכרת תודה / משאלה / כוחות
│   ├── מטרות: מטרה חדשה
│   ├── מעקב: מעקב חדש
│   └── מתקדם: מכתב לעצמי / ערכים / טריגר / גבול
├── Pinned Goal Card
├── Gratitude Quick Input ("על מה תודה היום?")
├── "אני בפגישה עכשיו" (only when agenda has items)
└── Footer ("פרטי לגמרי • בלי AI • הכל נשאר אצלך")

Today (/today)
├── Writing Canvas
├── Selection Toolbar (Agenda, Insight, Highlight)
├── Save Indicator
└── Previous Entries

Agenda (/agenda)
├── Items List (sortable)
├── Quick Add
├── In-Room Mode Toggle
└── Cycle Filter

Journey (/journey)
├── Tab Bar (scrollable horizontal):
│   הכל | רשומות | פגישות | תובנות | מטרות | משאלות |
│   תודה | כוחות | מכתבים | ערכים | מעקב
├── Unified Timeline (per tab)
├── Cycle Filter
├── Tag Filter (optional)
└── Empty State + CTA per tab

Vault (/vault)
├── PIN Settings
├── Discrete Mode Toggle
├── Export Options
├── Storage Usage Indicator
├── Backup Reminder
└── About
```

---

## 5. מפרט מודולים

### 5.0 Home (בית)

**מטרה:** מסך רגוע ומינימלי. 3 דברים בלבד — לא יותר.

**עיקרון:** Home לא עמוס. הוא לא Dashboard. הוא נקודת כניסה נקייה שמציעה פעולה אחת ראשית, מטרה מוצמדת, ורגע של הכרת תודה.

#### 5.0.1 כפתור "הוספה" — Add Action Sheet

כפתור מרכזי אחד גדול. לחיצה פותחת **Bottom Sheet** עם כל סוגי התוכן:

| קטגוריה | אופציות | Route |
|---------|---------|-------|
| **כתיבה** | רשומה חדשה | `/today` |
| **מדיה** | הקלטה קולית | `/record` |
| **מדיה** | תמונה | `/capture` |
| **טיפול** | סיכום פגישה | `/therapy/new` |
| **טיפול** | נקודה לאג'נדה | `/agenda` (quick add) |
| **תובנות** | תובנה חדשה | `/insights/new` |
| **רגש** | הכרת תודה | `/gratitude/new` |
| **רגש** | "מה אני מאחל לעצמי" | `/wishes/new` |
| **רגש** | כוחות שלי | `/strengths/new` |
| **מטרות** | מטרה חדשה | `/goals/new` |
| **מעקב** | מעקב חדש | `/tracking` |
| **מתקדם** | מכתב לעצמי | `/letters/new` |
| **מתקדם** | ערכים שלי | `/values/new` |

**עיצוב:**
- Grid של אייקונים + שמות (3-4 בשורה)
- חלוקה ויזואלית לקטגוריות (divider דק)
- נסגר ב-swipe down / tap outside
- הסוגים הנפוצים ביותר למעלה

#### 5.0.2 מטרה מוצמדת (Pinned Goal)

Card קומפקטי שמציג:
- שם המטרה
- סטטוס (active / paused / done)
- Progress stage (אם יש)
- לחיצה → מסך המטרה המלא

אם אין מטרה מוצמדת: Empty state עדין — "הגדר מטרה שתלווה אותך" + CTA.

#### 5.0.3 הכרת תודה — Quick Input

שדה קטן וחם: "על מה תודה היום?"
- שורת טקסט אחת + כפתור שמירה
- אחרי שמירה: "נשמר" + אפשרות להוסיף עוד
- פשוט input field, לא כרטיס מלא

#### 5.0.4 "אני בפגישה עכשיו"

מוצג **רק** כשיש נקודות פתוחות באג'נדה. כפתור בולט (teal) שפותח את מצב "בחדר".

#### 5.0.5 מה לא נמצא ב-Home

| רכיב שהיה קודם | סטטוס |
|----------------|--------|
| כרטיס סגול "הכנה לפגישה" | **הוסר.** זמין מכפתור הוספה |
| 4 כפתורי Quick Actions | **הוסרו.** מוחלפים בכפתור הוספה |
| Agenda Preview | **הוסר.** זמין מטאב אג'נדה |
| Trackers Quick Log | **הוסר.** זמין מכפתור הוספה + מסע |
| Recent Activity | **הוסר.** זמין מטאב מסע |

**Acceptance Criteria:**
- [ ] Home מציג בדיוק 3 אזורים: כפתור הוספה, מטרה, הכרת תודה
- [ ] כפתור הוספה פותח Action Sheet עם כל הסוגים
- [ ] Action Sheet כולל: כתיבה, הקלטה, תמונה, ועוד 10+ סוגי תוכן
- [ ] מטרה מוצמדת מוצגת כ-card קומפקטי
- [ ] הכרת תודה = שדה טקסט אחד + שמור
- [ ] "אני בפגישה" מופיע רק כשיש נקודות באג'נדה
- [ ] אין כפילויות CTA (כפתור הוספה אחד בלבד)

---

### 5.1 Today (כתיבה)

**מטרה:** מרחב כתיבה נקי וגמיש.

| Feature | Description |
|---------|-------------|
| Writing Canvas | שדה טקסט חופשי, נקי |
| Autosave | Debounce 700-1200ms, drafts store, flush on exit |
| Save Indicator | "שומר..." → "נשמר ✓" → "טיוטה" |
| Text Selection | בחירת טקסט → Toolbar: אג'נדה / תובנה / הארה |
| Tags | בחירה ידנית מסט מוגדר |
| Entry Type | free / thought / feeling / gratitude / win |

**Acceptance Criteria:**
- [ ] טקסט נשמר אוטומטית עם debounce
- [ ] אינדיקטור שמירה ויזואלי ברור
- [ ] Selection toolbar מופיע על בחירת טקסט
- [ ] אפשר ליצור מספר רשומות באותו יום

### 5.2 Agenda (אג'נדה)

**מטרה:** הכנה לפגישה הבאה.

| Feature | Description |
|---------|-------------|
| Items List | AgendaItems עם סדר עדיפות |
| Source Link | קישור למקור (entry/session/insight) |
| Status | open / done |
| Priority | Drag & Drop או שדה מספר |
| In-Room Mode | תצוגה גדולה ונקייה, read-only אופציונלי |
| Mark as Discussed | כפתור ליד כל פריט במצב בחדר |

**Acceptance Criteria:**
- [ ] רשימה מסודרת לפי priority
- [ ] לכל נקודה: קישור למקור
- [ ] מצב "בחדר" — מסך מלא, טקסט גדול
- [ ] Hide done toggle במצב בחדר

### 5.3 Insights (תובנות)

**מטרה:** לשמור "הבנתי ש..." בצורה ניתנת לשימוש.

| Feature | Description |
|---------|-------------|
| Create | From scratch או from selection |
| Quick Mode | title + type (20 שניות) |
| Deep Mode | Full fields (כפתור "להעמיק") |
| Types | pattern, boundary, tool, thought, emotion, other |
| Pin | מאפשר הצגה בולטת |
| Add to Agenda | בלחיצה אחת |

**Acceptance Criteria:**
- [ ] יצירת תובנה מתוך טקסט מסומן
- [ ] Quick mode ב-20 שניות
- [ ] הוספה לאג'נדה בלחיצה אחת
- [ ] פילטור לפי type ו-cycle

### 5.4 Gratitude (הכרת תודה)

**מטרה:** אימון תשומת לב למה עובד, בלי לשקר לעצמך.

| Feature | Description |
|---------|-------------|
| Quick Entry | 1-3 שורות + הערה אופציונלית |
| Date | ברירת מחדל = היום |
| No Streaks | אין מעקב רצפים |
| History | רשימה לפי תאריך |

**Acceptance Criteria:**
- [ ] יצירת entry ב-20 שניות
- [ ] אין שום אינדיקציה ל"פספוס"
- [ ] מופיע ב-Journey timeline

### 5.5 Goals (מטרות)

**מטרה:** לזכור לאן הולכים.

| Feature | Description |
|---------|-------------|
| Create | title, why, horizon, targetDate, status |
| Horizons | weekly, monthly, open |
| Statuses | active, paused, done, archived |
| Pin | מטרה אחת מוצמדת מופיעה ב-Home |
| Progress | start / middle / advanced (אופציונלי) |

**Acceptance Criteria:**
- [ ] CRUD מלא
- [ ] סינון לפי status
- [ ] מטרה מוצמדת ב-Home

### 5.6 Tracking (מעקב)

**מטרה:** לראות דפוסים לאורך זמן.

| Feature | Description |
|---------|-------------|
| Create Tracker | name, valueType, frequency |
| Value Types | boolean, rating_1_5, rating_1_10, count, duration_minutes, note_only |
| Quick Log | UI מהיר ל-trackers פעילים |
| History | Timeline per tracker |
| Validation | ערכים בטווח תקין |

**Acceptance Criteria:**
- [ ] יצירת tracker ו-entry
- [ ] Validation לפי valueType
- [ ] Quick log נגיש מכפתור ההוספה ב-Home

### 5.7 Journey (ציר זמן)

**מטרה:** לראות את כל המסע במקום אחד — כל הרובריקות, כל הסוגים.

| Feature | Description |
|---------|-------------|
| Tabs | Scrollable horizontal — 11 טאבים (ראו טבלה למטה) |
| Unified Timeline | כל הסוגים ממוינים לפי תאריך |
| Cycle Filter | סייקל נוכחי / בחירה |
| Tag Filter | Multi-select (אופציונלי) |
| Scroll Position | נשמר per-tab |
| Empty States | כל טאב ריק מציג CTA ליצירת פריט חדש |

**טאבים (scrollable):**

| # | טאב | מה מציג | Empty State CTA |
|---|------|---------|-----------------|
| 1 | **הכל** | Unified timeline | "כאן יתחיל המסע שלך" |
| 2 | **רשומות** | DailyEntries + AudioMemos + ImageEntries | "כתוב את הרשומה הראשונה" |
| 3 | **פגישות** | Sessions | "הוסף סיכום מהפגישה האחרונה" |
| 4 | **תובנות** | Insights | "תובנות נוצרות מהכתיבה שלך" |
| 5 | **מטרות** | Goals | "מה חשוב לך לעבוד עליו?" |
| 6 | **משאלות** | Wishes | "מה אתה מאחל לעצמך?" |
| 7 | **תודה** | GratitudeEntries | "על מה אתה מודה?" |
| 8 | **כוחות** | Strengths | "מה אתה טוב בו?" |
| 9 | **מכתבים** | LettersToSelf | "כתוב מכתב לעצמך" |
| 10 | **ערכים** | Values | "מה באמת חשוב לך?" |
| 11 | **מעקב** | TrackerEntries | "עקוב אחרי משהו לאורך זמן" |

**כללי Empty State:**  
כל Empty State חייב לכלול:
1. כפתור CTA ברור שמוביל ליצירת פריט חדש
2. משפט חם ומעודד (לא "אין פריטים מסוג זה")
3. Illustration מינימלית (Phase 2)

**Acceptance Criteria:**
- [ ] 11 טאבים ב-scroll אופקי (לא wrap)
- [ ] טאב "הכל" תמיד ראשון ונבחר כברירת מחדל
- [ ] Unified timeline ממויין נכון
- [ ] כל טאב ריק מציג CTA + טקסט חם
- [ ] CTA ב-Empty State מנווט למסך יצירה מלא
- [ ] Cycle filter עובד
- [ ] Scroll position נשמר per-tab
- [ ] Audio + Image entries מופיעים ב-timeline עם player/preview

### 5.8 Packet (פקט לפגישה)

**מטרה:** מסמך אחד לפני טיפול — בלחיצה אחת.

**תוכן:**
1. אג'נדה פתוחה (בסדר עדיפות)
2. תובנות מוצמדות
3. הארות מהסייקל
4. Action Items פתוחים

**פורמטים:**
- תצוגה באפליקציה (In-App View)
- Print to PDF (window.print)
- Export Markdown

**Phase 2:**
- PDF ייעודי
- Packet Quick View (widget-like)

### 5.9 Vault (הגדרות)

| Feature | Description |
|---------|-------------|
| PIN | נעילה עם PIN 4-6 ספרות |
| Recovery Key | מפתח שחזור חד-פעמי ב-onboarding |
| Discrete Mode | טשטוש תוכן בלחיצה |
| Auto-lock | אחרי X דקות + tab blur |
| Export | JSON + Markdown לפי טווח |
| Backup Reminder | באנר חודשי פנימי |
| Storage Usage | אינדיקטור שימוש באחסון (חשוב עם מדיה) |

### 5.10 Wishes (מה אני מאחל לעצמי)

**מטרה:** בניית שפת רצון — לא רק שפת כאב. מה אני **רוצה**, לא רק מה **כואב**.

| Feature | Description |
|---------|-------------|
| Quick Add | "אני מאחל לעצמי ש..." — שדה טקסט אחד |
| Why | למה זה חשוב (אופציונלי) |
| Tags | תיוג ידני |
| History | רשימה לפי תאריך |

**עקרון:** אין סטטוס, אין "הושג/לא הושג". משאלה היא לא משימה. היא פשוט **קיימת**. אפשר לחזור אליה, לקרוא, להתחבר.

**Acceptance Criteria:**
- [ ] יצירה ב-15 שניות (שדה אחד חובה)
- [ ] מופיע ב-Journey timeline (טאב "משאלות" + "הכל")
- [ ] אין סטטוסים, אין tracking

### 5.11 Media (הקלטה ותמונה)

**מטרה:** לתת דרכים נוספות ללכוד רגעים — לא רק טקסט.

**עקרון Zero AI:** אין תמלול אוטומטי, אין OCR. הקלטה נשמרת כמו שהיא. תמונה נשמרת כמו שהיא. המשתמש יכול להוסיף הערת טקסט ידנית.

#### הקלטה קולית (Audio Memo)

| Feature | Description |
|---------|-------------|
| Record | כפתור Record אדום + timer + stop |
| Preview | Player מינימלי עם play/pause + duration |
| Note | הערת טקסט אופציונלית |
| Tags | תיוג ידני |

#### תמונה (Image Entry)

| Feature | Description |
|---------|-------------|
| Capture | מצלמה או בחירה מגלריה |
| Preview | תצוגה מקדימה של התמונה |
| Note | הערת טקסט אופציונלית |
| Tags | תיוג ידני |

**Storage:**
- Blobs נשמרים ב-IndexedDB (`mediaBlobs` store)
- אינדיקטור storage usage בהגדרות
- אם מתקרבים למגבלה: באנר "כדאי לגבות ולפנות מקום"

**Acceptance Criteria:**
- [ ] הקלטה: Record → Stop → Preview → Save
- [ ] תמונה: Capture/Pick → Preview → Note → Save
- [ ] שני הסוגים מופיעים ב-Journey timeline
- [ ] Player מובנה להקלטות, preview לתמונות
- [ ] Storage usage מוצג בהגדרות
- [ ] הכל אופליין — אפס קריאות רשת

### 5.12 Letters to Self (מכתב לעצמי) — Sprint 3

**מטרה:** כלי טיפולי קלאסי — לכתוב מכתב לעצמך מפרספקטיבה אחרת.

| Feature | Description |
|---------|-------------|
| Type | מהעתיד / מהעבר / מהיום |
| Title | כותרת חופשית ("לי בעוד שנה") |
| Content | כתיבה חופשית |
| Tags | תיוג ידני |

**Acceptance Criteria:**
- [ ] בחירת סוג מכתב (3 אפשרויות)
- [ ] כתיבה חופשית ללא הגבלה
- [ ] מופיע ב-Journey (טאב "מכתבים" + "הכל")

### 5.13 Strengths (כוחות שלי) — Sprint 3

**מטרה:** לזכור מה **כן** עובד. לא רק מה כואב.

| Feature | Description |
|---------|-------------|
| Quick Add | "אני טוב ב..." |
| Example | "כמו כשהצלחתי..." (אופציונלי) |
| Source | אם נוצר מתוך entry/session — קישור |

**Acceptance Criteria:**
- [ ] יצירה ב-10 שניות (שדה אחד חובה)
- [ ] מופיע ב-Journey
- [ ] אפשר ליצור מתוך טקסט מסומן

### 5.14 Values (ערכים שלי) — Sprint 3

**מטרה:** מצפן פנימי. מה באמת חשוב לי.

| Feature | Description |
|---------|-------------|
| Name | ערך ("כנות", "חירות", "משפחה") |
| Why | למה חשוב לי (אופציונלי) |
| Living Example | מתי אני חי אותו (אופציונלי) |
| Conflict Example | מתי אני סוטה ממנו (אופציונלי) |

**Acceptance Criteria:**
- [ ] יצירה ב-10 שניות (שדה אחד חובה)
- [ ] מופיע ב-Journey (טאב "ערכים")
- [ ] Progressive disclosure: שדה אחד חובה, שאר אופציונלי

---

## 6. עיצוב ו-UX

### 6.1 Design System

```css
/* Colors */
--color-primary: #7C3AED;        /* Violet 600 */
--color-primary-light: #EDE9FE;  /* Violet 100 */
--color-teal: #0D9488;           /* Teal 600 */
--color-warm: #F59E0B;           /* Amber 500 */
--color-pink: #EC4899;           /* Pink 500 */
--color-surface: #FAFAF9;        /* Stone 50 */
--color-text-primary: #1C1917;   /* Stone 900 */
--color-text-secondary: #57534E; /* Stone 600 */

/* Typography */
Font: Heebo (Hebrew), 400-700
Body: 15px / 1.7 line-height
H1: 30px / bold / -0.03em
H2: 24px / bold / -0.025em
H3: 20px / semibold / -0.02em

/* Spacing (4px grid) */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px

/* Radius */
Small: 8px
Medium: 12px
Large: 16px
Full: 9999px

/* Shadows */
Card: 0 1px 3px rgba(28,25,23,0.06), inset 0 1px 0 rgba(255,255,255,0.8)
Elevated: 0 8px 24px rgba(28,25,23,0.12)
Primary: 0 4px 16px rgba(124,58,237,0.25)
```

### 6.2 Component Patterns

**Cards:**
- `card-premium` - default white card with subtle gradient
- `card-interactive` - clickable with hover/active states
- `card-purple/teal/pink/warm` - colored variants

**Buttons:**
- `btn-primary` - gradient purple, used for main CTAs
- `btn-secondary` - white with border
- `btn-ghost` - no background
- `btn-teal` - teal gradient for "in session" actions

**Chips:**
- `chip-purple/teal/amber/pink` - colored badges

**Navigation:**
- Glass morphism bottom nav
- Active state with gradient background + dot indicator

### 6.3 UX Guidelines

| Rule | Implementation |
|------|----------------|
| Mobile-first | Design from 375px up |
| Touch targets | Min 44x44px |
| Safe areas | Respect notch + home indicator |
| Max width | Content limited to 720px |
| Empty states | Icon + warm message + CTA |
| Loading | Skeleton screens, no spinners |
| Transitions | 200ms ease-out, no jarring |
| Toasts | Success/error with haptic feedback |

### 6.4 Micro-interactions

- Page transitions: fade-in-up 400ms
- Cards: hover lift 2px + shadow increase
- Buttons: scale 0.97 on press
- Selection toolbar: pop-in animation
- Save indicator: pulse on saving

---

## 7. אבטחה ופרטיות

### 7.1 Threat Model

**מגנים מפני:**
- אדם זר שמשתמש במכשיר (PIN + Auto-lock)
- Shoulder surfing (Discrete Mode)
- אובדן נתונים (Export + Backup Reminder)

**לא מגנים מפני:**
- פריצה ממוקדת למכשיר
- Forensic analysis
- Keyloggers/Malware

### 7.2 Encryption

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

// Storage
// - salt: stored in IndexedDB (unencrypted)
// - Recovery Key: generated once, user must save
// - Data: encrypted with AES-GCM
```

### 7.3 Recovery Key Flow

1. User sets PIN during onboarding
2. System generates 24-word Recovery Key
3. User must confirm they saved it (copy/print/screenshot)
4. Recovery Key encrypts master key separately from PIN
5. If PIN forgotten → Recovery Key can unlock data

### 7.4 Auto-lock

- Inactivity timeout: 5 minutes (configurable)
- Tab blur: optional, with 3-5 second grace period
- Uses `visibilitychange` event + timestamp

---

## 8. MVP ו-Roadmap

### 8.1 MVP Scope

**✅ נכנס:**

| Module | Features |
|--------|----------|
| **Home** | כפתור הוספה (Action Sheet) + מטרה מוצמדת + הכרת תודה |
| Today | Writing + Autosave + Selection toolbar + Save indicator |
| Agenda | Items + Priority + Source + In-room mode |
| Therapy | Summaries + Session date + Calendar + Search |
| Journey | Unified timeline + 11 טאבים + Cycle filter + Empty States w/ CTA |
| Insights | CRUD + Quick/Deep mode + Add to agenda |
| Gratitude | Quick entry (1-3 items) + Quick input ב-Home |
| Goals | CRUD + Pin + Status + Pinned in Home |
| Tracking | Trackers + Entries + Quick log |
| Packet | In-app view + Print to PDF |
| Vault | PIN + Discrete mode + Export + Storage indicator |

**❌ לא נכנס:**

| Feature | When |
|---------|------|
| Mood/Charts | Never (anti-pattern) |
| AI anything | Never |
| Streaks/Nags | Never |
| Automatic transcription (audio) | Never (Zero AI) |
| OCR (images) | Never (Zero AI) |
| Cloud Sync | Phase 2 |
| Decoy Mode | Phase 2 |
| Toolbox | Sprint 3 |
| Boundary Drafts | Sprint 3 |
| Collections/Views | Phase 2 |
| Recovery Key | Sprint 2 |

### 8.2 Sprint Plan

**Sprint 1:**
- **Home: Simplified design** — Add button + Pinned Goal + Gratitude input
- Today: Writing + Autosave + Selection
- Agenda: Items + Priority + Source
- Therapy: Summaries + Search
- Journey: Basic timeline + 11 tabs + Empty States with CTA
- IndexedDB: Full schema + CRUD
- UI: Design system + Components

**Sprint 2:**
- Journey: Full filters + Cycle filter + Tag filter
- Insights: Full module
- Gratitude: Full module
- Goals: Full module
- Tracking: Full module
- **Wishes: Full module (מה אני מאחל לעצמי)**
- **Audio Memos: Record + Playback + Notes**
- **Image Entries: Capture + Preview + Notes**
- Search: Full-text (FlexSearch)
- Export: JSON + Markdown + Print
- Vault: PIN + Auto-lock + Discrete + Storage usage

**Sprint 3:**
- Packet: Full module
- **Letters to Self: Full module**
- **Strengths: Full module**
- **Values: Full module**
- Toolbox: Tools + Usage tracking
- Session Close: Post-session ritual
- Recovery Key: Encryption upgrade
- Backup Reminder: Monthly banner

**Phase 2:**
- E2E Encrypted Sync (opt-in)
- Decoy Mode
- Collections
- Saved Views
- PDF Export
- Boundary Drafts

---

## 9. מדדי הצלחה

| Metric | Target |
|--------|--------|
| **Activation** | 5 פריטים בשבוע ראשון |
| **Retention** | כניסה שבועית לאורך 4 שבועות |
| **Prep KPI** | פתיחת Agenda/Packet לפני פגישה |
| **Reliability** | אפס מקרים של "איבדתי טקסט" |
| **Zero AI** | 0 קריאות ל-AI APIs |

---

## 10. שאלות פתוחות

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Highlight edit policy | Freeze snapshot / Update offsets | **Freeze** |
| 2 | Versioning for entries | None / Last edited only / Full history | TBD |
| 3 | Tag strategy | String array / Normalized store | **String array** |
| 4 | FlexSearch vs Fuse.js | FlexSearch (faster) / Fuse.js (simpler) | TBD |
| 5 | Dark mode | Sprint 2 / Phase 2 | TBD |
| 6 | Journey tabs visibility | כולם גלויים מהתחלה / משתמש "מפעיל" רובריקות | **כולם גלויים** (מומלץ) |
| 7 | Audio format | WebM (native) / WAV / MP3 | TBD — WebM מומלץ (נתמך ב-MediaRecorder) |
| 8 | Image compression | שמירת original / דחיסה ל-80% quality | TBD — דחיסה מומלצת לחיסכון storage |
| 9 | מטרות naming | "מטרות" + "צעדים" נפרדים / הכל תחת "מטרות" עם horizon | **הכל תחת "מטרות"** (מומלץ) |

---

## 11. מחוץ לסקופ

**לעולם לא:**
- AI/LLM/ML של כל סוג
- תיוג אוטומטי
- סיכום אוטומטי
- ניתוח סנטימנט
- זיהוי דפוסים אוטומטי
- תמלול אוטומטי של הקלטות (Zero AI)
- OCR אוטומטי על תמונות (Zero AI)
- Streaks / Gamification
- Push notifications מעיקות
- Social features

**לא ב-MVP:**
- Cloud sync
- Multi-device
- Voice-to-text (תמלול)
- OCR/PDF parsing
- Collaboration
- Therapist portal
- Dark mode (TBD — Sprint 2 / Phase 2)

---

## נספח: User Stories

1. **כתיבה:** כמשתמש, אני רוצה לכתוב רשומה יומית ולראות שהיא נשמרת אוטומטית.
2. **סימון לטיפול:** כמשתמש, אני רוצה לסמן קטע טקסט ולהוסיף אותו לאג'נדה בלחיצה אחת.
3. **אג'נדה:** כמשתמש, אני רוצה לראות רשימה מסודרת של כל מה שהכנתי לפגישה.
4. **תובנה:** כמשתמש, אני רוצה לשמור "הבנתי ש..." ולחזור אליו בפגישה.
5. **הכרת תודה:** כמשתמש, אני רוצה לכתוב 1-3 דברים שאני מודה עליהם היום — ישירות מ-Home.
6. **מטרה:** כמשתמש, אני רוצה להגדיר מטרה ולראות אותה ב-Home כהנחיה יומית.
7. **מעקב:** כמשתמש, אני רוצה לעקוב אחרי משהו לאורך זמן.
8. **Packet:** כמשתמש, אני רוצה לראות מסמך אחד עם כל מה שהכנתי לפגישה.
9. **פרטיות:** כמשתמש, אני רוצה לנעול את האפליקציה ב-PIN ולטשטש את המסך.
10. **הוספה מהירה:** כמשתמש, אני רוצה ללחוץ כפתור אחד ב-Home ולבחור מה להוסיף — רשומה, הקלטה, תמונה, תובנה, או כל סוג אחר.
11. **הקלטה:** כמשתמש, אני רוצה להקליט מחשבה קולית כשאין לי זמן לכתוב, ולהוסיף הערה אח"כ.
12. **תמונה:** כמשתמש, אני רוצה לצלם דף שכתבתי / ציטוט / מקום ולשמור אותו עם הערה.
13. **משאלה:** כמשתמש, אני רוצה לכתוב "אני מאחל לעצמי ש..." ולחזור אליו מתי שארצה.
14. **מכתב לעצמי:** כמשתמש, אני רוצה לכתוב מכתב לעצמי מפרספקטיבה אחרת (עתיד/עבר/הווה).
15. **כוחות:** כמשתמש, אני רוצה לשמור "אני טוב ב..." כדי לזכור מה עובד לי.
16. **ערכים:** כמשתמש, אני רוצה להגדיר מה באמת חשוב לי ולבדוק מולו את ההחלטות שלי.
17. **מסע מלא:** כמשתמש, אני רוצה לראות את כל מה שכתבתי/הקלטתי/צילמתי ב-Timeline אחד מסודר, עם אפשרות לסנן לפי סוג.

---

*מסמך זה מוכן לשימוש. עדכון אחרון: 7 בפברואר 2026*
