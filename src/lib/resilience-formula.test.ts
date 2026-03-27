import { describe, expect, it } from 'vitest'
import {
  analyzeResilience,
  calculateDynamicKappa,
  calculateEdgeOfChaos,
} from './resilience-formula'

describe('resilience-formula', () => {
  it('derives dynamic kappa when explicit kappa is absent', () => {
    const result = analyzeResilience({ delta_dr: -1.2, delta_psi: 0.8 })

    expect(result.kappa).toBeGreaterThanOrEqual(0.3)
    expect(result.kappa).toBeLessThanOrEqual(0.8)
    expect(result.edge_of_chaos).toBeGreaterThanOrEqual(0)
    expect(result.edge_of_chaos).toBeLessThanOrEqual(1)
  })

  it('keeps explicit kappa override', () => {
    const result = analyzeResilience({ delta_dr: -1, delta_psi: 0.5, kappa: 0.61 })
    expect(result.kappa).toBe(0.61)
  })

  it('calculates dynamic kappa and EoC edges correctly', () => {
    expect(calculateDynamicKappa(0)).toBeCloseTo(0.8)
    expect(calculateDynamicKappa(2)).toBeCloseTo(0.3)
    expect(calculateEdgeOfChaos(1)).toBeCloseTo(1)
    expect(calculateEdgeOfChaos(2.2)).toBeCloseTo(0)
  })
})
