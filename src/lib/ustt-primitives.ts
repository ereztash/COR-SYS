/**
 * USTT Primitives — Unified Structural Transfer Theory
 *
 * 5 atomic operations, 12 structural primitives, 3 meta-categories.
 * This module provides the primitive layer that maps COR-SYS pathologies
 * to their structural root causes.
 *
 * Source: shared/primitives.json (knowledge base)
 * Integration: dsm-org-taxonomy.ts pathologies reference these primitives.
 */

import type { PathologyCode } from './dsm-engine'
import type { ExtendedPathologyCode } from './dsm-org-taxonomy'

// ━━━ Atomic Operations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type AtomicOp = 'S' | 'delta' | 'T' | 'M' | 'arrow'

export const ATOMIC_OPERATIONS: Record<AtomicOp, { name: string; nameHe: string; symbol: string }> = {
  S: { name: 'Sensing', nameHe: 'חישה', symbol: 'S' },
  delta: { name: 'Comparison', nameHe: 'השוואה', symbol: 'Δ' },
  T: { name: 'Threshold', nameHe: 'סף', symbol: 'T' },
  M: { name: 'Mode Switch', nameHe: 'מעבר מצב', symbol: 'M' },
  arrow: { name: 'Propagation', nameHe: 'הפצה', symbol: '→' },
}

// ━━━ Meta-Categories ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MetaCategory = 'Process' | 'Structure' | 'Epistemics'

export const META_CATEGORIES: Record<MetaCategory, {
  nameHe: string
  color: string
  primitiveIds: string[]
  coreQuestion: string
}> = {
  Process: {
    nameHe: 'תהליך',
    color: '#B87333',
    primitiveIds: ['P1', 'P2', 'P3', 'P4'],
    coreQuestion: 'What happens on the time axis?',
  },
  Structure: {
    nameHe: 'מבנה',
    color: '#2A6B6B',
    primitiveIds: ['P6', 'P7', 'P8', 'P9', 'P10'],
    coreQuestion: 'What is the topology of the system?',
  },
  Epistemics: {
    nameHe: 'אפיסטמיקה',
    color: '#8A5627',
    primitiveIds: ['P5', 'P11', 'P12'],
    coreQuestion: 'What does the system know about itself?',
  },
}

// ━━━ Primitives ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Primitive {
  id: string
  name: string
  nameHe: string
  category: MetaCategory
  formula: string
  atomicSequence: string
  whenBreaks: string
  icpSignal: string
  icpQuestion: string
}

