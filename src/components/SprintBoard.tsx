'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moveTaskAction, deleteTaskAction } from '@/lib/actions/tasks'
import { TaskForm } from '@/components/forms/TaskForm'
import type { Task } from '@/types/database'

const COLUMNS: { key: Task['status']; label: string; color: string; dot: string }[] = [
  { key: 'todo', label: 'לביצוע', color: 'border-slate-600', dot: 'bg-slate-500' },
  { key: 'in_progress', label: 'בביצוע', color: 'border-blue-600', dot: 'bg-blue-500' },
  { key: 'blocked', label: 'חסום', color: 'border-red-600', dot: 'bg-red-500' },
  { key: 'done', label: 'הושלם', color: 'border-emerald-600', dot: 'bg-emerald-500' },
]

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-slate-500/20 text-slate-400',
}
const PRIORITY_LABELS: Record<string, string> = {
  critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך'
}

interface SprintBoardProps {
  sprintId: string
  clientId: string
  initialTasks: Task[]
}

export function SprintBoard({ sprintId, clientId, initialTasks }: SprintBoardProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState<Task['status'] | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [, startTransition] = useTransition()

  async function moveTask(taskId: string, newStatus: Task['status']) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await moveTaskAction(taskId, newStatus, clientId, sprintId)
  }

  async function deleteTask(taskId: string) {
    if (!confirm('למחוק משימה זו?')) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await deleteTaskAction(taskId, clientId, sprintId)
  }

  function refresh() {
    setShowForm(null)
    setEditTask(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key)
        return (
          <div key={col.key} className={`bento-card p-4 border-t-2 ${col.color} flex flex-col gap-3`}>
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                <h3 className="text-sm font-bold text-slate-200">{col.label}</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <button onClick={() => setShowForm(col.key)}
                className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors">
                +
              </button>
            </div>

            {/* Add form */}
            {showForm === col.key && (
              <TaskForm
                sprintId={sprintId}
                clientId={clientId}
                initial={{ status: col.key }}
                onSuccess={refresh}
                onCancel={() => setShowForm(null)}
              />
            )}

            {/* Tasks */}
            <div className="space-y-2 flex-1">
              {colTasks.map(task => (
                <div key={task.id}>
                  {editTask?.id === task.id ? (
                    <TaskForm
                      sprintId={sprintId}
                      clientId={clientId}
                      initial={task}
                      onSuccess={refresh}
                      onCancel={() => setEditTask(null)}
                    />
                  ) : (
                    <TaskCard
                      task={task}
                      onEdit={() => setEditTask(task)}
                      onDelete={() => deleteTask(task.id)}
                      onMove={moveTask}
                    />
                  )}
                </div>
              ))}
            </div>

            {colTasks.length === 0 && showForm !== col.key && (
              <button onClick={() => setShowForm(col.key)}
                className="text-xs text-slate-600 hover:text-slate-400 text-center py-4 border border-dashed border-slate-800 rounded-xl transition-colors">
                + הוסף משימה
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({ task, onEdit, onDelete, onMove }: {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onMove: (id: string, s: Task['status']) => void
}) {
  const [showMove, setShowMove] = useState(false)
  const nextStatuses = COLUMNS.filter(c => c.key !== task.status)

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-white font-medium leading-tight flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="w-5 h-5 rounded bg-slate-700 hover:bg-blue-600 text-[10px] text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="ערוך">✏</button>
          <button onClick={() => setShowMove(!showMove)} className="w-5 h-5 rounded bg-slate-700 hover:bg-emerald-600 text-[10px] text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="העבר">→</button>
          <button onClick={onDelete} className="w-5 h-5 rounded bg-slate-700 hover:bg-red-600 text-[10px] text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="מחק">×</button>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.estimated_hours && (
          <span className="text-[10px] text-slate-500">{task.estimated_hours}h</span>
        )}
        {task.due_date && (
          <span className="text-[10px] text-slate-500">⏰ {task.due_date}</span>
        )}
      </div>

      {showMove && (
        <div className="mt-2 flex flex-wrap gap-1">
          {nextStatuses.map(s => (
            <button key={s.key} onClick={() => { onMove(task.id, s.key); setShowMove(false) }}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              → {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
