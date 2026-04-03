import { describe, it, expect } from 'vitest'
import { computeDiagnostic } from './diagnostic'

/** Minimal all-high pathology answers (reused to avoid duplication). */
const ALL_HIGH_ANSWERS = {
  pathologyZeroSum: 'frequent' as const,
  pathologyNod: 'high' as const,
  pathologyLearning: 'single_loop' as const,
  pathologySemantic: 'high_drift' as const,
  pathologySc: 'high' as const,
  decisionLatency: 'over_15' as const,
}

describe('computeDiagnostic', () => {
  it('merges operating_context from client into plan summary when answers omit it', () => {
    const r = computeDiagnostic(
      'Solo',
      { companySize: 'oms_solo' } as QuestionnaireAnswer,
      { operating_context: 'one_man_show' }
    )
    expect(r.planResult.summary).toContain('One man show')
  })

  it('returns plan, dsmDiagnosis, orgPathology, edges, protocols; plan title includes client name', () => {
    const result = computeDiagnostic('Acme Corp', {
      pathologyZeroSum: 'occasional',
      pathologyNod: 'medium',
      pathologyLearning: 'mixed',
      pathologySemantic: 'medium_drift',
      decisionLatency: '5_to_15',
      urgencyLevel: 'medium',
      companySize: '50_150',
      interventionGoal: 'both',
    })

    expect(result).toBeDefined()
    expect(result.planResult).toBeDefined()
    expect(result.planResult.title).toBe('\u05EA\u05D5\u05DB\u05E0\u05D9\u05EA \u05E2\u05E1\u05E7\u05D9\u05EA — Acme Corp')
    expect(result.dsmDiagnosis).toBeDefined()
    expect(result.orgPathology).toBeDefined()
    expect(result.orgPathology).toHaveProperty('primaryType')
    expect(result.orgPathology).toHaveProperty('csAmplifier')
    expect(result.comorbidityEdges).toBeDefined()
    expect(result.interventionProtocols).toBeDefined()
    expect(result.unifiedTreatmentPlan).toBeDefined()
    expect(Array.isArray(result.unifiedTreatmentPlan.items)).toBe(true)
    expect(result.unifiedTreatmentPlan.pipelineVersion).toBeTruthy()
    expect(result.ignition).toBeNull()
  })

  it('dsmDiagnosis has expected shape', () => {
    const result = computeDiagnostic('Org', {
      pathologyZeroSum: 'occasional',
      pathologyNod: 'low',
      pathologyLearning: 'double_loop',
      pathologySemantic: 'low_drift',
      decisionLatency: 'under_5',
    })
    const d = result.dsmDiagnosis
    expect(d).toHaveProperty('severityProfile')
    expect(d).toHaveProperty('codes')
    expect(d).toHaveProperty('pathologies')
    expect(Array.isArray(d.pathologies)).toBe(true)
  })

  it('comorbidityEdges is an array', () => {
    const result = computeDiagnostic('Org', {})
    expect(Array.isArray(result.comorbidityEdges)).toBe(true)
  })

  it('interventionProtocols is an array', () => {
    const result = computeDiagnostic('Org', {})
    expect(Array.isArray(result.interventionProtocols)).toBe(true)
  })

  // ─── Edge case: empty answers ─────────────────────────────────────────────

  it('does not throw for empty answers {}', () => {
    expect(() => computeDiagnostic('Empty', {})).not.toThrow()
  })

  it('returns healthy or live-demo defaults for empty answers', () => {
    const result = computeDiagnostic('Empty', {})
    expect(result.planResult.recommendedChannelId).toBe('l1')
    expect(result.planResult.recommendedOptionId).toBe('live-demo')
    expect(['healthy', 'at-risk']).toContain(result.dsmDiagnosis.severityProfile)
  })

  // ─── Edge case: all-high answers ─────────────────────────────────────────

  it('all-high answers: systemic-collapse, comorbidity edges, protocols, and CS org type', () => {
    const result = computeDiagnostic('Crisis Corp', {
      ...ALL_HIGH_ANSWERS,
      urgencyLevel: 'high',
      companySize: 'over_300',
      interventionGoal: 'both',
    })
    expect(result.dsmDiagnosis.severityProfile).toBe('systemic-collapse')
    expect(result.dsmDiagnosis.codes).toEqual(['DR-3', 'ND-3', 'UC-3', 'SC-3'])
    expect(result.orgPathology.csAmplifier).toBe(true)
    expect(result.orgPathology.primaryType).toBe('CS')
    expect(result.interventionProtocols.length).toBeGreaterThan(0)
    expect(result.unifiedTreatmentPlan.items.length).toBeGreaterThan(0)
    expect(result.comorbidityEdges.length).toBeGreaterThan(0)
  })

  // ─── Edge case: partial answers ───────────────────────────────────────────

  it('does not throw for partial answers (only ICP fields)', () => {
    expect(() =>
      computeDiagnostic('Partial', {
        companySize: '50_150',
        urgencyLevel: 'high',
        interventionGoal: 'reduce_latency',
      })
    ).not.toThrow()
  })

  it('does not throw for partial answers (only pathology fields)', () => {
    expect(() =>
      computeDiagnostic('Partial', {
        pathologyZeroSum: 'occasional',
        pathologyNod: 'medium',
      })
    ).not.toThrow()
  })

  it('partial high pathology yields at-risk or higher severity', () => {
    const result = computeDiagnostic('Partial', {
      pathologyZeroSum: 'frequent',
      pathologyNod: 'low',
      pathologyLearning: 'double_loop',
      pathologySemantic: 'low_drift',
      decisionLatency: 'under_5',
    })
    const validProfiles = ['at-risk', 'critical', 'systemic-collapse']
    expect(validProfiles).toContain(result.dsmDiagnosis.severityProfile)
  })

  it('ignition is null when not one_man_show', () => {
    expect(computeDiagnostic('Org', { companySize: '50_150' }).ignition).toBeNull()
  })

  it('ignition profile when OMS and ignition questionnaire filled', () => {
    const result = computeDiagnostic('Solo', {
      operatingContext: 'one_man_show',
      companySize: 'oms_solo',
      ignitionPrimaryVector: 'internal_push',
      ignitionDominantTrap: 'prep_trap',
      ignitionLastCommercialAsk: 'within_30d',
    })
    expect(result.ignition).not.toBeNull()
    expect(result.ignition?.primaryVector).toBe('internal_push')
    expect(result.planResult.dynamicSummary.ignitionParagraph).toBeTruthy()
  })
})