export const PRIMITIVES: Record<string, Primitive> = {
  P1: {
    id: 'P1',
    name: 'Negative Feedback Loop',
    nameHe: 'לולאת משוב שלילית',
    category: 'Process',
    formula: 'output -> sensor -> comparator -> corrector -> output',
    atomicSequence: 'S->delta->T(correct)',
    whenBreaks: 'KPIs that do not flow back to management',
    icpSignal: 'Decisions repeat without data arriving',
    icpQuestion: 'Do your KPIs actually reach the person who decides?',
  },
  P2: {
    id: 'P2',
    name: 'Positive Feedback Loop',
    nameHe: 'לולאת משוב חיובית',
    category: 'Process',
    formula: 'output -> amplifier -> output (no brake)',
    atomicSequence: 'S->delta->T(amplify)',
    whenBreaks: 'Small problem that became a snowball',
    icpSignal: 'A metric that only goes up (or down) and nobody stops it',
    icpQuestion: 'What escalates in your org and nobody stops?',
  },
  P3: {
    id: 'P3',
    name: 'Threshold / Phase Transition',
    nameHe: 'סף / מעבר פאזה',
    category: 'Process',
    formula: 'accumulation -> critical_mass -> state_change',
    atomicSequence: 'S->delta->T(accumulate)->M(phase)',
    whenBreaks: '"We did not see it coming"',
    icpSignal: 'Organization functions then collapses. Non-linear.',
    icpQuestion: 'Where in your org are you accumulating without measuring?',
  },
  P4: {
    id: 'P4',
    name: 'Decay Function',
    nameHe: 'פונקציית דעיכה',
    category: 'Process',
    formula: 'value(t) = value(0) * e^(-lambda*t)',
    atomicSequence: 'S(t1)->delta(t1,t2)->T(below)',
    whenBreaks: 'Process that once worked and suddenly does not',
    icpSignal: 'Silent degradation: NOD, skill erosion, process drift',
    icpQuestion: 'What process used to work and silently stopped?',
  },
  P5: {
    id: 'P5',
    name: 'Signal-to-Noise Ratio',
    nameHe: 'יחס אות לרעש',
    category: 'Epistemics',
    formula: 'useful_signal / total_information',
    atomicSequence: 'S(total)->delta(signal,noise)->T(ratio)',
    whenBreaks: 'Too much information, nobody knows what matters',
    icpSignal: 'Reports nobody reads; dashboards nobody checks',
    icpQuestion: 'How many reports do you produce that change no decision?',
  },
  P6: {
    id: 'P6',
    name: 'Emergence from Local Rules',
    nameHe: 'צמיחה מכללים מקומיים',
    category: 'Structure',
    formula: 'local_rules -> interactions -> global_pattern != intended',
    atomicSequence: 'M(local)->T(emerge)->delta(intended,actual)',
    whenBreaks: 'Policy change that does not change behavior',
    icpSignal: 'Gap between announced change and actual behavior',
    icpQuestion: 'What policy did you announce that nobody follows?',
  },
  P7: {
    id: 'P7',
    name: 'Bottleneck',
    nameHe: 'צוואר בקבוק',
    category: 'Structure',
    formula: 'flow_rate = min(capacity_of_each_node)',
    atomicSequence: 'S->T(capacity)->delta(min)',
    whenBreaks: 'Everyone waits for one person',
    icpSignal: 'Decision Latency, key-person dependency',
    icpQuestion: 'Who in your org, without them nothing moves?',
  },
  P8: {
    id: 'P8',
    name: 'Gradient / Flow',
    nameHe: 'מפל / זרימה',
    category: 'Structure',
    formula: 'flow = -gradient(potential) * conductivity',
    atomicSequence: 'S(topology)->T(path_exists?)->delta',
    whenBreaks: 'Information does not reach who needs it',
    icpSignal: 'Trapped knowledge, broken handoffs, silo walls',
    icpQuestion: 'Where does information stop flowing in your org?',
  },
  P9: {
    id: 'P9',
    name: 'Coupling / Decoupling',
    nameHe: 'צימוד / ניתוק',
    category: 'Structure',
    formula: 'correlation(A,B) -> tight/loose -> conflict/autonomy',
    atomicSequence: 'S(A)->S(B)->delta(A,B)->T(conflict)',
    whenBreaks: 'Two departments working against each other',
    icpSignal: 'Contradictory KPIs, misaligned incentives, blame cycles',
    icpQuestion: 'Which two teams in your org pull in opposite directions?',
  },
  P10: {
    id: 'P10',
    name: 'Conservation (COR)',
    nameHe: 'שימור משאבים',
    category: 'Structure',
    formula: 'loss_impact = alpha * gain_impact (alpha > 1)',
    atomicSequence: 'S(loss)->delta(loss,gain)->T(alpha>1)',
    whenBreaks: 'What you lost hurts more than what you gained',
    icpSignal: 'Resource hoarding, change resistance, risk aversion',
    icpQuestion: 'What are people protecting instead of building?',
  },
  P11: {
    id: 'P11',
    name: 'Perturbation as Signal Amplifier',
    nameHe: 'הפרעה כמגבר אות',
    category: 'Epistemics',
    formula: 'stress_event -> hidden_structure_becomes_visible',
    atomicSequence: 'M(perturb)->S(hidden)->delta(visible)',
    whenBreaks: 'Crisis that revealed a problem everyone knew about',
    icpSignal: 'Post-crisis discoveries, "we always knew" moments',
    icpQuestion: 'What did your last crisis reveal that was always there?',
  },
  P12: {
    id: 'P12',
    name: 'Representation-Reality Gap',
    nameHe: 'פער ייצוג-מציאות',
    category: 'Epistemics',
    formula: 'delta(declared_state, actual_state) > 0',
    atomicSequence: 'S(declared)->S(actual)->delta->T(>0)',
    whenBreaks: 'What the org says about itself does not match reality',
    icpSignal: 'Ontological Friction, glossy reports that hide dysfunction',
    icpQuestion: 'Where is the gap between what you say and what happens?',
  },
}

// ━━━ Pathology-to-Primitive Mapping ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PathologyPrimitiveMap {
  pathology: ExtendedPathologyCode
  primaryPrimitives: string[]
  crossCategory: string | null
  mechanism: string
}

