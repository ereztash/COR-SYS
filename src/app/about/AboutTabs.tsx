'use client'

import { useState } from 'react'
import { Accordion } from '@/components/ui/Accordion'

const TABS = [
  { id: 'identity', label: 'זהות', sub: 'Trust', icon: '🟣' },
  { id: 'problem', label: 'הבעיה', sub: 'Urgency', icon: '🔴' },
  { id: 'solution', label: 'הפתרון', sub: 'Differentiation', icon: '🟢' },
  { id: 'conversion', label: 'מסחור', sub: 'Conversion', icon: '🟡' },
] as const

const TAB_TAKEAWAYS: Record<(typeof TABS)[number]['id'], { focus: string; bullets: string[] }> = {
  identity: {
    focus: 'Trust',
    bullets: [
      'השילוב המבדל: עבודה סוציאלית (טראומה) + הנדסת אלגוריתמים.',
      'הבטחה תפעולית: זיהוי Decision Latency Tax והפחתה תוך 14 יום.',
      'עוגן אמינות: מחקר, אתיקה ויישום פרקטי בשטח הישראלי.',
    ],
  },
  problem: {
    focus: 'Urgency',
    bullets: [
      'שלוש פתולוגיות ליבה: DR / ND / UC פוגעות בקצב החלטה.',
      'עלות העיכוב מתורגמת ישירות לירידת הסתברות הצלחה.',
      'היעד הוא מעבר מכיבוי שריפות לניהול החלטות שיטתי.',
    ],
  },
  solution: {
    focus: 'Differentiation',
    bullets: [
      'המוצר עובד כ-Decision Operating System ולא ככלי דוחות בלבד.',
      'הצלבה בין אבחון, המלצה, ביצוע ופולו-אפ באותה זרימה.',
      'ערך מרכזי: מעבר מהמלצה כללית לתוכנית פעולה מדידה.',
    ],
  },
  conversion: {
    focus: 'Conversion',
    bullets: [
      'מסלול הכנסה משלב Sprint + Retainer + Webinar.',
      'המסרים ממופים ל-ROI ול-Cost of Delay בצורה ישירה.',
      'הלקוח מקבל הצעת ערך מבוססת מדדים ולא תמחור שעות.',
    ],
  },
}

function TabTakeaways({ tabId }: { tabId: (typeof TABS)[number]['id'] }) {
  const data = TAB_TAKEAWAYS[tabId]
  return (
    <section className="surface-strong rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="type-meta">תובנות מפתח</p>
        <span className="status-badge status-info">{data.focus}</span>
      </div>
      <div className="space-y-1.5">
        {data.bullets.map((bullet) => (
          <p key={bullet} className="text-xs text-slate-300">
            • {bullet}
          </p>
        ))}
      </div>
    </section>
  )
}

export function AboutTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('identity')
  const [readingMode, setReadingMode] = useState<'focused' | 'full'>('focused')

  return (
    <div className={`max-w-[1280px] mx-auto p-4 md:p-5 dense-copy ${readingMode === 'focused' ? 'focused-density' : ''}`}>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <p className="type-meta">מצב קריאה</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReadingMode('focused')}
            className={`status-badge px-3 py-1.5 ${readingMode === 'focused' ? 'status-success' : 'border border-slate-700 text-slate-300'}`}
          >
            ממוקד
          </button>
          <button
            type="button"
            onClick={() => setReadingMode('full')}
            className={`status-badge px-3 py-1.5 ${readingMode === 'full' ? 'status-info' : 'border border-slate-700 text-slate-300'}`}
          >
            מלא
          </button>
        </div>
      </div>
      <nav className="sticky top-3 z-10 flex flex-wrap gap-2 mb-6 p-2 rounded-xl surface-strong backdrop-blur-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all motion-card ${
              active === t.id ? 'cta-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
            <span className="mr-1.5 type-meta opacity-80 hidden sm:inline normal-case">| {t.sub}</span>
          </button>
        ))}
      </nav>

      <TabTakeaways tabId={active} />

      {active === 'identity' && <TabIdentity />}
      {active === 'problem' && <TabProblem />}
      {active === 'solution' && <TabSolution />}
      {active === 'conversion' && <TabConversion />}
    </div>
  )
}

