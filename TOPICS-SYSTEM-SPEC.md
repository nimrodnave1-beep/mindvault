# MindVault — Topics System & Therapeutic Modules — מפרט למפתחים

**גרסה:** 1.1  
**תאריך:** 6 בפברואר 2026  
**סטטוס:** מוכן לפיתוח  
**תלות:** PRD-DEVELOPERS.md v1.0 + FEEDBACK-v1.1.md  
**שינויים ב-1.1:** Inbox Pattern, Visual Context, Wizard Protocols, Playbook כ-Manual, Journey Milestones, Half Power Emoji, Privacy per Topic

---

## תוכן עניינים

1. [סקירה כללית](#1-סקירה-כללית) — כולל Inbox Pattern, Wizard Pattern, Visual Context
2. [Topic System — שלד המערכת](#2-topic-system--שלד-המערכת) — כולל Inbox, Visual Context, Privacy per Topic
3. [Data Model — כל ה-Entities החדשים](#3-data-model--כל-ה-entities-החדשים)
4. [IndexedDB Schema — Stores חדשים](#4-indexeddb-schema--stores-חדשים)
5. [מסכים וניווט (IA) — עדכון](#5-מסכים-וניווט-ia--עדכון)
6. [פיצ'ר: Topic Playbook — "חוזה עם עצמי"](#6-פיצר-topic-playbook--חוזה-עם-עצמי) — North Star + Rescue Kit
7. [פיצ'ר: Urge Protocol — Wizard](#7-פיצר-urge-protocol--wizard) — 4 שלבים
8. [פיצ'ר: Trigger vs Hurt — מדחום רגשי](#8-פיצר-trigger-vs-hurt--מדחום-רגשי) — Cooling כפוי ב-8+
9. [פיצ'ר: Half Power — 3 רמות](#9-פיצר-half-power--3-רמות) — Emoji Check-in + Action Check
10. [פיצ'ר: Internal Validation (זוגיות)](#10-פיצר-internal-validation-זוגיות)
11. [פיצ'ר: Gratitude & Spotlight per Topic](#11-פיצר-gratitude--spotlight-per-topic)
12. [Topic: שוק ההון — פיצ'רים ייעודיים](#12-topic-שוק-ההון--פיצרים-ייעודיים)
13. [Topic: זוגיות — פיצ'רים ייעודיים](#13-topic-זוגיות--פיצרים-ייעודיים)
14. [Topic: סטרס — פיצ'רים ייעודיים](#14-topic-סטרס--פיצרים-ייעודיים)
15. [Topic: שינה — פיצ'רים ייעודיים](#15-topic-שינה--פיצרים-ייעודיים)
16. [פיצ'רים נוספים (Cross-Topic)](#16-פיצרים-נוספים-cross-topic)
17. [Journey — אינטגרציה מעודכנת](#17-journey--אינטגרציה-מעודכנת) — כולל Cross-Topic View + Milestones
18. [סדר בנייה מומלץ](#18-סדר-בנייה-מומלץ) — Phase A-F
19. [סיכום Entities ו-Stores](#19-סיכום-entities-ו-stores)
20. [סיכום שיפורי v1.1](#20-סיכום-שיפורי-v11)

---

## 1. סקירה כללית

### מה משתנה

**Topics הופך לשלד של כל האפליקציה.** במקום אפליקציה "שטוחה" עם מודולים (Today, Agenda, Journey...), המערכת עוברת למודל **Topic-centric**: כל דבר שייך לנושא, וכל נושא מכיל את כל המודולים.

### עקרונות שנשמרים

- **Zero AI** — הכל ידני, דטרמיניסטי, אופליין
- **Offline-first** — IndexedDB כמקור אמת
- **אפס אשמה** — אין streaks, אין "פספסת", אין התראות מעיקות
- **פעולה אחת** — כל פעולה = לחיצה אחת
- **מינימום שורה אחת** — כל רובריקה עובדת עם שדה חובה אחד + "להעמיק"

### עקרון חדש: Topic כקונטקסט

> כל פריט במערכת שייך לנושא. הנושא נותן את ההקשר הטיפולי: מה הכלים, מה הפרוטוקול, מה ההיסטוריה. כשדחיפות מגיעה — המשתמש נכנס לנושא ומוצא את ה"בית" שלו.

### עקרון חדש: שיטת המגירות (Inbox Pattern)

> כתיבה קודם, שיוך אחר כך. אם המשתמש לחוץ או בסערה — הוא לא חייב לבחור נושא. הכל נכנס ל-**Inbox** ומשויך מאוחר יותר.

### עקרון חדש: פרוטוקולים כתהליכים (Wizard Pattern)

> כל פרוטוקול טיפולי הוא **תהליך שלב-אחר-שלב (Wizard)**, לא טופס ארוך. שלב אחד בכל פעם → מפחית עומס קוגניטיבי ומנחה את המשתמש דרך הרגע הקשה.

### עקרון חדש: Visual Context

> לכל Topic צבע מוביל (Accent Color). כשנכנסים לנושא — ה-Header, הכפתורים, וה-Accent משתנים לפי הצבע. המטרה: **שינוי הסטייט התודעתי** דרך ה-UI. "שוק ההון" = קר וכחול, "זוגיות" = חם וורוד.

---

## 2. Topic System — שלד המערכת

### 2.1 מהו Topic

Topic = נושא טיפולי שהמשתמש מגדיר. לכל Topic יש שם, אייקון, צבע, ו-Playbook אישי.

**דוגמאות:** שוק ההון, זוגיות, סטרס, שינה, עבודה, הורות, ביקורת עצמית, גבולות.

### 2.2 שיוך פריטים ל-Topic — שיטת המגירות (Inbox Pattern)

**כל entity במערכת** (רשומה, הארה, הכרת תודה, יעד, מעקב, אג'נדה, סיכום טיפול, Urge, Trigger, וכו') מקבל שיוך ל-Topic:

| שדה | סוג | חובה? | תיאור |
|-----|------|-------|-------|
| `primaryTopicId` | `string (UUID) \| null` | **לא** | הנושא הראשי. `null` = **Inbox** (לא שויך עדיין) |
| `secondaryTopicIds` | `string[]` | לא | נושאים נוספים (0-3 מומלץ) |

**ברירת מחדל:** ה-Topic האחרון שהמשתמש השתמש בו (שמור ב-`settings` store, key: `lastActiveTopicId`).  
**Inbox default:** אם המשתמש לוחץ "כתיבה מהירה" בלי לבחור Topic → `primaryTopicId = null` (Inbox).

#### The Global Inbox

**בעיה:** בחירת Topic בזמן סערה רגשית = חיכוך שמעכב כתיבה.

**פתרון:** כפתור "כתיבה מהירה" תמיד זמין, ללא חובת שיוך. פריטים ללא Topic נכנסים ל-**Inbox**.

**"למיין את המגירה" Flow:**
1. כשיש 3+ פריטים ב-Inbox → באנר עדין במסך "היום": "יש לך X פריטים ללא נושא. רוצה למיין?"
2. לחיצה → מסך מיון מהיר:
   - פריט אחד מוצג בכל פעם (Tinder-style swipe או רשימה)
   - לכל פריט: snippet + כפתורי Topics לבחירה מהירה (chips)
   - כפתור "דלג" (נשאר ב-Inbox)
3. אחרי מיון: Toast "מסודר! X פריטים שויכו."

**חוקי Inbox:**

| כלל | פירוט |
|-----|-------|
| תדירות באנר | פעם ביום מקסימום (לא מציק) |
| אין Inbox enforcement | פריטים יכולים להישאר ב-Inbox לנצח — **אפס אשמה** |
| Journey | פריטי Inbox מופיעים ב-Journey עם badge "📥 לא שויך" |
| Agenda | פריטי Inbox **כן** מופיעים באג'נדה הכללית |
| חיפוש | Inbox נכלל בחיפוש כללי |

### 2.3 ניהול Topics

| פעולה | פירוט |
|-------|-------|
| יצירה | שם + אייקון (emoji) + צבע (מתוך פלטה קבועה) |
| עריכה | שינוי שם / אייקון / צבע |
| Archive | נושא לא פעיל — לא מופיע ברשימות, הנתונים נשמרים |
| Unarchive | החזרה לפעיל |
| מחיקה | **אין מחיקה.** רק Archive. (פריטים שמשויכים לנושא לא יישברו) |
| סדר | Drag & drop לסדר ב-Topics Home |

### 2.4 מגבלות

| מגבלה | ערך | סוג |
|-------|-----|------|
| נושאים פעילים | 4–8 | **Soft limit** — הודעה ידידותית אחרי 8: "הרבה נושאים? אולי כדאי לארכב חלק" |
| נושאים מקסימום (כולל archived) | 20 | **Hard limit** |
| אורך שם | 30 תווים | Hard limit |
| Secondary topics per item | 3 | Hard limit |

### 2.5 Visual Context — צבע מוביל לכל Topic

כשהמשתמש נכנס ל-Topic Detail Screen, ה-UI משתנה ויזואלית:

| רכיב | שינוי |
|------|-------|
| **Header background** | Gradient עדין מ-`topic.color` ל-transparent |
| **CTA buttons** | `topic.color` כ-accent |
| **Tab indicator** | `topic.color` underline |
| **Card borders** | `topic.color` בעוצמה 20% (subtle) |
| **Playbook Emergency button** | `topic.color` כ-background |

**מטרה:** שינוי הסטייט התודעתי. "שוק ההון" = צבע קר ומרוכז. "זוגיות" = צבע חם. "סטרס" = צבע מרגיע.

**טכנית:**
- CSS variable `--topic-accent` מוגדר ברמת ה-Topic Detail layout
- כל component בתוך Topic קורא מ-`--topic-accent`
- Light variant: `--topic-accent-light` (20% opacity) לרקעים

### 2.6 Privacy per Topic

נושאים רגישים (למשל "זוגיות") יכולים לקבל **שכבת הגנה נוספת** מעבר ל-PIN הגלובלי.

| הגדרה | פירוט |
|-------|-------|
| `requirePin` | Topic דורש הקלדת PIN מחדש בכל כניסה (גם אם האפליקציה כבר פתוחה) |
| `blurByDefault` | כרטיס ה-Topic ב-Topics Home מטושטש. נגישות רק דרך long-press |
| `hideFromJourney` | פריטים של ה-Topic **לא** מופיעים ב-Journey "הכל" — רק ב-Journey של ה-Topic עצמו |

**UX Flow — Topic עם `requirePin`:**
1. משתמש לוחץ על כרטיס Topic
2. מסך PIN (אותו PIN גלובלי, או PIN ייעודי ל-Topic)
3. אחרי אימות → נכנס ל-Topic Detail
4. אחרי יציאה מ-Topic → ננעל מחדש

**UX Flow — Topic עם `blurByDefault`:**
1. ב-Topics Home: כרטיס מטושטש (blur), טקסט "..." במקום שם
2. Long-press → מראה שם + מאפשר כניסה (עם PIN אם מוגדר)

**AC:**
- [ ] הגדרות Privacy ב-Topic Settings (3 toggles)
- [ ] blur = CSS `filter: blur(10px)` על כרטיס
- [ ] `hideFromJourney` = filter out ב-Journey query ברמת "הכל"
- [ ] PIN per Topic: אופציונלי, 4 ספרות, נשמר ב-`settings` store כ-hash

### 2.7 Topic מובנה: "כללי"

**תמיד קיים**, לא ניתן למחיקה/ארכוב. משמש כברירת מחדל כשהמשתמש לא רוצה לשייך לנושא ספציפי.

- `id`: קבוע, מוגדר בקוד (`GENERAL_TOPIC_ID`)
- `name`: "כללי"
- `icon`: "📝"
- `isDefault`: true
- `isArchived`: false (תמיד)
- `requirePin`: false (תמיד)
- `blurByDefault`: false (תמיד)
- `hideFromJourney`: false (תמיד)

---

## 3. Data Model — כל ה-Entities החדשים

### 3.0 קונבנציות (חלות על כל ה-Entities)

| כלל | פורמט |
|-----|--------|
| IDs | UUID v4 |
| `date` | `YYYY-MM-DD` (timezone מקומי) |
| `createdAt` / `updatedAt` | ISO 8601 עם timezone: `2026-02-06T14:30:00+02:00` |
| Soft delete | `isDeleted: boolean` (ברירת מחדל: `false`) |
| Sync readiness | `updatedAt` + `isDeleted` על כל entity |

---

### 3.1 Topic

```
Topic {
  id: UUID
  name: string                     // מקסימום 30 תווים
  icon: string                     // emoji
  color: string                    // hex מתוך פלטה קבועה (8-12 צבעים)
  northStarSentence: string        // "משפט הבית" — חוזה עם עצמי (אופציונלי)
  sortOrder: number                // סדר תצוגה ב-Topics Home
  isDefault: boolean               // true רק ל"כללי"
  isArchived: boolean
  // --- Privacy ---
  requirePin: boolean              // דורש PIN בכניסה ל-Topic (ברירת מחדל: false)
  topicPin: string | null          // hash של PIN ייעודי (null = משתמש ב-PIN גלובלי)
  blurByDefault: boolean           // כרטיס מטושטש ב-Topics Home (ברירת מחדל: false)
  hideFromJourney: boolean         // מוסתר מ-Journey "הכל" (ברירת מחדל: false)
  // --- Meta ---
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean               // soft delete
}
```

**Color palette (פלטה קבועה):**
```
#6B4EE6  (סגול)
#E64E8A  (ורוד)
#E6854E  (כתום)
#E6C84E  (צהוב)
#4EE66B  (ירוק)
#4EB8E6  (תכלת)
#4E6BE6  (כחול)
#8A4EE6  (סגול כהה)
#E64E4E  (אדום)
#6B7280  (אפור — ל"כללי")
```

---

### 3.2 עדכון Entities קיימים — הוספת Topic fields

**כל entity קיים מקבל 2 שדות חדשים:**

```
// מוסיפים לכל אחד מהבאים:
// DailyEntry, Session, Highlight, AgendaItem, ActionItem

{
  ...existing fields...
  primaryTopicId: string | null    // UUID — null = Inbox (לא שויך עדיין)
  secondaryTopicIds: string[]      // UUID[] — אופציונלי, מקסימום 3
}
```

**Migration:** entities קיימים ללא `primaryTopicId` מקבלים `null` (Inbox). המשתמש ימיין אותם ב-"למיין את המגירה" flow.

---

### 3.3 TopicPlaybook (דף פעולה לנושא — "חוזה עם עצמי")

ה-Playbook הוא לא רק רשימת כלים — הוא **Manual אישי**. "חוזה עם עצמי" שמכיל את משפט הבית, כלי החירום, והסקשנים.

```
TopicPlaybook {
  id: UUID
  topicId: string                  // UUID — unique per topic (1:1)
  // --- North Star (חוזה עם עצמי) ---
  northStarSentence: string        // "משפט הבית" — מוצג בראש ה-Playbook בפונט גדול
  // --- Rescue Kit (כלי חירום) ---
  rescueToolIds: string[]          // UUID[] של TopicTools — 1-3 כלים שמופיעים ראשונים בחירום
  // --- Sections ---
  sections: PlaybookSection[]      // 1-10 סקשנים
  updatedAt: ISO string
  isDeleted: boolean
}

PlaybookSection {
  id: UUID                         // unique within playbook
  title: string                    // "עוגנים", "משפט מפתח", "צעד ראשון"
  content: string                  // תוכן חופשי
  sortOrder: number
}
```

**מבנה ה-Playbook כ-"Manual אישי":**

```
┌─────────────────────────────────────────────────────────────┐
│  📖 Playbook: שוק ההון                                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ⭐ משפט הבית (North Star)                                │ │
│  │  "אני פועל לפי תוכנית, לא לפי מחיר."                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  🆘 כלי חירום (Rescue Kit)                                │ │
│  │  [Market Interrupt]  [Cooling Window]  [Decision Log]     │ │
│  │   ← כפתורים שמפעילים ישירות                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ─── סקשנים ──────────────────────────────────────────────── │
│  ▸ Interrupt מול Polling                                      │
│  ▸ חלון בדיקה אחד                                            │
│  ▸ מה אני לא עושה בין לבין                                    │
└─────────────────────────────────────────────────────────────┘
```

**דוגמאות Playbook לפי נושא:**

| נושא | משפט הבית (North Star) | כלי חירום (Rescue Kit) | סקשנים |
|------|----------------------|----------------------|--------|
| שוק ההון | "אני פועל לפי תוכנית, לא לפי מחיר." | Market Interrupt, Decision Log | "Interrupt מול Polling", "חלון בדיקה אחד" |
| זוגיות | "הקשר חשוב יותר מהצדק שלי." | Repair Note, Boundary Draft | "ויסות קודם, תקשורת אחר כך", "תבנית הודעה נקייה" |
| סטרס | "הגל תמיד עובר." | Now Check-in, 4-7-8 Breathing | "עכשיו אני כאן", "גל טרולי — מה עושים" |
| שינה | "שינה היא לא מותרות, היא תשתית." | Wind-down Routine, Phone Rule | "Wind-down Protocol", "עוגנים לפני שינה" |

---

### 3.4 UrgeEvent (דחיפות — Wizard Flow)

```
UrgeEvent {
  id: UUID
  primaryTopicId: string | null    // לאיזה נושא הדחיפות שייכת (null = Inbox)
  secondaryTopicIds: string[]
  // --- Step 1: זיהוי ---
  urgeText: string                 // "מה הדחף?" — טקסט חופשי או בחירה מרשימה
  urgeCategory: 'check' | 'send' | 'buy' | 'react' | 'avoid' | 'custom' | null
                                   // קטגוריית דחף מהירה (אופציונלי)
  // --- Step 2: השהיה ---
  pauseDuration: number            // שניות השהיה (ברירת מחדל: 10)
  breathingUsed: boolean           // האם השתמש בנשימה במהלך ההשהיה
  // --- Step 3: מחיר ---
  costText: string                 // "מה יקרה מחר אם אעשה את זה עכשיו?"
  // --- Step 4: חלופה ---
  alternativeText: string          // "מה אני בוחר לעשות במקום?"
  suggestedToolId: string | null   // UUID של TopicTool שהוצע מה-Toolbox (אופציונלי)
  usedSuggestedTool: boolean       // האם השתמש בכלי המוצע
  // --- Outcome ---
  outcome: 'resisted' | 'acted' | null  // מה קרה בסוף (עדכון מאוחר)
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

**Urge Categories (בחירה מהירה בשלב 1):**

| Category | Label | דוגמה |
|----------|-------|-------|
| `check` | "לבדוק" | לבדוק תיק, לבדוק הודעות |
| `send` | "לשלוח" | לשלוח הודעה, לכתוב תגובה |
| `buy` | "לקנות/למכור" | לבצע עסקה, לקנות משהו |
| `react` | "להגיב" | להגיב לפרובוקציה, להתפרץ |
| `avoid` | "להימנע" | לבטל, לברוח, לא להופיע |
| `custom` | "אחר" | טקסט חופשי |

---

### 3.5 TriggerHurtEvent (טריגר מול פגיעה — זוגיות, עם מדחום רגשי)

```
TriggerHurtEvent {
  id: UUID
  primaryTopicId: string | null    // ברירת מחדל: Topic זוגיות
  secondaryTopicIds: string[]
  // --- מדחום רגשי (שלב ראשון) ---
  intensityLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                                   // עוצמת הפגיעה/רגש (1=נמוך, 10=גבוה מאוד)
  coolingEnforced: boolean         // האם המערכת אכפה cooling (intensity >= 8)
  coolingDuration: number          // שניות של cooling שנאכפו (0 אם לא נאכף)
  // --- בחירת סוג ---
  type: 'trigger' | 'hurt'        // החלטת המשתמש (אחרי cooling אם נאכף)

  // אם trigger:
  regulationDuration: number       // שניות שחלפו (60-120)
  draftMessage: string             // טיוטת הודעה אחרי ויסות (אופציונלי)

  // אם hurt:
  boundaryRequest: string          // "מה אני מבקש"
  boundaryDefinition: string       // "מה הגבול"
  boundaryConsequence: string      // "מה יקרה אם לא מכובד"

  note: string                     // הערה חופשית (אופציונלי)
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

**מדחום רגשי — Cooling Enforcement:**

| עוצמה | מה קורה |
|-------|---------|
| 1-4 | ירוק — ממשיך ישירות לבחירת trigger/hurt |
| 5-7 | כתום — המלצה לנשום (לא כפוי) + ממשיך |
| **8-10** | **אדום — cooling כפוי**: מסך נשימה 5 דקות (300 שניות) → כפתור "סיימתי" נפתח רק אחרי 5 דקות → רק אז מאפשר כתיבה |

**זה "עוזר טיפולי" אקטיבי בלי AI** — המערכת לא מנתחת, היא פשוט אוכפת המתנה כשהמשתמש עצמו מדווח שהוא ב-8+.

---

### 3.6 HalfPowerEntry (רשומת חצי כוח — עם Emoji Check-in)

```
HalfPowerEntry {
  id: UUID
  primaryTopicId: string | null    // null = Inbox
  content: string                  // תוכן מוגבל (ראה מגבלות לפי Topic)
  templateType: 'emoji_checkin' | 'action_check' | 'freeform_90s' | 'one_sentence' | 'facts_only' | 'custom'
  // --- Emoji Check-in fields ---
  emojiMood: string | null         // emoji שנבחר (😊😐😔😤😰 וכו')
  actionCheckText: string | null   // "האם עמדתי בחוק הקטן?" — טקסט ה-MicroBoundary
  actionCheckResult: boolean | null // כן/לא — עמדתי?
  // --- Meta ---
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

**מגבלות לפי templateType:**

| Template | Topic מומלץ | מגבלה | מה זה |
|----------|------------|-------|-------|
| `emoji_checkin` | כל נושא | **לחיצה אחת** — בחירת emoji בלבד | "איך אני?" — 😊😐😔😤😰🥱 |
| `action_check` | כל נושא | **לחיצה אחת** — כפתור "עמדתי / לא עמדתי" | "האם שמרתי על החוק הקטן?" (מקושר ל-MicroBoundary) |
| `freeform_90s` | סטרס | טיימר 90 שניות — אחרי שנגמר, שומר אוטומטית | כתיבה חופשית עם מגבלת זמן |
| `one_sentence` | שוק ההון | שדה טקסט אחד, מקסימום 280 תווים | "לא בדקתי תיק היום" |
| `facts_only` | זוגיות | 3 שדות טקסט בלבד, 140 תווים כל אחד | "רק עובדות" |
| `custom` | כללי | טקסט חופשי, ללא מגבלה | כתיבה חופשית |

**Emoji Check-in — פיצ'ר קריטי למניעת נטישה:**

> כשאין כוח לכלום — **לחיצה אחת על emoji מספיקה**. זה שומר continuity בלי מאמץ.

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ חצי כוח                                                  │
│                                                               │
│  איך אני?                                                    │
│                                                               │
│  [😊]  [😐]  [😔]  [😤]  [😰]  [🥱]                        │
│                                                               │
│  ──── או ────                                                │
│                                                               │
│  [✅ עמדתי בחוק הקטן]    [❌ לא עמדתי — וזה בסדר]          │
│                                                               │
│  "לא בדקתי תיק היום"    ← מציג את ה-MicroBoundary של היום   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.7 InternalValidation (תיקוף פנימי — זוגיות)

```
InternalValidation {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: זוגיות
  triggeredAt: ISO string          // מתי לחץ "לא שולח עכשיו"
  affirmationShown: string         // המשפט שהוצג
  durationSeconds: number          // כמה שניות נשאר ב-overlay (ברירת מחדל 10)
  didSendAfter: boolean | null     // האם שלח אחרי? (אופציונלי, self-report)
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

**משפטי אישור קבועים (ניתנים לעריכה ע"י המשתמש):**

```
ValidationAffirmation {
  id: UUID
  text: string                     // "אני לא צריך תיקוף עכשיו"
  primaryTopicId: string | null    // null = כללי
  sortOrder: number
  isDefault: boolean               // ברירות מחדל שמגיעות עם המערכת
  createdAt: ISO string
  isDeleted: boolean
}
```

**ברירות מחדל (seed data):**
- "אני מספיק גם בלי תגובה עכשיו"
- "זה לא דחוף. אני יכול לחכות"
- "אני בוחר לא לשלוח. זה בסדר"

---

### 3.8 GratitudeEntry (הכרת תודה — per Topic)

```
GratitudeEntry {
  id: UUID
  primaryTopicId: string           // חובה
  date: YYYY-MM-DD
  type: 'quick' | 'deep'
  items: GratitudeItem[]           // 1-3 פריטים
  feeling: string                  // אופציונלי — "איך הרגשתי"
  memoryNote: string               // "איך אני רוצה לזכור"
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}

GratitudeItem {
  text: string                     // חובה
  why: string                      // אופציונלי
  myContribution: string           // אופציונלי
  category: 'person' | 'event' | 'self' | null
}
```

**Spotlight Presets per Topic (seed data):**

| Topic | Prompt | Label |
|-------|--------|-------|
| זוגיות | "תודה אחת לאור" | Spotlight: זוגיות |
| משפחה | "רגע אחד עם היילי" | Spotlight: משפחה |
| כללי/עצמי | "משהו אחד שעשיתי טוב" | Spotlight: עצמי |
| שינה | "דבר אחד שעזר לי להירדם" | Spotlight: שינה |

**שימו לב:** ה-Spotlight Presets הם **UI sugar בלבד** — הם פשוט פותחים GratitudeEntry עם Topic ספציפי ו-prompt מותאם. אין entity נפרד.

---

### 3.9 MarketInterruptPlan (שוק ההון)

```
MarketInterruptPlan {
  id: UUID
  primaryTopicId: string           // תמיד Topic שוק ההון
  checkTime: string                // "09:00" — שעת בדיקה מוסכמת
  actionCondition: string          // "תנאי אחד לפעולה" — טקסט חופשי
  doNotList: string[]              // "מה אני לא עושה בין לבין" — רשימת טקסטים
  isActive: boolean                // האם התוכנית פעילה
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

---

### 3.10 CoolingWindow (שוק ההון — טיימר)

```
CoolingWindow {
  id: UUID
  primaryTopicId: string
  startedAt: ISO string
  endsAt: ISO string               // "החלטתי לא לבדוק עד X"
  reason: string                   // אופציונלי — "למה אני דוחה"
  completed: boolean               // האם הגיע לסוף בלי לבדוק
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.11 DecisionLog (שוק ההון)

```
DecisionLog {
  id: UUID
  primaryTopicId: string
  action: string                   // "איזו פעולה אני דוחה"
  reason: string                   // "למה"
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.12 RepairNote (זוגיות — אחרי קונפליקט)

```
RepairNote {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: זוגיות
  secondaryTopicIds: string[]
  responsibility: string           // "מה אני לוקח אחריות"
  request: string                  // "מה אני מבקש"
  appreciation: string             // "מה אני מעריך"
  linkedTriggerHurtId: string | null  // קישור ל-TriggerHurtEvent אם יש
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

---

### 3.13 NowCheckin (סטרס)

```
NowCheckin {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: סטרס
  body: string                     // "איפה זה בגוף" — טקסט חופשי
  urgeLevel: 1 | 2 | 3 | 4 | 5   // דחיפות (1 = נמוך, 5 = גבוה)
  choice: string                   // "מה אני בוחר" — טקסט חופשי
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.14 WaveModeSession (סטרס — גל)

```
WaveModeSession {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: סטרס
  startedAt: ISO string
  endedAt: ISO string | null       // null = עדיין בגל
  durationSeconds: number | null   // מחושב מ-start/end
  breathingUsed: boolean           // האם השתמש בנשימה מודרכת
  noteAfter: string                // הערה אחרי הגל (אופציונלי)
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.15 MicroBoundary (סטרס — חוק קטן להיום)

```
MicroBoundary {
  id: UUID
  primaryTopicId: string
  text: string                     // "טלפון הפוך", "לא לבדוק חדשות בבוקר"
  date: YYYY-MM-DD                 // ליום הזה
  kept: boolean | null             // האם שמרתי? (self-report, אופציונלי)
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.16 SleepLog (שינה)

```
SleepLog {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: שינה
  date: YYYY-MM-DD                 // הלילה של (תאריך ההליכה לישון)
  bedTime: string                  // "23:30" (HH:mm)
  wakeTime: string                 // "07:15" (HH:mm)
  quality: 1 | 2 | 3 | 4 | 5     // 1 = גרוע, 5 = מצוין
  disturbance: string              // "מה הפריע" — אופציונלי
  cycleId: string
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

---

### 3.17 WindDownRoutine (שינה)

```
WindDownRoutine {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: שינה
  steps: RoutineStep[]             // 1-5 צעדים
  isActive: boolean
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}

RoutineStep {
  id: UUID
  text: string                     // "לכבות מסכים", "נשימה", "קריאה"
  sortOrder: number
}
```

---

### 3.18 PhoneRule (שינה)

```
PhoneRule {
  id: UUID
  primaryTopicId: string           // ברירת מחדל: שינה
  ruleType: 'other_room' | 'face_down' | 'silent' | 'custom'
  customText: string               // אם ruleType = 'custom'
  timerMinutes: number             // כמה דקות לפני השינה
  isActive: boolean
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

---

### 3.19 TenMinuteDefer (Cross-Topic — דחיית פעולה)

```
TenMinuteDefer {
  id: UUID
  primaryTopicId: string
  urgeDescription: string          // "מה רציתי לעשות"
  deferredAt: ISO string           // מתי דחיתי
  expiresAt: ISO string            // +10 דקות
  didActAfter: boolean | null      // האם עשיתי אחרי? (אופציונלי)
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.20 OneSentenceEntry (Cross-Topic)

```
OneSentenceEntry {
  id: UUID
  primaryTopicId: string
  sentence: string                 // מקסימום 280 תווים — חובה
  prompt: 'decision' | 'feeling' | 'choice' | 'custom'
  cycleId: string
  createdAt: ISO string
  isDeleted: boolean
}
```

**Prompts לפי סוג:**

| prompt | טקסט מוצג |
|--------|----------|
| `decision` | "מה החלטתי לא לעשות היום?" |
| `feeling` | "במשפט אחד — איך אני?" |
| `choice` | "מה בחרתי לעשות אחרת?" |
| `custom` | שדה חופשי |

---

### 3.21 ChoiceLog (Cross-Topic)

```
ChoiceLog {
  id: UUID
  primaryTopicId: string
  didNotDo: string                 // "מה בחרתי לא לעשות היום"
  cycleId: string
  date: YYYY-MM-DD
  createdAt: ISO string
  isDeleted: boolean
}
```

---

### 3.22 TopicTool (Toolbox per Topic)

```
TopicTool {
  id: UUID
  topicId: string                  // UUID — לאיזה Topic שייך
  name: string                     // "נשימה 4-7-8", "גבול עם אמא"
  whenToUse: string                // "כשאני מרגיש לחץ בעבודה"
  signal: string                   // "איך יודעים שזה הזמן" — "כשהלסת נועלת"
  sortOrder: number                // סדר תצוגה (מקסימום 5 כלים לנושא)
  createdAt: ISO string
  updatedAt: ISO string
  isDeleted: boolean
}
```

---

### 3.23 ToolUsage (שימוש בכלי)

```
ToolUsage {
  id: UUID
  toolId: string                   // UUID של TopicTool
  topicId: string                  // UUID — redundant אבל חוסך join
  entryId: string | null           // מקושר לרשומה (אופציונלי)
  note: string                     // אופציונלי
  createdAt: ISO string
  isDeleted: boolean
}
```

---

## 4. IndexedDB Schema — Stores חדשים

```javascript
// ===== Stores חדשים =====
db.createObjectStore('topics',             { keyPath: 'id' });
db.createObjectStore('topicPlaybooks',     { keyPath: 'id' });
db.createObjectStore('urgeEvents',         { keyPath: 'id' });
db.createObjectStore('triggerHurtEvents',  { keyPath: 'id' });
db.createObjectStore('halfPowerEntries',   { keyPath: 'id' });
db.createObjectStore('internalValidations',{ keyPath: 'id' });
db.createObjectStore('validationAffirmations', { keyPath: 'id' });
db.createObjectStore('gratitudeEntries',   { keyPath: 'id' });
db.createObjectStore('marketInterruptPlans', { keyPath: 'id' });
db.createObjectStore('coolingWindows',     { keyPath: 'id' });
db.createObjectStore('decisionLogs',       { keyPath: 'id' });
db.createObjectStore('repairNotes',        { keyPath: 'id' });
db.createObjectStore('nowCheckins',        { keyPath: 'id' });
db.createObjectStore('waveModeSessions',   { keyPath: 'id' });
db.createObjectStore('microBoundaries',    { keyPath: 'id' });
db.createObjectStore('sleepLogs',          { keyPath: 'id' });
db.createObjectStore('windDownRoutines',   { keyPath: 'id' });
db.createObjectStore('phoneRules',         { keyPath: 'id' });
db.createObjectStore('tenMinuteDefers',    { keyPath: 'id' });
db.createObjectStore('oneSentenceEntries', { keyPath: 'id' });
db.createObjectStore('choiceLogs',         { keyPath: 'id' });
db.createObjectStore('topicTools',         { keyPath: 'id' });
db.createObjectStore('toolUsages',         { keyPath: 'id' });

// ===== Indexes =====

// topics
topics.createIndex('by-archived', 'isArchived');
topics.createIndex('by-sortOrder', 'sortOrder');

// topicPlaybooks
topicPlaybooks.createIndex('by-topicId', 'topicId', { unique: true });

// urgeEvents
urgeEvents.createIndex('by-topicId', 'primaryTopicId');
urgeEvents.createIndex('by-cycleId', 'cycleId');
urgeEvents.createIndex('by-createdAt', 'createdAt');

// triggerHurtEvents
triggerHurtEvents.createIndex('by-topicId', 'primaryTopicId');
triggerHurtEvents.createIndex('by-cycleId', 'cycleId');
triggerHurtEvents.createIndex('by-type', 'type');

// halfPowerEntries
halfPowerEntries.createIndex('by-topicId', 'primaryTopicId');
halfPowerEntries.createIndex('by-cycleId', 'cycleId');

// gratitudeEntries
gratitudeEntries.createIndex('by-topicId', 'primaryTopicId');
gratitudeEntries.createIndex('by-date', 'date');
gratitudeEntries.createIndex('by-cycleId', 'cycleId');

// marketInterruptPlans
marketInterruptPlans.createIndex('by-topicId', 'primaryTopicId');

// coolingWindows
coolingWindows.createIndex('by-topicId', 'primaryTopicId');
coolingWindows.createIndex('by-endsAt', 'endsAt');

// decisionLogs
decisionLogs.createIndex('by-topicId', 'primaryTopicId');
decisionLogs.createIndex('by-cycleId', 'cycleId');

// repairNotes
repairNotes.createIndex('by-topicId', 'primaryTopicId');
repairNotes.createIndex('by-cycleId', 'cycleId');

// nowCheckins
nowCheckins.createIndex('by-topicId', 'primaryTopicId');
nowCheckins.createIndex('by-cycleId', 'cycleId');

// waveModeSessions
waveModeSessions.createIndex('by-topicId', 'primaryTopicId');
waveModeSessions.createIndex('by-cycleId', 'cycleId');

// microBoundaries
microBoundaries.createIndex('by-topicId', 'primaryTopicId');
microBoundaries.createIndex('by-date', 'date');

// sleepLogs
sleepLogs.createIndex('by-topicId', 'primaryTopicId');
sleepLogs.createIndex('by-date', 'date');

// windDownRoutines
windDownRoutines.createIndex('by-topicId', 'primaryTopicId');

// phoneRules
phoneRules.createIndex('by-topicId', 'primaryTopicId');

// tenMinuteDefers
tenMinuteDefers.createIndex('by-topicId', 'primaryTopicId');
tenMinuteDefers.createIndex('by-cycleId', 'cycleId');

// oneSentenceEntries
oneSentenceEntries.createIndex('by-topicId', 'primaryTopicId');
oneSentenceEntries.createIndex('by-cycleId', 'cycleId');

// choiceLogs
choiceLogs.createIndex('by-topicId', 'primaryTopicId');
choiceLogs.createIndex('by-date', 'date');

// topicTools
topicTools.createIndex('by-topicId', 'topicId');

// toolUsages
toolUsages.createIndex('by-toolId', 'toolId');
toolUsages.createIndex('by-topicId', 'topicId');

// ===== עדכון Indexes ב-Stores קיימים =====

// entries (קיים) — להוסיף:
entries.createIndex('by-primaryTopicId', 'primaryTopicId');

// agendaItems (קיים) — להוסיף:
agendaItems.createIndex('by-primaryTopicId', 'primaryTopicId');

// highlights (קיים) — להוסיף:
highlights.createIndex('by-primaryTopicId', 'primaryTopicId');

// sessions (קיים) — להוסיף:
sessions.createIndex('by-primaryTopicId', 'primaryTopicId');

// actionItems (קיים) — להוסיף:
actionItems.createIndex('by-primaryTopicId', 'primaryTopicId');
```

---

## 5. מסכים וניווט (IA) — עדכון

### 5.1 מבנה ניווט חדש

```
┌─────────────────────────────────────────────────────────────┐
│  Bottom Nav (5 טאבים)                                         │
│                                                               │
│  [היום]  [נושאים]  [מסע]  [אג'נדה]  [עוד]                     │
│    ✏️       🏷️       🗺️      📋       ≡                       │
└─────────────────────────────────────────────────────────────┘
```

| # | טאב | אייקון | תוכן |
|---|------|--------|------|
| 1 | **היום** | ✏️ | Quick actions + Recent + כתיבה מהירה (כמו Home/Pulse) |
| 2 | **נושאים** | 🏷️ | Topics Home — grid של כל הנושאים |
| 3 | **מסע** | 🗺️ | Journey — Timeline כרונולוגי (עם Topic filter) |
| 4 | **אג'נדה** | 📋 | Agenda — נקודות לפגישה (עם Topic filter) |
| 5 | **עוד** | ≡ | Vault, Export, Settings, Therapy Vault (סיכומים) |

### 5.2 Topics Home (טאב "נושאים")

```
┌─────────────────────────────────────────────────────────────┐
│  הנושאים שלי                                    [+ נושא חדש] │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 📊 שוק ההון  │  │ 💑 זוגיות    │  │ 😤 סטרס      │        │
│  │  3 פתוחים    │  │  1 פתוח      │  │  2 פתוחים    │        │
│  │  באג'נדה     │  │  באג'נדה     │  │  באג'נדה     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 🌙 שינה      │  │ 📝 כללי      │  │              │        │
│  │  --          │  │  5 רשומות    │  │  + נושא חדש  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
│  ─── ארכיון (2 נושאים) ───                         [הצג ▾]  │
└─────────────────────────────────────────────────────────────┘
```

**כרטיס Topic:**
- אייקון + שם
- צבע רקע (מהפלטה)
- סטטיסטיקה קצרה: "X פתוחים באג'נדה" / "Y רשומות" / אחרון עודכן
- לחיצה → **Topic Detail Screen**

### 5.3 Topic Detail Screen (בתוך נושא)

```
┌─────────────────────────────────────────────────────────────┐
│  ← חזרה     📊 שוק ההון                          [⚙️ ערוך]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─ Tabs ──────────────────────────────────────────────────┐ │
│  │ [סקירה] [כתיבה] [אג'נדה] [הארות] [מעקב] [יעדים]       │ │
│  │ [מסע] [כלים] [Playbook]                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ Tab Content ───────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  (תוכן משתנה לפי Tab נבחר)                                │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  [🆘 מצב חירום — Playbook]     ← כפתור נגיש תמיד בתוך Topic │
└─────────────────────────────────────────────────────────────┘
```

**Tabs בתוך Topic:**

| Tab | שם | תוכן |
|-----|-----|------|
| סקירה | Overview | סיכום מהיר: אג'נדה פתוחה + אחרון שנכתב + כלים מהירים |
| כתיבה | Today | כמו מסך Today, אבל pre-filtered ל-Topic |
| אג'נדה | Agenda | נקודות לפגישה של ה-Topic הזה |
| הארות | Insights | הארות שסומנו בנושא |
| מעקב | Trackers | SleepLog / CoolingWindow / MicroBoundary וכו' — לפי מה שרלוונטי לנושא |
| יעדים | Goals | ActionItems / Homework של הנושא |
| מסע | Journey | Timeline של הנושא בלבד |
| כלים | Tools | TopicTools + קיצורי דרך ל-UrgeProtocol, NowCheckin, וכו' |
| Playbook | Playbook | דף הפעולה — מסך סטטי + פעולות מהירות |

**החלטת UX: Tabs גלילה אופקית** — לא כל הטאבים נראים, המשתמש גולל ימינה/שמאלה. ה-3 הראשונים (סקירה, כתיבה, אג'נדה) תמיד נראים.

### 5.4 מסך "היום" — עדכון

מסך "היום" הופך ל-**Hub** עם Topic context + Inbox:

```
┌─────────────────────────────────────────────────────────────┐
│  ערב טוב, נדב                                   6 בפברואר  │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  ┌─ 📥 Inbox (3 פריטים ממתינים) ─────────── [למיין →] ────┐ │
│  │  באנר עדין — מופיע רק כשיש 3+ פריטים ב-Inbox           │ │
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
│  │   ↑ שומר ל-Inbox                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ אחרונים ───────────────────────────────────────────────┐ │
│  │  רשומה (📊) — "החלטתי לא לבדוק..."          לפני 2 שע' │ │
│  │  הכרת תודה (💑) — "תודה לאור שהק..."        אתמול      │ │
│  │  ⚡ Emoji Check-in (😤) — סטרס              אתמול      │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**"כתיבה מהירה"** = שדה טקסט שנפתח ישירות, ללא Topic picker. שומר ל-Inbox (`primaryTopicId = null`). המשתמש ימיין אחר כך ב-"למיין את המגירה".

### 5.5 יצירת פריט — Topic Picker

**בכל מסך יצירה**, השדה הראשון הוא Topic:

```
┌─────────────────────────────────────────────────────────────┐
│  רשומה חדשה                                                  │
│                                                               │
│  נושא: [📊 שוק ההון ▾]          ← ברירת מחדל: אחרון שנבחר   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  (שדה כתיבה)                                              │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  [+ נושאים נוספים]              ← פותח secondaryTopics picker │
└─────────────────────────────────────────────────────────────┘
```

**Topic Picker:**
- Dropdown/Bottom Sheet עם כל ה-Topics הפעילים
- אייקון + צבע + שם
- "כללי" תמיד ראשון
- "+ נושא חדש" בתחתית

---

## 6. פיצ'ר: Topic Playbook — "חוזה עם עצמי"

### מטרה

בזמן גל או דחיפות — לא לחשוב. להיכנס ל"פרוטוקול" של הנושא ולמצוא מה לעשות. ה-Playbook הוא **Manual אישי** — לא רשימת כלים, אלא "חוזה עם עצמי".

### UX Flow

1. משתמש בתוך Topic → לחיצה על טאב "Playbook" (או כפתור "מצב חירום" 🆘)
2. מסך Playbook נפתח — **מסך מלא, נקי, font גדול** (בדומה למצב "בחדר")
3. **בראש המסך:** "משפט הבית" (North Star) — בפונט גדול ובולט
4. **מתחתיו:** "כלי חירום" (Rescue Kit) — 1-3 כפתורי פעולה מהירים מה-Toolbox
5. **אחריהם:** הסקשנים מוצגים אחד מתחת לשני, עם כותרות בולטות

```
┌─────────────────────────────────────────────────────────────┐
│  📖 Playbook: סטרס                              [✏️ ערוך]   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ⭐ "הגל תמיד עובר."                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  🆘 כלי חירום:                                                │
│  [🔧 נשימה 4-7-8]  [🔧 Now Check-in]  [🔧 Wave Mode]       │
│                                                               │
│  ▸ עכשיו אני כאן                                             │
│    "תעצור. תנשום. תשים רגליים על הרצפה."                     │
│                                                               │
│  ▸ גל טרולי — מה עושים                                       │
│    "הגל רוצה פעולה. אני נותן לו לעבור."                      │
│                                                               │
│  ▸ עוגנים                                                     │
│    "מים קרים על הפנים, הליכה 5 דקות, שיר מרגיע"             │
└─────────────────────────────────────────────────────────────┘
```

### Playbook Editor

- בתוך Topic → Settings → "ערוך Playbook"
- **North Star:** שדה טקסט אחד (מקסימום 100 תווים)
- **Rescue Kit:** בחירת 1-3 כלים מה-TopicTools (dropdown)
- **Sections:** הוספת/עריכת/מחיקת/סידור סקשנים
- כל סקשן = כותרת + תוכן (markdown בסיסי: **bold**, *italic*, bullet list)

### Acceptance Criteria

- [ ] לכל Topic יש Playbook (נוצר ריק עם Topic)
- [ ] **North Star** מוצג בראש ב-font גדול (24px+), ממורכז
- [ ] **Rescue Kit** מוצג כ-1-3 כפתורי action שמפעילים כלים ישירות (TopicTools)
- [ ] Playbook מוצג כמסך מלא, נקי, ללא ניווט מיותר
- [ ] כפתור "מצב חירום" 🆘 נגיש מכל מסך בתוך Topic
- [ ] סקשנים ניתנים לגרירה (drag & drop) לסידור
- [ ] Playbook ריק מציג Empty State: "בנה את הפרוטוקול שלך — מה עושים כשזה מגיע?"
- [ ] **Seed data:** כשיוצרים Topic, Playbook נוצר ריק. אין templates מוכנים (המשתמש בונה לבד, בהתאם לעקרון Zero AI)
- [ ] North Star ריק מציג placeholder: *"מה המשפט שמחזיר אותי למקום?"*

---

## 7. פיצ'ר: Urge Protocol — Wizard (שלב אחר שלב)

### מטרה

לתפוס את הרגע שבו הדחיפות רוצה פעולה, ולשים עליה מסגרת. **ישות גלובלית** עם שיוך לנושא. **Wizard בן 4 שלבים** — שלב אחד בכל מסך, לא טופס ארוך.

### UX Flow — Wizard

```
┌─────────────────────────────────────────────────────────────┐
│  🆘 פרוטוקול דחיפות                          שלב 1 מתוך 4  │
│                                                               │
│  נושא: [📊 שוק ההון ▾]                                       │
│                                                               │
│  מה הדחף?                                                    │
│                                                               │
│  [לבדוק] [לשלוח] [לקנות/למכור] [להגיב] [להימנע] [אחר]    │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  (שדה טקסט חופשי — מה בדיוק רוצה לעשות?)                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│                                               [הבא →]        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🆘 פרוטוקול דחיפות                          שלב 2 מתוך 4  │
│                                                               │
│  נושמים.                                                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │              (animation נשימה — 10 שניות)                 │ │
│  │               expand 4s → hold 3s → shrink 3s             │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  [דלג →]                   (כפתור "הבא" מתאפשר אחרי 10 שנ') │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🆘 פרוטוקול דחיפות                          שלב 3 מתוך 4  │
│                                                               │
│  מה יקרה מחר אם אעשה את זה עכשיו?                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  (שדה טקסט)                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│                                               [הבא →]        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🆘 פרוטוקול דחיפות                          שלב 4 מתוך 4  │
│                                                               │
│  מה אני בוחר לעשות במקום?                                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  (שדה טקסט)                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  💡 כלי מהיר מה-Toolbox:                                     │
│  [🔧 נשימה 4-7-8]  [🔧 הליכה 5 דקות]                       │
│   ← כפתורים מה-TopicTools של הנושא שנבחר                     │
│                                                               │
│                                    [סיום ✓]  [דחה 10 דק ⏱️] │
└─────────────────────────────────────────────────────────────┘
```

**שלבים:**

| # | שלב | מה קורה | חובה? |
|---|------|---------|-------|
| 1 | **זיהוי** | Topic + קטגוריית דחף + טקסט חופשי | כן |
| 2 | **השהיה** | נשימה ויזואלית 10 שניות | אפשר לדלג |
| 3 | **מחיר** | "מה יקרה מחר?" | כן |
| 4 | **חלופה** | "מה אני בוחר במקום?" + כלי מה-Toolbox + אפשרות "דחה 10 דקות" | כן |

### Edge Cases

- משתמש לא בוחר Topic → `primaryTopicId = null` (Inbox)
- משתמש לוחץ "ביטול" באמצע → **לא שומר** (אין drafts ל-Urge)
- שלב 4: אם יש TopicTools לנושא שנבחר → מציג 1-3 כלים מה-Rescue Kit. אם אין → לא מציג
- "דחה 10 דק" בשלב 4 → שומר UrgeEvent + יוצר TenMinuteDefer אוטומטית

### Acceptance Criteria

- [ ] Urge Protocol נגיש מ-Quick Actions במסך "היום" ומכל Topic
- [ ] **4 שלבים**, שלב בכל מסך (Wizard), עם progress indicator
- [ ] שלב 2 (נשימה): animation expand/hold/shrink, כפתור "הבא" מושבת ל-10 שניות (כפתור "דלג" תמיד זמין)
- [ ] שלב 4: מציג כלים מ-TopicTools של הנושא שנבחר (Rescue Kit)
- [ ] שלב 4: כפתור "דחה 10 דקות" → יוצר TenMinuteDefer אוטומטית
- [ ] אחרי סיום: Toast "נרשם. אתה בוחר."
- [ ] UrgeEvent מופיע ב-Journey תחת ה-Topic שנבחר
- [ ] שדה `outcome` ניתן לעדכון מאוחר (מתוך Journey: "מה קרה בסוף?")

---

## 8. פיצ'ר: Trigger vs Hurt (זוגיות) — עם מדחום רגשי

### מטרה

הבחנה בין פגיעה אמיתית לטריגר פנימי. Flow שונה לכל אחד. **מדחום רגשי** לפני הבחירה — אם העוצמה גבוהה (8+), המערכת אוכפת cooling לפני שמאפשרת כתיבה.

### UX Flow — Wizard (4 שלבים)

```
┌─────────────────────────────────────────────────────────────┐
│  שלב 1: מדחום רגשי                              1 מתוך 4   │
│                                                               │
│  איפה אני עכשיו?                                             │
│                                                               │
│  1 ─────────●────────────────────────────── 10               │
│  רגוע      ↑ 3              קשה    גל מלא                    │
│                                                               │
│                                               [הבא →]        │
└─────────────────────────────────────────────────────────────┘
```

**אם עוצמה 8-10 → Cooling כפוי (שלב 1.5):**

```
┌─────────────────────────────────────────────────────────────┐
│  🧘 הגוף שלך צריך רגע                                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │           (animation נשימה — 5 דקות)                      │ │
│  │           "שאפ... החזק... נשוף..."                        │ │
│  │                                                           │ │
│  │           ⏱️ 4:32 נשאר                                    │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  "אתה כאן. קח את הזמן."                                     │
│                                                               │
│  (כפתור "סיימתי" מושבת עד סוף 5 דקות)                       │
└─────────────────────────────────────────────────────────────┘
```

**שלב 2: בחירת סוג (אחרי cooling אם נאכף):**

```
┌─────────────────────────────────────────────────────────────┐
│  שלב 2: מה קורה עכשיו?                          2 מתוך 4   │
│                                                               │
│  ┌───────────────────┐    ┌───────────────────┐              │
│  │                     │    │                     │            │
│  │   😤 טריגר פנימי  │    │   💔 פגיעה אמיתית  │            │
│  │   "זה יותר שלי"   │    │   "פגעו בי באמת"   │            │
│  │                     │    │                     │            │
│  └───────────────────┘    └───────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**שלב 3 (אם "טריגר"):**

1. מסך ויסות: טיימר 60–120 שניות (בחירת המשתמש)
   - מסך מינימלי, צבע רגוע, משפט: "אני כאן. זה גל. הוא יעבור."
   - כפתור "סיימתי" (מתאפשר רק אחרי שהטיימר מסתיים)
2. אחרי הטיימר: "רוצה לכתוב טיוטת הודעה?" (אופציונלי)
   - שדה טקסט לטיוטה
   - כפתור "שמור כטיוטה" (לא "שלח"!)

**שלב 3 (אם "פגיעה אמיתית"):**

1. תבנית גבול:
   - "מה אני מבקש" (חובה)
   - "מה הגבול" (חובה)
   - "מה יקרה אם לא מכובד" (אופציונלי)
2. כפתור "שמור"

**שלב 4: סיכום + שמירה:**
- סיכום קצר של מה שנכתב
- כפתור "שמור"
- אופציונלי: "רוצה להוסיף לאג'נדה?" → יוצר AgendaItem

### Acceptance Criteria

- [ ] **מדחום רגשי** (slider 1-10) כשלב ראשון — חובה
- [ ] **Cooling כפוי** ב-8+: מסך נשימה 5 דקות, כפתור "סיימתי" נעול עד הסוף
- [ ] Cooling ב-5-7: המלצה לנשום (לא כפוי), כפתור "דלג" זמין
- [ ] בחירה בין "טריגר" ל"פגיעה" בכפתורים ברורים וגדולים
- [ ] טיימר ויסות (trigger): countdown ויזואלי, 60/90/120 שניות (3 אפשרויות)
- [ ] כפתור "סיימתי" מושבת (disabled) עד סוף הטיימר
- [ ] טיוטת הודעה נשמרת ב-`draftMessage`, **לא נשלחת**
- [ ] הכל נשמר תחת Topic שנבחר (ברירת מחדל: זוגיות)
- [ ] Event מופיע ב-Journey עם אייקון שונה: 😤 לטריגר, 💔 לפגיעה
- [ ] `intensityLevel` מוצג ב-Journey card כנקודת צבע (ירוק→אדום)

---

## 9. פיצ'ר: Half Power per Topic — עם Emoji Check-in

### מטרה

**פיצ'ר קריטי למניעת נטישה.** כשאין כוח לרשומה מלאה — מגבלה ידידותית שמורידה חיכוך. ברמה הכי נמוכה: **לחיצה אחת על emoji מספיקה** לשמור continuity.

### UX Flow

**כניסה:** בתוך Topic → כתיבה → "⚡ חצי כוח" (toggle או כפתור)

**מסך Half Power — 3 רמות:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ חצי כוח                                   📊 שוק ההון   │
│                                                               │
│  ── רמה 1: לחיצה אחת ──────────────────────────────────── │
│                                                               │
│  איך אני?                                                    │
│  [😊]  [😐]  [😔]  [😤]  [😰]  [🥱]                        │
│                                                               │
│  ── רמה 2: חוק קטן ────────────────────────────────────── │
│                                                               │
│  "לא לבדוק תיק"  ← ה-MicroBoundary של היום                  │
│  [✅ עמדתי]    [❌ לא עמדתי — וזה בסדר]                      │
│                                                               │
│  ── רמה 3: כתיבה מצומצמת ──────────────────────────────── │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  (שדה טקסט מצומצם לפי Topic template)                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│                                               [שמור ✓]       │
└─────────────────────────────────────────────────────────────┘
```

**רמות ההשקעה:**

| רמה | מה עושים | זמן | Template |
|-----|----------|------|---------|
| **1 — Emoji** | בחירת emoji mood בלבד | 2 שניות | `emoji_checkin` |
| **2 — Action Check** | "עמדתי בחוק?" כן/לא | 3 שניות | `action_check` |
| **3 — כתיבה מצומצמת** | טקסט לפי Topic template | 30-90 שניות | לפי Topic |

**Templates לכתיבה מצומצמת (רמה 3):**

| Topic | Template | מגבלה |
|-------|----------|-------|
| סטרס | `freeform_90s` | טיימר 90 שניות → שמירה אוטומטית |
| שוק ההון | `one_sentence` | שדה אחד, 280 תווים: "לא בדקתי תיק היום" |
| זוגיות | `facts_only` | 3 שדות "עובדה", 140 תווים כל אחד |
| אחר | `custom` | טקסט חופשי, ללא מגבלה |

**חשוב:** רמה 1 ו-2 לא דורשות כתיבה. רק לחיצה. המשתמש יכול לעשות רק emoji ולסגור.

3. אחרי שמירה: Toast "נרשם. מספיק להיום."

### Edge Cases

- Emoji בלבד (רמה 1): שומר HalfPowerEntry עם `templateType='emoji_checkin'` + `emojiMood`
- Action Check (רמה 2): אם אין MicroBoundary ליום → לא מציג את רמה 2
- טיימר 90 שניות (רמה 3): אם המשתמש לא כתב כלום → לא שומר
- one_sentence: אם יותר מ-280 תווים → counter אדום, כפתור שמירה מושבת
- שילוב רמות: אפשר לעשות emoji + action check + כתיבה — הכל נשמר ב-entity אחד

### Acceptance Criteria

- [ ] **Emoji Check-in (רמה 1):** 6 emojis לבחירה, לחיצה אחת שומרת
- [ ] **Action Check (רמה 2):** מציג MicroBoundary של היום + כפתורי כן/לא. "לא עמדתי — וזה בסדר" (אפס אשמה)
- [ ] **כתיבה מצומצמת (רמה 3):** כל Template מציג מגבלה ויזואלית (טיימר / counter)
- [ ] opt-in: המשתמש בוחר להיכנס למצב חצי כוח, לא ברירת מחדל
- [ ] Entry נשמר כ-HalfPowerEntry עם `templateType` מתאים
- [ ] אפשר להגדיר template ברמת Topic (ב-Topic Settings)
- [ ] Half Power Entry מופיע ב-Journey עם אייקון ⚡ ואם יש emoji → מציג אותו

---

## 10. פיצ'ר: Internal Validation (זוגיות)

### מטרה

מחליף דחף לעדכן/לקבל תיקוף. רגע של עצירה.

### UX Flow

1. כפתור "לא שולח עכשיו" (נגיש מ-Topic זוגיות או מ-Quick Actions)
2. Overlay מסך מלא, 10 שניות:
   - רקע מעומעם (backdrop blur)
   - משפט אישור גדול במרכז (מתחלף כל 3-4 שניות, או קבוע)
   - Countdown bar עדין
   - אין כפתורים (פרט ל-X לסגירה)
3. אחרי 10 שניות: "איך אתה מרגיש?" (אופציונלי, לא חובה)
4. נשמר כ-InternalValidation event

### ניהול משפטים

- הגדרות → "משפטי תיקוף" → רשימה ניתנת לעריכה
- 3 ברירות מחדל (seed data)
- אפשר לשייך משפט ל-Topic (או להשאיר כללי)
- מקסימום 10 משפטים

### Acceptance Criteria

- [ ] Overlay מסך מלא עם backdrop blur
- [ ] Countdown 10 שניות ויזואלי
- [ ] משפט מוצג בפונט גדול, ממורכז
- [ ] אחרי סיום: Event נשמר (גם אם המשתמש סגר מוקדם)
- [ ] אפשרות "האם שלחת אחרי?" → `didSendAfter: boolean` (self-report, אופציונלי, מופיע שעה אחרי ב-notification רכה או ב-entry הבאה)

---

## 11. פיצ'ר: Gratitude & Spotlight per Topic

### מטרה

הכרת תודה בהקשר של נושא. לא "חיוביות רעילה", אלא תשומת לב למה עובד.

### UX Flow

**Quick Gratitude (ברירת מחדל — ~60 שניות):**

1. Quick Actions → "🙏 הכרת תודה"
2. Topic picker (ברירת מחדל: אחרון)
3. שדה אחד: "דבר קטן שטוב שהיה" (חובה)
4. שמור

**Deep Gratitude (כפתור "להעמיק" — ~2-3 דקות):**

1. 3 שדות: דבר קטן + למה זה חשוב + מה עשיתי שתרם
2. "איך הרגשתי" (אופציונלי)
3. "איך אני רוצה לזכור" (אופציונלי)

**Spotlight Presets:**

כפתורי קיצור דרך ב-Topic Detail → Overview:
- זוגיות: "תודה אחת לאור"
- שינה: "דבר אחד שעזר להירדם"
- כללי: "משהו אחד שעשיתי טוב"

Spotlight הוא לא entity נפרד — זה פשוט GratitudeEntry עם Topic ספציפי ו-prompt בהתאם.

### Acceptance Criteria

- [ ] Quick Gratitude = שדה אחד + Topic + שמור (3 לחיצות)
- [ ] Deep = כפתור "להעמיק" מרחיב שדות נוספים
- [ ] Spotlight preset = קיצור דרך שפותח Quick Gratitude עם Topic + placeholder מותאם
- [ ] אין streak, אין "פספסת יום", אין reminder
- [ ] Gratitude מופיעה ב-Journey עם אייקון 🙏

---

## 12. Topic: שוק ההון — פיצ'רים ייעודיים

### 12.1 Market Interrupt Plan

**מה זה:** תוכנית שהמשתמש מגדיר — מתי בודקים ומתי לא.

**מסך:** טאב "מעקב" בתוך Topic שוק ההון → "תוכנית בדיקה"

| שדה | דוגמה |
|-----|-------|
| שעת בדיקה | 09:00 |
| תנאי לפעולה | "ירידה של יותר מ-5% ביום" |
| לא עושה בין לבין | "לא בודק פורומים", "לא פותח אפליקציית מסחר" |

**AC:**
- [ ] MarketInterruptPlan — מסך הגדרה + תצוגה
- [ ] רק plan אחד פעיל בכל רגע (כפתור "ערוך" לעדכון)
- [ ] "לא עושה בין לבין" מוצג כ-checklist ב-Topic Overview

### 12.2 Cooling Window

**מה זה:** טיימר "החלטתי לא לבדוק עד X".

**מסך:** כפתור "הפעל Cooling" ב-Topic שוק ההון

1. בחירת זמן: 30 דק / 1 שעה / 2 שעות / עד מחר / custom
2. סיבה (אופציונלי)
3. מסך: countdown + משפט מעודד
4. אחרי סיום: "עמדת בזה!" (או "בדקת מוקדם? זה בסדר" — אפס אשמה)

**AC:**
- [ ] Countdown ויזואלי על מסך
- [ ] שמירת `completed: boolean` — האם הגיע לסוף
- [ ] אין notification אגרסיבי — רק ב-app
- [ ] CoolingWindow מופיע ב-Journey כ-event

### 12.3 Decision Log

**מה זה:** שורה אחת: "איזו פעולה אני דוחה, ולמה".

**מסך:** כפתור ב-Topic שוק ההון → Overview או Quick Actions

**AC:**
- [ ] שני שדות: "פעולה שאני דוחה" + "למה" (שניהם חובה)
- [ ] נשמר ב-DecisionLog, מופיע ב-Journey של שוק ההון
- [ ] Quick entry: אפשר לפתוח ישירות מ-Topic Overview

---

## 13. Topic: זוגיות — פיצ'רים ייעודיים

### 13.1 Regulate then Communicate

**מה זה:** טיימר ויסות לפני כתיבת טיוטה.

**מסך:** כפתור "רגע לפני שאני כותב" ב-Topic זוגיות

1. טיימר: 60 / 120 / 180 שניות (בחירה)
2. מסך ויסות: צבע רגוע, משפט: "ויסות קודם, תקשורת אחר כך"
3. אחרי טיימר: שדה כתיבת טיוטה
4. שמור כטיוטה (BoundaryDraft entity מ-FEEDBACK v1.1, או כ-DailyEntry עם tag)

**שימו לב:** דומה ל-Trigger flow אבל **ללא ההבחנה trigger/hurt**. זה כלי עצמאי ומהיר.

**AC:**
- [ ] טיימר countdown ויזואלי
- [ ] כפתור כתיבה נפתח רק אחרי סיום טיימר
- [ ] הטיוטה נשמרת — **לא נשלחת**
- [ ] Event מופיע ב-Journey

### 13.2 Boundary Drafts

**כבר מוגדר ב-FEEDBACK v1.1 (סעיף 43).**

3 שדות:
- "מה אני מבקש" (חובה)
- "מה הגבול" (חובה)
- "מה אני עושה אם לא מכובד" (אופציונלי)

**עדכון:** שייך ל-Topic (ברירת מחדל: זוגיות), עם `primaryTopicId`.

### 13.3 Repair Note (אחרי קונפליקט)

**מסך:** כפתור "תיקון" ב-Topic זוגיות

| שדה | חובה? | תיאור |
|-----|-------|-------|
| מה אני לוקח אחריות | כן | טקסט חופשי |
| מה אני מבקש | כן | טקסט חופשי |
| מה אני מעריך | לא | טקסט חופשי |

**AC:**
- [ ] 2 שדות חובה + 1 אופציונלי
- [ ] אפשר לקשר ל-TriggerHurtEvent קיים (dropdown אופציונלי)
- [ ] RepairNote מופיע ב-Journey עם אייקון 🤝
- [ ] אחרי שמירה: Toast "נרשם. צעד חשוב."

---

## 14. Topic: סטרס — פיצ'רים ייעודיים

### 14.1 Now Check-in

**מה זה:** בדיקת מצב מהירה — גוף, דחיפות, בחירה.

**מסך:** כפתור "איפה אני עכשיו?" ב-Topic סטרס (או Quick Actions)

| שדה | חובה? | פורמט |
|-----|-------|-------|
| גוף | כן | טקסט חופשי: "איפה זה יושב בגוף?" |
| דחיפות | כן | סליידר 1-5 |
| בחירה | כן | טקסט חופשי: "מה אני בוחר?" |

**AC:**
- [ ] 3 שדות, שמירה מהירה
- [ ] סליידר 1-5 עם labels: 1="רגוע", 3="בינוני", 5="גל מלא"
- [ ] NowCheckin מופיע ב-Journey עם צבע לפי urgeLevel (ירוק→אדום)

### 14.2 Wave Mode (מצב גל)

**מה זה:** מסך מינימלי לזמן גל — בלי תפריטים, בלי הסחות.

**מסך:** כפתור "🌊 גל" ב-Topic סטרס

1. מסך מלא, רקע כהה/רגוע
2. טיימר (עולה, לא countdown — "כמה זמן אני בגל")
3. כפתור "נשימה" (מפעיל animation של נשימה 4-7-8)
4. כפתור "סיימתי" → שדה הערה אופציונלי → שמור

**AC:**
- [ ] מסך מלא, **אין ניווט** (רק X לסגירה)
- [ ] טיימר עולה (stopwatch)
- [ ] כפתור נשימה: animation פשוט (expand 4s → hold 7s → shrink 8s → repeat)
- [ ] "סיימתי" → optional note → שמור WaveModeSession
- [ ] אם סוגר בלי "סיימתי" → שומר עם `endedAt = now`, בלי note

### 14.3 Micro-Boundary (חוק קטן להיום)

**מסך:** כפתור ב-Topic סטרס → "חוק קטן להיום"

| שדה | דוגמה |
|-----|-------|
| החוק | "טלפון הפוך", "לא לבדוק חדשות בבוקר" |
| לתאריך | היום (ברירת מחדל) |

**AC:**
- [ ] שדה אחד + תאריך (ברירת מחדל: היום)
- [ ] ב-Topic Overview: "החוק שלי להיום: ..."
- [ ] בסוף היום (או למחרת): אפשרות self-report: "שמרתי? כן/לא/קשה"
- [ ] Micro-Boundary מופיע ב-Journey

---

## 15. Topic: שינה — פיצ'רים ייעודיים

### 15.1 Wind-down Routine

**מה זה:** רשימת 3-5 צעדים קבועים לפני שינה.

**מסך:** Topic שינה → טאב "מעקב" → "שגרת ערב"

**הגדרה (פעם אחת):**
- 1-5 צעדים, כל צעד = שורת טקסט (drag & drop לסידור)
- דוגמאות: "לכבות מסכים", "נשימה", "קריאה 10 דקות"

**תצוגה יומית:**
- Checklist — סימון V ליד כל צעד שבוצע
- לא שומרת היסטוריה של ביצוע (MVP) — רק ה-routine עצמו נשמר

**AC:**
- [ ] Routine אחד פעיל (1:1 עם Topic שינה)
- [ ] 1-5 צעדים, drag & drop
- [ ] Checklist ב-Topic Overview
- [ ] **אין streak / tracking** — רק checklist מתאפס יומי

### 15.2 Sleep Log Lite

**מסך:** Topic שינה → טאב "מעקב" → "יומן שינה"

| שדה | חובה? | פורמט |
|-----|-------|-------|
| שעת שינה | כן | Time picker (HH:mm) |
| שעת קימה | כן | Time picker (HH:mm) |
| איכות | כן | 1-5 (כוכבים / slider) |
| מה הפריע | לא | טקסט חופשי |

**AC:**
- [ ] SleepLog אחד ליום (by `date`)
- [ ] אם כבר יש ליום → עריכה (לא יצירה חדשה)
- [ ] תצוגת mini-graph ב-Topic Overview: 7 ימים אחרונים (איכות 1-5 כעמודות)
- [ ] **לא שולח reminders** — המשתמש ממלא כשרוצה

### 15.3 Phone Rule

**מסך:** Topic שינה → "חוק טלפון"

| שדה | אפשרויות |
|-----|----------|
| סוג חוק | בחדר אחר / הפוך על השולחן / מצב שקט / custom |
| טיימר | X דקות לפני שינה (30/60/90/120) |

**AC:**
- [ ] PhoneRule אחד פעיל
- [ ] מוצג ב-Topic Overview כ-reminder רך: "חוק הטלפון שלך: הפוך על השולחן, 60 דקות לפני"
- [ ] **אין enforcement** — רק תזכורת ויזואלית

---

## 16. פיצ'רים נוספים (Cross-Topic)

### 16.1 Ten Minutes Rule

**מטרה:** דחיית פעולה אימפולסיבית ב-10 דקות.

**UX:** כפתור "דוחה 10 דקות" — נגיש מ:
- Urge Protocol (אחרי שמירה)
- Quick Actions במסך "היום"
- Topic Overview (כפתור מהיר)

**Flow:**
1. "מה רציתי לעשות?" (שדה טקסט — חובה)
2. Topic (ברירת מחדל: אחרון)
3. שמור → טיימר 10 דקות מתחיל
4. אחרי 10 דקות: **אין notification** — רק ב-app אם פותח: "עברו 10 דקות. עדיין רוצה?"
5. Self-report: "עשיתי / לא עשיתי / עוד לא החלטתי"

**AC:**
- [ ] שדה חובה + Topic + טיימר
- [ ] **אין push notification** — רק in-app
- [ ] Self-report אופציונלי
- [ ] TenMinuteDefer מופיע ב-Journey

### 16.2 One Clean Sentence

**מטרה:** כשאין כוח — משפט אחד מספיק.

**UX:** Quick Action → "משפט אחד"

| Prompt | טקסט |
|--------|------|
| `decision` | "מה החלטתי לא לעשות היום?" |
| `feeling` | "במשפט אחד — איך אני?" |
| `choice` | "מה בחרתי לעשות אחרת?" |
| `custom` | שדה חופשי |

**AC:**
- [ ] 280 תווים מקסימום, counter ויזואלי
- [ ] Topic חובה
- [ ] Prompt נבחר ב-tap (לא dropdown — 4 כפתורים)
- [ ] נשמר כ-OneSentenceEntry, מופיע ב-Journey

### 16.3 Choice Log

**מטרה:** "מה בחרתי לא לעשות היום" — מאמן חופש.

**UX:** Quick Action → "בחירה"

- שדה אחד: "מה בחרתי לא לעשות" (חובה)
- Topic (ברירת מחדל: אחרון)
- שמור

**AC:**
- [ ] שדה אחד + Topic + תאריך (auto: היום)
- [ ] ChoiceLog מופיע ב-Journey עם אייקון ✋
- [ ] ב-Topic Overview: "הבחירה של היום: ..."

### 16.4 Toolbox per Topic

**מטרה:** 2-5 כלים קבועים לכל נושא, עם קיצור דרך.

**מסך:** Topic → טאב "כלים"

| שדה | תיאור |
|-----|-------|
| שם הכלי | "נשימה 4-7-8", "גבול עם אמא" |
| מתי להשתמש | "כשאני מרגיש לחץ בעבודה" |
| איך אני יודע שזה הזמן | "כשהלסת נועלת" |

**Killer UX: כפתור "הפעל כלי"** → מוסיף ToolUsage עם timestamp. מייצר מעקב שימוש בלי מאמץ.

**AC:**
- [ ] מקסימום 5 כלים לנושא (soft limit — הודעה אחרי 5)
- [ ] כפתור "הפעל" → שומר ToolUsage → Toast "השתמשת ב-[שם הכלי] ✓"
- [ ] ToolUsage מופיע ב-Journey
- [ ] Drag & drop לסידור כלים

---

## 17. Journey — אינטגרציה מעודכנת

### 17.1 שכבות ניווט

**Journey מקבל 2 שכבות ניווט:**

```
┌─────────────────────────────────────────────────────────────┐
│  מסע                                                         │
│                                                               │
│  Scope: [הכל ▾] [שוק ההון] [זוגיות] [סטרס] [שינה] [כללי]  │
│                                                               │
│  Tabs:  [הכל] [רשומות] [אג'נדה] [הארות] [הכרת תודה]        │
│         [דחיפויות] [מעקב] [כלים]                             │
│                                                               │
│  ─────────────────────────────────────────────────────────── │
│  📅 6 בפברואר 2026                                           │
│  ├─ 📊 Decision Log: "דחיתי בדיקת תיק ב-13:00"             │
│  ├─ 🙏 Gratitude (זוגיות): "תודה לאור שהקשיב"              │
│  ├─ 😤 Trigger (זוגיות): טריגר פנימי — 90 שניות ויסות      │
│  │                                                            │
│  📅 5 בפברואר 2026                                           │
│  ├─ ✏️ רשומה (סטרס): "יום מאתגר..."                         │
│  ├─ 🌊 Wave Mode: 4 דקות                                    │
│  ├─ ✋ Choice Log: "לא בדקתי פורומים"                        │
│  │                                                            │
│  📅 4 בפברואר (📌 פגישה)                                     │
│  ├─ 📋 Session Summary                                       │
│  └─ ...                                                       │
└─────────────────────────────────────────────────────────────┘
```

### 17.2 Scope Filter

| Scope | מה מוצג |
|-------|---------|
| **הכל** | כל ה-entities מכל ה-Topics |
| **Topic ספציפי** | רק entities ש-`primaryTopicId` = Topic נבחר (או שה-Topic נמצא ב-`secondaryTopicIds`) |

**UX:** שורת chips אופקית (scrollable). "הכל" ראשון, אחריו Topics לפי sortOrder.

### 17.3 Module Tabs (בתוך Scope)

| Tab | מציג Entities מסוג |
|-----|-------------------|
| **הכל** | הכל (ברירת מחדל) |
| **רשומות** | DailyEntry, HalfPowerEntry, OneSentenceEntry |
| **אג'נדה** | AgendaItem |
| **הארות** | Highlight, Insight |
| **הכרת תודה** | GratitudeEntry |
| **דחיפויות** | UrgeEvent, TriggerHurtEvent, TenMinuteDefer |
| **מעקב** | SleepLog, CoolingWindow, MicroBoundary, NowCheckin, WaveModeSession, ChoiceLog, DecisionLog |
| **כלים** | ToolUsage |

**UX:** Tabs אופקיים (scrollable) מתחת ל-Scope filter.

### 17.4 Cross-Topic View — "מבט על" (Correlation View)

**מטרה:** לראות מתאם בין נושאים. למשל: יום שבו היה "גל" בסטרס → איך זה השפיע על הזוגיות.

**מסך:** ב-Journey, כשה-Scope = "הכל", כפתור "📊 מבט על" (toggle)

```
┌─────────────────────────────────────────────────────────────┐
│  מסע — מבט על                                    [📊 פעיל]  │
│                                                               │
│  📅 6 בפברואר 2026                                           │
│  ┌─ 😤 סטרס ─────────────────────────────────────────────┐  │
│  │  🌊 Wave Mode: 8 דקות                                  │  │
│  │  📍 Now Check-in: דחיפות 5/5                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│           ↕️ (השפעה)                                          │
│  ┌─ 💑 זוגיות ────────────────────────────────────────────┐  │
│  │  😤 Trigger: טריגר פנימי (intensity 8/10)               │  │
│  │  🆘 Urge: "לשלוח הודעה כועסת"                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  📅 5 בפברואר 2026                                           │
│  ┌─ 📊 שוק ההון ──────────────────────────────────────────┐  │
│  │  ❄️ Cooling Window: 2 שעות (completed ✓)               │  │
│  │  ✋ Decision Log: "דחיתי בדיקת תיק"                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─ 🌙 שינה ──────────────────────────────────────────────┐  │
│  │  🌙 Sleep Log: 6.5 שעות, איכות 3/5                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**איך זה עובד:**
- בתצוגת "מבט על", כל יום מקובץ לפי Topics (לא רשימה שטוחה)
- כל Topic block מוצג בצבע שלו
- ימים שיש בהם פעילות ב-2+ Topics מקבלים אינדיקציה ויזואלית: "חפיפה"
- **אין ניתוח אוטומטי** — המשתמש רואה את המתאם ומסיק מסקנות לבד (Zero AI)

**AC:**
- [ ] Toggle "מבט על" ב-Journey כשה-Scope = "הכל"
- [ ] ימים מקובצים לפי Topics, כל Topic בצבע שלו
- [ ] Topics עם `hideFromJourney = true` **לא** מופיעים בתצוגת "הכל"
- [ ] Default: תצוגה רגילה (שטוחה). "מבט על" = opt-in

---

### 17.5 Topic Milestones — ציוני דרך

**מטרה:** בתוך Journey של נושא ספציפי, להציג "ציוני דרך" אוטומטיים שמייצרים תחושת התקדמות (Self-Efficacy).

**Milestones מחושבים (computed, לא stored):**

| Milestone | חישוב | תצוגה |
|-----------|-------|-------|
| "7 ימים ללא Urge Protocol" | אין UrgeEvent ב-Topic ב-7 ימים אחרונים | 🏆 "שבוע שלם בלי דחיפות!" |
| "3 Cooling Windows שהושלמו" | 3 CoolingWindows עם `completed = true` | 🏆 "3 פעמים עמדת בזה!" |
| "10 רשומות בנושא" | ספירת DailyEntry + HalfPowerEntry | 🏆 "10 רשומות — אתה כותב!" |
| "5 כלים שהופעלו" | ספירת ToolUsage | 🏆 "5 פעמים השתמשת בכלים שלך" |
| "Repair Note ראשון" | קיום RepairNote אחד+ | 🏆 "צעד ראשון בתיקון" |
| "30 ימים של Sleep Log" | 30 SleepLogs | 🏆 "חודש שלם של מעקב שינה" |

**UX:**
- Milestones מוצגים כבאנר עדין ב-Timeline (בין הרשומות)
- צבע זהב/חם, אייקון 🏆
- **אין notification** — רק מופיעים כשגוללים ב-Journey
- **אין streak** — אם "נשבר" ציון דרך, הוא לא נעלם. ה-Milestone נשמר

**AC:**
- [ ] Milestones = computed, לא stored (מחושבים ב-runtime)
- [ ] מוצגים רק ב-Journey של Topic ספציפי (לא ב-"הכל")
- [ ] מקסימום 1 milestone ליום (כדי לא להעמיס)
- [ ] אין "איבדת את ה-streak" — אפס אשמה
- [ ] טקסט חיובי ומעודד, לא שיפוטי

---

### 17.6 Entity Display in Journey

כל entity ב-Journey מוצג כ-card קטן עם:

| רכיב | תיאור |
|------|-------|
| אייקון | לפי סוג (ראה טבלה למטה) |
| Topic badge | אייקון + צבע של ה-Topic |
| Snippet | 80-120 תווים מהתוכן |
| Timestamp | שעה + "לפני X שעות" |
| Intensity dot | (רק ל-TriggerHurtEvent) — נקודת צבע ירוק→אדום לפי `intensityLevel` |

**אייקונים לפי סוג:**

| Entity | אייקון |
|--------|--------|
| DailyEntry | ✏️ |
| HalfPowerEntry (emoji) | ⚡ + ה-emoji שנבחר |
| HalfPowerEntry (text) | ⚡ |
| OneSentenceEntry | 💬 |
| Session | 📌 |
| Highlight | 💡 |
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
| DecisionLog | ✋ |
| ChoiceLog | ✋ |
| SleepLog | 🌙 |
| ToolUsage | 🔧 |
| TenMinuteDefer | ⏱️ |
| InternalValidation | 🧘 |
| Milestone (computed) | 🏆 |
| Inbox item (no topic) | 📥 |

---

## 18. סדר בנייה מומלץ

### Phase A — שלד (חובה ראשון)

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| A1 | **Topic entity + CRUD** (כולל privacy fields) | בינוני | — |
| A2 | **Topic Picker component** (כולל "📥 Inbox" option) | קטן | A1 |
| A3 | **הוספת `primaryTopicId` (nullable) + `secondaryTopicIds` לכל entity קיים** | בינוני | A1 |
| A4 | **Migration: entities קיימים → `null` (Inbox)** | קטן | A3 |
| A5 | **Topics Home screen** (כולל blur for private Topics) | בינוני | A1 |
| A6 | **Topic Detail screen + tabs + Visual Context** (accent color theming) | גדול | A1, A5 |
| A7 | **Journey — Scope filter + Module tabs** | בינוני | A3 |
| A8 | **מסך "היום" — עדכון עם Topics + Inbox banner** | בינוני | A2 |
| A9 | **"למיין את המגירה" — Inbox Sort flow** | בינוני | A2 |
| A10 | **Privacy per Topic — PIN + blur + hideFromJourney** | בינוני | A1 |

### Phase B — Playbook + כלים קריטיים

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| B1 | **Topic Playbook** (North Star + Rescue Kit + Sections) | בינוני | A6 |
| B2 | **Urge Protocol — Wizard 4 שלבים** (כולל נשימה + Toolbox suggestion) | גדול | A2, E5 |
| B3 | **Now Check-in** (סטרס) | קטן | A2 |
| B4 | **Wave Mode** (סטרס) | בינוני | A2 |
| B5 | **Ten Minutes Rule** | קטן | A2 |

### Phase C — נושאים ייעודיים

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| C1 | **Market Interrupt Plan** (שוק ההון) | קטן | A6 |
| C2 | **Cooling Window** (שוק ההון) | בינוני | A6 |
| C3 | **Decision Log** (שוק ההון) | קטן | A6 |
| C4 | **Trigger vs Hurt — Wizard עם מדחום רגשי + Cooling כפוי** (זוגיות) | גדול | A2 |
| C5 | **Regulate then Communicate** (זוגיות) | בינוני | A2 |
| C6 | **Boundary Drafts** (זוגיות) | קטן | A2 |
| C7 | **Repair Note** (זוגיות) | קטן | A2 |

### Phase D — Gratitude + הרחבות

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| D1 | **Gratitude per Topic** | בינוני | A2 |
| D2 | **Spotlight presets** | קטן | D1 |
| D3 | **Half Power per Topic — 3 רמות** (Emoji + Action Check + כתיבה מצומצמת) | גדול | A6, E4 |
| D4 | **Internal Validation** | בינוני | A2 |
| D5 | **One Clean Sentence** | קטן | A2 |
| D6 | **Choice Log** | קטן | A2 |

### Phase E — שינה + Toolbox

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| E1 | **Sleep Log Lite** | קטן | A6 |
| E2 | **Wind-down Routine** | קטן | A6 |
| E3 | **Phone Rule** | קטן | A6 |
| E4 | **Micro-Boundary** (סטרס) | קטן | A2 |
| E5 | **Toolbox per Topic** | בינוני | A6 |
| E6 | **ToolUsage tracking** | קטן | E5 |

### Phase F — Journey Advanced

| # | משימה | מאמץ | תלות |
|---|-------|------|------|
| F1 | **Cross-Topic View ("מבט על")** | בינוני | A7 |
| F2 | **Topic Milestones (computed)** | בינוני | A7 |

---

## 19. סיכום Entities ו-Stores

### Entities חדשים: 23

| # | Entity | Store | Sprint מומלץ |
|---|--------|-------|-------------|
| 1 | Topic | `topics` | Phase A |
| 2 | TopicPlaybook | `topicPlaybooks` | Phase B |
| 3 | UrgeEvent | `urgeEvents` | Phase B |
| 4 | TriggerHurtEvent | `triggerHurtEvents` | Phase C |
| 5 | HalfPowerEntry | `halfPowerEntries` | Phase D |
| 6 | InternalValidation | `internalValidations` | Phase D |
| 7 | ValidationAffirmation | `validationAffirmations` | Phase D |
| 8 | GratitudeEntry | `gratitudeEntries` | Phase D |
| 9 | MarketInterruptPlan | `marketInterruptPlans` | Phase C |
| 10 | CoolingWindow | `coolingWindows` | Phase C |
| 11 | DecisionLog | `decisionLogs` | Phase C |
| 12 | RepairNote | `repairNotes` | Phase C |
| 13 | NowCheckin | `nowCheckins` | Phase B |
| 14 | WaveModeSession | `waveModeSessions` | Phase B |
| 15 | MicroBoundary | `microBoundaries` | Phase E |
| 16 | SleepLog | `sleepLogs` | Phase E |
| 17 | WindDownRoutine | `windDownRoutines` | Phase E |
| 18 | PhoneRule | `phoneRules` | Phase E |
| 19 | TenMinuteDefer | `tenMinuteDefers` | Phase B |
| 20 | OneSentenceEntry | `oneSentenceEntries` | Phase D |
| 21 | ChoiceLog | `choiceLogs` | Phase D |
| 22 | TopicTool | `topicTools` | Phase E |
| 23 | ToolUsage | `toolUsages` | Phase E |

### Entities מעודכנים: 5

| Entity | שינוי |
|--------|-------|
| DailyEntry | + `primaryTopicId` (nullable), `secondaryTopicIds` |
| Session | + `primaryTopicId` (nullable), `secondaryTopicIds` |
| Highlight | + `primaryTopicId` (nullable), `secondaryTopicIds` |
| AgendaItem | + `primaryTopicId` (nullable), `secondaryTopicIds` |
| ActionItem | + `primaryTopicId` (nullable), `secondaryTopicIds` |

### Stores חדשים ב-IndexedDB: 23

### Indexes חדשים: ~45

---

## 20. סיכום שיפורי v1.1

| # | שיפור | איפה במסמך | השפעה |
|---|-------|-----------|-------|
| 1 | **Inbox Pattern** | סעיף 2.2 + מסך "היום" | `primaryTopicId` הפך ל-nullable. כתיבה מהירה ללא חובת שיוך |
| 2 | **Visual Context** | סעיף 2.5 + Topic Detail | CSS accent color per Topic. שינוי תודעתי דרך UI |
| 3 | **Urge Protocol → Wizard** | סעיף 3.4 + סעיף 7 | 4 שלבים: זיהוי → נשימה → מחיר → חלופה. הצעת כלי מ-Toolbox |
| 4 | **מדחום רגשי** | סעיף 3.5 + סעיף 8 | Slider 1-10 לפני Trigger/Hurt. Cooling כפוי ב-8+ (5 דקות) |
| 5 | **Playbook כ-Manual** | סעיף 3.3 + סעיף 6 | North Star sentence + Rescue Kit (1-3 כלים מהירים) |
| 6 | **Cross-Topic View** | סעיף 17.4 | "מבט על" ב-Journey: ימים מקובצים לפי Topics |
| 7 | **Topic Milestones** | סעיף 17.5 | ציוני דרך computed ב-Journey. אפס אשמה, רק חיובי |
| 8 | **Half Power → 3 רמות** | סעיף 3.6 + סעיף 9 | Emoji Check-in (לחיצה אחת) + Action Check + כתיבה מצומצמת |
| 9 | **Privacy per Topic** | סעיף 2.6 + Topic entity | PIN per Topic, blur ב-Home, hide from Journey |
| 10 | **Phase F** | סעיף 18 | Phase חדש: Journey Advanced (Cross-Topic + Milestones) |

---

*מסמך זה מוכן לשימוש. v1.1 — לעדכונים, לעדכן גרסה ותאריך.*