export const PATHOLOGY_PRIMITIVE_MAP: PathologyPrimitiveMap[] = [
  {
    pathology: 'DR',
    primaryPrimitives: ['P10', 'P2'],
    crossCategory: 'S x P',
    mechanism: 'Conservation (P10) breach triggers positive feedback spiral (P2) of disengagement',
  },
  {
    pathology: 'ND',
    primaryPrimitives: ['P4', 'P6'],
    crossCategory: 'P x S',
    mechanism: 'Local rules (P6) produce workarounds that decay (P4) standards silently',
  },
  {
    pathology: 'UC',
    primaryPrimitives: ['P12', 'P1'],
    crossCategory: 'E x P',
    mechanism: 'Reality gap (P12) grows because feedback loop (P1) is broken',
  },
  {
    pathology: 'SC',
    primaryPrimitives: ['P7', 'P9'],
    crossCategory: 'S',
    mechanism: 'Bottlenecks (P7) amplified by coupling conflicts (P9) between units',
  },
  {
    pathology: 'ZSG_SAFETY',
    primaryPrimitives: ['P12', 'P8'],
    crossCategory: 'E x S',
    mechanism: 'Reality gap (P12) hides unsafe conditions; flow (P8) of safety info blocked',
  },
  {
    pathology: 'ZSG_CULTURE',
    primaryPrimitives: ['P2', 'P9'],
    crossCategory: 'P x S',
    mechanism: 'Competitive coupling (P9) feeds positive feedback loop (P2) of zero-sum behavior',
  },
  {
    pathology: 'CLT',
    primaryPrimitives: ['P5', 'P7'],
    crossCategory: 'E x S',
    mechanism: 'Signal-to-noise collapse (P5) creates cognitive bottleneck (P7)',
  },
  {
    pathology: 'OLD',
    primaryPrimitives: ['P1', 'P12'],
    crossCategory: 'P x E',
    mechanism: 'Broken feedback (P1) prevents learning; reality gap (P12) protects assumptions',
  },
]

// ━━━ Cross-Category Diagnosis Paths ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CrossCategoryPath {
  symptomCategory: MetaCategory
  rootCategory: MetaCategory
  pattern: string
  example: string
}

export const CROSS_CATEGORY_PATHS: CrossCategoryPath[] = [
  {
    symptomCategory: 'Process',
    rootCategory: 'Structure',
    pattern: 'P2 amplifies because P7 blocks',
    example: 'Burnout (Process) rooted in bottleneck (Structure)',
  },
  {
    symptomCategory: 'Structure',
    rootCategory: 'Epistemics',
    pattern: 'P9 exists because P12 hides it',
    example: 'Contradictory metrics (Structure) hidden by "data-driven" narrative (Epistemics)',
  },
  {
    symptomCategory: 'Epistemics',
    rootCategory: 'Process',
    pattern: 'P5 overload causes P4 decay',
    example: 'Info noise (Epistemics) causes standards to erode (Process)',
  },
  {
    symptomCategory: 'Process',
    rootCategory: 'Epistemics',
    pattern: 'P1 broken means P12 grows',
    example: 'Without feedback (Process) representation-reality gap grows (Epistemics)',
  },
  {
    symptomCategory: 'Structure',
    rootCategory: 'Process',
    pattern: 'P8 broken feeds P2',
    example: 'Missing info channels (Structure) feed runaway spiral (Process)',
  },
  {
    symptomCategory: 'Epistemics',
    rootCategory: 'Structure',
    pattern: 'P11 reveals P9',
    example: 'Crisis (Epistemics) exposes toxic coupling (Structure)',
  },
]

// ━━━ Utility: Get primitives for a pathology ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getPrimitivesForPathology(code: ExtendedPathologyCode): Primitive[] {
  const map = PATHOLOGY_PRIMITIVE_MAP.find(m => m.pathology === code)
  if (!map) return []
  return map.primaryPrimitives
    .map(id => PRIMITIVES[id])
    .filter((p): p is Primitive => p !== undefined)
}

export function getCrossCategoryMechanism(code: ExtendedPathologyCode): string | null {
  const map = PATHOLOGY_PRIMITIVE_MAP.find(m => m.pathology === code)
  return map?.mechanism ?? null
}

export function getPrimitivesByCategory(category: MetaCategory): Primitive[] {
  return Object.values(PRIMITIVES).filter(p => p.category === category)
}
