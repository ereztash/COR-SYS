export type AgentName = 'alpha' | 'beta' | 'gamma' | 'delta'
export type AgentRiskLevel = 'low' | 'medium' | 'high'
export type GovernanceStatus = 'approved' | 'awaiting_approval' | 'blocked'

export interface GovernanceInput {
  agentName: AgentName
  confidence: number
  riskLevel: AgentRiskLevel
  requestedMutation: boolean
  approvalGranted?: boolean
  hardLimitViolations?: string[]
}

export interface GovernanceDecision {
  status: GovernanceStatus
  canWrite: boolean
  autonomy: {
    enabled: boolean
    confidence: number
  }
  humanOversight: {
    required: boolean
    granted: boolean
  }
  codedSafety: {
    passed: boolean
    violations: string[]
  }
}

const MIN_CONFIDENCE_TO_WRITE = 0.45

export function evaluateGovernance(input: GovernanceInput): GovernanceDecision {
  const violations = input.hardLimitViolations ?? []
  if (violations.length > 0) {
    return {
      status: 'blocked',
      canWrite: false,
      autonomy: { enabled: false, confidence: input.confidence },
      humanOversight: { required: input.requestedMutation, granted: !!input.approvalGranted },
      codedSafety: { passed: false, violations },
    }
  }

  if (input.requestedMutation && input.confidence < MIN_CONFIDENCE_TO_WRITE) {
    return {
      status: 'blocked',
      canWrite: false,
      autonomy: { enabled: false, confidence: input.confidence },
      humanOversight: { required: true, granted: !!input.approvalGranted },
      codedSafety: { passed: false, violations: ['confidence_below_minimum'] },
    }
  }

  const requiresApproval = input.requestedMutation && input.riskLevel === 'high'
  if (requiresApproval && !input.approvalGranted) {
    return {
      status: 'awaiting_approval',
      canWrite: false,
      autonomy: { enabled: true, confidence: input.confidence },
      humanOversight: { required: true, granted: false },
      codedSafety: { passed: true, violations: [] },
    }
  }

  return {
    status: 'approved',
    canWrite: input.requestedMutation,
    autonomy: { enabled: true, confidence: input.confidence },
    humanOversight: { required: requiresApproval, granted: !!input.approvalGranted || !requiresApproval },
    codedSafety: { passed: true, violations: [] },
  }
}

export function inferRiskLevel(confidence: number, impactScore: number): AgentRiskLevel {
  if (impactScore >= 0.75 || confidence < 0.35) return 'high'
  if (impactScore >= 0.4 || confidence < 0.55) return 'medium'
  return 'low'
}