// ---- TAB 1: זהות ----
function TabIdentity() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <section className="bento-card col-span-1 md:col-span-2 p-5 md:p-6 border-t-4 border-t-indigo-500">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg">
            א.ט
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
              ארז טל-שיר <span className="text-purple-400 font-light">| Founder</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              עבודה סוציאלית, מדעי ההתנהגות (טראומה ולחץ) × מהנדס אלגוריתמים × ארכיטקט AI
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-500/20">מכללת תל חי</span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-500/20">Genesis Logic Core</span>
              <span className="status-badge status-success text-[10px] px-2 py-0.5">ATAOV Framework</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-lg font-black text-white">+1M ₪</p>
                <p className="text-[10px] text-slate-400">הגדלת הכנסות שנתיות</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-lg font-black text-white">2023-24</p>
                <p className="text-[10px] text-slate-400">שלוחת חוסן – חרבות ברזל</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
                <p className="text-lg font-black text-white">DDD + AI</p>
                <p className="text-[10px] text-slate-400">הנדסת חוסן אלגוריתמית</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Accordion
                id="t1-founder-exp"
                title={<span className="font-bold text-sm text-purple-300">💼 ניסיון והישגים</span>}
                className="border-purple-900/30"
              >
                <div className="space-y-1">
                  <p>• <strong>חונך סטודנטים, חברת נתן:</strong> ליווי פרטני, פיתוח מיומנויות למידה, תיאום עם גורמים טיפוליים.</p>
                  <p>• <strong>צומת ספרים (משרה מלאה):</strong> הוביל מהלכים אסטרטגיים שהגדילו הכנסות במיליון ₪ – יישם תובנות ממחקר לשיפור שיווק וניהול מלאי.</p>
                  <p>• <strong>התנדבות חרבות ברזל (ים המלח):</strong> הקמת שלוחת חוסן לאוכלוסיית שדרות ועוטף עזה, הדרכות חוסן נפשי, שימוש ב-AI לשיפור תהליכים.</p>
                  <p>• <strong>מיומנויות:</strong> הדרכה, חשיבה מערכתית, ניהול פרויקטים, עברית + אנגלית, AI מחקרי-יישומי.</p>
                </div>
              </Accordion>
              <Accordion
                id="t1-founder-phil"
                title={<span className="font-bold text-sm text-purple-300">⚛ פילוסופיית פעולה (Genesis Logic)</span>}
                className="border-purple-900/30"
              >
                <div className="space-y-1">
                  <p>• <strong>הולדת אמת חדשה:</strong> יצירת פתרונות חדשניים באמצעות EchoGenesisEngine ו-ΔTensionSensor לזיהוי פערים.</p>
                  <p>• <strong>מוסריות ספונטנית:</strong> פעולה מוסרית במצבי משבר, שירות טובת השדה על פני תועלת עצמית.</p>
                  <p>• <strong>למידה רקורסיבית:</strong> שימור &quot;עקבות זיכרון&quot; לשיפור מתמיד – ארכיטקטורת ATAOV (אימות אונטולוגי).</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-5 md:p-6 border-t-4 border-t-blue-500 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Heebo, sans-serif' }}>
          העדשה הכפולה וסיר הלחץ <span className="text-blue-400 font-light">| Identity</span>
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          COR-SYS ממוקדת בצומת שבין <strong>עבודה סוציאלית</strong> (טראומה וחוסן) לבין <strong>הנדסת אלגוריתמים</strong> (DDD, אוטומציה). אנו מזהים את &quot;מס עכבת ההחלטה&quot; (Decision Latency Tax) המדמם P&L, ומטמיעים חוסמי עורקים טכנולוגיים בתוך 14 יום.
        </p>
        <div className="mt-auto space-y-2">
          <Accordion
            id="t1-macro"
            title={<span className="font-bold text-sm text-blue-300">🌐 קונטקסט המאקרו (2025-2026)</span>}
          >
            השקעות פרטיות נותרו גבוהות (כ-15.6 מיליארד דולר), אך מספר סבבי הגיוס צנח. התעסוקה בהייטק קפאה על כ-403,000 עובדים. התוצאה: <strong>לחץ תפעולי אדיר</strong> על חברות Growth Stage (50-300 עובדים) להפיק יותר תפוקה מאותם משאבים תחת טראומה קולקטיבית (פוסט 7.10), מה שמוביל לקריסת &quot;שיטות המשפחה&quot;.
          </Accordion>
          <Accordion
            id="t1-ethics"
            title={<span className="font-bold text-sm text-emerald-400">⚖ החוקה האתית (NASW & SE)</span>}
          >
            <div className="space-y-2">
              <p><strong>NASW Code of Ethics (סעיף 1.03):</strong> מחייב כשירות, הסכמה מדעת ופרטיות במתן שירותים מבוססי טכנולוגיה.</p>
              <p><strong>Software Engineering Liability:</strong> מניעת נזק מערכתי על ידי הקפדה על חוקיות ולוגיקה אלגוריתמית.</p>
              <p><strong>Ethical-Technical Constitution:</strong> חוסן ארגוני אינו &quot;פינוק&quot; של משאבי אנוש, אלא חובה אתית (Accountability) המונעת קריסה אנושית תחת מערכות אלגוריתמיות.</p>
            </div>
          </Accordion>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 xl:col-span-4 p-6 md:p-8 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-950/30 to-slate-900">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            🧪 ביסוס מחקרי <span className="text-blue-400 font-light">| Feasibility</span>
          </h2>
          <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-1 rounded-full font-bold border border-blue-500/30">4 מחקרים</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'Meta-System Consulting Feasibility', desc: 'מחקר היתכנות ראשוני – בחינת השוק, דמוגרפיה והתאמת מודל.' },
            { title: 'Feasibility Study v2.0', desc: 'גרסה מורחבת עם ניתוח מעמיק של חסמי כניסה ופוטנציאל צמיחה.' },
            { title: 'VC Feasibility Assessment', desc: 'Meta-Thinking as a Service – הערכת היתכנות מנקודת מבט של קרנות הון סיכון.' },
            { title: 'Reality Check – Israeli AI Market', desc: 'בדיקת מציאות כנגד שוק ה-AI הישראלי – אתגרים והזדמנויות ספציפיים.' },
          ].map((r) => (
            <div key={r.title} className="bg-slate-800/50 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-xs font-bold text-blue-300 mb-1">{r.title}</h4>
              <p className="text-[10px] text-slate-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---- TAB 2: הבעיה ----
function TabProblem() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <section className="bento-card col-span-1 p-6 md:p-8 border-t-4 border-t-red-500 max-h-[420px] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Heebo, sans-serif' }}>
          הדימום הקוגניטיבי <span className="text-intent-danger font-light">| Pathologies</span>
        </h2>
        <div className="space-y-3">
          <Accordion
            id="t2-nod"
            title={<span className="font-bold text-sm text-intent-danger">⚠ 1. נורמליזציית סטייה</span>}
            className="border-red-900/30 bg-red-950/10"
          >
            <strong>(Normalization of Deviance - NOD)</strong><br />
            תהליך (כמו באסון הצ&apos;לנג&apos;ר) שבו עקיפות נהלים, &quot;אקסלים סודיים&quot; וקיצורי דרך הופכים לנורמה מקובלת. בארגוני צמיחה זה קורה עקב הצורך בהישרדות מהירה. התוצאה היא חוב תהליכי עצום וסיכון קטסטרופלי סמוי.
          </Accordion>
          <Accordion
            id="t2-zerosum"
            title={<span className="font-bold text-sm text-orange-400">⇅ 2. תרבות סכום-אפס</span>}
            className="border-orange-900/30 bg-orange-950/10"
          >
            <strong>(Zero-Sum Culture & Contradiction Loss)</strong><br />
            שבירת האינטגרציה בארגון. אופטימיזציה מקומית של צוות אחד פוגעת בצוות אחר – &quot;ענישת סתירה&quot;. התוצאה: אגירת מידע, סילואים ו-Handoffs שוחקים.
          </Accordion>
          <Accordion
            id="t2-learn"
            title={<span className="font-bold text-sm text-yellow-400">🧠 3. ליקויי למידה</span>}
            className="border-yellow-900/30 bg-yellow-950/10"
          >
            <strong>(Organizational Learning Deficits)</strong><br />
            הישארות בלמידה &quot;חד-לולאתית&quot; (Single-Loop) של כיבוי שריפות, במקום למידה &quot;דו-לולאתית&quot; (Double-Loop) המאתגרת חוקי בסיס. מייצר &quot;דיסקוונטינואיטי קוגניטיבי&quot; – נתק בין הנהלה ליישום בשטח.
          </Accordion>
        </div>
      </section>

      <section className="bento-card col-span-1 p-6 md:p-8 panel-dr flex flex-col justify-center items-center text-center">
        <span className="text-4xl mb-2">🕐</span>
        <h2 className="text-lg font-bold text-slate-300 mb-1">Decision Latency Tax</h2>
        <div className="text-6xl md:text-7xl font-black text-white font-mono my-1 tracking-tighter">
          23<span className="text-3xl axis-dr">h</span>
        </div>
        <p className="text-xs text-red-300/80 font-bold uppercase tracking-widest mb-4">בשבוע, למנהל בכיר</p>
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-slate-300 leading-relaxed">
          זמן המבוזבז על פגישות סנכרון ותיאום בשל חוסר ודאות.
          <span className="block mt-2 border-t border-red-500/30 pt-2 text-intent-danger font-bold">הנתון הקריטי מהמחקר:</span>
          עיכוב של מעל 5 שעות בקבלת החלטה מרסק הסתברות הצלחה מ-<strong className="text-white text-lg">58%</strong> ל-<strong className="text-white text-lg">18%</strong>.
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-t-amber-500">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            🎯 לקוח המטרה (ICP) <span className="text-amber-400 font-light">| Target</span>
          </h2>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-500/30">Research Validated</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-amber-400 font-black text-lg">50-300</p>
            <p className="text-[10px] text-slate-400">עובדים (Growth Stage)</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-amber-400 font-black text-lg">SaaS / Fintech</p>
            <p className="text-[10px] text-slate-400">תעשיות מטרה עיקריות</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-amber-400 font-black text-lg">CEO / COO</p>
            <p className="text-[10px] text-slate-400">מקבלי ההחלטה</p>
          </div>
        </div>
        <div className="space-y-2">
          <Accordion id="t2-icp-profile" title={<span className="font-bold text-sm text-amber-300">👤 פרופיל הלקוח האידיאלי</span>} className="border-amber-900/30">
            <div className="space-y-1">
              <p>• <strong>חברות Growth Stage ישראליות</strong> (Post Series A/B) שחוות כאבי צמיחה תפעוליים.</p>
              <p>• <strong>תעשיות:</strong> SaaS, Fintech, HealthTech, Cyber – תעשיות עם לחץ גבוה ומורכבות תהליכית.</p>
              <p>• <strong>סימפטום מרכזי:</strong> פגישות סנכרון אינסופיות, תחלופה גבוהה, &quot;כולם עסוקים אבל שום דבר לא זז&quot;.</p>
              <p>• <strong>טריגר רכישה:</strong> רבעון עם miss בתוצאות + תלונות צוות על בירוקרטיה + CEO שמרגיש &quot;פלסטר על פלסטר&quot;.</p>
            </div>
          </Accordion>
          <Accordion id="t2-icp-pain" title={<span className="font-bold text-sm text-amber-300">💔 הכאב שאנחנו פותרים</span>} className="border-amber-900/30">
            <div className="space-y-1">
              <p>• <strong>Decision Latency Tax:</strong> 23 שעות שבועיות של מנהל בכיר על פגישות ריקות.</p>
              <p>• <strong>Contradiction Loss:</strong> צוותים שמבטלים את עבודת השני בלי לדעת.</p>
              <p>• <strong>טראומה קולקטיבית:</strong> פוסט 7.10 – שחיקה, חרדה ו&quot;הישרדות&quot; כמצב ברירת מחדל.</p>
              <p>• <strong>חוב תהליכי:</strong> &quot;אקסלים סודיים&quot;, נהלים שאף אחד לא קורא, ידע שאבד עם עובדים שעזבו.</p>
            </div>
          </Accordion>
        </div>
      </section>
    </div>
  )
}

