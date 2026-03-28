/**
 * DSM-Org Content Index — bridge between 7×21 taxonomy and clinical model
 *
 * Maps each subtopic from dsm-org-taxonomy.ts to:
 *   - PathologyType(s) from dsm-org-model.ts
 *   - InterventionPlaybook IDs from dsm-org-model.ts
 *   - DiagnosticAxis(es) from questions.ts
 *   - Report content key for loading full-text reports
 *
 * This module does NOT duplicate data — it links existing canonical sources.
 */

import type { PathologyType } from './pathology-kb'
import type { DiagnosticAxis } from './questions'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContentLink {
  /** Subtopic ID from DSM_ORG_PARTS (e.g. 'tam-signature', 'zsg', 'nod') */
  subtopicId: string

  /** Part number 1-7 */
  part: number

  /** DSM-Org pathology types this subtopic relates to */
  pathologyTypes: PathologyType[]

  /** Diagnostic axes from the questionnaire this subtopic covers */
  axes: DiagnosticAxis[]

  /** Intervention playbook IDs from DSM_INTERVENTION_PLAYBOOKS (e.g. '5.1', '5.3') */
  playbookIds: string[]

  /** Tags for cross-cutting themes not captured by pathology/axis alone */
  tags: string[]

  /** Key for loading report content (matches user's 21 reports) */
  reportKey: string
}

// ─── Content Index ───────────────────────────────────────────────────────────

