import { describe, expect, it } from 'vitest'
import { classifyFeedbackLoop, detectEmergence } from './feedback-loop'

describe('feedback loop monitoring', () => {
  it('classifies runaway loops from negative outcomes', () => {
    expect(
      classifyFeedbackLoop({
        learning_gain: -0.4,
        delta_entropy: 1.2,
        delta_j_quotient: -0.1,
      })
    ).toBe('runaway')
  })

  it('detects discontinuous emergence on sharp severity jump', () => {
    const result = detectEmergence([
      {
        severity_profile: 'At-risk',
        edge_of_chaos_score: 0.82,
        total_entropy: 6.1,
      },
      {
        severity_profile: 'Critical',
        edge_of_chaos_score: 0.41,
        total_entropy: 8.3,
      },
    ])

    expect(result.signal).toBe('discontinuous')
    expect(result.severityJump).toBeGreaterThan(0)
  })
})
