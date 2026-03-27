/**
 * Embedding-based pathology matcher.
 *
 * TWO matching passes run in parallel:
 *
 * Pass 1 — SEVERITY match (PATHOLOGY_KB, 4 entries)
 *   Maps answer text → healthy / at-risk / critical / systemic-collapse
 *   Used for: sprint urgency, profile label, score inference
 *
 * Pass 2 — TYPE match (PATHOLOGY_TYPE_KB, 5 entries)
 *   Maps answer text → NOD / ZSG / OLD / CLT / CS
 *   Used for: intervention selection, T/A/M cost signature, protocol recommendation
 *
 * Both passes use the same embedding model and cosine similarity function.
 * CS amplifier is detected separately via score thresholding (all axes ≥ 6).
 *
 * Model: text-embedding-3-small
 *   — $0.02 / 1M tokens (~$0.0001/month at 10 sessions)
 *   — 1536 dimensions
 *   — Sufficient Hebrew quality for symptom matching
 */

import OpenAI from 'openai'
import {
  PATHOLOGY_KB,
  PATHOLOGY_TYPE_KB,
  detectCsAmplifier,
  type PathologyEntry,
  type PathologyTypeEntry,
  type PathologyType,
} from './pathology-kb'

const MODEL = 'text-embedding-3-small'

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

/** Cosine similarity between two float vectors */
function cosine(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ─── Severity match types ─────────────────────────────────────────────────────

export interface MatchResult {
  entry: PathologyEntry
  similarity: number
  rank: number
}

// ─── Type match types ─────────────────────────────────────────────────────────

export interface TypeMatchResult {
  entry: PathologyTypeEntry
  similarity: number
  rank: number
}

// ─── KB embedding (batched) ───────────────────────────────────────────────────

async function embedSeverityKB(): Promise<Map<string, number[]>> {
  const openai = getOpenAI()
  const response = await openai.embeddings.create({
    model: MODEL,
    input: PATHOLOGY_KB.map(e => e.description),
  })
  const map = new Map<string, number[]>()
  response.data.forEach((item, i) => {
    map.set(PATHOLOGY_KB[i].profile, item.embedding)
  })
  return map
}

async function embedTypeKB(): Promise<Map<PathologyType, number[]>> {
  const openai = getOpenAI()
  const response = await openai.embeddings.create({
    model: MODEL,
    input: PATHOLOGY_TYPE_KB.map(e => e.description),
  })
  const map = new Map<PathologyType, number[]>()
  response.data.forEach((item, i) => {
    map.set(PATHOLOGY_TYPE_KB[i].type, item.embedding)
  })
  return map
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Full dual-pass pathology match.
 *
 * Returns:
 *   severityMatches — ranked severity profiles (for urgency/sprint)
 *   typeMatches     — ranked pathology types (for intervention selection)
 *   topType         — the best-match pathology type entry
 *   csAmplifier     — true when all axes ≥ 6 (CS amplifier active)
 */
export interface DualMatchResult {
  severityMatches: MatchResult[]
  typeMatches: TypeMatchResult[]
  topType: TypeMatchResult
  csAmplifier: boolean
}

export async function matchPathologyDual(
  answerText: string,
  scores?: { dr: number; nd: number; uc: number }
): Promise<DualMatchResult> {
  const openai = getOpenAI()

  // Embed query + both KBs in parallel (3 calls → 1 round-trip set)
  const [queryResponse, severityKB, typeKB] = await Promise.all([
    openai.embeddings.create({ model: MODEL, input: answerText }),
    embedSeverityKB(),
    embedTypeKB(),
  ])

  const queryVec = queryResponse.data[0].embedding

  // Severity pass
  const severityMatches: MatchResult[] = PATHOLOGY_KB.map(entry => ({
    entry,
    similarity: cosine(queryVec, severityKB.get(entry.profile) ?? []),
    rank: 0,
  }))
  severityMatches.sort((a, b) => b.similarity - a.similarity)
  severityMatches.forEach((r, i) => { r.rank = i + 1 })

  // Type pass
  const typeMatches: TypeMatchResult[] = PATHOLOGY_TYPE_KB.map(entry => ({
    entry,
    similarity: cosine(queryVec, typeKB.get(entry.type) ?? []),
    rank: 0,
  }))
  typeMatches.sort((a, b) => b.similarity - a.similarity)
  typeMatches.forEach((r, i) => { r.rank = i + 1 })

  // CS amplifier: score-based (not embedding-based — CS is a modulator, not a type)
  const csAmplifier = scores ? detectCsAmplifier(scores) : false

  return {
    severityMatches,
    typeMatches,
    topType: typeMatches[0],
    csAmplifier,
  }
}

/**
 * Legacy single-pass severity match.
 * Kept for backward compatibility with existing callers.
 */
export async function matchPathology(answerText: string): Promise<MatchResult[]> {
  const openai = getOpenAI()
  const [queryResponse, kbEmbeddings] = await Promise.all([
    openai.embeddings.create({ model: MODEL, input: answerText }),
    embedSeverityKB(),
  ])
  const queryVec = queryResponse.data[0].embedding
  const results: MatchResult[] = PATHOLOGY_KB.map(entry => ({
    entry,
    similarity: cosine(queryVec, kbEmbeddings.get(entry.profile) ?? []),
    rank: 0,
  }))
  results.sort((a, b) => b.similarity - a.similarity)
  results.forEach((r, i) => { r.rank = i + 1 })
  return results
}
