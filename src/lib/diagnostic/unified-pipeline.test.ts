import { describe, it, expect } from 'vitest'
import {
  runUnifiedTreatmentPipeline,
  stableJsonForPlanCompare,
  DEFAULT_SC_WHEN_MISSING,
} from './unified-pipeline'

describe('runUnifiedTreatmentPipeline', () => {
  it('returns deterministic stableJson for identical inputs', () => {
    const input = {
      scores: { dr: 4, nd: 5, uc: 3, sc: 5 },
      answers: null as null,
      envelope: { t_max: 90 as const, r_max: 5 as const },
    }
    const a = runUnifiedTreatmentPipeline(input)
    const b = runUnifiedTreatmentPipeline(input)
    expect(stableJsonForPlanCompare(a)).toBe(stableJsonForPlanCompare(b))
  })

  it('CS amplifier with high load adds cascade sequencing alert', () => {
    const result = runUnifiedTreatmentPipeline({
      scores: { dr: 7, nd: 7, uc: 8, sc: 5 },
      answers: null,
    })
    expect(result.orgPathology.primaryType).toBe('CS')
    expect(result.orgPathology.csAmplifier).toBe(true)
    expect(result.sequencing_alerts_he.length).toBeGreaterThan(0)
    expect(result.sequencing_alerts_he.some((s) => s.includes('\u05E7\u05E1\u05E7\u05D3\u05D4'))).toBe(true)
  })

  it('NOD with elevated SC applies ND sequencing lock when criteria match', () => {
    const result = runUnifiedTreatmentPipeline({
      scores: { dr: 6, nd: 8, uc: 4, sc: 7 },
      answers: null,
    })
    expect(result.orgPathology.primaryType).toBe('NOD')
    expect(result.orgPathology.csAmplifier).toBe(false)
    const locked = result.items.filter((i) => i.sequencing_locked)
    expect(locked.length).toBeGreaterThan(0)
    expect(locked.some((i) => (i.sequencing_lock_reason_he ?? '').includes('\u05D1\u05E2\u05DC\u05D5\u05EA'))).toBe(true)
  })

  it('extreme envelope does not throw', () => {
    expect(() =>
      runUnifiedTreatmentPipeline({
        scores: { dr: 3, nd: 3, uc: 3 },
        envelope: { t_max: 30 as const, r_max: 1 as const, b_max: 0 },
      })
    ).not.toThrow()
  })

  it('defaults missing SC to DEFAULT_SC_WHEN_MISSING for dominance', () => {
    const withDefault = runUnifiedTreatmentPipeline({
      scores: { dr: 2, nd: 2, uc: 2 },
    })
    const withExplicit = runUnifiedTreatmentPipeline({
      scores: { dr: 2, nd: 2, uc: 2, sc: DEFAULT_SC_WHEN_MISSING },
    })
    expect(withDefault.orgPathology.dominantAxis).toBe(withExplicit.orgPathology.dominantAxis)
  })
})
