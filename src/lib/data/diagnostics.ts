import { createClient } from '@/lib/supabase/server'
import type { ClientDiagnostic, ClientDiagnosticInsert, ClientDiagnosticSummary } from '@/types/database'

export async function getDiagnosticsByClientId(clientId: string): Promise<ClientDiagnostic[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('client_diagnostics')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[data/diagnostics] getDiagnosticsByClientId', clientId, error.message)
    return []
  }
  return (data ?? []) as ClientDiagnostic[]
}

export async function insertDiagnostic(
  clientId: string,
  answers: Record<string, unknown>,
  dsmSummary: ClientDiagnosticSummary
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const insertPayload: ClientDiagnosticInsert = {
    client_id: clientId,
    answers,
    dsm_summary: dsmSummary,
  }
  const { error } = await supabase
    .from('client_diagnostics')
    // @ts-expect-error Postgrest infers insert as never for tables with jsonb
    .insert(insertPayload)
  if (error) {
    console.error('[data/diagnostics] insertDiagnostic', clientId, error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
