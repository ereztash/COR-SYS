import { getDashboardData } from '@/lib/data/dashboard'
import { formatCurrency } from '@/lib/utils'
import { YEAR_1_REVENUE_TARGET } from '@/lib/business-config'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users, Zap } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 30

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black min-h-screen">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 glow-breathe">C</div>
            <h1 className="text-4xl font-black text-white tracking-tight">COR-SYS</h1>
            <span className="status-badge status-info px-3 py-1 mr-2 shimmer-bar">Deep-Grid v2.2</span>
          </div>
          <p className="text-xs text-indigo-300 font-bold tracking-wide mt-1">Name it. Face it. Fix it.</p>
          <p className="text-slate-400 font-medium text-sm mt-2 mode-advanced">מערכת הפעלה אונטולוגית: הנדסת חוסן, צמצום אנטרופיה ומקסום ROI</p>
          <p className="text-slate-400 font-medium text-sm mt-2 mode-beginner-only">מערכת שעוזרת לזהות בעיה, לבחור פעולה ולמדוד אם באמת השתפר.</p>
          <p className="text-slate-400 font-medium text-sm mt-2 mode-research">A decision-operating system coupling diagnostic semantics, intervention priors, and adaptive feedback loops.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span className="mode-advanced">J(t) = C(t) / E(t) | Active</span>
          <span className="mode-beginner-only">מצב מערכת: פעיל</span>
          <span className="mode-research">Load observable active</span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="לקוחות פעילים" value={data.activeClients.length.toString()} sub={`מתוך ${data.clients.length} סה"כ`} color="blue" delay="delay-0" />
        <KpiCard label="ספרינטים פעילים" value={data.activeSprints.length.toString()} sub="ספרינטי 14 יום" color="indigo" delay="delay-75" />
        <KpiCard label="משימות פתוחות" value={data.openTasks.toString()} sub="לא הושלמו" color="yellow" delay="delay-150" />
        <KpiCard label="הכנסות החודש" value={formatCurrency(data.revenueThisMonth)} sub={`סה"כ: ${formatCurrency(data.totalRevenue)}`} color="emerald" delay="delay-225" />
      </div>

      {/* Portfolio Analytics */}
      {data.portfolioAnalytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <KpiCard label="אבחונים בפורטפוליו" value={data.portfolioAnalytics.totalClientsWithDiagnostics.toString()} sub="לקוחות עם אבחון" color="blue" delay="delay-300" />
          <KpiCard label="תקין" value={data.portfolioAnalytics.byProfile.healthy.toString()} sub="healthy" color="emerald" delay="delay-375" />
          <KpiCard label="בסיכון" value={data.portfolioAnalytics.byProfile.atRisk.toString()} sub="at-risk" color="yellow" delay="delay-375" />
          <KpiCard label="קריטי" value={data.portfolioAnalytics.byProfile.critical.toString()} sub="critical" color="red" delay="delay-450" />
          <KpiCard label="קריסה מערכתית" value={data.portfolioAnalytics.byProfile.systemicCollapse.toString()} sub="systemic-collapse" color="red" delay="delay-450" />
          <div className="bento-card p-4 border border-slate-600">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">ממוצע DR/ND/UC</p>
            <p className="text-sm font-mono text-slate-300">
              DR {data.portfolioAnalytics.avgDR.toFixed(1)} · ND {data.portfolioAnalytics.avgND.toFixed(1)} · UC {data.portfolioAnalytics.avgUC.toFixed(1)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">פתולוגיה נפוצה: {data.portfolioAnalytics.mostCommonPathology ?? '—'}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Decision Latency */}
        <div className="bento-card ambient-glow col-span-1 p-6 panel-dr flex flex-col justify-center items-center text-center" style={{ '--card-glow': 'rgba(244, 63, 94, 0.2)' } as React.CSSProperties}>
          <span className="text-3xl mb-2">🕐</span>
          <h2 className="text-sm font-bold text-slate-300 mb-1">Decision Latency Tax</h2>
          <div className="text-6xl font-black text-white font-mono my-1 live-ticker">
            {data.totalLatency.toFixed(0)}<span className="text-2xl axis-dr">h</span>
          </div>
          <p className="text-xs text-intent-danger font-bold uppercase tracking-widest mb-3">בשבוע, סה"כ</p>
          <Link href="/clients" className="text-xs axis-dr border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
            עדכן לפי לקוח ←
          </Link>
        </div>

        {/* Active Clients */}
        <div className="bento-card col-span-1 md:col-span-2 xl:col-span-2 p-6 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">לקוחות פעילים</h2>
            <Link href="/clients/new" className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-bold">
              + הוסף לקוח
            </Link>
          </div>
          <div className="space-y-2">
            {data.clients.length === 0 ? (
              <EmptyState icon={Users} title="אין לקוחות עדיין" ctaLabel="הוסף לקוח" ctaHref="/clients/new" />
            ) : (
              data.clients.map(client => (
                <Link key={client.id} href={`/clients/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-600 transition-all group">
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{client.name}</p>
                    <p className="text-xs text-slate-400">{client.company ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.decision_latency_hours && (
                      <span className="text-xs text-red-400 font-mono">{client.decision_latency_hours}h</span>
                    )}
                    <Badge status={client.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link href="/clients" className="block text-center mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            כל הלקוחות →
          </Link>
        </div>

        {/* Active Sprints */}
        <div className="bento-card col-span-1 p-6 border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">ספרינטים פעילים</h2>
            <Link href="/sprints" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">הכל →</Link>
          </div>
          <div className="space-y-2">
            {data.activeSprints.length === 0 ? (
              <EmptyState icon={Zap} title="אין ספרינטים פעילים" ctaLabel="התחל ספרינט" ctaHref="/clients" />
            ) : (
              data.activeSprints.slice(0, 4).map(sprint => (
                <Link key={sprint.id} href={`/clients/${sprint.client_id}/sprints/${sprint.id}`}
                  className="block p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
                  <p className="font-bold text-white text-sm">{sprint.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sprint.clients?.name ?? '—'}</p>
                  <div className="flex gap-1 mt-1.5">
                    <Badge status={sprint.status} />
                    <span className="text-[10px] text-slate-500">עד {sprint.end_date}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 14-Day Sprint Info */}
        <div className="bento-card col-span-1 md:col-span-2 p-6 border-t-4 border-emerald-500">
          <h2 className="text-lg font-bold text-white mb-2">ספרינט חוסם עורקים (14 יום)</h2>
          <p className="text-xs text-slate-400 mb-4">מתודולוגיית PRISM — MECE + Answer First + BCG</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { days: 'ימים 1-4', label: 'BIA & Diagnostic', color: 'border-emerald-900/40', dot: 'bg-emerald-500' },
              { days: 'ימים 5-8', label: 'Logic Injection (DDD)', color: 'border-emerald-900/40', dot: 'bg-emerald-400' },
              { days: 'ימים 9-12', label: 'Tech Tourniquet', color: 'border-emerald-500/50 bg-emerald-900/20', dot: 'bg-emerald-300' },
              { days: 'ימים 13-14', label: 'Validation & Handover', color: 'border-emerald-900/40', dot: 'bg-emerald-200' },
            ].map((step, i) => (
              <div key={step.days} className={`p-3 rounded-xl border bg-slate-800/30 ${step.color} relative group hover:bg-slate-800/50 transition-colors`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${step.dot} shrink-0 group-hover:scale-125 transition-transform`} />
                  <p className="text-[10px] text-emerald-400 font-bold">{step.days}</p>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{step.label}</p>
                {i < 3 && <div className="hidden sm:block absolute -bottom-3 left-1/2 w-px h-3 bg-emerald-800/40" />}
              </div>
            ))}
          </div>
        </div>

        {/* Financials Summary */}
        <div className="bento-card col-span-1 md:col-span-2 p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">כלכלה | P&L</h2>
            <Link href="/financials" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">נהל כספים →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 mb-1 uppercase">הכנסות החודש</p>
              <p className="text-xl font-black text-white">{formatCurrency(data.revenueThisMonth)}</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 mb-1 uppercase">סה"כ הכנסות</p>
              <p className="text-xl font-black text-white">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
            <p>יעד שנה 1: <span className="text-emerald-400 font-bold">{formatCurrency(YEAR_1_REVENUE_TARGET)}</span> (מודל שמרני)</p>
          </div>
        </div>

        {/* 4 Agents — full explanation */}
        <div className="bento-card col-span-1 md:col-span-2 xl:col-span-2 p-6 border-t-4 border-indigo-500">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-bold text-white">איך המערכת מחליטה מה לעשות</h2>
            <span className="status-badge status-info">Autopoietic Loop</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            במקום המלצה "מהבטן", המערכת עובדת ב-4 שלבים פשוטים: להבין מצב, לבדוק תרחישים, לזהות סיכון בזמן אמת, ולהסביר למה זו ההמלצה.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                sym: 'α',
                name: 'Alpha',
                role: 'סידור התמונה',
                io: 'קלט: שאלון/מסמכים → פלט: מה הבעיות המרכזיות ואיפה יש סתירות',
                color: 'text-blue-400',
              },
              {
                sym: 'β',
                name: 'Beta',
                role: 'בדיקת תרחישים',
                io: 'קלט: המלצה + מקרים דומים → פלט: מה הסיכוי לתוצאה טובה/בינונית/חלשה',
                color: 'text-indigo-400',
              },
              {
                sym: 'γ',
                name: 'Gamma',
                role: 'ניטור הידרדרות',
                io: 'קלט: מה תכננו מול מה שבוצע → פלט: האם יש סטייה מסוכנת או לולאה שמחמירה',
                color: 'text-emerald-400',
              },
              {
                sym: 'δ',
                name: 'Delta',
                role: 'שיקוף החלטה',
                io: 'קלט: כל הנתונים → פלט: למה בחרנו את ההמלצה ומה לבדוק הלאה',
                color: 'text-purple-400',
              },
            ].map(agent => (
              <div key={agent.sym} className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 group hover:border-slate-600/50 hover:bg-slate-800/50 transition-all duration-200">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`w-8 h-8 rounded bg-slate-900 flex items-center justify-center font-mono font-bold border border-slate-700 ${agent.color} group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    {agent.sym}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{agent.name}</p>
                    <p className="text-[10px] text-slate-500">{agent.role}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{agent.io}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            בשורה אחת: המערכת קודם מבינה, אחר כך בודקת, תוך כדי מנטרת, ולבסוף מסבירה.
          </p>
        </div>

        {/* Action Plan Basis */}
        <div className="bento-card col-span-1 md:col-span-2 p-6 border-l-4 border-l-indigo-500">
          <h2 className="text-lg font-bold text-white mb-2">על מה תוכנית הפעולה מבוססת (במילים פשוטות)</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            התוכנית לא נכתבת ידנית ולא נשלפת מתבנית. היא נוצרת משילוב של מצב אמיתי אצלך, ניסיון עבר, ומה אפשרי לבצע בפועל.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'מצב נוכחי', text: 'איפה הכאב הכי גדול כרגע ומה חומרתו (למשל עומס החלטות, תקיעות בין צוותים).' },
              { title: 'מה עבד בארגונים דומים', text: 'השוואה למקרי עבר דומים כדי להבין מה בדרך כלל עובד טוב יותר.' },
              { title: 'מה באמת אפשר לבצע', text: 'התאמת ההמלצה לזמן, משאבים ורמת התנגדות צפויה בארגון.' },
              { title: 'בקרה לאורך זמן', text: 'בדיקות קבועות כדי לוודא שההתערבות באמת משפרת ולא רק נראית טוב על הנייר.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                <p className="text-xs font-bold text-indigo-300 mb-1">{item.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-300 font-bold mb-1">איך לקרוא את התוכנית מהר:</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              קודם מסתכלים על "מה הבעיה הכי דחופה", אחר כך על "מה ההמלצה", ואז על "איך מודדים הצלחה תוך 2-4 שבועות".
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/clients" className="text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 transition-colors">
              מעבר ללקוחות →
            </Link>
            <Link href="/knowledge/dsm-org" className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/40 transition-colors">
              בסיס ידע DSM-Org →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color, delay = '' }: { label: string; value: string; sub: string; color: string; delay?: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-500/5',
    indigo: 'border-indigo-500/30 bg-indigo-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    red: 'border-red-500/30 bg-red-500/5',
  }
  const textColors: Record<string, string> = {
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    yellow: 'text-yellow-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
  }
  const glowColors: Record<string, string> = {
    blue: 'rgba(59, 130, 246, 0.18)',
    indigo: 'rgba(99, 102, 241, 0.18)',
    yellow: 'rgba(234, 179, 8, 0.18)',
    emerald: 'rgba(16, 185, 129, 0.18)',
    red: 'rgba(239, 68, 68, 0.18)',
  }
  return (
    <div
      className={`bento-card ambient-glow p-4 border ${colors[color]} animate-fade-up ${delay}`}
      style={{ '--card-glow': glowColors[color] } as React.CSSProperties}
    >
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${textColors[color]}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  )
}

