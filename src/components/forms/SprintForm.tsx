'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSprintAction, updateSprintAction } from '@/lib/actions/sprints'
import type { SprintStatus } from '@/types/database'

interface SprintFormProps {
  clientId: string
  clientName: string
  sprintNumber: number
  initial?: { id: string; title: string; start_date: string; end_date: string; status: string; goal: string | null }
}

export function SprintForm({ clientId, clientName, sprintNumber, initial }: SprintFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const defaultEnd = new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: initial?.title ?? `ספרינט ${sprintNumber} — ${clientName}`,
    start_date: initial?.start_date ?? today,
    end_date: initial?.end_date ?? defaultEnd,
    status: initial?.status ?? 'planned',
    goal: initial?.goal ?? '',
  })

  const set = (k: string, v: string) => {
    const updated = { ...form, [k]: v }
    if (k === 'start_date') {
      const start = new Date(v)
      start.setDate(start.getDate() + 13)
      updated.end_date = start.toISOString().split('T')[0]
    }
    setForm(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      client_id: clientId,
      sprint_number: sprintNumber,
      title: form.title,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status as SprintStatus,
      goal: form.goal || null,
    }

    let sprintId = initial?.id
    if (initial?.id) {
      const res = await updateSprintAction(initial.id, clientId, payload)
      if (!res.ok) { setError(res.error ?? ''); setLoading(false); return }
    } else {
      const res = await createSprintAction(payload)
      if (!res.ok) { setError(res.error ?? ''); setLoading(false); return }
      sprintId = res.id ?? sprintId
    }

    router.push(`/clients/${clientId}/sprints/${sprintId}`)
    router.refresh()
  }

  const inputCls = 'w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">{error}</div>}

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">כותרת הספרינט *</label>
        <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">תאריך התחלה</label>
          <input className={inputCls} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">תאריך סיום (14 יום)</label>
          <input className={inputCls} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">סטטוס</label>
        <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="planned">מתוכנן</option>
          <option value="active">פעיל</option>
          <option value="completed">הושלם</option>
          <option value="cancelled">בוטל</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">מטרת הספרינט</label>
        <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.goal} onChange={e => set('goal', e.target.value)}
          placeholder="מה אנחנו רוצים להשיג בסוף 14 הימים האלה?" />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm">
          ביטול
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-colors">
          {loading ? 'שומר...' : initial ? 'עדכן ספרינט' : 'צור ספרינט'}
        </button>
      </div>
    </form>
  )
}
