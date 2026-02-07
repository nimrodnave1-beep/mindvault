# MindVault — שינויים מ-v2.0 ל-v3.0

**תאריך:** 7 בפברואר 2026  
**מסמך מקור:** PRD-DEVELOPERS.md (840 → 1,192 שורות)  
**למי מיועד:** מפתח שכבר מכיר את v2.0

---

## TL;DR — מה השתנה ב-30 שניות

1. **Home עוצב מחדש** — צומצם ל-3 אזורים בלבד (כפתור הוספה, מטרה, תודה)
2. **6 entities חדשים** — AudioMemo, ImageEntry, Wish, LetterToSelf, Strength, Value
3. **Journey** — עלה מ-4 טאבים ל-11, כל Empty State כולל CTA
4. **מדיה** — תמיכה בהקלטה קולית ותמונה (Zero AI — בלי תמלול/OCR)
5. **5 מודולים חדשים** — Wishes, Media, Letters, Strengths, Values
6. **12 routes חדשים** + Sprint plan מעודכן

---

## 1. Home — עיצוב מחדש (סעיף 5.0 ב-PRD)

### מה הוסר מ-Home

| רכיב שהיה ב-v2 | סטטוס ב-v3 |
|-----------------|------------|
| כרטיס סגול "הכנה לפגישה הבאה" | **הוסר.** זמין מכפתור ההוספה |
| 4 כפתורי Quick Actions (רשומה, פגישה, תובנה, תודה) | **הוסרו.** מוחלפים בכפתור הוספה אחד |
| Agenda Preview (תצוגת נקודות לפגישה) | **הוסר.** זמין מטאב אג'נדה |
| Trackers Quick Log | **הוסר.** זמין מכפתור ההוספה + מסע |
| Recent Activity | **הוסר.** זמין מטאב מסע |

### מה נוסף ל-Home

| רכיב חדש | תיאור |
|----------|-------|
| **כפתור "הוספה" מרכזי** | כפתור אחד גדול → פותח Action Sheet עם 13 סוגי תוכן |
| **מטרה מוצמדת (Pinned Goal)** | Card קומפקטי עם שם + סטטוס + progress |
| **הכרת תודה Quick Input** | שדה טקסט אחד + כפתור שמירה (לא כרטיס מלא) |

### Action Sheet — כל סוגי התוכן (חדש לגמרי)

כפתור ההוספה פותח Bottom Sheet עם grid של אייקונים:

| קטגוריה | אופציות | Route |
|---------|---------|-------|
| כתיבה | רשומה חדשה | `/today` |
| מדיה | הקלטה קולית | `/record` 🆕 |
| מדיה | תמונה | `/capture` 🆕 |
| טיפול | סיכום פגישה | `/therapy/new` |
| טיפול | נקודה לאג'נדה | `/agenda` |
| תובנות | תובנה חדשה | `/insights/new` |
| רגש | הכרת תודה | `/gratitude/new` |
| רגש | "מה אני מאחל לעצמי" | `/wishes/new` 🆕 |
| רגש | כוחות שלי | `/strengths/new` 🆕 |
| מטרות | מטרה חדשה | `/goals/new` |
| מעקב | מעקב חדש | `/tracking` |
| מתקדם | מכתב לעצמי | `/letters/new` 🆕 |
| מתקדם | ערכים שלי | `/values/new` 🆕 |

**פעולה נדרשת:** לבנות את ה-Action Sheet component + routing לכל הדפים החדשים.

---

## 2. Entities חדשים — Data Model

### 2a. ב-סעיף 3.3 (Sprint 2) — 3 entities חדשים

