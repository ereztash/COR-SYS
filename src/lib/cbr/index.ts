/**
 * CBR Engine — barrel export
 * Import from '@/lib/cbr' for all CBR functionality.
 */

export { generateCaseEmbedding, buildContextualInput } from './embedding'
export type { EmbeddingInput } from './embedding'

export { findSimilarCases } from './similarity'
export type { SimilaritySearchInput, RankedCase } from './similarity'

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
} from '@/lib/resilience-formula'
export type { ResilienceInput, ResilienceOutput, Trajectory } from '@/lib/resilience-formula'
