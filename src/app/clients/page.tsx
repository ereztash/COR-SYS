import { getClients, getClientPortfolioStats } from '@/lib/data/clients'
import { getOptionById } from '@/lib/service-catalog'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ModeBlurb } from '@/components/ui/ModeBlurb'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export const revalidate = 30

const STATUS_LABEL_HE: Record<string, string> = {
  active: 'פעיל',
  prospect: 'פוטנציאלי',
  churned: 'עזב',
  paused: 'מושהה',
  volunteer: 'התנדבות',
}

export default async function ClientsPage() {
  const [clients, stats] = await Promise.all([getClients(), getClientPortfolioStats()])

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">לקוחות</h1>
            <p className="text-slate-400 text-sm mt-1">{clients.length} לקוחות במערכת</p>
            <ModeBlurb
              className="mt-2"
              beginner="כאן מנהלים לקוחות, רואים סטטוס נוכחי ונכנסים להמלצה הבאה לכל לקוח."
              advanced="Client portfolio view with quick access to diagnosis, actions, and follow-up."
              research="Portfolio index for cross-client pattern tracking and intervention-state comparison."
            />
          </div>
          <Link href="/clients/new"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
            + לקוח חדש
          </Link>
        </div>

        {stats && stats.total > 0 && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bento-card p-4 border-t-4 border-t-slate-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase">סה״כ לקוחות</p>
              <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
            </div>
            <div className="bento-card p-4 border-t-4 border-t-blue-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase">הקשר: צוות</p>
              <p className="text-2xl font-black text-blue-300 mt-1">{stats.operating.team}</p>
            </div>
            <div className="bento-card p-4 border-t-4 border-t-emerald-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase">הקשר: עצמאי</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{stats.operating.one_man_show}</p>
            </div>
            <div className="bento-card p-4 border-t-4 border-t-amber-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase">הקשר לא מוגדר</p>
              <p className="text-2xl font-black text-amber-200/90 mt-1">{stats.operating.unset}</p>
            </div>
            <div className="bento-card p-4 border-t-4 border-t-indigo-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase">עם תוכנית שמורה</p>
              <p className="text-2xl font-black text-indigo-300 mt-1">{stats.clientsWithPlan}</p>
            </div>
            <div className="bento-card p-4 border-t-4 border-t-cyan-500 col-span-2 sm:col-span-3 lg:col-span-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">לפי סטטוס</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                {(Object.keys(stats.byStatus) as (keyof typeof stats.byStatus)[]).map((k) => (
                  <span key={k}>
                    {STATUS_LABEL_HE[k] ?? k}: <strong className="text-slate-200">{stats.byStatus[k]}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {stats && Object.keys(stats.recommendations).length > 0 && (
          <div className="mb-8 bento-card p-4 border-t-4 border-t-violet-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">המלצות שירות (מתוכניות שמורות)</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {Object.entries(stats.recommendations).map(([optId, n]) => {
                const opt = getOptionById(optId)
                const label = opt?.nameHe ?? optId
                return (
                  <span key={optId} className="text-slate-300">
                    {label}: <strong className="text-white">{n}</strong>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {clients.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`}
              className="block bento-card p-5 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{client.name}</h2>
                    <Badge status={client.status} />
                    {client.operating_context === 'one_man_show' && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        עצמאי
                      </span>
                    )}
                    {client.operating_context === 'team' && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        צוות
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{client.company ?? '—'} {client.industry ? `• ${client.industry}` : ''}</p>
                  {client.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-1">{client.notes}</p>}
                </div>
                <div className="text-left space-y-1 mr-4 shrink-0">
                  {client.monthly_retainer && (
                    <p className="text-sm font-bold text-emerald-400">{client.monthly_retainer.toLocaleString('he-IL')} ₪/חודש</p>
                  )}
                  {client.decision_latency_hours && (
                    <p className="text-xs text-red-400">{client.decision_latency_hours}h עיכוב/שבוע</p>
                  )}
                  {client.engagement_start && (
                    <p className="text-xs text-slate-500">התחיל: {formatDate(client.engagement_start)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {clients.length === 0 && (
            <EmptyState
              icon={Users}
              title="אין לקוחות עדיין"
              description="הוסף את הלקוח הראשון כדי להתחיל לעבוד עם אבחונים, ספרינטים ותוכניות פעולה."
              ctaLabel="הוסף לקוח ראשון"
              ctaHref="/clients/new"
            />
          )}
        </div>
      </div>
    </div>
  )
}