// ---- TAB 3: הפתרון ----
const AGENTS = [
  { sym: 'α', name: 'Alpha', role: 'אדריכל אונטולוגי', color: 'text-blue-400', desc: 'מידול המערכת בסטנדרט MECE. מניעת חפיפות, הגדרת גבולות (Bounded Contexts) לביטול סילואים וניהול מורכבות ארגונית.' },
  { sym: 'β', name: 'Beta', role: 'מתכנן ניסויים', color: 'text-indigo-400', desc: 'מריץ סימולציות מונטה-קרלו ותרחישי "מה-אם" דרך השערות Answer First לאימות פתרונות טרם כתיבת שורת קוד.' },
  { sym: 'γ', name: 'Gamma', role: 'אנליסט אנטרופיה', color: 'text-emerald-400', desc: 'הסוכן הקריטי: מנטר KL-Divergence (הפער בין הנחיית הנהלה ליישום בשטח), ומודד J(t) = C(t) / E(t). מזהה "סחיפה סמנטית" מבעוד מועד.' },
  { sym: 'δ', name: 'Delta', role: 'דשבורד מנהלים', color: 'text-purple-400', desc: 'מערכת "קופסה שקופה". סוכן סוקרטי (Autopoietic) המציג נימוקים מאחורי כל המלצת אוטומציה, וכופה למידה דו-לולאתית.' },
] as const

