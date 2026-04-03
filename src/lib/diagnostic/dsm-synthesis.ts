/**
 * DSM-Org synthesis Γ\u05D0\u05E4 single mapping from axis scores (DR/ND/UC/SC) to
 * organizational PathologyType (NOD / ZSG_SAFETY / ZSG_CULTURE / OLD / CLT / CS).
 *
 * ## Where this sits in the product
 *
 * - **Long questionnaire** (`diagnose` in dsm-engine): answers Γ\u05D6\u05E2 `DSMDiagnosis` with axis scores
 *   Γ\u05D6\u05E2 use `primaryOrgPathologyFromDiagnosis` for DSM-Org type + CS amplifier flag.
 * - **Fast triage** (wizard sliders / embeddings blended scores): same numeric scores
 *   Γ\u05D6\u05E2 use `primaryOrgPathologyFromAxisScores`.
 * - **CBR snapshot** (`score_dr` Γ\u05D0ª `score_sc`): same Γ\u05D6\u05E2 `primaryOrgPathologyFromAxisScores`.
 *
 * ```mermaid
 * flowchart LR
 *   subgraph longPath [LongQuestionnaire]
 *     QA[QuestionnaireAnswer]
 *     DE[diagnose]
 *   end
 *   subgraph scores [AxisScores]
 *     S[dr_nd_uc_sc]
 *   end
 *   subgraph orgType [DSM_Org_Type]
 *     PT[PathologyType]
 *   end
 *   subgraph fastPath [FastTriage]
 *     SL[SlidersOrBlendedScores]
 *   end
 *   QA --> DE
 *   DE --> S
 *   SL --> S
 *   S --> SYN[primaryOrgPathologyFromAxisScores]
 *   SYN --> PT
 * ```
 *
 * **SC dominance:** when Structural Clarity (SC) is the highest axis, we do not silently
 * default to NOD. We type from the strongest axis among DR/ND/UC (structural load still
 * reflected in `dominantAxis` for UI / action-plan pooling).
 *
 * **ZSG** split: ZSG_SAFETY (Edmondson / voice) vs ZSG_CULTURE (zero-sum) Γ\u05D0\u05E4 see pathology-kb.
 */

import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import type { DSMDiagnosis } from '@/lib/dsm-engine'
import { getDominantAxis } from '@/lib/diagnostic/action-plan'
import type { DiagnosticAxis } from '@/lib/diagnostic/questions'
import {
  axisToPathologyType,
  detectCsAmplifier,
  type PathologyType,
} from '@/lib/diagnostic/pathology-kb'

export interface AxisScoreInput {
  dr: number
  nd: number
  uc: number
  sc?: number
}

export interface PrimaryOrgPathologyResult {
  primaryType: PathologyType
  csAmplifier: boolean
  /** Highest axis by score (includes SC). */
  dominantAxis: DiagnosticAxis
  /** Axis used for PathologyType when `dominantAxis` is SC. */
  resolvedAxisForOrgType: DiagnosticAxis
}

/**
 * When SC wins globally, derive org-type from the strongest behavioral axis (DR/ND/UC).
 */
export function resolveDominantAxisForOrgType(scores: AxisScoreInput): DiagnosticAxis {
  const raw = getDominantAxis(scores)
  if (raw !== 'SC') return raw
  const triple: Array<[DiagnosticAxis, number]> = [
    ['DR', scores.dr],
    ['ND', scores.nd],
    ['UC', scores.uc],
  ]
  triple.sort((a, b) => b[1] - a[1])
  return triple[0][0]
}

/**
 * Canonical mapping: axis scores Γ\u05D6\u05E2 primary DSM-Org type + CS systemic amplifier flag.
 */
export function primaryOrgPathologyFromAxisScores(
  scores: AxisScoreInput,
  answers?: QuestionnaireAnswer | null
): PrimaryOrgPathologyResult {
  const csAmplifier = detectCsAmplifier({
    dr: scores.dr,
    nd: scores.nd,
    uc: scores.uc,
  })
  const dominantAxis = getDominantAxis(scores)
  const resolvedAxisForOrgType = resolveDominantAxisForOrgType(scores)
  const primaryType: PathologyType = csAmplifier
    ? 'CS'
    : axisToPathologyType(resolvedAxisForOrgType, scores, answers)
  return { primaryType, csAmplifier, dominantAxis, resolvedAxisForOrgType }
}

/**
 * Bridge from full DSM engine output (axis codes + scores) to DSM-Org PathologyType.
 */
export function primaryOrgPathologyFromDiagnosis(
  diagnosis: DSMDiagnosis,
  answers?: QuestionnaireAnswer | null
): PrimaryOrgPathologyResult {
  const m = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p.score])) as Record<
    string,
    number
  >
  return primaryOrgPathologyFromAxisScores(
    {
      dr: m.DR ?? 0,
      nd: m.ND ?? 0,
      uc: m.UC ?? 0,
      sc: m.SC ?? 0,
    },
    answers
  )
}
