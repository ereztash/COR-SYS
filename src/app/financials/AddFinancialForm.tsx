'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFinancialAction } from '@/lib/actions/financials'

export function AddFinancialForm({ clients }: { clients: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const now = new Date()
  const [form, setForm] = useState({
    client_id: clients[0]?.id ?? '',
    period_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    revenue: '',
    invoiced: false,
    paid_date: '',
    notes: '',
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await createFinancialAction({
      client_id: form.client_id,
      period_month: form.period_month,
      revenue: parseFloat(form.revenue) || 0,
      invoiced: form.invoiced,
      paid_date: form.paid_date || null,
      notes: form.notes || null,
    })
    setLoading(false)
    setForm(f => ({ ...f, revenue: '', paid_date: '', notes: '' }))
    router.refresh()
  }

  const inputCls = 'w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select className={inputCls} value={form.client_id} onChange={e => set('client_id', e.target.value)} required>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className={inputCls} type="month" value={form.period_month.slice(0, 7)}
        onChange={e => set('period_month', `${e.target.value}-01`)} />
      <input className={inputCls} type="number" value={form.revenue} onChange={e => set('revenue', e.target.value)}
        placeholder="סכום (₪)" required />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="invoiced" checked={form.invoiced} onChange={e => set('invoiced', e.target.checked)}
          className="w-4 h-4 rounded" />
        <label htmlFor="invoiced" className="text-xs text-slate-400">הוחשבן</label>
      </div>
      <input className={inputCls} type="date" value={form.paid_date} onChange={e => set('paid_date', e.target.value)}
        placeholder="תאריך תשלום" />
      <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.notes}
        onChange={e => set('notes', e.target.value)} placeholder="הערות" />
      <button type="submit" disabled={loading || clients.length === 0}
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-colors">
        {loading ? 'שומר...' : 'הוסף רשומה'}
      </button>
      {clients.length === 0 && <p className="text-xs text-red-400">הוסף לקוח תחילה</p>}
    </form>
  )
}