const SPRINT_PHASES = [
  { days: 'ימים 1-4', label: 'BIA & Diagnostic', desc: 'מיפוי זרימת העבודה והכנסת מסמכי הלקוח (נהלים, ישיבות) ל-NotebookLM. יצירת "מפת פער דלתא", מדידת DLI בסיסי ואיתור סתירות לוגיות. הפעלת שאלון אבחון מערכתי דינמי ליצירת בסיס כמותי.', highlight: false },
  { days: 'ימים 5-8', label: 'Logic Injection (DDD)', desc: 'החלת עקרונות Domain-Driven Design (DDD). ביטול סילואים ע"י יצירת גבולות ברורים (Bounded Contexts) המונעים זליגת סמכויות וענישת סתירה.', highlight: false },
  { days: 'ימים 9-12', label: 'Tech Tourniquet (החוסם)', desc: 'שלב הליבה: בנייה והזרקה של כלי AI/אוטומציה ממוקד בדיוק בנקודת הכשל. לצמצם Handoffs, לסנן רעש סמנטי, ולעצור דימום ארגוני.', highlight: true },
  { days: 'ימים 13-14', label: 'Validation & Handover', desc: 'עריכת תרגיל שולחן TTX מונחה AI לאימות מתמטי של ירידה ב-Latency. העברת מקל והכשרת "נאמן חוסן/אוטומציה" פנימי.', highlight: false },
] as const

