# COR-SYS

**מערכת ניהול ייעוץ אישית** — דשבורד אופציה פנימי לניהול לקוחות, ספרינטים וכספים.

- **COR** — Conservation of Resources (Hobfoll): ארגונים פועלים לשמור על משאבים; אובדן כואב יותר מרווח מקביל.
- **SYS** — Systems: ההתערבות תמיד מבנית, לא אישית.

הגרנטיה: *על כל שעת פגישה — הארגון חוסך לפחות שעת עבודה אחת בשבוע, לכל שארית חיי התהליך.*

---

## מה האפליקציה עושה

- **דשבורד:** KPIs (לקוחות פעילים, ספרינטים פעילים, משימות פתוחות, הכנסות), Decision Latency Tax, P&L, מתודולוגיית ספרינט 14 יום.
- **לקוחות:** CRUD, סטטוס, תעריף שעתי ו-retainer, decision latency.
- **ספרינטים:** ספרינטי 14 יום (PRISM — MECE + Answer First + BCG), משימות, סטטוסים.
- **כספים:** הכנסות לפי לקוח וחודש, חיוב/תשלום, התקדמות ליעד שנה 1.
- **שירותים וערוצים:** דף `/services` — ערוצי L1/L2/L3 ואפשרויות תמחור (Live Demo, ספרינט, Retainer, וכו').
- **תוכנית עסקית ללקוח:** בדף הלקוח — בלוק "תוכנית עסקית" + קישור ל־`/clients/[id]/plan`. ניהול תוכנית אחת לכל לקוח (סיכום, המלצת שירות, צעדים).
- **שאלון COR-SYS:** ב־`/clients/[id]/plan` — שאלון לפי ICP, פתולוגיות (NOD, Zero-Sum, Learning) ומדדים. התשובות בונות אוטומטית תוכנית עסקית והמלצת ערוץ/שירות.

---

## ICP (קהל יעד)

- **גודל:** 50–300 עובדים. **שלב:** Growth (Series A–C).
- **סקטורים:** Cybersecurity, Fintech, Healthtech AI, B2B מורכב.
- **Champions:** COO, CFO, CEO.

---

## סטק

- **Next.js 16**, **React 19**, **Supabase** (DB + auth-ready).
- **TypeScript** strict.

---

## הרצה

```bash
# התקנת תלויות
npm install

# העתקת משתני סביבה (ראה .env.example)
cp .env.example .env.local
# מלא ב-.env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# שרת פיתוח
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000).

---

## תיעוד עסקי

- [מסגרת עסקית ומודל COR-SYS](docs/business-framework.md)
- [מטרות ו-KPIs](docs/goals-and-kpis.md)
- [תוכנית אסטרטגית](docs/strategic-plan.md)
- [ערך ללקוח ועמדה](docs/value-proposition.md)
- [ICP ומכירות (Live Demo, תמחור)](docs/icp-and-sales.md)
- [מיצוב תחרותי](docs/competitive-positioning.md)
- [סינתזת HTML ↔ אפליקציה](docs/synthesis-html-app.md)

---

## איפה כל ההרחבות (מה בנינו)

| מה | איפה |
|----|------|
| **דשבורד אופציה** | `/` — KPIs, לקוחות, ספרינטים, כספים, Decision Latency, 4 סוכנים |
| **זהות עסקית מלאה (4 לשוניות MECE)** | `/about` — טאבים: זהות, הבעיה, הפתרון, מסחור (כולל אקורדיונים, מתחרים, תמחור, GTM, 10-Day Blitz, P&L, Roadmap) |
| **תיעוד עסקי** | `docs/` — 7 מסמכים (מסגרת, מטרות, אסטרטגיה, ערך, ICP, מיצוב, סינתזה) |
| **קבועים עסקיים** | `src/lib/business-config.ts` — יעד שנה 1 (720K) |
| **משתני סביבה** | `.env.example` — Supabase URL + anon key |
| **סקיל התנהלות Claude** | `.cursor/skills/claude-conduct/` — Plan-Validate-Execute, כללי כשלון, קוד |
| **סקיל יצירת DOCS ופרומפטים למצגות** | `.cursor/skills/create-docs-and-prompts/` — ייצור קבצי docs ופרומפטים למצגות |
| **שירותים וערוצים** | `/services` + `src/lib/service-catalog.ts` — ערוצים L1/L2/L3 ואפשרויות שירות (תמחור) |
| **תוכנית עסקית ללקוח** | `/clients/[id]/plan` — שאלון COR-SYS, סיכום, המלצת שירות, צעדים. טבלה: `client_business_plans` |
| **מיגרציית תוכניות** | `supabase-migration-client-plans.sql` — הרץ ב-Supabase כדי לאפשר שמירת תוכניות |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Deploy on Vercel](https://vercel.com/new)
