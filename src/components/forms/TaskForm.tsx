'use client'
import { useState } from 'react'
import { createTaskAction, updateTaskAction } from '@/lib/actions/tasks'
import type { Task, TaskStatus } from '@/types/database'

interface TaskFormProps {
  sprintId: string
  clientId: string
  initial?: Partial<Task>
  onSuccess: () => void
  onCancel: () => void
}

export function TaskForm({ sprintId, clientId, initial, onSuccess, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'todo',
    priority: initial?.priority ?? 'medium',
    estimated_hours: initial?.estimated_hours?.toString() ?? '',
    due_date: initial?.due_date ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      sprint_id: sprintId,
      client_id: clientId,
      title: form.title,
      description: form.description || null,
      status: form.status as TaskStatus,
      priority: form.priority,
      estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      due_date: form.due_date || null,
      tags: [],
      completed_at: form.status === 'done' ? new Date().toISOString() : null,
    }

    if (initial?.id) {
      await updateTaskAction(initial.id, payload)
    } else {
      await createTaskAction(payload)
    }

    setLoading(false)
    onSuccess()
  }

  const inputCls = 'w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
      <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="כותרת המשימה *" autoFocus />

      <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="תיאור (אופציונלי)" />

      <div className="grid grid-cols-2 gap-2">
        <select className={inputCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
          <option value="critical">קריטי</option>
          <option value="high">גבוה</option>
          <option value="medium">בינוני</option>
          <option value="low">נמוך</option>
        </select>
        <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="todo">לביצוע</option>
          <option value="in_progress">בביצוע</option>
          <option value="done">הושלם</option>
          <option value="blocked">חסום</option>
        </select>
        <input className={inputCls} type="number" step="0.5" value={form.estimated_hours} onChange={e => set('estimated_hours', e.target.value)} placeholder="שעות מוערך" />
        <input className={inputCls} type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors">ביטול</button>
        <button type="submit" disabled={loading} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors disabled:opacity-50">
          {loading ? 'שומר...' : initial?.id ? 'עדכן' : 'הוסף משימה'}
        </button>
      </div>
    </form>
  )
}