const COMPETITORS = [
  { name: 'Big 4 & MBB (McKinsey, PwC)', tag: '$70K-$280K/mo', color: 'text-red-400', desc: 'מסתמכים על מדדי פיגור (Lag Measures) וסקרים. יקרים, כבדים ואיטיים מדי עבור סטארטאפים בשלבי צמיחה שזקוקים לפתרון זריז ואלגוריתמי.' },
  { name: 'מובילי דעה (Sinek, Brown)', tag: '$50K-$200K/gig', color: 'text-orange-400', desc: 'מספקים השראה, תרבות וספרים רבי מכר, אך מציעים אפס כלים טכנולוגיים או אלגוריתמיים ליישום פרקטי ביומיום.' },
  { name: 'Trauma-Informed Providers', tag: '6+ Weeks', color: 'text-purple-400', desc: 'תהליכי עומק איטיים. מתמקדים במגזר הציבורי, רווחה וחינוך. חסרים את האוריינטציה הטכנולוגית לטיפול בצווארי בקבוק בקוד ובמוצר (Tech Tourniquet).' },
  { name: 'יועצי AI/אוטומציה מקומיים', tag: 'Tech Only', color: 'text-cyan-400', desc: 'מתמקדים בטכנולוגיה בלבד – חסרים את העדשה הקלינית. לא מזהים טראומה ארגונית, NOD או סחיפה סמנטית. פותרים סימפטומים, לא שורשים.' },
] as const

