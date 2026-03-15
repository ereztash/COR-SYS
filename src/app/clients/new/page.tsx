import { ClientForm } from '@/components/forms/ClientForm'

export default function NewClientPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/clients" className="text-slate-400 hover:text-white text-sm transition-colors">← לקוחות</a>
          <h1 className="text-3xl font-black text-white mt-2">לקוח חדש</h1>
        </div>
        <div className="bento-card p-6">
          <ClientForm />
        </div>
      </div>
    </div>
  )
}
