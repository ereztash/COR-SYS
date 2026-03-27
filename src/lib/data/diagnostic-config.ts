import { createClient } from '@/lib/supabase/server'
import type {
  TriggerRuleRow,
  InterventionEvidenceProfileRow,
  GateReviewRow,
} from '@/types/database'

export interface DiagnosticConfigPayload {
  triggerRules: TriggerRuleRow[]
  evidenceProfiles: InterventionEvidenceProfileRow[]
  gateReviews: GateReviewRow[]
}

export async function getDiagnosticConfig(): Promise<DiagnosticConfigPayload> {
  const supabase = await createClient()
  const [triggersRes, evidenceRes, gatesRes] = await Promise.all([
    supabase.from('trigger_rules').select('*').eq('is_active', true).order('id', { ascending: true }),
    supabase.from('intervention_evidence_profiles').select('*').order('intervention_tag', { ascending: true }),
    supabase.from('gate_reviews').select('*').eq('is_active', true).order('week', { ascending: true }),
  ])

  return {
    triggerRules: (triggersRes.data ?? []) as TriggerRuleRow[],
    evidenceProfiles: (evidenceRes.data ?? []) as InterventionEvidenceProfileRow[],
    gateReviews: (gatesRes.data ?? []) as GateReviewRow[],
  }
}
