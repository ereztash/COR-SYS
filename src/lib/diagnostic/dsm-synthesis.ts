/**
 * DSM Synthesis Layer
 *
 * Single source of truth for mapping axis scores (DR/ND/UC/SC)
 * to DSM-Org pathology types (NOD/ZSG/OLD/CLT/CS) and detecting
 * the CS systemic amplifier and PSG (Psychological Safety Gap).
 *
 * Consolidates logic previously spread across pathology-kb.ts
 * (axisToPathologyType, detectCsAmplifier) and dsm-engine.ts
 * (detectCascadeState) into one coherent mapping layer with
 * explicit rules, thresholds, and optional clinical signals.
 *
 * Key design decisions:
 *   - ZSG = Zero-Sum Game Culture (competition / silo dynamics)
 *   - PSG = Psychological Safety Gap (fear-driven silence, blame)
 *   - CS  = Cascade State (systemic amplifier, not standalone)
 *   - SC axis feeds CLT/NOD depending on context, not a standalone type
 */

import type { DiagnosticAxis } from './questions'
import type { PathologyType, TamSignature } from './pathology-kb'
import { PATHOLOGY_TYPE_KB } from './pathology-kb'

// ─── Input / Output types ────────────────────────────────────────────────────

export interface SynthesisInput {
  /** Axis scores from questionnaire or direct input (0–10 scale) */
  dr: number
  nd: number
  uc: number
  sc: number

  /** Optional clinical signals that sharpen the mapping */
  edmondsonScore?: number    // Edmondson 7-item mean (1–7), lower = worse PSG
  mbiExhaustion?: number     // MBI Emotional Exhaustion subscale (0–54)
  contextSwitchesPerDay?: number
  recurringActionItemPct?: number  // % of retro items that recur
  hotfixRateMultiplier?: number    // current / baseline hotfix rate
}

export interface SynthesisResult {
  /** Primary pathology type (highest confidence) */
  primary: PathologyType

  /** All detected pathology types ranked by confidence (descending) */
  ranked: Array<{ type: PathologyType; confidence: number; reasoning: string }>

  /** CS amplifier active when all axes simultaneously elevated */
  csAmplifier: boolean

  /** PSG detected when Edmondson low or blame indicators present */
  psgDetected: boolean

  /** Dominant questionnaire axis */
  dominantAxis: DiagnosticAxis

  /** Computed T/A/M signature from canonical pathology signatures */
  tamSignature: TamSignature
}

// ─── Thresholds ──────────────────────────────────────────────────────────────

const CS_THRESHOLD = 6
const PSG_EDMONDSON_CUTOFF = 3.5
const HIGH_AXIS = 5
const MODERATE_AXIS = 3

// ─── Core synthesis function ─────────────────────────────────────────────────

export function synthesize(input: SynthesisInput): SynthesisResult {
  const dominantAxis = getDominantAxis(input)
  const csAmplifier = detectCsAmplifier(input)
  const psgDetected = detectPsg(input)

  const candidates = buildCandidates(input, dominantAxis, csAmplifier, psgDetected)
  candidates.sort((a, b) => b.confidence - a.confidence)

  const primary = candidates[0]?.type ?? 'NOD'
  const tamSignature = computeWeightedTam(candidates)

  return {
    primary,
    ranked: candidates,
    csAmplifier,
    psgDetected,
    dominantAxis,
    tamSignature,
  }
}

// ─── Axis dominance ──────────────────────────────────────────────────────────

function getDominantAxis(input: SynthesisInput): DiagnosticAxis {
  const axes: Array<[DiagnosticAxis, number]> = [
    ['DR', input.dr],
    ['ND', input.nd],
    ['UC', input.uc],
    ['SC', input.sc],
  ]
  axes.sort((a, b) => b[1] - a[1])
  return axes[0][0]
}

// ─── CS amplifier detection ──────────────────────────────────────────────────