```typescript
// 🆕 הקלטה קולית
interface AudioMemo {
  id: string;
  duration: number;              // שניות
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// 🆕 תמונה
interface ImageEntry {
  id: string;
  blobKey: string;               // מפתח ל-blob ב-IndexedDB media store
  note: string | null;
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// 🆕 משאלה
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

### 2b. ב-סעיף 3.4 (Sprint 3+) — 3 entities חדשים

```typescript
// 🆕 מכתב לעצמי
interface LetterToSelf {
  id: string;
  type: 'from_future' | 'from_past' | 'from_present';
  title: string;
  content: string;
  tags: string[];
  cycleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// 🆕 כוחות שלי
interface Strength {
  id: string;
  text: string;                  // "אני טוב ב..."
  example: string | null;
  sourceType: 'entry' | 'session' | 'standalone' | null;
  sourceId: string | null;
  tags: string[];
  cycleId: string;
  createdAt: string;
  deletedAt: string | null;
}

// 🆕 ערכים שלי
interface Value {
  id: string;
  name: string;                  // "כנות", "חירות", "משפחה"
  why: string | null;
  livingExample: string | null;
  conflictExample: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

**פעולה נדרשת:** להוסיף את 6 ה-interfaces + CRUD functions לכל אחד.

---

## 3. IndexedDB — שינויים בסכמה (סעיף 3.5)

**DB_VERSION:** 3 → **4**

### Stores חדשים (7+1)

```javascript
// 🆕 Sprint 2
db.createObjectStore('wishes', { keyPath: 'id' });
db.createObjectStore('audioMemos', { keyPath: 'id' });
db.createObjectStore('imageEntries', { keyPath: 'id' });
db.createObjectStore('mediaBlobs', { keyPath: 'key' });  // 🆕 blob storage

// 🆕 Sprint 3+
db.createObjectStore('lettersToSelf', { keyPath: 'id' });
db.createObjectStore('strengths', { keyPath: 'id' });
db.createObjectStore('values', { keyPath: 'id' });
```

### Indexes חדשים

```
wishes: cycleId, createdAt
audioMemos: cycleId, createdAt
imageEntries: cycleId, createdAt
lettersToSelf: type, cycleId
strengths: cycleId
values: createdAt
```

**פעולה נדרשת:** עדכון migration function ב-`db.ts` — DB_VERSION=4 + יצירת stores + indexes.

---

## 4. Routes חדשים (סעיף 4)

### 12 routes שנוספו

| Route | מודול | Sprint |
|-------|-------|--------|
| `/wishes` | רשימת משאלות | 2 |
| `/wishes/new` | יצירת משאלה | 2 |
| `/record` | הקלטה קולית | 2 |
| `/capture` | צילום תמונה | 2 |
| `/letters` | רשימת מכתבים | 3 |
| `/letters/new` | כתיבת מכתב | 3 |
| `/strengths` | רשימת כוחות | 3 |
| `/strengths/new` | הוספת כוח | 3 |
| `/values` | רשימת ערכים | 3 |
| `/values/new` | הוספת ערך | 3 |

**Routes שנשארו ללא שינוי:** `/`, `/today`, `/agenda`, `/journey`, `/vault`, `/therapy/*`, `/insights/*`, `/gratitude/*`, `/goals/*`, `/tracking`, `/packet`

**פעולה נדרשת:** ליצור page files עבור כל route חדש.

---

## 5. Journey — שינויים משמעותיים (סעיף 5.7)

### טאבים: 4 → 11

| # | טאב | סטטוס | מה מציג |
|---|------|--------|---------|
| 1 | **הכל** | 🆕 | Unified timeline — כל הסוגים |
| 2 | **רשומות** | 🆕 | DailyEntries + AudioMemos + ImageEntries |
| 3 | פגישות | קיים | Sessions |
| 4 | תובנות | קיים | Insights |
| 5 | מטרות | שונה שם (היה "יעדים") | Goals |
| 6 | **משאלות** | 🆕 | Wishes |
| 7 | תודה | קיים | GratitudeEntries |
| 8 | **כוחות** | 🆕 | Strengths |
| 9 | **מכתבים** | 🆕 | LettersToSelf |
| 10 | **ערכים** | 🆕 | Values |
| 11 | **מעקב** | 🆕 | TrackerEntries |

### Empty States — כל הטאבים (שינוי גדול)

ב-v2 Empty States היו פסיביים ("אין פריטים מסוג זה"). ב-v3 **כל** Empty State חייב:
1. כפתור CTA שמנווט ליצירת פריט
2. משפט חם (לא "אין X")
3. Illustration מינימלית (Phase 2)

### שינויים טכניים

- טאבים ב-**scroll אופקי** (לא wrap לשורה שנייה)
- טאב "הכל" תמיד ראשון + ברירת מחדל
- **Scroll position נשמר per-tab**
- Audio + Image entries מופיעים ב-timeline עם player/preview

**פעולה נדרשת:** הרחבת Tab component, הוספת 7 טאבים, עדכון Empty States, שמירת scroll position.

---

## 6. מודולים חדשים — סיכום

### 5.10 Wishes — "מה אני מאחל לעצמי" (Sprint 2)

- שדה טקסט אחד חובה + "למה" אופציונלי
- **אין סטטוסים.** משאלה היא לא משימה
- מופיע ב-Journey (טאב "משאלות" + "הכל")
- פרטים מלאים: PRD סעיף 5.10

### 5.11 Media — הקלטה + תמונה (Sprint 2)

- הקלטה: Record → Stop → Preview → Note → Save
- תמונה: Capture/Pick → Preview → Note → Save
- **Zero AI:** אין תמלול, אין OCR
- Blobs ב-`mediaBlobs` store
- Storage usage indicator בהגדרות (חדש ב-Vault)
- פרטים מלאים: PRD סעיף 5.11

### 5.12 Letters to Self — מכתב לעצמי (Sprint 3)

- 3 סוגים: מהעתיד / מהעבר / מהיום
- כותרת + כתיבה חופשית
- פרטים מלאים: PRD סעיף 5.12

### 5.13 Strengths — כוחות שלי (Sprint 3)

- "אני טוב ב..." — שדה אחד חובה
- אפשר ליצור מתוך טקסט מסומן (כמו Insight)
- פרטים מלאים: PRD סעיף 5.13

### 5.14 Values — ערכים שלי (Sprint 3)

- ערך + "למה חשוב" + דוגמת חיים + דוגמת קונפליקט
- Progressive disclosure: רק שדה אחד חובה
- פרטים מלאים: PRD סעיף 5.14

---

## 7. שינויים נוספים

### Vault (סעיף 5.9)

- 🆕 **Storage Usage** — אינדיקטור שימוש באחסון (חשוב עם מדיה)

### שאלות פתוחות (סעיף 10) — 4 חדשות

| # | שאלה | סטטוס |
|---|------|-------|
| 6 | Journey tabs: כולם גלויים מהתחלה? | **כולם גלויים** (מומלץ) |
| 7 | Audio format: WebM / WAV / MP3? | TBD — WebM מומלץ |
| 8 | Image compression: original / 80%? | TBD — דחיסה מומלצת |
| 9 | מטרות naming: נפרד / הכל תחת "מטרות"? | **הכל תחת "מטרות"** |

### Out of Scope (סעיף 11) — הוספות

- 🆕 "תמלול אוטומטי של הקלטות (Zero AI)" — **לעולם לא**
- 🆕 "OCR אוטומטי על תמונות (Zero AI)" — **לעולם לא**

### User Stories (נספח) — 8 חדשים

סיפורים #10-#17 נוספו: הוספה מהירה, הקלטה, תמונה, משאלה, מכתב לעצמי, כוחות, ערכים, מסע מלא.

---

## 8. Sprint Plan מעודכן

### מה השתנה ב-Sprint Plan

| Sprint | מה נוסף ב-v3 |
|--------|-------------|
| **Sprint 1** | Home חדש (כפתור הוספה + מטרה + תודה), Journey עם 11 טאבים + Empty States |
| **Sprint 2** | Wishes (מודול שלם), Audio Memos, Image Entries, Storage usage |
| **Sprint 3** | Letters to Self, Strengths, Values |

---

## Checklist למפתח — מה לעשות

### Sprint 1 (שינויים מ-v2)

- [ ] **Home:** להסיר כרטיס סגול + 4 Quick Actions + Agenda Preview + Recent Activity
- [ ] **Home:** לבנות כפתור הוספה + Action Sheet component
- [ ] **Home:** לבנות Pinned Goal card
- [ ] **Home:** לבנות Gratitude Quick Input field
- [ ] **Journey:** להוסיף 7 טאבים חדשים (הכל, רשומות, משאלות, כוחות, מכתבים, ערכים, מעקב)
- [ ] **Journey:** טאבים ב-scroll אופקי
- [ ] **Journey:** לעדכן כל Empty State עם CTA + טקסט חם
- [ ] **IndexedDB:** DB_VERSION=4, להוסיף 7 stores חדשים + mediaBlobs

### Sprint 2 (מודולים חדשים)

- [ ] **Wishes:** CRUD + route `/wishes` + `/wishes/new`
- [ ] **Audio:** Record + Playback + route `/record`
- [ ] **Image:** Capture + Preview + route `/capture`
- [ ] **Vault:** Storage Usage indicator
- [ ] **Journey:** Audio + Image ב-timeline עם player/preview

### Sprint 3 (מודולים חדשים)

- [ ] **Letters:** CRUD + route `/letters` + `/letters/new`
- [ ] **Strengths:** CRUD + route `/strengths` + `/strengths/new`
- [ ] **Values:** CRUD + route `/values` + `/values/new`

---

*מסמך זה הוא delta בלבד. ה-Source of Truth המלא: `PRD-DEVELOPERS.md` v3.0*
