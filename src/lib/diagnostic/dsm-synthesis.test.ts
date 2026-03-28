import { describe, it, expect } from 'vitest'
import { synthesize, type SynthesisInput } from './dsm-synthesis'

const base: SynthesisInput = { dr: 1, nd: 1, uc: 1, sc: 1 }

describe('synthesize', () => {
  it('returns NOD as default when no strong signals', () => {
    const r = synthesize(base)
    expect(r.primary).toBe('NOD')
    expect(r.csAmplifier).toBe(false)
    expect(r.psgDetected).toBe(false)
  })

  it('detects NOD when ND axis is high', () => {
    const r = synthesize({ ...base, nd: 7 })
    expect(r.primary).toBe('NOD')
    expect(r.ranked[0].type).toBe('NOD')
  })

  it('detects ZSG when DR axis is dominant and high', () => {
    const r = synthesize({ ...base, dr: 8, nd: 3 })
    expect(r.ranked.find(c => c.type === 'ZSG')).toBeDefined()
    expect(r.ranked.find(c => c.type === 'ZSG')!.confidence).toBeGreaterThan(0.3)
  })

  it('detects OLD when UC high + ND moderate', () => {
    const r = synthesize({ ...base, uc: 7, nd: 4 })
    expect(r.ranked.find(c => c.type === 'OLD')).toBeDefined()
    expect(r.ranked.find(c => c.type === 'OLD')!.confidence).toBeGreaterThan(0.3)
  })

  it('detects CLT when UC high + DR low', () => {
    const r = synthesize({ ...base, uc: 7, dr: 2, sc: 6 })
    expect(r.ranked.find(c => c.type === 'CLT')).toBeDefined()
    expect(r.ranked.find(c => c.type === 'CLT')!.confidence).toBeGreaterThan(0.3)
  })

  it('detects CS amplifier when all three core axes >= 6', () => {
    const r = synthesize({ ...base, dr: 7, nd: 8, uc: 6, sc: 5 })
    expect(r.csAmplifier).toBe(true)
    expect(r.ranked.find(c => c.type === 'CS')).toBeDefined()
  })

  it('does NOT detect CS when one axis is below 6', () => {
    const r = synthesize({ ...base, dr: 7, nd: 5.9, uc: 6, sc: 5 })
    expect(r.csAmplifier).toBe(false)
  })

  it('detects PSG when Edmondson score is below cutoff', () => {
    const r = synthesize({ ...base, edmondsonScore: 2.8 })
    expect(r.psgDetected).toBe(true)
  })

  it('detects PSG heuristically when DR + ND both high', () => {
    const r = synthesize({ ...base, dr: 6, nd: 6 })
    expect(r.psgDetected).toBe(true)
  })

  it('does not detect PSG when Edmondson above cutoff and axes low', () => {
    const r = synthesize({ ...base, edmondsonScore: 5.2 })
    expect(r.psgDetected).toBe(false)
  })

  it('returns correct dominant axis', () => {
    expect(synthesize({ ...base, sc: 9 }).dominantAxis).toBe('SC')
    expect(synthesize({ ...base, dr: 9 }).dominantAxis).toBe('DR')
    expect(synthesize({ ...base, uc: 9 }).dominantAxis).toBe('UC')
    expect(synthesize({ ...base, nd: 9 }).dominantAxis).toBe('ND')
  })

  it('boosts NOD confidence with high hotfix rate', () => {
    const withHotfix = synthesize({ ...base, nd: 4, hotfixRateMultiplier: 3 })
    const without = synthesize({ ...base, nd: 4 })
    const nodWith = withHotfix.ranked.find(c => c.type === 'NOD')!.confidence
    const nodWithout = without.ranked.find(c => c.type === 'NOD')!.confidence
    expect(nodWith).toBeGreaterThan(nodWithout)
  })

  it('boosts OLD confidence with high recurring action items', () => {
    const r = synthesize({ ...base, uc: 6, nd: 4, recurringActionItemPct: 55 })
    const old = r.ranked.find(c => c.type === 'OLD')
    expect(old).toBeDefined()
    expect(old!.confidence).toBeGreaterThan(0.5)
  })

  it('produces valid T/A/M signature', () => {
    const r = synthesize({ ...base, nd: 8 })
    expect(r.tamSignature.t).toBeGreaterThanOrEqual(1)
    expect(r.tamSignature.t).toBeLessThanOrEqual(5)
    expect(r.tamSignature.a).toBeGreaterThanOrEqual(1)
    expect(r.tamSignature.a).toBeLessThanOrEqual(5)
    expect(r.tamSignature.m).toBeGreaterThanOrEqual(1)
    expect(r.tamSignature.m).toBeLessThanOrEqual(5)
  })

  it('CLT confidence reduced when MBI exhaustion high (CS takes over)', () => {
    const withMbi = synthesize({ ...base, uc: 7, dr: 2, mbiExhaustion: 30 })
    const noMbi = synthesize({ ...base, uc: 7, dr: 2 })
    const cltWith = withMbi.ranked.find(c => c.type === 'CLT')!.confidence
    const cltNo = noMbi.ranked.find(c => c.type === 'CLT')!.confidence
    expect(cltWith).toBeLessThan(cltNo)
  })
})