function detectCsAmplifier(input: SynthesisInput): boolean {
  return input.dr >= CS_THRESHOLD && input.nd >= CS_THRESHOLD && input.uc >= CS_THRESHOLD
}

// ─── PSG detection ───────────────────────────────────────────────────────────

function detectPsg(input: SynthesisInput): boolean {
  if (input.edmondsonScore != null && input.edmondsonScore < PSG_EDMONDSON_CUTOFF) {
    return true
  }
  // Heuristic: high DR + high ND with low UC voice infrastructure signal
  if (input.dr >= HIGH_AXIS && input.nd >= HIGH_AXIS) {
    return true
  }
  return false
}

// ─── Candidate building (the heart of synthesis) ─────────────────────────────

interface Candidate {
  type: PathologyType
  confidence: number
  reasoning: string
}

function buildCandidates(
  input: SynthesisInput,
  dominantAxis: DiagnosticAxis,
  csAmplifier: boolean,
  psgDetected: boolean
): Candidate[] {
  const candidates: Candidate[] = []

  // NOD: ND dominant or high hotfix rate
  const nodConf = computeNodConfidence(input)
  if (nodConf > 0) {
    candidates.push({ type: 'NOD', confidence: nodConf, reasoning: nodReasoning(input) })
  }

  // ZSG: DR dominant + silo dynamics
  const zsgConf = computeZsgConfidence(input)
  if (zsgConf > 0) {
    candidates.push({ type: 'ZSG', confidence: zsgConf, reasoning: zsgReasoning(input) })
  }

  // OLD: recurring failures + learning deficit
  const oldConf = computeOldConfidence(input)
  if (oldConf > 0) {
    candidates.push({ type: 'OLD', confidence: oldConf, reasoning: oldReasoning(input) })
  }

  // CLT: attention axis dominant
  const cltConf = computeCltConfidence(input)
  if (cltConf > 0) {
    candidates.push({ type: 'CLT', confidence: cltConf, reasoning: cltReasoning(input) })
  }

  // CS: systemic amplifier
  if (csAmplifier) {
    candidates.push({
      type: 'CS',
      confidence: 0.95,
      reasoning: `DR=${input.dr.toFixed(1)}, ND=${input.nd.toFixed(1)}, UC=${input.uc.toFixed(1)} — all above ${CS_THRESHOLD}. Cascade State active.`,
    })
  }

  if (candidates.length === 0) {
    candidates.push({ type: 'NOD', confidence: 0.1, reasoning: 'Default — no strong signal detected.' })
  }

  return candidates
}

// ─── Per-pathology confidence scoring ────────────────────────────────────────

function computeNodConfidence(input: SynthesisInput): number {
  let conf = 0
  if (input.nd >= HIGH_AXIS) conf += 0.4
  else if (input.nd >= MODERATE_AXIS) conf += 0.2

  if (input.hotfixRateMultiplier != null && input.hotfixRateMultiplier >= 2) conf += 0.3
  if (input.dr >= HIGH_AXIS && input.nd >= MODERATE_AXIS) conf += 0.1
  if (input.sc >= HIGH_AXIS) conf += 0.1 // SC feeds NOD via structural ambiguity

  return Math.min(1, conf)
}

function nodReasoning(input: SynthesisInput): string {
  const parts: string[] = []
  if (input.nd >= HIGH_AXIS) parts.push(`ND=${input.nd.toFixed(1)} (high)`)
  if (input.hotfixRateMultiplier != null) parts.push(`Hotfix x${input.hotfixRateMultiplier.toFixed(1)}`)
  if (input.sc >= HIGH_AXIS) parts.push('SC feeding NOD')
  return parts.join('; ') || 'ND elevated'
}