export const DSM_CONTENT_INDEX: ContentLink[] = [
  // Part 1: Measurement & Triage
  {
    subtopicId: 'tam-signature',
    part: 1,
    pathologyTypes: ['NOD', 'ZSG', 'OLD', 'CLT', 'CS'],
    axes: ['DR', 'ND', 'UC', 'SC'],
    playbookIds: ['5.4'],
    tags: ['triage', 'T/A/M', 'measurement'],
    reportKey: 'report-1-tam-triage',
  },
  {
    subtopicId: 'change-readiness',
    part: 1,
    pathologyTypes: ['OLD', 'CLT'],
    axes: ['UC'],
    playbookIds: [],
    tags: ['AIM', 'IAM', 'FIM', 'Weiner', 'change-readiness'],
    reportKey: 'report-2-change-readiness',
  },
  {
    subtopicId: 'ius-score',
    part: 1,
    pathologyTypes: ['NOD', 'CLT', 'CS'],
    axes: ['DR', 'ND', 'UC', 'SC'],
    playbookIds: ['5.4'],
    tags: ['IUS', 'constraint-envelope', 'MVC'],
    reportKey: 'report-3-ius-score',
  },

  // Part 2: Communication & Psychological Space
  {
    subtopicId: 'psg',
    part: 2,
    pathologyTypes: ['ZSG', 'CS'],
    axes: ['DR', 'UC'],
    playbookIds: ['5.1', '5.7'],
    tags: ['PSG', 'psychological-safety', 'Edmondson', 'near-miss'],
    reportKey: 'report-4-psg',
  },
  {
    subtopicId: 'dugri-toxicity',
    part: 2,
    pathologyTypes: ['ZSG'],
    axes: ['DR', 'ND'],
    playbookIds: ['5.1', '5.5'],
    tags: ['dugri', 'blame-culture', 'Israeli-DNA'],
    reportKey: 'report-5-dugri-toxicity',
  },
  {
    subtopicId: 'boundary-ambiguity',
    part: 2,
    pathologyTypes: ['CLT', 'NOD'],
    axes: ['SC', 'DR'],
    playbookIds: ['5.5', '5.6'],
    tags: ['flat-hierarchy', 'boundary-ambiguity', 'scale-up'],
    reportKey: 'report-6-boundary-ambiguity',
  },

  // Part 3: Process & Structural Deviation
  {
    subtopicId: 'nod',
    part: 3,
    pathologyTypes: ['NOD'],
    axes: ['ND'],
    playbookIds: ['5.1', '5.3', '5.4'],
    tags: ['Vaughan', 'deviance', 'QA-bypass'],
    reportKey: 'report-7-nod',
  },
  {
    subtopicId: 'semantic-drift',
    part: 3,
    pathologyTypes: ['OLD', 'NOD'],
    axes: ['UC', 'ND'],
    playbookIds: ['5.2'],
    tags: ['Floridi', 'ontological-friction', 'semantic-drift'],
    reportKey: 'report-8-semantic-drift',
  },
  {
    subtopicId: 'sc-deficit',
    part: 3,
    pathologyTypes: ['CLT', 'NOD'],
    axes: ['SC'],
    playbookIds: ['5.5', '5.6'],
    tags: ['silos', 'decision-latency', 'structural-clarity'],
    reportKey: 'report-9-sc-deficit',
  },

  // Part 4: Cognitive & Learning Fixation
  {
    subtopicId: 'old',
    part: 4,
    pathologyTypes: ['OLD'],
    axes: ['UC', 'ND'],
    playbookIds: ['5.2', '5.1', '5.7'],
    tags: ['Argyris', 'double-loop', 'learning-disability'],
    reportKey: 'report-10-old',
  },
  {
    subtopicId: 'conceptia-fixation',
    part: 4,
    pathologyTypes: ['OLD', 'ZSG'],
    axes: ['UC', 'DR'],
    playbookIds: ['5.2', '5.7'],
    tags: ['conceptia', 'AAR-malfunction', 'defensive-routines'],
    reportKey: 'report-11-conceptia-fixation',
  },
  {
    subtopicId: 'clt',
    part: 4,
    pathologyTypes: ['CLT'],
    axes: ['UC', 'SC'],
    playbookIds: ['5.3', '5.4', '5.6'],
    tags: ['Sweller', 'context-switching', 'AI-waste', 'Gloria-Mark'],
    reportKey: 'report-12-clt',
  },

  // Part 5: Resilience & Burnout
  {
    subtopicId: 'distorted-reciprocity',
    part: 5,
    pathologyTypes: ['ZSG', 'CS'],
    axes: ['DR'],
    playbookIds: ['5.1', '5.7'],
    tags: ['Hobfoll', 'psychological-contract', 'layoffs', 'BLM'],
    reportKey: 'report-13-distorted-reciprocity',
  },
  {
    subtopicId: 'systemic-burnout',
    part: 5,
    pathologyTypes: ['CS', 'CLT'],
    axes: ['DR', 'UC'],
    playbookIds: ['5.4', '5.7'],
    tags: ['MBI', 'rebound-effect', 'emotional-leadership', 'JD-R'],
    reportKey: 'report-14-systemic-burnout',
  },
  {
    subtopicId: 'miluim-multiplier',
    part: 5,
    pathologyTypes: ['CS', 'OLD', 'CLT'],
    axes: ['DR', 'UC'],
    playbookIds: ['5.4', '5.7'],
    tags: ['miluim', 'tacit-knowledge', 'silent-stagnation', 'brain-drain'],
    reportKey: 'report-15-miluim-multiplier',
  },

  // Part 6: Comorbidity & Sequencing
  {
    subtopicId: 'cascade-state',
    part: 6,
    pathologyTypes: ['CS', 'NOD', 'ZSG', 'OLD', 'CLT'],
    axes: ['DR', 'ND', 'UC', 'SC'],
    playbookIds: ['5.4'],
    tags: ['cascade', 'halt', 'P_c', 'entropy'],
    reportKey: 'report-16-cascade-state',
  },
  {
    subtopicId: 'burke-litwin',
    part: 6,
    pathologyTypes: ['CS', 'ZSG', 'NOD'],
    axes: ['DR', 'SC'],
    playbookIds: [],
    tags: ['Burke-Litwin', 'transformational', 'transactional'],
    reportKey: 'report-17-burke-litwin',
  },
  {
    subtopicId: 'sequencing-logic',
    part: 6,
    pathologyTypes: ['OLD', 'CLT', 'CS'],
    axes: ['UC', 'SC'],
    playbookIds: ['5.1', '5.2'],
    tags: ['comorbidity', 'sequencing', 'iatrogenic'],
    reportKey: 'report-18-sequencing-logic',
  },

  // Part 7: Intervention Playbooks
  {
    subtopicId: 'just-culture',
    part: 7,
    pathologyTypes: ['ZSG', 'NOD', 'OLD'],
    axes: ['ND', 'DR'],
    playbookIds: ['5.1', '5.2'],
    tags: ['ECRI', 'just-culture', 'appreciative-inquiry', 'near-miss-forum'],
    reportKey: 'report-19-just-culture',
  },
  {
    subtopicId: 'nudge-mvc',
    part: 7,
    pathologyTypes: ['CLT', 'NOD'],
    axes: ['UC', 'SC'],
    playbookIds: ['5.3', '5.4'],
    tags: ['nudge', 'MVC', 'focus-blocks', 'async-first', 'Thaler'],
    reportKey: 'report-20-nudge-mvc',
  },
  {
    subtopicId: 'structural-engineering',
    part: 7,
    pathologyTypes: ['ZSG', 'CLT'],
    axes: ['SC', 'DR'],
    playbookIds: ['5.5', '5.6'],
    tags: ['DACI', 'RevOps', 'CoS', 'shock-absorber'],
    reportKey: 'report-21-structural-engineering',
  },
]

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function getLinksForPathology(type: PathologyType): ContentLink[] {
  return DSM_CONTENT_INDEX.filter(l => l.pathologyTypes.includes(type))
}

export function getLinksForAxis(axis: DiagnosticAxis): ContentLink[] {
  return DSM_CONTENT_INDEX.filter(l => l.axes.includes(axis))
}

export function getLinksForPlaybook(playbookId: string): ContentLink[] {
  return DSM_CONTENT_INDEX.filter(l => l.playbookIds.includes(playbookId))
}

export function getLinksForPart(part: number): ContentLink[] {
  return DSM_CONTENT_INDEX.filter(l => l.part === part)
}

export function getLinkBySubtopicId(subtopicId: string): ContentLink | undefined {
  return DSM_CONTENT_INDEX.find(l => l.subtopicId === subtopicId)
}

export function getLinksForTag(tag: string): ContentLink[] {
  return DSM_CONTENT_INDEX.filter(l => l.tags.includes(tag))
}
