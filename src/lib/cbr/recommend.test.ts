import { describe, expect, it } from 'vitest'
import { getRecommendations } from './recommend'

describe('CBR recommendation ranking', () => {
  it('exposes EoC-aware metadata and boldness', () => {
    const result = getRecommendations({
      rankedCases: [
        {
          case_id: '1',
          org_industry: 'tech',
          severity: 'critical',
          intervention_type: 'sprint',
          delta_total_entropy: -2,
          j_quotient_recovered: 0.12,
          learning_gain: 0.4,
          lambda_eigenvalue: 1.02,
          similarity_score: 0.93,
          pathology_distance: 0.08,
          rank_score: 0.95,
          similarity_method: 'hybrid',
        },
        {
          case_id: '2',
          org_industry: 'tech',
          severity: 'critical',
          intervention_type: 'sprint',
          delta_total_entropy: -1.7,
          j_quotient_recovered: 0.08,
          learning_gain: 0.25,
          lambda_eigenvalue: 0.96,
          similarity_score: 0.87,
          pathology_distance: 0.12,
          rank_score: 0.9,
          similarity_method: 'hybrid',
        },
      ],
      snapshot: { j_quotient: 18000 },
    })

    expect(result.recommendations[0].avg_eoc_score).toBeGreaterThan(0.8)
    expect(result.recommendations[0].recommendation_boldness).toBe('bold')
  })
})
