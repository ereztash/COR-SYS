import { getClientById } from '@/lib/data/clients'
import { notFound } from 'next/navigation'
import { ClientForm } from '@/components/forms/ClientForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const client = await getClientById(clientId)
  if (!client) notFound()

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-white text-sm transition-colors">← {client.name}</Link>
          <h1 className="text-3xl font-black text-white mt-2">עריכת לקוח</h1>
        </div>
        <div className="bento-card p-6">
          <ClientForm initial={client} clientId={clientId} />
        </div>
      </div>
    </div>
  )
}
