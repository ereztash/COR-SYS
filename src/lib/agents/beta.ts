import type { RankedCase } from '@/lib/cbr/similarity'
import type { RecommendationResult } from '@/types/database'

export interface BetaSimulationInput {
  interventionType: string
  dailyLossEstimate: number
  rankedCases: RankedCase[]
  recommendation?: RecommendationResult
  iterations?: number
  seed?: string
}

export interface BetaPercentiles {
  p5: number
  p50: number
  p95: number
}

export interface BetaSimulationResult {
  interventionType: string
  roiPercentiles: BetaPercentiles
  benefitPercentiles: BetaPercentiles
  riskPercentiles: BetaPercentiles
  sampleCount: number
  seeded: boolean
}

function hashSeed(seed: string): number {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createSeededRng(seed: string) {
  let state = hashSeed(seed)
  return function next() {
    state = Math.imul(1664525, state) + 1013904223
    return (state >>> 0) / 4294967296
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)))
  return sorted[index]
}

function costForIntervention(interventionType: string): number {
  if (interventionType === 'sprint') return 65000
  if (interventionType === 'retainer') return 28000
  if (interventionType === 'live-demo') return 12000
  return 22000
}

function caseBenefit(caseItem: RankedCase, dailyLossEstimate: number): number {
  const entropyComponent = Math.max(0, -(caseItem.delta_total_entropy ?? 0)) * 0.12
  const jqComponent = Math.max(0, caseItem.j_quotient_recovered ?? 0) * 0.6
  const lgComponent = Math.max(0, caseItem.learning_gain ?? 0) * 0.25
  const multiplier = 0.1 + entropyComponent + jqComponent + lgComponent
  return dailyLossEstimate * 90 * multiplier
}

export function simulateRecommendation(input: BetaSimulationInput): BetaSimulationResult {
  const relevantCases = input.rankedCases.filter((item) => item.intervention_type === input.interventionType)
  const iterations = input.iterations ?? 400
  const rng = createSeededRng(input.seed ?? `${input.interventionType}:${relevantCases.length}`)
  const fallbackSuccess = input.recommendation?.success_rate ?? 0.45
  const cost = costForIntervention(input.interventionType)

  const roiSamples: number[] = []
  const benefitSamples: number[] = []
  const riskSamples: number[] = []

  for (let i = 0; i < iterations; i++) {
    const chosenCase =
      relevantCases.length > 0
        ? relevantCases[Math.floor(rng() * relevantCases.length)]
        : null

    const benefitBase = chosenCase
      ? caseBenefit(chosenCase, input.dailyLossEstimate)
      : input.dailyLossEstimate * 90 * (0.08 + fallbackSuccess * 0.35)
    const stochasticNoise = 0.75 + rng() * 0.5
    const benefit = benefitBase * stochasticNoise
    const downside = Math.max(0, cost * (0.25 + rng() * (1 - fallbackSuccess)))
    const roi = (benefit - cost) / cost

    benefitSamples.push(benefit)
    roiSamples.push(roi)
    riskSamples.push(downside)
  }

  return {
    interventionType: input.interventionType,
    roiPercentiles: {
      p5: percentile(roiSamples, 0.05),
      p50: percentile(roiSamples, 0.5),
      p95: percentile(roiSamples, 0.95),
    },
    benefitPercentiles: {
      p5: percentile(benefitSamples, 0.05),
      p50: percentile(benefitSamples, 0.5),
      p95: percentile(benefitSamples, 0.95),
    },
    riskPercentiles: {
      p5: percentile(riskSamples, 0.05),
      p50: percentile(riskSamples, 0.5),
      p95: percentile(riskSamples, 0.95),
    },
    sampleCount: relevantCases.length,
    seeded: true,
  }
}
