# CLAUDE.md — Master Entry Point

> נקודת הכניסה למערכת COR-SYS.
> כל סשן מתחיל כאן. הקובץ מנחה טעינה, ניתוב, והפעלה.

---

## שלב 0 — טעינת זהות

טען לפני כל דבר אחר:

1. `profile/identity.md` — זהות ליבה, immutable
2. `profile/communication.md` — טון, מבנה, איסורים
3. `profile/workflow.md` — דפוסי עבודה, Iron Rule, Sprint

---

## שלב 1 — Board Decides (Layer 0)

קרא `context/thinking-style-router.md`.
קלט: task + urgency + type_hint.
הרץ לוגיקת החלטה.
פלט: THINKING_STYLE + ACTIVATE + RATIONALE.

הבורד (`context/agents-board.md`) מחליט — ה-Routing משרת את החלטתו.

---

## שלב 2 — הפעלה לפי THINKING_STYLE

| THINKING_STYLE | טען והפעל |
|---|---|
| Triage | `pipelines/operative-triage.md` |
| Content | `pipelines/content-generation.md` + 3 פוסטים אחרונים מ-`posts/linkedin/` |
| Content+RTM | Mode E (RTM Scout) → `pipelines/content-generation.md` — כשאין נושא ספציפי |
| Content+Board | `context/agents-board.md` (סימולציה) → `pipelines/content-generation.md` |
| Pipeline | `pipelines/agents-access.md` + `context/agents-bridge.md` |
| Board | `context/agents-board.md` — בורד מלא (22+5) → סינתזה |
| Board-Converged | `context/agents-board.md` במשטר Board-Converged: קולות, CHALLENGE/COUNTER, התכנסות |
| Strategic | `pipelines/strategic-thinking.md` + `pipelines/world-simulation.md` |
| Double-loop | `pipelines/double-loop-learning.md` |
| Mega-chain | `pipelines/mega-chain.md` + `domains/knowledge-index.md` |
| Socratic | `pipelines/socratic-learning.md` |
| Workaround | `pipelines/workaround-construction.md` |
| Diagnostic | `domains/systemic-diagnostics.md` |
| Emotional | `pipelines/emotional-processing.md` + סוכנים 20, 21, 22 |

---

## שלב 2.5 — Pre-flight

אחרי thinking-style-router (למעט Triage):
- קרא `context/super-agent-protocol.md`
- טען `pipelines/execution-rules.md` — **תמיד**
- טען Meta-Controller: `סוכנים/סוכן-19-מטא-קונטרולר/AGENT_SYNTHESIS`

---

## שלב 3 — בקרת איכות

- System 2: לפני פלט — `context/rag-grounding-protocol.md` — 80% RAG-based
- תוכן רגשי: `pipelines/emotional-processing.md` מופעל במקביל
- סיום סשן: `pipelines/explanation-generation.md` → `pipelines/post-session-learning.md`

---

## מצב נוכחי — S(t) מרץ 2026

- מטרות: `context/goals.md`
- פרויקטים: `context/projects.md`
- תוכנית הישרדות: `context/strategic-plan-survival.md`

**Priority Stack:** הכנסה > קצב (LinkedIn) > עומק (COR-SYS) > אופטימיזציה

---

## MOCs — מפות תוכן

| דומיין | קובץ |
|---|---|
| מטא-קוגניציה | `MOC-META.md` |
| COR-SYS עסקי | `MOC-CORSYS.md` |
| ארגוני | `MOC-ORG.md` |
| גיאו-קוגניטיבי | `MOC-COGEO.md` |
| טכנולוגי | `MOC-TECH.md` |
| פרופיל | `MOC-PROFILE.md` |
| מערכות | `MOC-SYS.md` |
| מסחר | `MOC-TRADE.md` |

---

## Heuristic Skills — היוריסטיקות לחיסכון אסימונים

> 4 סקילים שמקודדים את תוצאות המחקר כ-decision trees. משמשים כ-fast path לפני טעינת קבצים מלאים.

| Task shape | סקיל | סיגנלים |
|-----------|------|---------|
| אבחון פער / מדידה / PE / J Quotient / "מה שבור" | `delta-diagnostic` | "מדוד", "פער", "delta", "מה שבור", "deviation" |
| זיהוי ציר / חיבור חוצה דומיין / anchor term | `axis-router` | "ציר", "axis", "אותו מנגנון", "isomorphism", "cross-domain" |
| לפני ספרינט / post-incident / מה נחשף / stress test | `stress-probe` | "stress probe", "לפני ספרינט", "מה נחשף", "TTE", "perturbation" |
| הפיך / בלתי הפיך / סוג התערבות / boundary | `symmetry-classifier` | "הפיך", "reversible", "סוג התערבות", "transition" |

**Cascading:**
- `delta-diagnostic` שלב 4 → auto-invoke `symmetry-classifier`
- `delta-diagnostic` + ציר מזוהה → auto-load `axis-router` לציר הספציפי
- `stress-probe` הושלם → feed תוצאות ל-`delta-diagnostic`

---

## כללים

- Pipelines הם פרוטוקולים, לא המלצות. כשמופעלים — עקוב במלואם
- Pipeline אחד בכל פעם. לא לערבב באמצע
- `profile/identity.md` אינו ניתן לעקיפה על ידי context/
- אם בקשה סותרת ערכים — מדווחים, לא פוסחים

