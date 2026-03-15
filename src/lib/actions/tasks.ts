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
  if (!isValidUuid(payload.sprint_id) || !isValidUuid(payload.client_id)) return { ok: false, error: 'מזהה לא חוקי' }
  if (!isTaskStatus(payload.status) || !isTaskPriority(payload.priority)) return { ok: false, error: 'סטטוס או עדיפות לא חוקיים' }
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
  if (!isValidUuid(id)) return { ok: false, error: 'מזהה לא חוקי' }
  if (payload.status != null && !isTaskStatus(payload.status)) return { ok: false, error: 'סטטוס לא חוקי' }
  if (payload.priority != null && !isTaskPriority(payload.priority)) return { ok: false, error: 'עדיפות לא חוקית' }
  const safePayload = payload.estimated_hours !== undefined ? { ...payload, estimated_hours: toFiniteNumber(payload.estimated_hours) ?? payload.estimated_hours } : payload
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches tasks Update shape
  const { error } = await supabase.from('tasks').update(safePayload).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  return { ok: true }
}

export async function moveTaskAction(taskId: string, newStatus: TaskStatus, clientId: string, sprintId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(taskId) || !isValidUuid(clientId) || !isValidUuid(sprintId)) return { ok: false, error: 'מזהה לא חוקי' }
  if (!isTaskStatus(newStatus)) return { ok: false, error: 'סטטוס לא חוקי' }
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
  if (!isValidUuid(taskId) || !isValidUuid(clientId) || !isValidUuid(sprintId)) return { ok: false, error: 'מזהה לא חוקי' }
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath(`/clients/${clientId}/sprints/${sprintId}`)
  return { ok: true }
}
