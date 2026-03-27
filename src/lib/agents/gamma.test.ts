import { describe, expect, it } from 'vitest'
import { computeTokenKlDivergence } from './gamma'

describe('gamma agent', () => {
  it('shows higher KL divergence when declared and observed narratives diverge', () => {
    const aligned = computeTokenKlDivergence(
      ['strategy trust learning'],
      ['strategy trust learning']
    )
    const drifted = computeTokenKlDivergence(
      ['strategy trust learning'],
      ['blame latency silo escalation']
    )

    expect(aligned).toBeLessThan(drifted)
  })
})