function computeZsgConfidence(input: SynthesisInput): number {
  let conf = 0
  if (input.dr >= HIGH_AXIS) conf += 0.35
  else if (input.dr >= MODERATE_AXIS) conf += 0.15

  if (input.nd >= MODERATE_AXIS && input.dr >= HIGH_AXIS) conf += 0.15
  // ZSG distinct from PSG: ZSG is competition-driven, not fear-driven
  if (input.sc >= HIGH_AXIS) conf += 0.1

  // If PSG is strong but DR is low, it's not ZSG
  if (input.dr < MODERATE_AXIS) conf *= 0.3

  return Math.min(1, conf)
}

function zsgReasoning(input: SynthesisInput): string {
  const parts: string[] = []
  if (input.dr >= HIGH_AXIS) parts.push(`DR=${input.dr.toFixed(1)} (high competition)`)
  if (input.nd >= MODERATE_AXIS) parts.push('ND moderate+ (blame dynamics)')
  return parts.join('; ') || 'DR elevated'
}

function computeOldConfidence(input: SynthesisInput): number {
  let conf = 0
  if (input.uc >= HIGH_AXIS && input.nd >= MODERATE_AXIS) conf += 0.4
  else if (input.uc >= MODERATE_AXIS) conf += 0.15

  if (input.recurringActionItemPct != null && input.recurringActionItemPct >= 40) conf += 0.3
  if (input.nd >= HIGH_AXIS) conf += 0.1 // NOD → OLD cascade

  return Math.min(1, conf)
}

function oldReasoning(input: SynthesisInput): string {
  const parts: string[] = []
  if (input.uc >= HIGH_AXIS) parts.push(`UC=${input.uc.toFixed(1)} (calibration deficit)`)
  if (input.recurringActionItemPct != null) parts.push(`Recurring items ${input.recurringActionItemPct}%`)
  if (input.nd >= HIGH_AXIS) parts.push('NOD→OLD cascade')
  return parts.join('; ') || 'UC+ND elevated'
}

function computeCltConfidence(input: SynthesisInput): number {
  let conf = 0
  if (input.uc >= HIGH_AXIS && input.dr < HIGH_AXIS) conf += 0.35
  else if (input.uc >= MODERATE_AXIS) conf += 0.15

  if (input.contextSwitchesPerDay != null && input.contextSwitchesPerDay >= 15) conf += 0.3
  if (input.sc >= HIGH_AXIS) conf += 0.15 // SC amplifies CLT

  // Distinguish CLT from CS: CLT is architectural, CS is emotional
  if (input.mbiExhaustion != null && input.mbiExhaustion > 27) conf *= 0.5

  return Math.min(1, conf)
}

function cltReasoning(input: SynthesisInput): string {
  const parts: string[] = []
  if (input.uc >= HIGH_AXIS) parts.push(`UC=${input.uc.toFixed(1)} (cognitive overload)`)
  if (input.contextSwitchesPerDay != null) parts.push(`${input.contextSwitchesPerDay} ctx switches/day`)
  if (input.sc >= HIGH_AXIS) parts.push('SC amplifying CLT')
  return parts.join('; ') || 'UC elevated'
}

// ─── T/A/M computation ───────────────────────────────────────────────────────

function computeWeightedTam(candidates: Candidate[]): TamSignature {
  let totalWeight = 0
  let wT = 0, wA = 0, wM = 0

  for (const c of candidates) {
    if (c.confidence < 0.1) continue
    const entry = PATHOLOGY_TYPE_KB.find(p => p.type === c.type)
    if (!entry) continue

    const w = c.confidence
    wT += entry.tam.t * w
    wA += entry.tam.a * w
    wM += entry.tam.m * w
    totalWeight += w
  }

  if (totalWeight === 0) return { t: 1, a: 1, m: 1 }
  return {
    t: Math.min(5, Math.round((wT / totalWeight) * 10) / 10),
    a: Math.min(5, Math.round((wA / totalWeight) * 10) / 10),
    m: Math.min(5, Math.round((wM / totalWeight) * 10) / 10),
  }
}

// ─── Convenience re-exports for backward compatibility ───────────────────────

export { getDominantAxis as synthesisGetDominantAxis }
export { detectCsAmplifier as synthesisDetectCsAmplifier }
