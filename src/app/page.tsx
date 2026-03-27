import { getDashboardData } from '@/lib/data/dashboard'
import { formatCurrency } from '@/lib/utils'
import { YEAR_1_REVENUE_TARGET } from '@/lib/business-config'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black min-h-screen">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">C</div>
            <h1 className="text-4xl font-black text-white tracking-tight">COR-SYS</h1>
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mr-2">Deep-Grid v2.2</span>
          </div>
          <p className="text-slate-400 font-medium text-sm mt-2">מערכת הפעלה אונטולוגית: הנדסת חוסן, צמצום אנטרופיה ומקסום ROI</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          J(t) = C(t) / E(t) | Active
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
        <div className="bento-card col-span-1 p-6 bg-gradient-to-br from-red-950/60 to-slate-900 flex flex-col justify-center items-center text-center">
          <span className="text-3xl mb-2">🕐</span>
          <h2 className="text-sm font-bold text-slate-300 mb-1">Decision Latency Tax</h2>
          <div className="text-6xl font-black text-white font-mono my-1">
            {data.totalLatency.toFixed(0)}<span className="text-2xl text-red-400">h</span>
          </div>
          <p className="text-xs text-red-300/80 font-bold uppercase tracking-widest mb-3">בשבוע, סה"כ</p>
          <Link href="/clients" className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
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
              <p className="text-slate-500 text-sm text-center py-4">אין לקוחות עדיין</p>
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
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm mb-2">אין ספרינטים פעילים</p>
                <Link href="/clients" className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                  התחל ספרינט
                </Link>
              </div>
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
              { days: 'ימים 1-4', label: 'BIA & Diagnostic', color: 'border-emerald-900/40' },
              { days: 'ימים 5-8', label: 'Logic Injection (DDD)', color: 'border-emerald-900/40' },
              { days: 'ימים 9-12', label: 'Tech Tourniquet', color: 'border-emerald-500/50 bg-emerald-900/20' },
              { days: 'ימים 13-14', label: 'Validation & Handover', color: 'border-emerald-900/40' },
            ].map(step => (
              <div key={step.days} className={`p-3 rounded-xl border bg-slate-800/30 ${step.color}`}>
                <p className="text-[10px] text-emerald-400 font-bold">{step.days}</p>
                <p className="text-xs text-slate-300 mt-0.5">{step.label}</p>
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

        {/* 4 Agents */}
        <div className="bento-card col-span-1 md:col-span-2 p-6 border-t-4 border-indigo-500">
          <h2 className="text-lg font-bold text-white mb-4">מנוע הביצוע: 4 סוכנים חכמים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { sym: 'α', name: 'Alpha', role: 'אדריכל אונטולוגי', color: 'text-blue-400' },
              { sym: 'β', name: 'Beta', role: 'מתכנן ניסויים', color: 'text-indigo-400' },
              { sym: 'γ', name: 'Gamma', role: 'אנליסט אנטרופיה', color: 'text-emerald-400' },
              { sym: 'δ', name: 'Delta', role: 'דשבורד מנהלים', color: 'text-purple-400' },
            ].map(agent => (
              <div key={agent.sym} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className={`w-8 h-8 rounded bg-slate-900 flex items-center justify-center font-mono font-bold border border-slate-700 ${agent.color}`}>
                  {agent.sym}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{agent.name}</p>
                  <p className="text-[10px] text-slate-500">{agent.role}</p>
                </div>
              </div>
            ))}
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
  return (
    <div className={`bento-card p-4 border ${colors[color]} animate-fade-up ${delay}`}>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${textColors[color]}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  )
}

