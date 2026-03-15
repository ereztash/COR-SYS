import { createClient } from '@/lib/supabase/server'
import type { Sprint } from '@/types/database'

type SprintWithClient = Sprint & { clients: { name: string; company: string | null } | null }
type SprintWithTasks = Sprint & { tasks: { id: string; status: string }[] }

export async function getSprints(): Promise<SprintWithClient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sprints').select('*, clients(name, company)').order('created_at', { ascending: false })
  if (error) {
    console.error('[data/sprints] getSprints', error.message)
    return []
  }
  return (data ?? []) as SprintWithClient[]
}

export async function getSprintsWithTasks(): Promise<(Sprint & { clients: { id: string; name: string; company: string | null } | null; tasks: { id: string; status: string }[] })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sprints').select('*, clients(id, name, company), tasks(id, status)').order('created_at', { ascending: false })
  if (error) {
    console.error('[data/sprints] getSprintsWithTasks', error.message)
    return []
  }
  return (data ?? []) as (Sprint & { clients: { id: string; name: string; company: string | null } | null; tasks: { id: string; status: string }[] })[]
}

export async function getSprintsByClient(clientId: string): Promise<SprintWithTasks[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sprints').select('*, tasks(id, status)').eq('client_id', clientId).order('created_at', { ascending: false })
  if (error) {
    console.error('[data/sprints] getSprintsByClient', clientId, error.message)
    return []
  }
  return (data ?? []) as SprintWithTasks[]
}

export async function getSprintById(sprintId: string): Promise<Sprint | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sprints').select('*').eq('id', sprintId).single()
  if (error) {
    console.error('[data/sprints] getSprintById', sprintId, error.message)
    return null
  }
  return data
}

export async function getSprintCountByClient(clientId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase.from('sprints').select('id', { count: 'exact', head: true }).eq('client_id', clientId)
  if (error) {
    console.error('[data/sprints] getSprintCountByClient', clientId, error.message)
    return 0
  }
  return count ?? 0
}
