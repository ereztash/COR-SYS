import { describe, expect, it } from 'vitest'
import { diagnose } from '@/lib/dsm-engine'
import {
  primaryOrgPathologyFromAxisScores,
  primaryOrgPathologyFromDiagnosis,
  resolveDominantAxisForOrgType,
} from './dsm-synthesis'

describe('resolveDominantAxisForOrgType', () => {
  it('returns raw dominant when not SC', () => {
    expect(resolveDominantAxisForOrgType({ dr: 8, nd: 3, uc: 2, sc: 1 })).toBe('DR')
  })

  it('falls back to highest among DR/ND/UC when SC is dominant', () => {
    expect(resolveDominantAxisForOrgType({ dr: 2, nd: 8, uc: 3, sc: 9 })).toBe('ND')
    expect(resolveDominantAxisForOrgType({ dr: 2, nd: 3, uc: 7, sc: 10 })).toBe('UC')
  })
})

describe('primaryOrgPathologyFromAxisScores', () => {
  it('returns CS when all three core axes are elevated (amplifier)', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 7, nd: 7, uc: 7, sc: 0 })
    expect(r.csAmplifier).toBe(true)
    expect(r.primaryType).toBe('CS')
  })

  it('returns ZSG_CULTURE when ND dominant, DR low, ND high (score-only default)', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 3, nd: 7, uc: 4, sc: 0 })
    expect(r.csAmplifier).toBe(false)
    expect(r.dominantAxis).toBe('ND')
    expect(r.primaryType).toBe('ZSG_CULTURE')
  })

  it('returns ZSG_SAFETY when questionnaire PSI is low', () => {
    const answers = {
      psi1: '1' as const,
      psi2: '1' as const,
      psi3: '1' as const,
      psi4: '1' as const,
      psi5: '1' as const,
      psi6: '1' as const,
      psi7: '1' as const,
    }
    const r = primaryOrgPathologyFromAxisScores({ dr: 3, nd: 7, uc: 4, sc: 0 }, answers)
    expect(r.primaryType).toBe('ZSG_SAFETY')
  })

  it('returns NOD when ND dominant and DR not low', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 6, nd: 8, uc: 4, sc: 0 })
    expect(r.primaryType).toBe('NOD')
  })

  it('returns OLD when UC dominant and ND >= DR', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 3, nd: 6, uc: 8, sc: 0 })
    expect(r.dominantAxis).toBe('UC')
    expect(r.primaryType).toBe('OLD')
  })

  it('returns CLT when UC dominant and ND < DR', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 7, nd: 3, uc: 8, sc: 0 })
    expect(r.primaryType).toBe('CLT')
  })

  it('uses DR/ND/UC tie-break when SC is highest', () => {
    const r = primaryOrgPathologyFromAxisScores({ dr: 4, nd: 8, uc: 5, sc: 10 })
    expect(r.dominantAxis).toBe('SC')
    expect(r.resolvedAxisForOrgType).toBe('ND')
    expect(r.csAmplifier).toBe(false)
    expect(r.primaryType).toBe('ZSG_CULTURE')
  })
})

describe('primaryOrgPathologyFromDiagnosis', () => {
  it('matches axis scores from diagnose()', () => {
    const answers = {
      pathologyZeroSum: 'frequent' as const,
      pathologyNod: 'high' as const,
      pathologyLearning: 'double_loop' as const,
      pathologySemantic: 'low_drift' as const,
      pathologySc: 'medium' as const,
      decisionLatency: 'under_5' as const,
    }
    const d = diagnose(answers)
    const fromDiag = primaryOrgPathologyFromDiagnosis(d, answers)
    const scores = Object.fromEntries(d.pathologies.map((p) => [p.code, p.score])) as {
      DR: number
      ND: number
      UC: number
      SC: number
    }
    const fromScores = primaryOrgPathologyFromAxisScores(
      {
        dr: scores.DR,
        nd: scores.ND,
        uc: scores.UC,
        sc: scores.SC,
      },
      answers
    )
    expect(fromDiag.primaryType).toBe(fromScores.primaryType)
    expect(fromDiag.csAmplifier).toBe(fromScores.csAmplifier)
  })
})
