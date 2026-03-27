import type { DsmDiagnosticSnapshot, InterventionAndFeedback } from '@/types/database'

export type FeedbackLoopType = 'negative' | 'positive' | 'runaway'
export type EmergenceSignal = 'continuous' | 'discontinuous'

export interface EmergenceMonitorResult {
  signal: EmergenceSignal
  severityJump: number
  lambdaShift: number
}

const SEVERITY_ORDER: Record<string, number> = {
  healthy: 0,
  'at-risk': 1,
  critical: 2,
  'systemic-collapse': 3,
  Healthy: 0,
  'At-risk': 1,
  Critical: 2,
  'Systemic-collapse': 3,
}

function severityScore(value: string | null | undefined): number {
  if (!value) return 0
  return SEVERITY_ORDER[value] ?? 0
}

export function classifyFeedbackLoop(
  intervention: Pick<InterventionAndFeedback, 'learning_gain' | 'delta_entropy' | 'delta_j_quotient'> | null
): FeedbackLoopType | null {
  if (!intervention) return null
  const lg = intervention.learning_gain ?? 0
  const deltaEntropy = intervention.delta_entropy ?? 0
  const deltaJ = intervention.delta_j_quotient ?? 0

  if (lg < -0.2 || deltaEntropy > 1 || deltaJ < -0.05) return 'runaway'
  if (lg > 0 || deltaEntropy < 0 || deltaJ > 0) return 'negative'
  return 'positive'
}

export function detectEmergence(
  snapshots: Array<Pick<DsmDiagnosticSnapshot, 'severity_profile' | 'edge_of_chaos_score' | 'total_entropy'>>
): EmergenceMonitorResult {
  if (snapshots.length < 2) {
    return { signal: 'continuous', severityJump: 0, lambdaShift: 0 }
  }

  const prev = snapshots[snapshots.length - 2]
  const current = snapshots[snapshots.length - 1]
  const severityJump = severityScore(current.severity_profile) - severityScore(prev.severity_profile)
  const lambdaShift = Math.abs((current.edge_of_chaos_score ?? 0) - (prev.edge_of_chaos_score ?? 0))
  const entropyJump = Math.abs((current.total_entropy ?? 0) - (prev.total_entropy ?? 0))

  return {
    signal: severityJump >= 1 && (lambdaShift > 0.2 || entropyJump > 1.5) ? 'discontinuous' : 'continuous',
    severityJump,
    lambdaShift,
  }
}
