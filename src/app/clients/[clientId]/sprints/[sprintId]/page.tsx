import { getSprintById } from '@/lib/data/sprints'
import { getClientById } from '@/lib/data/clients'
import { getTasksBySprint } from '@/lib/data/tasks'
import { notFound } from 'next/navigation'
import { SprintBoard } from '@/components/SprintBoard'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SprintPage({ params }: { params: Promise<{ clientId: string; sprintId: string }> }) {
  const { clientId, sprintId } = await params
  const [sprint, client, tasks] = await Promise.all([
    getSprintById(sprintId),
    getClientById(clientId),
    getTasksBySprint(sprintId),
  ])
  if (!sprint || !client) notFound()

  const done = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const today = new Date()
  const start = new Date(sprint.start_date)
  const end = new Date(sprint.end_date)
  const daysPassed = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000))
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000))

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/clients" className="hover:text-slate-300 transition-colors">לקוחות</Link>
          <span>/</span>
          <Link href={`/clients/${clientId}`} className="hover:text-slate-300 transition-colors">{client.name}</Link>
          <span>/</span>
          <span className="text-slate-300">{sprint.title}</span>
        </div>

        {/* Sprint Header */}
        <div className="bento-card p-6 mb-6 border-t-4 border-emerald-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white">{sprint.title}</h1>
                <Badge status={sprint.status} />
              </div>
              {sprint.goal && <p className="text-slate-400 text-sm mt-1 max-w-2xl">{sprint.goal}</p>}
              <p className="text-xs text-slate-500 mt-2">{sprint.start_date} — {sprint.end_date}</p>
            </div>
            <Link href={`/clients/${clientId}/sprints/new`}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition-colors shrink-0">
              + ספרינט חדש
            </Link>
          </div>

          {/* Progress */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{tasks.length}</p>
              <p className="text-[10px] text-slate-500 uppercase">משימות</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-400">{done}</p>
              <p className="text-[10px] text-slate-500 uppercase">הושלמו</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-yellow-400">{daysLeft}</p>
              <p className="text-[10px] text-slate-500 uppercase">ימים נותרו</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-blue-400">{pct}%</p>
              <p className="text-[10px] text-slate-500 uppercase">הושלם</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Board */}
        <SprintBoard sprintId={sprintId} clientId={clientId} initialTasks={tasks} />

      </div>
    </div>
  )
}