function TabSolution() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-t-indigo-500">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            ⚙ מנוע הביצוע: 4 סוכנים חכמים
          </h2>
          <span className="text-[10px] text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded font-bold border border-indigo-500/20">J = ∂I/∂Ω</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map((a) => (
            <Accordion
              key={a.sym}
              id={`t3-${a.sym}`}
              title={
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded bg-slate-900 flex items-center justify-center font-mono font-bold text-xs border border-slate-700 ${a.color}`}>{a.sym}</div>
                  <span className="font-bold text-sm text-slate-200">{a.name} ({a.role})</span>
                </div>
              }
              className="border-indigo-900/30"
            >
              {a.desc}
            </Accordion>
          ))}
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-t-cyan-500">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            🩺 מנוע אבחון מערכתי <span className="text-cyan-400 font-light">| Diagnostic Engine</span>
          </h2>
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-1 rounded-full font-bold border border-cyan-500/30">12+ מחקרים</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          שאלון אבחון מערכתי דינמי, מבוסס מחקר מטא-אנליטי, הפועל כ&quot;MRI ארגוני&quot; – מזהה Co-Occurrence של פתולוגיות (NOD × Zero-Sum × Learning Deficit) ומייצר מפת חום מדויקת.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-cyan-400 font-bold text-sm">שאלון OSINT</p>
            <p className="text-[10px] text-slate-400">אישוש סטטיסטי מבוסס מקורות פתוחים</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-cyan-400 font-bold text-sm">Pathology Model</p>
            <p className="text-[10px] text-slate-400">ולידציה מטא-אנליטית של מודל הפתולוגיות</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <p className="text-cyan-400 font-bold text-sm">AI-Human Systems</p>
            <p className="text-[10px] text-slate-400">שאלון אבחון מערכות AI-אנושיות</p>
          </div>
        </div>
        <div className="space-y-2">
          <Accordion id="t3-diag-method" title={<span className="font-bold text-sm text-cyan-300">🔬 מתודולוגיה ויישום</span>} className="border-cyan-900/30">
            <div className="space-y-1">
              <p>• <strong>אבחון מערכתי דינמי:</strong> שאלון רב-שכבתי הבודק תפקוד ארגוני ב-3 ממדים: מבני, תרבותי ותהליכי.</p>
              <p>• <strong>מחקר ביסוס:</strong> &quot;The Missing Evidence: Why Organizational Pathology Co-Occurrence Remains Understudied&quot; – מוכיח שהחפיפה בין NOD, Zero-Sum ו-Learning Deficit היא blind-spot מחקרי.</p>
              <p>• <strong>Systemic Pathology Validation:</strong> Meta-Analytic Assessment עם נתונים סטטיסטיים מ-OSINT לביסוס הפרדיגמה.</p>
              <p>• <strong>הנחיית מחקר לוגית:</strong> תהליך מובנה לאבחון שמונע הטיה אנושית ומייצר תוצאות ניתנות לשחזור.</p>
            </div>
          </Accordion>
          <Accordion id="t3-diag-research" title={<span className="font-bold text-sm text-cyan-300">📖 מחקרי ביקורת ותיקוף</span>} className="border-cyan-900/30">
            <div className="space-y-1">
              <p>• ביקורות מומחים על מודל הפתולוגיות</p>
              <p>• נתונים סטטיסטיים מ-OSINT לביסוס כמותי</p>
              <p>• תכנית מחקר מובנית לתיקוף מתמשך</p>
              <p>• הרחבת מדגם מחקרי ובדיקת מסמכי שטח</p>
            </div>
          </Accordion>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-t-emerald-500 max-h-[500px] overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            ⏱ ספרינט חוסם עורקים (14 ימים)
          </h2>
          <div className="flex items-center gap-2">
            <a href="https://gemini.google.com/share/0f75cdcac30d" target="_blank" rel="noreferrer" className="text-[10px] text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded font-bold uppercase tracking-widest transition-colors">
              🚀 הפעל מודול
            </a>
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded font-bold uppercase border border-emerald-500/20">PRISM Methodology</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          מתודולוגיית המנסרה (PRISM) ממזגת <strong>MECE (McKinsey)</strong> לפירוק בעיות, <strong>Answer First (Bain)</strong> להשערות מהירות, ו-<strong>BCG</strong> לוויזואליזציה דו-צירית.
        </p>
        <div className="space-y-2">
          {SPRINT_PHASES.map((s) => (
            <Accordion
              key={s.days}
              id={`t3-${s.days}`}
              title={<span className={`font-bold text-sm ${s.highlight ? 'text-emerald-400' : 'text-emerald-300'}`}>{s.days}: {s.label}</span>}
              className={s.highlight ? 'border-emerald-400/50 bg-emerald-900/20' : 'border-emerald-900/30'}
            >
              {s.desc}
            </Accordion>
          ))}
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-t-pink-500">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            ✨ נוירו-סטוריטלינג ומטא-פרומפטינג <span className="text-pink-400 font-light">| Core IP</span>
          </h2>
          <span className="bg-pink-500/20 text-pink-300 text-[10px] px-2 py-1 rounded-full font-bold border border-pink-500/30">Proprietary</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          סינתזה אונטולוגית הממזגת תובנות נוירולוגיות, פסיכולוגיית עומק וארכיטקטורת פרומפטים מתקדמת – לייצר תקשורת ארגונית שמפעילה מנגנוני שכנוע ולמידה מובנים במוח האנושי.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-pink-900/30">
            <h4 className="text-sm font-bold text-pink-300 mb-2">🧠 Neuro-Prompt Synthesis</h4>
            <p className="text-[10px] text-slate-400">גישור בין מוחות ו-AI. בניית מטא-פרומפטים לעצי החלטות ארגוניים שמפחיתים עומס קוגניטיבי ומגבירים דיוק בקבלת החלטות.</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-pink-900/30">
            <h4 className="text-sm font-bold text-pink-300 mb-2">📐 מטא-פרומפטינג להאצת יעילות</h4>
            <p className="text-[10px] text-slate-400">אופטימיזציית שימוש ב-LLM ברמה ארגונית. ניתוח מקרי בוחן ופיתוח פרומפטים שמייצרים תוצאות עקביות וניתנות לשחזור.</p>
          </div>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-t-4 border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>האוקיינוס האדום (מפת מתחרים)</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Defensible Moat</span>
        </div>
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
          {COMPETITORS.map((c) => (
            <Accordion
              key={c.name}
              id={`t3-comp-${c.name.slice(0, 8)}`}
              title={
                <div className="flex justify-between items-center w-full gap-2">
                  <span className={`font-bold text-sm ${c.color}`}>{c.name}</span>
                  <span className="text-xs font-mono bg-slate-700/50 px-2 py-0.5 rounded">{c.tag}</span>
                </div>
              }
              className="bg-slate-800/20 hover:bg-slate-800/40"
            >
              {c.desc}
            </Accordion>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap justify-between items-center gap-2">
          <strong className="text-slate-300 text-sm">החפיר (Moat):</strong>
          <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
            {['14 Days ROI', 'Glass Box AI', 'Double Lens', 'Clinical + Code'].map((m) => (
              <span key={m} className="bg-slate-600 text-white px-2 py-1 rounded shadow">{m}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// ---- TAB 4: מסחור ----
const GTM_STEPS = [
  { n: 1, title: 'הכנת מסמכים (Input)', desc: 'CEO/COO מביא סיכומי ישיבות הנהלה או ספרי נהלים.', eye: false },
  { n: 2, title: 'AI Injection', desc: 'הזרקה ל-NotebookLM והפעלת פרומפט אבחוני מול עיני הלקוח.', eye: false },
  { n: 3, title: 'Jaw Drop', desc: 'המערכת מוכיחה מתמטית את ה-Contradiction Loss ומחשבת זמן ניהולי שנשרף.', eye: true },
] as const

const BLITZ_DAYS = [
  { day: 'D-10', text: 'הכרזה: "האילתור הישראלי" הורג את ה-P&L.', highlight: false },
  { day: 'D-8', text: 'Outreach: הודעות אישיות + סקר KL-Divergence.', highlight: false },
  { day: 'D-5', text: 'וידאו "מאחורי הקלעים" – Tech Tourniquet.', highlight: false },
  { day: 'D-2', text: 'הטיזר: חשיפת נוסחת J = C / E.', highlight: false },
  { day: 'D-Day', text: 'וובינר חי + Live Demo + סגירת פגישות.', highlight: true },
] as const

const ROADMAP = [
  { q: 'Q2', label: 'בסיס אונטולוגי', active: true },
  { q: 'Q3', label: 'וובינר ו-GTM', active: false },
  { q: 'Q4', label: '3 פיילוטים', active: false },
  { q: 'Q1', label: 'השקת זכיינים', active: false },
] as const

function TabConversion() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-l-4 border-l-emerald-500">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Heebo, sans-serif' }}>
            כלכלה אונטולוגית <span className="text-emerald-400 font-light">| Value Pricing</span>
          </h2>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded-full font-bold">ROI Guaranteed</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">תמחור שעתי (T&M) יוצר ניגוד אינטרסים. COR-SYS מתמחרת אחוז קטן מהערך העצום שמשוחרר ל-P&L.</p>
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50 mb-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">נוסחת שחזור הפוטנציאל (ΔP)</p>
          <div className="text-xl md:text-2xl font-bold text-emerald-400">ΔP = (H × C × 52) × Pₛ <span className="text-sm opacity-70">(20%)</span></div>
          <div className="flex justify-center gap-4 text-[10px] text-slate-500 mt-2 flex-wrap">
            <span>H = שעות נחסכות</span><span>C = עלות שעה</span><span>Pₛ = פקטור שמרנות</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <p className="text-[10px] text-slate-400 mb-1 uppercase">ספרינט חוסם עורקים</p>
            <p className="text-xl md:text-2xl font-black text-white">40k-80k <span className="text-xs text-slate-500 font-normal">₪ (One-Time)</span></p>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <p className="text-[10px] text-slate-400 mb-1 uppercase">ריטיינר SaaS חוסן</p>
            <p className="text-xl md:text-2xl font-black text-white">5k-15k <span className="text-xs text-slate-500 font-normal">₪ (ARR/mo)</span></p>
          </div>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Heebo, sans-serif' }}>
          פורטפוליו שירותים <span className="text-slate-500 font-light">| Funnel</span>
        </h2>
        <div className="space-y-4">
          <div className="border border-slate-700 p-4 rounded-xl relative overflow-hidden hover:border-slate-500 transition">
            <div className="absolute top-0 right-0 w-1 h-full bg-slate-500" />
            <h4 className="font-bold text-slate-200 text-sm">L1: Top of Funnel</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
              <li>Live Demo אבחוני (חינם).</li>
              <li>מחשבון Decision Latency (Lead Gen).</li>
              <li>Self-Audit של נורמליזציית סטייה.</li>
              <li>וובינר &quot;ארכיטקטורת החוסן&quot; (Trust-Led).</li>
            </ul>
          </div>
          <div className="border border-blue-800 bg-blue-900/10 p-4 rounded-xl relative overflow-hidden hover:border-blue-500 transition">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
            <h4 className="font-bold text-blue-300 text-sm">L2: Mid/Bottom Funnel</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
              <li><a href="https://gemini.google.com/share/0f75cdcac30d" target="_blank" rel="noreferrer" className="hover:text-blue-300 transition-colors"><strong>ספרינט &quot;חוסם עורקים&quot; (14 יום).</strong> 🔗</a></li>
              <li><strong>Resilience Retainer (SaaS).</strong></li>
              <li><strong>סדנת AI ארגונית</strong> – הפעלה מעשית.</li>
            </ul>
          </div>
          <div className="border border-indigo-900 bg-indigo-900/10 p-4 rounded-xl relative overflow-hidden hover:border-indigo-500 transition">
            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
            <h4 className="font-bold text-indigo-300 text-sm">L3: Scale</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
              <li>הסמכת יועצים &quot;נאמני חוסן&quot; (Royalty).</li>
              <li>רישוי API של הסוכנים לאנטרפרייז.</li>
              <li>הרצאות Keynote ($10K+).</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 bg-gradient-to-b from-blue-900/30 to-slate-900 border-t-4 border-t-blue-400">
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Heebo, sans-serif' }}>אסטרטגיית GTM</h2>
        <p className="text-[10px] text-blue-300 mb-6 uppercase tracking-widest font-bold">The Live Demo Trap</p>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">מנגנון שמקצר מחזור מכירה משבועות ל-30 דקות. Trust-Led Growth המייצר &quot;אפקט לסת שמוטה&quot;.</p>
        <div className="relative space-y-6 pr-4 border-r-2 border-slate-700 mr-2">
          {GTM_STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold z-10 ${s.eye ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-blue-500 text-white'}`}>
                {s.eye ? '👁' : s.n}
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">{s.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-sm font-bold text-slate-300 mb-2">🤝 שותפויות GTM</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed"><strong>קרנות VCs:</strong> שיווק כ-Value-Add שמגן על השקעות. חוסם קריסה תפעולית ומהווה &quot;תעודת ביטוח&quot; לחוסן.</p>
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 p-6 md:p-8 border-b-4 border-b-orange-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="type-h1 text-white">The 10-Day Webinar Blitz</h2>
          <div className="flex gap-2">
            <span className="status-badge status-warning">Tactical Campaign</span>
            <span className="status-badge status-info">B2B Optimized</span>
          </div>
        </div>
        <p className="type-body text-slate-300 mb-4">מערך וובינר מבוסס מחקר B2B אופטימלי – &quot;ארכיטקטורת החוסן&quot;. מתודולוגיה שנבנתה מניתוח מעמיק של מה עובד בוובינרים בשוק הישראלי.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <a
            href="/lecture-script-resilience-architecture.md"
            target="_blank"
            rel="noreferrer"
            className="status-badge status-success px-3 py-1.5"
          >
            תסריט הרצאה (גרסה סופית)
          </a>
          <a
            href="https://org-fortify.lovable.app"
            target="_blank"
            rel="noreferrer"
            className="status-badge status-info px-3 py-1.5"
          >
            מחשבון ROI חי
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {BLITZ_DAYS.map((b) => (
            <div
              key={b.day}
              className={`p-3 rounded-lg border shadow-sm ${b.highlight ? 'bg-orange-500/20 border-orange-500/50 col-span-2 md:col-span-1' : 'bg-slate-800/80 border-slate-700'}`}
            >
              <span className="block text-orange-400 font-black text-xs mb-1">{b.day}</span>
              <span className={`text-[10px] leading-tight ${b.highlight ? 'text-white font-bold' : 'text-slate-300'}`}>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bento-card col-span-1 md:col-span-2 xl:col-span-4 p-6 md:p-8 bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 md:border-l md:border-slate-800 md:pl-6 flex flex-col justify-center">
            <h2 className="type-h2 text-white mb-4">📊 תחזית P&amp;L (שנה 1)</h2>
            <div className="space-y-3 text-xs type-kpi">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1"><span>12 ספרינטים (50K ממוצע)</span><span className="text-slate-200">600K ₪</span></div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1"><span>5 לקוחות Retainer פעילים</span><span className="text-slate-200">240K ₪</span></div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1"><span>סדנאות + וובינרים</span><span className="text-slate-200">60K ₪</span></div>
              <div className="flex justify-between font-bold text-emerald-400 pt-2 text-sm"><span>EBITDA מוערך</span><span>720K+ ₪</span></div>
            </div>
            <p className="text-[9px] text-slate-500 mt-4 leading-tight bg-slate-800/50 p-2 rounded">* מודל שמרני (ספרינט אחד/חודש). פוטנציאל ב-2 ספרינטים/חודש: <strong className="text-emerald-500">1.2M+ ₪</strong> ללא עליה משמעותית בהוצאות.</p>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="type-h2 text-white mb-6">🗺 מפת דרכים (Roadmap)</h2>
            <div className="flex justify-between items-start relative">
              {ROADMAP.map((r) => (
                <div key={r.q} className="relative z-10 text-center flex-1">
                  <div className={`w-6 h-6 mx-auto rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold mb-2 ${r.active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>{r.q}</div>
                  <h4 className={`text-[10px] font-bold ${r.active ? 'text-slate-300' : 'text-slate-400'}`}>{r.label}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
