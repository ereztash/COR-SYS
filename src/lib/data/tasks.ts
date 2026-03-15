import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/types/database'

export async function getTasksBySprint(sprintId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tasks').select('*').eq('sprint_id', sprintId).order('created_at')
  if (error) {
    console.error('[data/tasks] getTasksBySprint', sprintId, error.message)
    return []
  }
  return data ?? []
}

export async function getOpenTasks(): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tasks').select('*').neq('status', 'done')
  if (error) {
    console.error('[data/tasks] getOpenTasks', error.message)
    return []
  }
  return data ?? []
}
