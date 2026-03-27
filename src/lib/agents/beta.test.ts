import { describe, expect, it } from 'vitest'
import { simulateRecommendation } from './beta'

describe('beta agent', () => {
  it('returns deterministic percentiles for the same seed', () => {
    const input = {
      interventionType: 'sprint',
      dailyLossEstimate: 1800,
      rankedCases: [
        {
          case_id: '1',
          org_industry: 'tech',
          severity: 'critical',
          intervention_type: 'sprint',
          delta_total_entropy: -2.1,
          j_quotient_recovered: 0.11,
          learning_gain: 0.42,
          lambda_eigenvalue: 1.14,
          similarity_score: 0.91,
          pathology_distance: 0.09,
          rank_score: 0.95,
          similarity_method: 'hybrid' as const,
        },
      ],
      seed: 'fixed-seed',
    }

    const a = simulateRecommendation(input)
    const b = simulateRecommendation(input)

    expect(a.roiPercentiles).toEqual(b.roiPercentiles)
    expect(a.benefitPercentiles).toEqual(b.benefitPercentiles)
    expect(a.sampleCount).toBe(1)
  })
})
