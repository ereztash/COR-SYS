import { getClientById } from '@/lib/data/clients'
import { getSprintCountByClient } from '@/lib/data/sprints'
import { notFound } from 'next/navigation'
import { SprintForm } from '@/components/forms/SprintForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewSprintPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const [client, count] = await Promise.all([
    getClientById(clientId),
    getSprintCountByClient(clientId),
  ])
  if (!client) notFound()
  const nextSprintNumber = count + 1

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-white text-sm transition-colors">← {client.name}</Link>
          <h1 className="text-3xl font-black text-white mt-2">ספרינט חדש #{nextSprintNumber}</h1>
          <p className="text-slate-400 text-sm mt-1">ספרינט 14 יום — חוסם עורקים</p>
        </div>
        <div className="bento-card p-6">
          <SprintForm clientId={clientId} clientName={client.name} sprintNumber={nextSprintNumber} />
        </div>
      </div>
    </div>
  )
}
