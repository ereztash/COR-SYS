import { describe, it, expect } from 'vitest'
import { computeDiagnostic } from './diagnostic'

/** Minimal all-high pathology answers (reused to avoid duplication). */
const ALL_HIGH_ANSWERS = {
  pathologyZeroSum: 'frequent' as const,
  pathologyNod: 'high' as const,
  pathologyLearning: 'single_loop' as const,
  pathologySemantic: 'high_drift' as const,
  decisionLatency: 'over_15' as const,
}

describe('computeDiagnostic', () => {
  it('returns all four result fields; plan title includes client name', () => {
    const result = computeDiagnostic('Acme Corp', {
      pathologyZeroSum: 'occasional',
      pathologyNod: 'medium',
      pathologyLearning: 'mixed',
      pathologySemantic: 'medium_drift',
      decisionLatency: '5_to_15',
      urgencyLevel: 'medium',
      companySize: '50_to_200',
      interventionGoal: 'full_transformation',
    })

    expect(result).toBeDefined()
    expect(result.planResult).toBeDefined()
    expect(result.planResult.title).toBe('תוכנית עסקית — Acme Corp')
    expect(result.dsmDiagnosis).toBeDefined()
    expect(result.comorbidityEdges).toBeDefined()
    expect(result.interventionProtocols).toBeDefined()
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
    expect(result.dsmDiagnosis.severityProfile).toBe('healthy')
  })

  // ─── Edge case: all-high answers ─────────────────────────────────────────

  it('all-high answers: systemic-collapse, comorbidity edges, and protocols', () => {
    const result = computeDiagnostic('Crisis Corp', {
      ...ALL_HIGH_ANSWERS,
      urgencyLevel: 'crisis',
      companySize: 'over_1000',
      interventionGoal: 'full_transformation',
    })
    expect(result.dsmDiagnosis.severityProfile).toBe('systemic-collapse')
    expect(result.dsmDiagnosis.codes).toEqual(['DR-3', 'ND-3', 'UC-3'])
    expect(result.interventionProtocols.length).toBeGreaterThan(0)
    expect(result.comorbidityEdges.length).toBeGreaterThan(0)
  })

  // ─── Edge case: partial answers ───────────────────────────────────────────

  it('does not throw for partial answers (only ICP fields)', () => {
    expect(() =>
      computeDiagnostic('Partial', {
        companySize: '50_to_200',
        urgencyLevel: 'high',
        interventionGoal: 'process_fix',
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
})
