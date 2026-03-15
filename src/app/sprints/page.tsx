import { getSprintsWithTasks } from '@/lib/data/sprints'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AllSprintsPage() {
  const sprints = await getSprintsWithTasks()
  const active = sprints.filter(s => s.status === 'active')
  const planned = sprints.filter(s => s.status === 'planned')
  const completed = sprints.filter(s => s.status === 'completed')

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">ספרינטים</h1>
          <p className="text-slate-400 text-sm mt-1">{sprints.length} ספרינטים סה"כ</p>
        </div>

        {[
          { label: 'פעילים', items: active, color: 'border-emerald-500/50 bg-emerald-900/10' },
          { label: 'מתוכננים', items: planned, color: 'border-slate-700/50 bg-slate-800/10' },
          { label: 'הושלמו', items: completed, color: 'border-blue-900/30 bg-blue-950/10' },
        ].map(group => group.items.length > 0 && (
          <div key={group.label} className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{group.label} ({group.items.length})</h2>
            <div className="space-y-3">
              {group.items.map(sprint => {
                const tasks = (sprint.tasks ?? []) as { id: string; status: string }[]
                const done = tasks.filter(t => t.status === 'done').length
                const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
                const client = sprint.clients as { name?: string; company?: string | null } | null

                return (
                  <Link key={sprint.id} href={`/clients/${sprint.client_id}/sprints/${sprint.id}`}
                    className={`block bento-card p-5 border ${group.color} hover:brightness-110 transition-all`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-white">{sprint.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{client?.name ?? '—'} {client?.company ? `• ${client.company}` : ''}</p>
                        <p className="text-xs text-slate-500 mt-1">{sprint.start_date} — {sprint.end_date}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{pct}%</p>
                        <p className="text-[10px] text-slate-500">{done}/{tasks.length}</p>
                      </div>
                    </div>
                    {tasks.length > 0 && (
                      <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {sprints.length === 0 && (
          <div className="bento-card p-12 text-center">
            <p className="text-slate-400 mb-4">אין ספרינטים עדיין</p>
            <Link href="/clients" className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors">
              התחל מלקוח
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
