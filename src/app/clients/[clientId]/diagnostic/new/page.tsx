import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientById } from '@/lib/data/clients'
import { getSprintCountByClient } from '@/lib/data'
import { DiagnosticWizard } from './DiagnosticWizard'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function DiagnosticNewPage({ params }: Props) {
  const { clientId } = await params
  const client = await getClientById(clientId)
  if (!client) notFound()
  const sprintCount = await getSprintCountByClient(clientId)

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/clients/${clientId}`}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4 block"
          >
            ← {client.name}
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              ⊕
            </div>
            <h1 className="text-2xl font-black text-white">אבחון מהיר</h1>
          </div>
          <p className="text-slate-400 text-sm">
            9 שאלות · DR / ND / UC · embedding-based pathology matching
          </p>
        </div>

        {/* Wizard */}
        <DiagnosticWizard clientId={clientId} clientName={client.name} sprintCount={sprintCount} />

      </div>
    </div>
  )
}