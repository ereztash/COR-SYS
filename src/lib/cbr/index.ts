/**
 * CBR Engine — barrel export
 * Import from '@/lib/cbr' for all CBR functionality.
 */

export { avg, SUCCESS_ENTROPY_DELTA, SUCCESS_J_QUOTIENT_THRESHOLD, CONFIDENCE_HIGH_THRESHOLD, CONFIDENCE_MEDIUM_THRESHOLD, CONFIDENCE_LOW_THRESHOLD, LAMBDA_TREND_THRESHOLD, jensenShannon, hybridScoreSimilarity, PSI_NORM_DEFAULT } from './utils'

export { generateCaseEmbedding, buildContextualInput } from './embedding'
export type { EmbeddingInput } from './embedding'

export { findSimilarCases } from './similarity'
export type { SimilaritySearchInput, RankedCase } from './similarity'

export { getRecommendations } from './recommend'
export type { RecommendationInput, RecommendationOutput } from './recommend'

export { bayesianUpdate, calibrate, batchCalibrate, computeOverrideSignals, loadPrior, persistPrior, updatePriorFromFollowup } from './calibration'
export type { CalibrationInput, CalibrationResult, OverrideSignal, CalibrationPriorRow } from './calibration'

export { computeTrajectory } from './trajectory'
export type { TrajectoryPrediction } from './trajectory'

export { computeSotaMetrics, SOTA_TARGETS } from './metrics'
export type { SotaMetrics, CtaMetrics } from './metrics'

export { evaluateRetrieval, buildSyntheticGoldenSet, RETRIEVAL_SOTA_TARGETS } from './retrieval-harness'
export type { GoldenQuery, RetrievalEvalResult, HarnessReport } from './retrieval-harness'

// Re-export resilience formula for convenience
export {
  analyzeResilience,
  calculateLearningGain,
  calculateEigenvalue,
  classifyTrajectory,
  computePsiScore,
  normalizeLearningGain,
  WEIGHT_DR,
  WEIGHT_PSI,
  CRITICAL_THRESHOLD,
  DEFAULT_KAPPA,
  PSI_DEFAULT,
} from '@/lib/resilience-formula'
export type { ResilienceInput, ResilienceOutput, Trajectory } from '@/lib/resilience-formula'
