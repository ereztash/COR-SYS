import { ClientForm } from '@/components/forms/ClientForm'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

export default function NewClientPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/clients" className="text-slate-400 hover:text-white text-sm transition-colors">← לקוחות</a>
          <h1 className="text-3xl font-black text-white mt-2">לקוח חדש</h1>
          <ModeBlurb
            className="mt-2"
            beginner="פותחים לקוח חדש כדי להתחיל אבחון ותוכנית פעולה."
            advanced="Create a new client profile as the base record for diagnosis and execution."
            research="Initialize a new case entity for longitudinal organizational analysis."
          />
        </div>
        <div className="bento-card p-6">
          <ClientForm />
        </div>
      </div>
    </div>
  )
}
