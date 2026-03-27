'use server'

/**
 * Diagnostic Sprint Creator
 *
 * Creates a sprint + 3 tasks from a diagnostic action plan in a single round-trip.
 * Called from DiagnosticWizard after diagnosis is complete.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'
import type { ActionPlanItem } from '@/lib/diagnostic/action-plan'
import type { PathologyProfile } from '@/lib/diagnostic/pathology-kb'
import { PROFILE_LABELS } from '@/lib/diagnostic/action-plan'
import type { Sprint, Task } from '@/types/database'

interface CreateDiagnosticSprintInput {
  clientId: string
  profile: PathologyProfile
  dominantAxis: string
  dr: number
  nd: number
  uc: number
  interventions: ActionPlanItem[]
  sprintNumber: number
}

export async function createDiagnosticSprintAction(
  input: CreateDiagnosticSprintInput
): Promise<{ ok: boolean; error?: string; sprintId?: string }> {
  if (!isValidUuid(input.clientId)) return { ok: false, error: 'מזהה לקוח לא חוקי' }

  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const end14 = new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0]

  const profileLabel = PROFILE_LABELS[input.profile] ?? input.profile
  const sprintTitle = `ספרינט אבחון — ${profileLabel} | ${input.dominantAxis} ↑`
  const goal = `DR ${input.dr.toFixed(1)} · ND ${input.nd.toFixed(1)} · UC ${input.uc.toFixed(1)} — ${input.interventions.map(i => i.title_he).join(' / ')}`
  const sprintPayload: Pick<Sprint, 'client_id' | 'sprint_number' | 'title' | 'start_date' | 'end_date' | 'status' | 'goal'> = {
    client_id: input.clientId,
    sprint_number: input.sprintNumber,
    title: sprintTitle,
    start_date: today,
    end_date: end14,
    status: 'active',
    goal,
  }

  const { data: sprint, error: sprintErr } = await supabase
    .from('sprints')
    .insert(sprintPayload as never)
    .select('id')
    .single()

  if (sprintErr || !sprint) {
    return { ok: false, error: sprintErr?.message ?? 'שגיאה ביצירת ספרינט' }
  }

  const sprintId = (sprint as { id: string }).id

  // Create 3 tasks from interventions
  const tasks: Pick<Task, 'sprint_id' | 'client_id' | 'title' | 'description' | 'status' | 'priority' | 'estimated_hours' | 'due_date' | 'tags' | 'completed_at'>[] =
    input.interventions.map((item, i) => ({
    sprint_id: sprintId,
    client_id: input.clientId,
    title: item.title_he,
    description: `${item.what_he}\n\nמדד הצלחה: ${item.metric_he}\n\nמנגנון: ${item.why_he}`,
    status: 'todo' as const,
    priority: i === 0 ? 'critical' : i === 1 ? 'high' : 'medium',
    estimated_hours: item.horizon === '14d' ? 4 : item.horizon === '30d' ? 8 : 16,
    due_date: item.horizon === '14d' ? end14 : null,
    tags: [item.axis, item.tag],
    completed_at: null,
  }))

  const { error: tasksErr } = await supabase.from('tasks').insert(tasks as never)

  if (tasksErr) {
    return { ok: false, error: tasksErr.message }
  }

  revalidatePath('/')
  revalidatePath(`/clients/${input.clientId}`)
  revalidatePath(`/clients/${input.clientId}/sprints/${sprintId}`)

  return { ok: true, sprintId }
}