'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientAction, updateClientAction } from '@/lib/actions/clients'
import type { Client, ClientStatus } from '@/types/database'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

interface ClientFormProps {
  initial?: Partial<Client>
  clientId?: string
}

export function ClientForm({ initial, clientId }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    company: initial?.company ?? '',
    industry: initial?.industry ?? '',
    status: initial?.status ?? 'prospect',
    hourly_rate: initial?.hourly_rate?.toString() ?? '',
    monthly_retainer: initial?.monthly_retainer?.toString() ?? '',
    decision_latency_hours: initial?.decision_latency_hours?.toString() ?? '',
    engagement_start: initial?.engagement_start ?? '',
    notes: initial?.notes ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      company: form.company || null,
      industry: form.industry || null,
      status: form.status as ClientStatus,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      monthly_retainer: form.monthly_retainer ? parseFloat(form.monthly_retainer) : null,
      decision_latency_hours: form.decision_latency_hours ? parseFloat(form.decision_latency_hours) : null,
      engagement_start: form.engagement_start || null,
      notes: form.notes || null,
    }

    if (clientId) {
      const res = await updateClientAction(clientId, payload)
      if (!res.ok) { setError(res.error ?? ''); setLoading(false); return }
      router.push(`/clients/${clientId}`)
    } else {
      const res = await createClientAction(payload)
      if (!res.ok) { setError(res.error ?? ''); setLoading(false); return }
      router.push(res.id ? `/clients/${res.id}` : '/clients')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ModeBlurb
        beginner="ממלאים פרטים בסיסיים כדי שהמערכת תבין את ההקשר של הלקוח."
        advanced="Structured client intake form for operational and economic baseline."
        research="Case metadata capture layer for downstream diagnostics and model learning."
      />
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="שם הלקוח *" required>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="שם מלא" />
        </Field>
        <Field label="חברה">
          <input className={inputCls} value={form.company} onChange={e => set('company', e.target.value)} placeholder="שם החברה" />
        </Field>
        <Field label="תחום / תעשייה">
          <input className={inputCls} value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="הייטק, פינטק, ..." />
        </Field>
        <Field label="סטטוס">
          <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="prospect">פוטנציאלי</option>
            <option value="active">פעיל — בתשלום</option>
            <option value="volunteer">התנדבות</option>
            <option value="paused">מושהה</option>
            <option value="churned">עזב</option>
          </select>
        </Field>
        <Field label="תעריף שעתי (₪)">
          <input className={inputCls} type="number" value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} placeholder="0" />
        </Field>
        <Field label="ריטיינר חודשי (₪)">
          <input className={inputCls} type="number" value={form.monthly_retainer} onChange={e => set('monthly_retainer', e.target.value)} placeholder="0" />
        </Field>
        <Field label="עיכוב החלטה (שעות/שבוע)" hint="כמה שעות בשבוע הלקוח מבזבז על אי-ודאות?">
          <input className={inputCls} type="number" step="0.5" value={form.decision_latency_hours} onChange={e => set('decision_latency_hours', e.target.value)} placeholder="0" />
        </Field>
        <Field label="תאריך תחילת מעורבות">
          <input className={inputCls} type="date" value={form.engagement_start} onChange={e => set('engagement_start', e.target.value)} />
        </Field>
      </div>

      <Field label="הערות">
        <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="פרטים נוספים, הקשר, אבחנות..." />
      </Field>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm">
          ביטול
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-colors">
          {loading ? 'שומר...' : clientId ? 'עדכן לקוח' : 'צור לקוח'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {hint && <p className="text-[10px] text-slate-500 mb-1">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-colors'
