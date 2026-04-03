/**
 * USTT (Unified Systems Thinking Taxonomy) Primitives
 *
 * 12 universal primitives that underlie all organizational pathologies.
 * Organized into 3 meta-categories: Entropy (E), Process (P), Structure (S).
 *
 * Cross-references: dsm-org-taxonomy.ts, dsm-engine.ts
 */

import type { ExtendedPathologyCode } from './dsm-org-taxonomy'

// ── Meta-Categories ─────────────────────────────────────────────────────────

export type MetaCategory = 'E' | 'P' | 'S'

export const META_CATEGORY_NAMES: Record<MetaCategory, { he: string; en: string }> = {
  E: { he: 'אנטרופיה', en: 'Entropy' },
  P: { he: 'תהליך', en: 'Process' },
  S: { he: 'מבנה', en: 'Structure' },
}

// ── Primitives ──────────────────────────────────────────────────────────────

export interface Primitive {
  id: string
  name: string
  category: MetaCategory
  description: string
}

export const PRIMITIVES: Primitive[] = [
  { id: 'P1', name: 'Feedback Loop Failure', category: 'P', description: 'Information about outcomes does not reach decision-makers' },
  { id: 'P2', name: 'Positive Feedback Spiral', category: 'P', description: 'Self-reinforcing cycle that amplifies deviation from equilibrium' },
  { id: 'P3', name: 'Delayed Response', category: 'P', description: 'System response lags behind environmental change' },
  { id: 'P4', name: 'Local Optimization', category: 'P', description: 'Sub-units optimize locally at the expense of global performance' },
  { id: 'P5', name: 'Signal-to-Noise Collapse', category: 'E', description: 'Meaningful signals drowned by noise; information overload' },
  { id: 'P6', name: 'Standard Decay', category: 'P', description: 'Gradual erosion of norms and standards without visible trigger' },
  { id: 'P7', name: 'Bottleneck Amplification', category: 'S', description: 'Constraints in one node cascade delays through the system' },
  { id: 'P8', name: 'Information Flow Block', category: 'S', description: 'Critical information cannot traverse organizational boundaries' },
  { id: 'P9', name: 'Coupling Conflict', category: 'S', description: 'Tight coupling between units creates interference patterns' },
  { id: 'P10', name: 'Conservation Breach', category: 'E', description: 'Energy/resources leak from the system without producing value' },
  { id: 'P11', name: 'Adaptive Capacity Loss', category: 'E', description: 'System loses ability to respond to novel situations' },
  { id: 'P12', name: 'Reality Gap', category: 'E', description: 'Growing divergence between perceived and actual system state' },
]

// ── Pathology → Primitive Mapping ───────────────────────────────────────────

export interface PathologyPrimitiveMapping {
  pathology: ExtendedPathologyCode
  primitiveIds: string[]
  crossCategory: string
  mechanism: string
}

export const PATHOLOGY_PRIMITIVE_MAP: PathologyPrimitiveMapping[] = [
  {
    pathology: 'DR',
    primitiveIds: ['P10', 'P2'],
    crossCategory: 'E x P',
    mechanism: 'Conservation breach triggers positive feedback spiral of disengagement',
  },
  {
    pathology: 'ND',
    primitiveIds: ['P4', 'P6'],
    crossCategory: 'P',
    mechanism: 'Local rules produce workarounds that decay standards silently',
  },
  {
    pathology: 'UC',
    primitiveIds: ['P12', 'P1'],
    crossCategory: 'E x P',
    mechanism: 'Reality gap grows because feedback loop is broken',
  },
  {
    pathology: 'SC',
    primitiveIds: ['P7', 'P9'],
    crossCategory: 'S',
    mechanism: 'Bottlenecks amplified by coupling conflicts between units',
  },
  {
    pathology: 'ZSG_SAFETY',
    primitiveIds: ['P12', 'P8'],
    crossCategory: 'E x S',
    mechanism: 'Reality gap hides unsafe conditions; flow of safety info blocked',
  },
  {
    pathology: 'ZSG_CULTURE',
    primitiveIds: ['P2', 'P9'],
    crossCategory: 'P x S',
    mechanism: 'Competitive coupling feeds positive feedback loop of zero-sum behavior',
  },
  {
    pathology: 'CLT',
    primitiveIds: ['P5', 'P7'],
    crossCategory: 'E x S',
    mechanism: 'Signal-to-noise collapse creates cognitive bottleneck',
  },
  {
    pathology: 'OLD',
    primitiveIds: ['P1', 'P12'],
    crossCategory: 'P x E',
    mechanism: 'Broken feedback prevents learning; reality gap protects assumptions',
  },
]

// ── Convenience Functions ───────────────────────────────────────────────────

/**
 * Get the full Primitive objects for a given pathology code.
 */
export function getPrimitivesForPathology(code: ExtendedPathologyCode): Primitive[] {
  const mapping = PATHOLOGY_PRIMITIVE_MAP.find(m => m.pathology === code)
  if (!mapping) return []
  return mapping.primitiveIds
    .map(id => PRIMITIVES.find(p => p.id === id))
    .filter((p): p is Primitive => p !== undefined)
}

/**
 * Get the cross-category mechanism description for a pathology.
 */
export function getCrossCategoryMechanism(code: ExtendedPathologyCode): string | null {
  const mapping = PATHOLOGY_PRIMITIVE_MAP.find(m => m.pathology === code)
  return mapping?.mechanism ?? null
}

/**
 * Get a primitive by its ID (e.g. 'P1', 'P12').
 */
export function getPrimitiveById(id: string): Primitive | undefined {
  return PRIMITIVES.find(p => p.id === id)
}
