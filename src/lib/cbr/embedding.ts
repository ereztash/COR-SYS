/**
 * CBR Embedding Service
 *
 * Generates VECTOR(1536) embeddings for DSM diagnostic snapshots.
 * Uses Contextual Retrieval pattern (Anthropic 2024) → -49% retrieval failure.
 *
 * Architecture:
 *   Input: DSM Snapshot + Org Context
 *   ↓ Step 1: Normalize tabular data (DR/ND/UC/DLI → 0-1 range)
 *   ↓ Step 2: Build contextual header string (industry | size | severity)
 *   ↓ Step 3: Generate text embedding via OpenAI text-embedding-3-small (1536 dims)
 *   ↓ Step 4: Concatenate [normalized_tabular_prefix | text_embedding] → trim to 1536
 *   Output: number[1536] → stored in dsm_diagnostic_snapshots.feature_vector
 *
 * Env required: OPENAI_API_KEY
 */

import OpenAI from 'openai'
import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'

// ─── OpenAI client (lazy init — only on server) ───────────────────────────────

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('[CBR] OPENAI_API_KEY is not set. Add it to .env.local')
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** OpenAI model that produces exactly 1536-dim vectors (matches our pgvector schema) */
const EMBEDDING_MODEL = 'text-embedding-3-small'

/** Max input tokens for text-embedding-3-small */
const MAX_INPUT_CHARS = 8000

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize DSM score (0-10) to [0, 1].
 * Used for tabular prefix so numeric features are scale-invariant.
 */
function normScore(v: number): number {
  return Math.max(0, Math.min(1, v / 10))
}

/**
 * Normalize DLI (days). Practical range: 0-90 days → 0-1.
 */
function normDli(v: number | null): number {
  if (v == null) return 0.5 // midpoint if unknown
  return Math.max(0, Math.min(1, v / 90))
}

/**
 * Normalize PSI (1-7) to [0, 1].
 */
function normPsi(v: number | null): number {
  if (v == null) return 0.5
  return (v - 1) / 6
}

// ─── Contextual Input Builder ─────────────────────────────────────────────────

/**
 * Build the contextual header string for embedding.
 * Pattern from Anthropic Contextual Retrieval (2024).
 *
 * Format:
 *   [CONTEXT: industry | size | severity]
 *   [SCORES: DR=x/10 ND=x/10 UC=x/10]
 *   [METRICS: DLI=xd J=x Entropy=x PSI=x/7]
 *   [NARRATIVE: free text bottleneck description]
 */
export function buildContextualInput(
  snapshot: Pick<
    DsmDiagnosticSnapshot,
    'score_dr' | 'score_nd' | 'score_uc' | 'total_entropy' |
    'j_quotient' | 'decision_latency' | 'psi_score' |
    'severity_profile' | 'bottleneck_text'
  >,
  org: Pick<OrganizationContext, 'industry_sector' | 'employee_size_band'>
): string {
  const contextLine = `[CONTEXT: ${org.industry_sector} | ${org.employee_size_band} | ${snapshot.severity_profile}]`
  const scoresLine = `[SCORES: DR=${snapshot.score_dr.toFixed(1)}/10 ND=${snapshot.score_nd.toFixed(1)}/10 UC=${snapshot.score_uc.toFixed(1)}/10]`
  const metricsLine = `[METRICS: DLI=${snapshot.decision_latency ?? '?'}d J=${snapshot.j_quotient ?? '?'} Entropy=${snapshot.total_entropy.toFixed(2)} PSI=${snapshot.psi_score?.toFixed(1) ?? '?'}/7]`
  const narrativeLine = snapshot.bottleneck_text
    ? `[NARRATIVE: ${snapshot.bottleneck_text.slice(0, MAX_INPUT_CHARS - 200)}]`
    : '[NARRATIVE: no narrative provided]'

  return [contextLine, scoresLine, metricsLine, narrativeLine].join('\n')
}

// ─── Tabular Prefix Vector ────────────────────────────────────────────────────

/**
 * Build a normalized tabular feature vector (9 dimensions) from snapshot.
 * This encodes the numeric signal independently of the text embedding.
 * Will be prepended to the text embedding and the full vector trimmed to 1536.
 *
 * Features: [dr_norm, nd_norm, uc_norm, entropy_norm, dli_norm, psi_norm, j_norm, sev_int, 0, 0]
 */
function buildTabularPrefix(
  snapshot: Pick<
    DsmDiagnosticSnapshot,
    'score_dr' | 'score_nd' | 'score_uc' | 'total_entropy' |
    'decision_latency' | 'psi_score' | 'j_quotient' | 'severity_profile'
  >
): number[] {
  const severityMap: Record<string, number> = {
    'Healthy': 0,
    'At-risk': 0.33,
    'Critical': 0.66,
    'Systemic-collapse': 1.0,
  }
  return [
    normScore(snapshot.score_dr),
    normScore(snapshot.score_nd),
    normScore(snapshot.score_uc),
    Math.min(1, snapshot.total_entropy / 4),           // entropy 0-4
    normDli(snapshot.decision_latency),
    normPsi(snapshot.psi_score),
    snapshot.j_quotient ? Math.min(1, snapshot.j_quotient / 1_000_000) : 0.5,
    severityMap[snapshot.severity_profile] ?? 0.5,
    0, 0,                                               // padding
  ]
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface EmbeddingInput {
  snapshot: Pick<
    DsmDiagnosticSnapshot,
    'score_dr' | 'score_nd' | 'score_uc' | 'total_entropy' |
    'j_quotient' | 'decision_latency' | 'psi_score' |
    'severity_profile' | 'bottleneck_text'
  >
  org: Pick<OrganizationContext, 'industry_sector' | 'employee_size_band'>
}

/**
 * Generate the full VECTOR(1536) embedding for a DSM diagnostic snapshot.
 *
 * Algorithm:
 *   1. Build tabular prefix (9 normalized numeric features)
 *   2. Generate 1536-dim text embedding from contextual input string
 *   3. Replace first 9 dimensions with tabular prefix (hybrid embedding)
 *   4. Return number[1536]
 */
export async function generateCaseEmbedding(input: EmbeddingInput): Promise<number[]> {
  const { snapshot, org } = input
  const openai = getOpenAI()

  // Step 1: Contextual input string
  const contextualText = buildContextualInput(snapshot, org)

  // Step 2: Text embedding (1536 dims)
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: contextualText,
    encoding_format: 'float',
  })

  const textEmbedding = response.data[0].embedding // number[1536]

  // Step 3: Tabular prefix (9 dims)
  const tabularPrefix = buildTabularPrefix(snapshot)

  // Step 4: Hybrid — replace first 9 dims with tabular signal, keep rest as text
  // This ensures numeric precision is preserved at index 0-8 where HNSW starts searching
  const hybrid = [...tabularPrefix, ...textEmbedding.slice(tabularPrefix.length)]

  return hybrid // exactly 1536 dims
}
