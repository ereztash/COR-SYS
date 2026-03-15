import { getClients } from '@/lib/data/clients'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">לקוחות</h1>
            <p className="text-slate-400 text-sm mt-1">{clients.length} לקוחות במערכת</p>
          </div>
          <Link href="/clients/new"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
            + לקוח חדש
          </Link>
        </div>

        <div className="space-y-3">
          {clients.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`}
              className="block bento-card p-5 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{client.name}</h2>
                    <Badge status={client.status} />
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
            <div className="bento-card p-12 text-center">
              <p className="text-slate-400 mb-4">אין לקוחות עדיין</p>
              <Link href="/clients/new" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
                הוסף לקוח ראשון
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

