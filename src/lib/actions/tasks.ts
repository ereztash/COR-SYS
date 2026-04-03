'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TaskStatus } from '@/types/database'
import { isValidUuid, isTaskStatus, isTaskPriority, toFiniteNumber, clampHours } from '@/lib/validation'

type TaskPayload = {
  sprint_id: string
  client_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: string
  estimated_hours: number | null
  due_date: string | null
  tags: string[]
  completed_at: string | null
}

export async function createTaskAction(payload: TaskPayload): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isValidUuid(payload.sprint_id) || !isValidUuid(payload.client_id)) return { ok: false, error: '\u05DE\u05D6\u05D4\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (!isTaskStatus(payload.status) || !isTaskPriority(payload.priority)) return { ok: false, error: '\u05E1\u05D8\u05D8\u05D5\u05E1 \u05D0\u05D5 \u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9\u05D9\u05DD' }
  const safePayload = {
    ...payload,
    estimated_hours: payload.estimated_hours != null ? clampHours(payload.estimated_hours) : null,
  }
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches tasks Insert shape
  const { data, error } = await supabase.from('tasks').insert(safePayload).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath(`/clients/${payload.client_id}/sprints/${payload.sprint_id}`)
  return { ok: true, id: (data as { id: string } | null)?.id }
}

export async function updateTaskAction(id: string, payload: Partial<TaskPayload>): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(id)) return { ok: false, error: '\u05DE\u05D6\u05D4\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (payload.status != null && !isTaskStatus(payload.status)) return { ok: false, error: '\u05E1\u05D8\u05D8\u05D5\u05E1 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (payload.priority != null && !isTaskPriority(payload.priority)) return { ok: false, error: '\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9\u05EA' }
  const safePayload = payload.estimated_hours !== undefined ? { ...payload, estimated_hours: toFiniteNumber(payload.estimated_hours) ?? payload.estimated_hours } : payload
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches tasks Update shape
  const { error } = await supabase.from('tasks').update(safePayload).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  return { ok: true }
}

export async function moveTaskAction(taskId: string, newStatus: TaskStatus, clientId: string, sprintId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(taskId) || !isValidUuid(clientId) || !isValidUuid(sprintId)) return { ok: false, error: '\u05DE\u05D6\u05D4\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (!isTaskStatus(newStatus)) return { ok: false, error: '\u05E1\u05D8\u05D8\u05D5\u05E1 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; partial update is valid
  const { error } = await supabase.from('tasks').update({
    status: newStatus,
    completed_at: newStatus === 'done' ? new Date().toISOString() : null,
  }).eq('id', taskId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath(`/clients/${clientId}/sprints/${sprintId}`)
  return { ok: true }
}

export async function deleteTaskAction(taskId: string, clientId: string, sprintId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(taskId) || !isValidUuid(clientId) || !isValidUuid(sprintId)) return { ok: false, error: '\u05DE\u05D6\u05D4\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath(`/clients/${clientId}/sprints/${sprintId}`)
  return { ok: true }
}
