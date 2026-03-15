import { getClientWithPlan, getSprintsByClient, getFinancialsByClient } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const [clientWithPlan, sprints, financials] = await Promise.all([
    getClientWithPlan(clientId),
    getSprintsByClient(clientId),
    getFinancialsByClient(clientId),
  ])
  if (!clientWithPlan) notFound()
  const { client, plan } = clientWithPlan
  const totalRevenue = financials.reduce((s, f) => s + (f.revenue ?? 0), 0)

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/clients" className="text-slate-400 hover:text-white text-sm transition-colors">← לקוחות</Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl font-black text-white">{client.name}</h1>
              <Badge status={client.status} />
            </div>
            <p className="text-slate-400 text-sm mt-1">{client.company ?? ''}{client.industry ? ` • ${client.industry}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clients/${clientId}/edit`}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm">
              עריכה
            </Link>
            <Link href={`/clients/${clientId}/sprints/new`}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors">
              + ספרינט חדש
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">עיכוב החלטה</p>
            <p className="text-2xl font-black text-red-400">{client.decision_latency_hours ?? 0}h</p>
            <p className="text-[10px] text-slate-500">לשבוע</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">ריטיינר</p>
            <p className="text-2xl font-black text-emerald-400">{client.monthly_retainer ? formatCurrency(client.monthly_retainer) : '—'}</p>
            <p className="text-[10px] text-slate-500">לחודש</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">הכנסות סה"כ</p>
            <p className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-slate-500">{financials.length} חודשים</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">ספרינטים</p>
            <p className="text-2xl font-black text-indigo-400">{sprints.length}</p>
            <p className="text-[10px] text-slate-500">{sprints.filter(s => s.status === 'active').length} פעילים</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Sprints */}
          <div className="md:col-span-2 bento-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">ספרינטים</h2>
              <Link href={`/clients/${clientId}/sprints/new`}
                className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors font-bold">
                + חדש
              </Link>
            </div>
            <div className="space-y-3">
              {sprints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm mb-3">אין ספרינטים עדיין</p>
                  <Link href={`/clients/${clientId}/sprints/new`}
                    className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                    התחל ספרינט ראשון
                  </Link>
                </div>
              ) : (
                sprints.map(sprint => {
                  const tasks = (sprint.tasks ?? []) as { id: string; status: string }[]
                  const done = tasks.filter(t => t.status === 'done').length
                  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

                  const sColors: Record<string, string> = {
                    active: 'border-emerald-500/30 bg-emerald-900/10',
                    planned: 'border-slate-700/50 bg-slate-800/20',
                    completed: 'border-slate-600/30 bg-slate-800/10',
                    cancelled: 'border-red-900/30 bg-red-950/10',
                  }

                  return (
                    <Link key={sprint.id} href={`/clients/${clientId}/sprints/${sprint.id}`}
                      className={`block p-4 rounded-xl border transition-all hover:brightness-110 ${sColors[sprint.status] ?? sColors.planned}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{sprint.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{sprint.start_date} — {sprint.end_date}</p>
                        </div>
                        <Badge status={sprint.status} />
                      </div>
                      {tasks.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>{done}/{tasks.length} משימות</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* תוכנית עסקית */}
            <div className="bento-card p-5 border-t-4 border-t-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-300">תוכנית עסקית</h3>
                <Link href={`/clients/${clientId}/plan`} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold">
                  {plan ? 'נהל →' : 'בנה (שאלון COR-SYS) →'}
                </Link>
              </div>
              {plan ? (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{plan.summary ?? 'תוכנית קיימת'}</p>
              ) : (
                <p className="text-xs text-slate-500">אין תוכנית. מלא שאלון לבניית תוכנית והמלצת שירות.</p>
              )}
            </div>

            {/* Notes */}
            <div className="bento-card p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-2">הערות</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{client.notes ?? 'אין הערות'}</p>
            </div>

            {/* Financials */}
            <div className="bento-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-300">כספים</h3>
                <Link href="/financials" className="text-[10px] text-emerald-400 hover:text-emerald-300">נהל →</Link>
              </div>
              {financials.slice(0, 4).map(f => (
                <div key={f.id} className="flex justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400">{new Date(f.period_month).toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{formatCurrency(f.revenue)}</span>
                    {f.paid_date && <span className="text-[10px] text-emerald-600">✓</span>}
                  </div>
                </div>
              ))}
              {financials.length === 0 && <p className="text-xs text-slate-500">אין רשומות כספיות</p>}
            </div>

            {/* Meta */}
            <div className="bento-card p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-3">פרטים</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">תחילת מעורבות</dt>
                  <dd className="text-slate-300">{formatDate(client.engagement_start)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">תעריף שעתי</dt>
                  <dd className="text-slate-300">{client.hourly_rate ? formatCurrency(client.hourly_rate) : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">נוסף</dt>
                  <dd className="text-slate-300">{formatDate(client.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

