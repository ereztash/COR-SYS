import { getClientWithPlan, getSprintsByClient, getFinancialsByClient, getLatestSnapshotForClient } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { SendAssessmentLink } from './SendAssessmentLink'
import { CBRSection } from './CBRSection'

export const dynamic = 'force-dynamic'

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_ACCENT: Record<string, string> = {
  'healthy':           '#34d399',
  'at-risk':           '#fbbf24',
  'critical':          '#fb923c',
  'systemic-collapse': '#f43f5e',
}

const SEVERITY_LABEL: Record<string, string> = {
  'healthy':           'תקין',
  'at-risk':           'בסיכון',
  'critical':          'קריטי',
  'systemic-collapse': 'קריסה מערכתית',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const [clientWithPlan, sprints, financials, cbrSnapshot] = await Promise.all([
    getClientWithPlan(clientId),
    getSprintsByClient(clientId),
    getFinancialsByClient(clientId),
    getLatestSnapshotForClient(clientId),
  ])
  if (!clientWithPlan) notFound()

  const { client, plan } = clientWithPlan
  const totalRevenue   = financials.reduce((s, f) => s + (f.revenue ?? 0), 0)
  const snapshot       = cbrSnapshot?.snapshot
  const severity       = snapshot?.severity_profile ?? null
  const accent         = severity ? (SEVERITY_ACCENT[severity] ?? '#818cf8') : '#6366f1'
  const activesprints  = sprints.filter(s => s.status === 'active').length

  // Loss frame: ₪/day from decision latency
  const dailyLoss = client.hourly_rate && client.decision_latency_hours
    ? Math.round((client.hourly_rate * client.decision_latency_hours) / 7)
    : null

  return (
    <div className="min-h-screen" style={{ background: '#0a1020' }}>

      {/* ── Story Arc Header ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden border-b border-white/5"
        style={{
          background: severity
            ? `linear-gradient(135deg,${accent}10 0%,rgba(10,16,32,0.98) 55%)`
            : 'linear-gradient(135deg,rgba(99,102,241,0.08) 0%,rgba(10,16,32,0.98) 55%)',
        }}
      >
        <div className="absolute inset-0 grid-texture opacity-60" />
        <div className="relative px-6 pt-6 pb-8 max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-5"
          >
            <span className="text-xs">←</span>
            <span>לקוחות</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
            <div>
              {/* Severity pulse + label */}
              {severity && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full animate-pulse-ring"
                      style={{ background: accent }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ background: accent }}
                    />
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    {SEVERITY_LABEL[severity] ?? severity}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-1">
                <h1
                  className="text-3xl font-black text-white"
                  style={{ fontFamily: 'Heebo, sans-serif' }}
                >
                  {client.name}
                </h1>
                <Badge status={client.status} />
              </div>
              <p className="text-slate-500 text-sm">
                {client.company ?? ''}
                {client.industry ? ` · ${client.industry}` : ''}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/clients/${clientId}/edit`}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
              >
                עריכה
              </Link>
              <Link
                href={`/clients/${clientId}/sprints/new`}
                className="px-4 py-2 rounded-xl text-white font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
              >
                + ספרינט חדש
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Decision latency + loss frame */}
          <div
            className="rounded-2xl p-4 border relative overflow-hidden"
            style={{ background: 'rgba(244,63,94,0.07)', borderColor: 'rgba(244,63,94,0.2)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg,#f43f5e,transparent)' }}
            />
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">עיכוב החלטה</p>
            <p className="text-2xl font-black text-red-400">{client.decision_latency_hours ?? 0}h</p>
            <p className="text-[10px] text-slate-600">שעות לשבוע</p>
            {dailyLoss && (
              <p className="text-[10px] text-red-500/70 mt-1 font-mono">≈₪{dailyLoss}/יום</p>
            )}
          </div>

          {/* Retainer */}
          <div
            className="rounded-2xl p-4 border relative overflow-hidden"
            style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg,#10b981,transparent)' }}
            />
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">ריטיינר</p>
            <p className="text-2xl font-black text-emerald-400">
              {client.monthly_retainer ? formatCurrency(client.monthly_retainer) : '—'}
            </p>
            <p className="text-[10px] text-slate-600">לחודש</p>
          </div>

          {/* Total revenue */}
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(30,41,59,0.6)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">הכנסות סה&quot;כ</p>
            <p className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-slate-600">{financials.length} חודשים</p>
          </div>

          {/* Sprints */}
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.2)' }}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">ספרינטים</p>
            <p className="text-2xl font-black text-indigo-400">{sprints.length}</p>
            <p className="text-[10px] text-slate-600">{activesprints} פעילים</p>
          </div>
        </div>
      </div>

      {/* ── Diagnostic Banner (if snapshot exists) ───────────────────────── */}
      {snapshot && (
        <div className="px-6 pb-4 max-w-6xl mx-auto">
          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{
              background:  `linear-gradient(135deg,${accent}08 0%,rgba(10,16,32,0.9) 60%)`,
              borderColor: `${accent}20`,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg,transparent,${accent}50,transparent)` }}
            />
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">DSM Snapshot</p>
                <p className="text-xs font-bold" style={{ color: accent }}>
                  {SEVERITY_LABEL[severity ?? ''] ?? severity}
                </p>
              </div>
              {[
                { label: 'DR', value: snapshot.score_dr },
                { label: 'ND', value: snapshot.score_nd },
                { label: 'UC', value: snapshot.score_uc },
                { label: 'SC', value: (snapshot as { score_sc?: number }).score_sc },
              ].map(d => d.value != null && (
                <div key={d.label} className="text-center">
                  <p className="text-[10px] text-slate-600 font-mono">{d.label}</p>
                  <p
                    className="text-lg font-black font-mono"
                    style={{
                      color: d.value > 5.5 ? '#f87171' : d.value > 2.5 ? '#fbbf24' : '#34d399',
                    }}
                  >
                    {d.value.toFixed(1)}
                  </p>
                </div>
              ))}
              <div className="text-center">
                <p className="text-[10px] text-slate-600 font-mono">אנטרופיה</p>
                <p className="text-lg font-black text-slate-300 font-mono">
                  {snapshot.total_entropy?.toFixed(2)}
                </p>
              </div>
              <div className="mr-auto">
                <Link
                  href={`/clients/${clientId}/plan`}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all"
                  style={{ color: accent, borderColor: `${accent}30`, background: `${accent}08` }}
                >
                  צפה בתוכנית →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Sprints — col-span-2 */}
          <div
            className="md:col-span-2 rounded-2xl p-6 border"
            style={{ background: 'rgba(15,23,42,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">ספרינטים</h2>
              <Link
                href={`/clients/${clientId}/sprints/new`}
                className="text-[11px] text-emerald-400 border border-emerald-500/25 px-3 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors font-bold"
              >
                + חדש
              </Link>
            </div>

            <div className="space-y-3">
              {sprints.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-3xl mb-3 opacity-30">⚡</div>
                  <p className="text-slate-500 text-sm mb-4">אין ספרינטים עדיין</p>
                  <Link
                    href={`/clients/${clientId}/sprints/new`}
                    className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    התחל ספרינט ראשון
                  </Link>
                </div>
              ) : (
                sprints.map(sprint => {
                  const tasks = (sprint.tasks ?? []) as { id: string; status: string }[]
                  const done  = tasks.filter(t => t.status === 'done').length
                  const pct   = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

                  const sStyle: Record<string, { bg: string; border: string }> = {
                    active:    { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.22)' },
                    planned:   { bg: 'rgba(30,41,59,0.4)',     border: 'rgba(255,255,255,0.07)' },
                    completed: { bg: 'rgba(15,23,42,0.3)',     border: 'rgba(255,255,255,0.05)' },
                    cancelled: { bg: 'rgba(127,29,29,0.12)',   border: 'rgba(244,63,94,0.15)'  },
                  }
                  const ss = sStyle[sprint.status] ?? sStyle.planned

                  return (
                    <Link
                      key={sprint.id}
                      href={`/clients/${clientId}/sprints/${sprint.id}`}
                      className="block p-4 rounded-xl border transition-all hover:brightness-125"
                      style={{ background: ss.bg, borderColor: ss.border }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white text-sm">{sprint.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {sprint.start_date} — {sprint.end_date}
                          </p>
                        </div>
                        <Badge status={sprint.status} />
                      </div>
                      {tasks.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
                            <span>{done}/{tasks.length} משימות</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: pct === 100
                                  ? '#10b981'
                                  : 'linear-gradient(90deg,#6366f1,#818cf8)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Send assessment */}
            <SendAssessmentLink clientId={clientId} />

            {/* Business plan */}
            <div
              className="rounded-2xl p-5 border relative overflow-hidden"
              style={{
                background:  'rgba(15,23,42,0.7)',
                borderColor: 'rgba(16,185,129,0.25)',
                borderTopWidth: '3px',
                borderTopColor: '#10b981',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-200">תוכנית עסקית</h3>
                <Link
                  href={`/clients/${clientId}/plan`}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  {plan ? 'נהל →' : 'בנה (שאלון) →'}
                </Link>
              </div>
              {plan ? (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {plan.summary ?? 'תוכנית קיימת'}
                </p>
              ) : (
                <p className="text-xs text-slate-600">
                  מלא שאלון COR-SYS לבניית תוכנית והמלצת שירות מותאמת.
                </p>
              )}
            </div>

            {/* CBR Recommendations */}
            {snapshot ? (
              <CBRSection
                snapshotId={snapshot.snapshot_id}
                clientId={clientId}
                hourlyRate={client.hourly_rate}
                decisionLatencyHours={client.decision_latency_hours}
              />
            ) : (
              <div
                className="rounded-2xl p-5 border"
                style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-2">
                  המלצות CBR
                </p>
                <p className="text-xs text-slate-600">
                  השלם שאלון אבחון כדי לקבל המלצות מבוססות-מקרים.
                </p>
              </div>
            )}

            {/* Follow-up */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-200">מדידה חוזרת</h3>
                <Link
                  href={`/clients/${clientId}/followup`}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  פתח →
                </Link>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                ΔDR · ΔPSI · λ = 1 + κ×LG
              </p>
            </div>

            {/* Notes */}
            {client.notes && (
              <div
                className="rounded-2xl p-5 border"
                style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-sm font-bold text-slate-200 mb-2">הערות</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{client.notes}</p>
              </div>
            )}

            {/* Financials */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200">כספים</h3>
                <Link href="/financials" className="text-[10px] text-emerald-400 hover:text-emerald-300">
                  נהל →
                </Link>
              </div>
              {financials.length === 0 ? (
                <p className="text-xs text-slate-600">אין רשומות כספיות</p>
              ) : (
                <div className="space-y-0">
                  {financials.slice(0, 4).map(f => (
                    <div
                      key={f.id}
                      className="flex justify-between items-center text-xs py-2 border-b last:border-0"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <span className="text-slate-500 font-mono">
                        {new Date(f.period_month).toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{formatCurrency(f.revenue)}</span>
                        {f.paid_date && <span className="text-emerald-600 text-[10px]">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meta */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-sm font-bold text-slate-200 mb-3">פרטים</h3>
              <dl className="space-y-2">
                {[
                  { label: 'תחילת מעורבות', value: formatDate(client.engagement_start) },
                  { label: 'תעריף שעתי',   value: client.hourly_rate ? formatCurrency(client.hourly_rate) : '—' },
                  { label: 'נוסף',          value: formatDate(client.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-[11px] text-slate-600">{label}</dt>
                    <dd className="text-[11px] text-slate-300 font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
