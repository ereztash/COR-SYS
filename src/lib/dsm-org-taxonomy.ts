/**
 * DSM-Org Full Taxonomy Γאפ 7 Parts, 21 Sub-topics
 *
 * Data source: NotebookLM organizational resilience library
 * Covers: T/A/M signatures, Red Flags, Sequencing Rules, Anti-Fragility
 *
 * Canonical: ZSG_SAFETY (╫ס╫ש╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש) + ZSG_CULTURE (╫í╫¢╫ץ╫¥-╫נ╫ñ╫í), aligned with pathology-kb.
 */

import type { PathologyCode } from './dsm-engine'
import {
  PATHOLOGY_PRIMITIVE_MAP,
  getPrimitivesForPathology,
  getCrossCategoryMechanism,
  type MetaCategory,
  type Primitive,
} from './ustt-primitives'

// ΓפאΓפאΓפא Extended Pathology Codes ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export type ExtendedPathologyCode = PathologyCode | 'ZSG_SAFETY' | 'ZSG_CULTURE' | 'CLT' | 'OLD'

export const EXTENDED_PATHOLOGY_NAMES: Record<ExtendedPathologyCode, { he: string; en: string }> = {
  DR: { he: '╫פ╫ף╫ף╫ש╫ץ╫¬ ╫₧╫ó╫ץ╫ץ╫¬╫¬', en: 'Distorted Reciprocity' },
  ND: { he: '╫á╫ץ╫¿╫₧╫£╫ש╫צ╫ª╫ש╫ש╫¬ ╫í╫ר╫ש╫ש╫פ', en: 'Normalization of Deviance' },
  UC: { he: '╫¢╫ש╫ץ╫£ ╫£╫נ-╫₧╫ש╫ש╫ª╫ע', en: 'Unrepresentative Calibration' },
  SC: { he: '╫ó╫₧╫ש╫₧╫ץ╫¬ ╫₧╫ס╫á╫ש╫¬', en: 'Structural Clarity Deficit' },
  ZSG_SAFETY: { he: '╫ע╫ש╫¿╫ó╫ץ╫ƒ ╫ס╫ס╫ש╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש', en: 'Psychological Safety Deficit' },
  ZSG_CULTURE: { he: '╫¬╫¿╫ס╫ץ╫¬ ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í', en: 'Zero-Sum Game Culture' },
  CLT: { he: '╫₧╫£╫¢╫ץ╫ף╫¬ ╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש', en: 'Cognitive Load Trap' },
  OLD: { he: '╫ע╫ש╫¿╫ó╫ץ╫ƒ ╫£╫₧╫ש╫ף╫פ ╫נ╫¿╫ע╫ץ╫á╫ש', en: 'Organizational Learning Deficit' },
}

// ΓפאΓפאΓפא T/A/M Canonical Signatures ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export interface TAMSignature {
  T: number  // Time cost (1-5)
  A: number  // Attention cost (1-5)
  M: number  // Money cost (1-5)
  primitives: string[]
  crossCategory: string | null
  mechanism: string
}

export interface TamSignatureWithPrimitives {
  time: string
  attention: string
  money: string
  primitives: string[]
  crossCategory: string | null
  mechanism: string
}

export const TAM_SIGNATURES: Record<ExtendedPathologyCode, TAMSignature> = {
  DR: { T: 3, A: 3, M: 4, primitives: ['P10', 'P2'], crossCategory: 'E x P', mechanism: 'Conservation breach triggers positive feedback spiral of disengagement' },
  ND: { T: 4, A: 3, M: 5, primitives: ['P4', 'P6'], crossCategory: 'P', mechanism: 'Local rules produce workarounds that decay standards silently' },
  UC: { T: 3, A: 4, M: 3, primitives: ['P12', 'P1'], crossCategory: 'E x P', mechanism: 'Reality gap grows because feedback loop is broken' },
  SC: { T: 5, A: 3, M: 4, primitives: ['P7', 'P9'], crossCategory: 'S', mechanism: 'Bottlenecks amplified by coupling conflicts between units' },
  ZSG_SAFETY: { T: 2, A: 4, M: 3, primitives: ['P12', 'P8'], crossCategory: 'E x S', mechanism: 'Reality gap hides unsafe conditions; flow of safety info blocked' },
  ZSG_CULTURE: { T: 3, A: 3, M: 5, primitives: ['P2', 'P9'], crossCategory: 'P x S', mechanism: 'Competitive coupling feeds positive feedback loop of zero-sum behavior' },
  CLT: { T: 2, A: 5, M: 4, primitives: ['P5', 'P7'], crossCategory: 'E x S', mechanism: 'Signal-to-noise collapse creates cognitive bottleneck' },
  OLD: { T: 3, A: 4, M: 3, primitives: ['P1', 'P12'], crossCategory: 'P x E', mechanism: 'Broken feedback prevents learning; reality gap protects assumptions' },
}

// ΓפאΓפאΓפא DSM-Org 7 Parts ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export interface DsmOrgSubTopic {
  id: string
  nameHe: string
  nameEn: string
  description: string
  relatedPathologies: ExtendedPathologyCode[]
  diagnosticQuestions: string[]
  kpis: string[]
}

export interface DsmOrgPart {
  part: number
  nameHe: string
  nameEn: string
  description: string
  primitiveIds?: string[]
  subTopics: DsmOrgSubTopic[]
}

export const DSM_ORG_PARTS: DsmOrgPart[] = [
  {
    part: 1,
    nameHe: '╫¬╫⌐╫¬╫ש╫¬ ╫פ╫₧╫ף╫ש╫ף╫פ ╫ץ╫פ╫ר╫¿╫ש╫נ╫צ\'',
    nameEn: 'Measurement & Triage Framework',
    description: '╫¢╫ש╫ª╫ף ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫₧╫₧╫ש╫¿ "╫¢╫נ╫ס╫ש╫¥" ╫£╫¬╫ª╫ץ╫¿╫פ ╫₧╫¬╫₧╫ר╫ש╫¬ ╫⌐╫£ ╫ó╫£╫ץ╫ש╫ץ╫¬ ╫ץ╫₧╫ף╫ף╫ש ╫ס╫⌐╫£╫ץ╫¬',
    primitiveIds: ['P10', 'P2', 'P7'],
    subTopics: [
      {
        id: 'tam-signature',
        nameHe: '╫ק╫¬╫ש╫₧╫¬ T/A/M',
        nameEn: 'T/A/M Signature (Time, Attention, Money)',
        description: '╫¢╫ש╫₧╫ץ╫¬ ╫פ╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫פ ╫£╫₧╫⌐╫נ╫ס╫ש╫¥ ╫º╫¿╫ש╫ר╫ש╫ש╫¥ Γאפ ╫צ╫₧╫ƒ, ╫º╫⌐╫ס, ╫¢╫í╫ú',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC'],
        diagnosticQuestions: [
          '╫¢╫₧╫פ ╫⌐╫ó╫ץ╫¬ ╫á╫ש╫פ╫ץ╫£╫ש╫ץ╫¬ ╫⌐╫ס╫ץ╫ó╫ש╫ץ╫¬ ╫נ╫ץ╫ס╫ף╫ץ╫¬ ╫ó╫£ ╫ñ╫ע╫ש╫⌐╫ץ╫¬ ╫ó╫ץ╫ף╫ñ╫ץ╫¬ ╫ץ╫¢╫ש╫ס╫ץ╫ש ╫⌐╫¿╫ש╫ñ╫ץ╫¬?',
          '╫₧╫פ╫ש ╫¿╫₧╫¬ ╫פ╫ó╫ץ╫₧╫í ╫פ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש Γאפ ╫¢╫₧╫פ ╫פ╫ק╫£╫ñ╫ץ╫¬ ╫פ╫º╫⌐╫¿ (Context Switches) ╫₧╫¬╫¿╫ק╫⌐╫ץ╫¬ ╫ס╫ש╫ץ╫¥?',
          '╫₧╫פ╫ץ ╫פ╫ף╫£╫ú ╫פ╫ñ╫ש╫á╫á╫í╫ש ╫פ╫á╫ץ╫ס╫ó ╫₧╫פ╫º╫ר╫ó "╫¢╫í╫ú ╫⌐╫á╫⌐╫נ╫¿ ╫ó╫£ ╫פ╫¿╫ª╫ñ╫פ"?',
        ],
        kpis: ['Decision Latency Hours/week', 'Context Switches/day', 'Revenue leakage Γג¬/month'],
      },
      {
        id: 'change-readiness',
        nameHe: '╫₧╫ץ╫ף╫£ ╫ס╫⌐╫£╫ץ╫¬ ╫£╫⌐╫ש╫á╫ץ╫ש',
        nameEn: 'Change Readiness (AIM, IAM, FIM)',
        description: '╫₧╫ף╫ף╫ש ╫₧╫º╫ץ╫ס╫£╫ץ╫¬, ╫פ╫£╫ש╫₧╫ץ╫¬ ╫ץ╫פ╫ש╫¬╫¢╫á╫ץ╫¬ ╫⌐╫£ ╫פ╫¬╫ó╫¿╫ס╫ץ╫ש╫ץ╫¬ (Weiner)',
        relatedPathologies: ['UC', 'OLD'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫פ╫¬╫ó╫¿╫ס╫ץ╫¬ ╫פ╫₧╫ץ╫ª╫ó╫¬ ╫á╫¬╫ñ╫í╫¬ ╫¢╫₧╫¬╫נ╫ש╫₧╫פ (Appropriate) ╫ó"╫ש ╫פ╫פ╫á╫פ╫£╫פ?',
          '╫פ╫נ╫¥ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫₧╫º╫ס╫£╫ש╫¥ ╫נ╫¬ ╫פ╫⌐╫ש╫á╫ץ╫ש (Acceptable) ╫נ╫ץ ╫ף╫ץ╫ק╫ש╫¥ ╫נ╫ץ╫¬╫ץ?',
          '╫פ╫נ╫¥ ╫פ╫ñ╫¬╫¿╫ץ╫ƒ ╫ש╫⌐╫ש╫¥ ╫¬╫ñ╫ó╫ץ╫£╫ש╫¬ ╫ץ╫¬╫º╫ª╫ש╫ס╫ש╫¬ (Feasible)?',
        ],
        kpis: ['AIM Score (1-5)', 'IAM Score (1-5)', 'FIM Score (1-5)'],
      },
      {
        id: 'ius-score',
        nameHe: '╫₧╫á╫ץ╫ó ╫ף╫ש╫¿╫ץ╫ע ╫ץ╫נ╫ש╫£╫ץ╫ª╫ש╫¥',
        nameEn: 'IUS Score & Constraint Envelope',
        description: '╫á╫ץ╫í╫ק╫¬ ╫ק╫ש╫⌐╫ץ╫ס ╫¬╫ץ╫ó╫£╫¬ ╫פ╫פ╫¬╫ó╫¿╫ס╫ץ╫¬ ╫₧╫ץ╫£ ╫ק╫í╫₧╫ש ╫¬╫º╫ª╫ש╫ס ╫ץ╫ñ╫á╫ש╫ץ╫¬ ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש╫¬',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC'],
        diagnosticQuestions: [
          '╫₧╫פ╫ץ ╫ª╫ש╫ץ╫ƒ ╫פ╫¬╫ץ╫ó╫£╫¬ ╫פ╫ª╫ñ╫ץ╫ש ╫₧╫ץ╫£ ╫ó╫£╫ץ╫¬ ╫פ╫פ╫¬╫ó╫¿╫ס╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫₧╫¬ ╫ק╫¿╫ש╫ע╫פ ╫₧╫í╫ú ╫ó╫ש╫ש╫ñ╫ץ╫¬ ╫פ╫⌐╫ש╫á╫ץ╫ש ╫⌐╫£ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥?',
          '╫₧╫פ╫ץ Constraint Penalty Γאפ ╫º╫á╫í ╫פ╫נ╫ש╫£╫ץ╫ª╫ש╫¥ ╫פ╫ª╫ñ╫ץ╫ש?',
        ],
        kpis: ['IUS Score (0-100)', 'Constraint Penalty (%)', 'Change Fatigue Index'],
      },
    ],
  },
  {
    part: 2,
    nameHe: '╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫¬╫º╫⌐╫ץ╫¿╫¬ ╫ץ╫₧╫¿╫ק╫ס ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש',
    nameEn: 'Communication & Psychological Space Pathologies',
    description: '╫¢╫⌐╫£╫ש╫¥ ╫ס╫ש╫¢╫ץ╫£╫¬ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫£╫á╫פ╫£ ╫צ╫¿╫ש╫₧╫¬ ╫₧╫ש╫ף╫ó ╫ק╫ץ╫ñ╫⌐╫ש╫¬ ╫ץ╫£╫פ╫ª╫ש╫ú ╫ר╫ó╫ץ╫ש╫ץ╫¬ ╫£╫£╫נ ╫ñ╫ק╫ף',
    primitiveIds: ['P7', 'P8', 'P9'],
    subTopics: [
      {
        id: 'zsg',
        nameHe: '╫¬╫¿╫ס╫ץ╫¬ ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í (ZSG)',
        nameEn: 'Zero-Sum Game Culture (ZSG)',
        description:
          '╫¬╫ק╫¿╫ץ╫¬ ╫ñ╫á╫ש╫₧╫ש╫¬ ╫ץ╫₧╫⌐╫נ╫ס╫ש╫¥ ╫á╫¬╫ñ╫í╫ש╫¥ ╫¢╫º╫ס╫ץ╫ó╫ש╫¥ Γאפ ╫פ╫¿╫ץ╫ץ╫ק ╫⌐╫£╫ש ╫¢╫פ╫ñ╫í╫ף ╫⌐╫£╫ת; ╫£╫¿╫ץ╫ס ╫₧╫£╫ץ╫ץ╫פ ╫ס╫ש╫¿╫ש╫ף╫¬ ╫ס╫ר╫ש╫ק╫ץ╫¬ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש╫¬ ╫ץ╫ף╫ש╫ץ╫ץ╫ק ╫ק╫í╫¿',
        relatedPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'UC'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫₧╫ף╫ץ╫ץ╫ק╫ש╫¥ ╫ó╫£ ╫¢╫₧╫ó╫ר-╫¬╫º╫£╫ץ╫¬ (Near-Miss) ╫£╫£╫נ ╫ñ╫ק╫ף ╫₧╫í╫á╫º╫ª╫ש╫ץ╫¬?',
          '╫₧╫פ ╫פ╫ñ╫ó╫¿ ╫ס╫ש╫ƒ ╫פ╫ª╫פ╫¿╫ץ╫¬ ╫פ╫פ╫á╫פ╫£╫פ ╫£╫á╫¢╫ץ╫á╫ץ╫¬ ╫ס╫ñ╫ץ╫ó╫£ ╫£╫פ╫ª╫ש╫ú ╫ר╫ó╫ץ╫ש╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫₧╫¬ ╫₧╫ע╫á╫á╫פ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש╫¬ Γאפ ╫ק╫ש╫ñ╫ץ╫⌐ ╫נ╫⌐╫₧╫ש╫¥ ╫ס╫₧╫º╫ץ╫¥ ╫ק╫º╫ש╫¿╫¬ ╫⌐╫ץ╫¿╫⌐╫ש ╫ס╫ó╫ש╫פ?',
        ],
        kpis: ['Near-Miss Reports/month', 'PSI Score (Edmondson)', 'Blame-to-System Ratio'],
      },
      {
        id: 'dugri-toxicity',
        nameHe: '╫¿╫ó╫ש╫£╫ץ╫¬ ╫פ╫ף╫ץ╫ע╫¿╫ש',
        nameEn: 'Dugri Toxicity',
        description: '╫⌐╫ש╫₧╫ץ╫⌐ ╫ס╫ש╫⌐╫ש╫¿╫ץ╫¬ ╫¢╫₧╫í╫ץ╫ץ╫פ ╫£╫נ╫£╫ש╫₧╫ץ╫¬ ╫₧╫ש╫£╫ץ╫£╫ש╫¬ ╫ץ╫¬╫¿╫ס╫ץ╫¬ ╫⌐╫£ ╫פ╫נ╫⌐╫₧╫פ',
        relatedPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'DR'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ "╫ש╫⌐╫ש╫¿╫ץ╫¬" ╫ס╫ñ╫ע╫ש╫⌐╫ץ╫¬ ╫פ╫á╫פ╫£╫פ ╫ש╫¿╫ף╫פ ╫£╫ñ╫í╫ש╫¥ ╫נ╫ש╫⌐╫ש╫ש╫¥?',
          '╫₧╫פ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ╫נ╫ש╫á╫ר╫¿╫נ╫º╫ª╫ש╫ץ╫¬ ╫פ╫₧╫ש╫£╫ץ╫£╫ש╫ץ╫¬ ╫פ╫ס╫£╫¬╫ש-╫₧╫º╫ª╫ץ╫ó╫ש╫ץ╫¬ ╫ס╫ª╫ץ╫ץ╫¬╫ש╫¥?',
          '╫פ╫נ╫¥ ╫פ╫á╫₧╫º╫ץ╫¬ ╫₧╫º╫ª╫ץ╫ó╫ש╫ץ╫¬ ╫á╫ף╫ק╫º╫ץ╫¬ ╫ó"╫ש ╫ס╫ש╫º╫ץ╫¿╫¬ ╫נ╫ש╫⌐╫ש╫¬?',
        ],
        kpis: ['Constructive vs Destructive Feedback Ratio', 'Exit Interview Mentions (%)'],
      },
      {
        id: 'boundary-ambiguity',
        nameHe: '╫ó╫₧╫ש╫₧╫ץ╫¬ ╫ע╫ס╫ץ╫£╫ץ╫¬',
        nameEn: 'Boundary Ambiguity Syndrome',
        description: '╫í╫¢╫á╫ץ╫¬ ╫פ╫פ╫ש╫¿╫¿╫¢╫ש╫פ ╫פ╫⌐╫ר╫ץ╫ק╫פ Γאפ ╫ס╫£╫ס╫ץ╫£ ╫¬╫ñ╫º╫ץ╫ף╫ש, ╫¢╫ñ╫ש╫£╫ץ╫ש╫ץ╫¬, ╫⌐╫ק╫ש╫º╫¬ ╫₧╫á╫פ╫£╫ש╫¥',
        relatedPathologies: ['SC', 'DR'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫₧╫¬ "╫נ╫⌐╫£╫ש╫ש╫¬ ╫ק╫ץ╫í╫¿ ╫ע╫ס╫ץ╫£╫ץ╫¬" Γאפ ╫¢╫ץ╫£╫¥ ╫₧╫ק╫£╫ש╫ר╫ש╫¥ ╫ó╫£ ╫פ╫¢╫£?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ╫פ╫ק╫£╫ר╫ץ╫¬ ╫⌐╫ק╫ץ╫צ╫¿╫ץ╫¬ ╫£╫₧╫á╫¢"╫£ ╫ס╫ע╫£╫£ ╫פ╫ש╫ó╫ף╫¿ ╫í╫₧╫¢╫ץ╫¬ ╫ס╫¿╫ץ╫¿╫פ?',
          '╫¢╫₧╫פ ╫ñ╫ע╫ש╫⌐╫ץ╫¬ ╫⌐╫ס╫ץ╫ó╫ש╫ץ╫¬ ╫á╫ע╫¿╫₧╫ץ╫¬ ╫₧╫¢╫ñ╫ש╫£╫ץ╫¬ ╫נ╫ק╫¿╫ש╫ץ╫¬?',
        ],
        kpis: ['Decision Escalation Rate (%)', 'Duplicate Meeting Hours/week'],
      },
    ],
  },
  {
    part: 3,
    nameHe: '╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫í╫ר╫ש╫ש╫פ ╫¬╫פ╫£╫ש╫¢╫ש╫¬ ╫ץ╫₧╫ס╫á╫ש╫¬',
    nameEn: 'Process & Structural Deviation Pathologies',
    description: '╫פ╫í╫¬╫ע╫£╫ץ╫¬ ╫£╫¬╫º╫ש╫á╫ץ╫¬ ╫⌐╫ע╫ץ╫ש╫פ ╫ץ╫נ╫ץ╫ס╫ף╫ƒ ╫₧╫⌐╫₧╫ó╫¬ ╫¬╫פ╫£╫ש╫¢╫ש╫¬',
    primitiveIds: ['P5', 'P8', 'P1'],
    subTopics: [
      {
        id: 'nod',
        nameHe: '╫á╫¿╫₧╫ץ╫£ ╫⌐╫£ ╫í╫ר╫ש╫ש╫פ (NOD)',
        nameEn: 'Normalization of Deviance',
        description: '╫פ╫ñ╫ש╫¢╫¬ ╫₧╫ó╫º╫ñ╫ש╫¥ ╫ץ╫º╫ש╫ª╫ץ╫¿╫ש ╫ף╫¿╫ת ╫₧╫í╫ץ╫¢╫á╫ש╫¥ ╫£╫á╫ץ╫¿╫₧╫פ ╫ס╫ע╫£╫£ ╫£╫ק╫ª╫ש ╫ש╫ש╫ª╫ץ╫¿ (Vaughan)',
        relatedPathologies: ['ND'],
        diagnosticQuestions: [
          '╫ס╫נ╫ש╫צ╫ץ ╫¬╫ף╫ש╫¿╫ץ╫¬ ╫á╫ó╫º╫ñ╫ש╫¥ ╫á╫פ╫£╫ש QA ╫¬╫ק╫¬ ╫£╫ק╫Ñ ╫ף╫ף╫£╫ש╫ש╫á╫ש╫¥?',
          '╫פ╫נ╫¥ "╫ó╫º╫ש╫ñ╫פ ╫ק╫ף-╫ñ╫ó╫₧╫ש╫¬" ╫פ╫ñ╫¢╫פ ╫£╫á╫ץ╫פ╫£ ╫í╫ר╫á╫ף╫¿╫ר╫ש?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ-Near-Miss ╫⌐╫£╫נ ╫ף╫ץ╫ץ╫ק ╫ס╫ע╫£╫£ ╫á╫ץ╫¿╫₧╫£╫ש╫צ╫ª╫ש╫פ?',
        ],
        kpis: ['QA Bypass Rate (%)', 'Vaughan Stage (1-5)', 'Technical Debt Growth Rate'],
      },
      {
        id: 'semantic-drift',
        nameHe: '╫í╫ק╫ש╫ñ╫פ ╫í╫₧╫á╫ר╫ש╫¬ ╫ף╫ע╫¿╫ף╫ר╫ש╫ס╫ש╫¬',
        nameEn: 'Degradative Semantic Drift',
        description: '╫⌐╫ק╫ש╫º╫¬ ╫פ╫₧╫⌐╫₧╫ó╫ץ╫¬ ╫⌐╫£ ╫á╫פ╫£╫ש╫¥ ╫ץ╫ó╫¿╫¢╫ש ╫£╫ש╫ס╫פ Γאפ "╫í╫ש╫í╫₧╫נ╫ץ╫¬ ╫¿╫ש╫º╫ץ╫¬"',
        relatedPathologies: ['UC', 'OLD'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫ª╫פ╫¿╫ץ╫¬ ╫פ╫ק╫צ╫ץ╫ƒ (Espoused) ╫ó╫ץ╫₧╫ף╫ץ╫¬ ╫ס╫í╫¬╫ש╫¿╫פ ╫£╫₧╫פ ╫⌐╫₧╫ס╫ץ╫ª╫ó (In-Use)?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ "╫פ╫í╫ש╫í╫₧╫נ╫ץ╫¬ ╫פ╫¿╫ש╫º╫ץ╫¬" Γאפ ╫ó╫¿╫¢╫ש╫¥ ╫⌐╫נ╫ú ╫נ╫ק╫ף ╫£╫נ ╫₧╫º╫ש╫ש╫¥ ╫ס╫ñ╫ץ╫ó╫£?',
          '╫פ╫נ╫¥ ╫נ╫ץ╫ס╫ף╫ƒ ╫פ"╫ק╫ש╫¢╫ץ╫ת ╫פ╫נ╫ץ╫á╫ר╫ץ╫£╫ץ╫ע╫ש" ╫₧╫ש╫ש╫ª╫¿ ╫ª╫ש╫á╫ש╫ץ╫¬ ╫ס╫º╫¿╫ס ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥?',
        ],
        kpis: ['Espoused vs In-Use Gap Score', 'Cynicism Index (survey)', 'Value Alignment (%)'],
      },
      {
        id: 'sc-deficit',
        nameHe: '╫ע╫ש╫¿╫ó╫ץ╫ƒ ╫ס╫פ╫ש╫¿╫ץ╫¬ ╫₧╫ס╫á╫ש╫¬',
        nameEn: 'Structural Clarity Deficit',
        description: '╫₧╫₧╫ע╫ץ╫¿╫ץ╫¬ ╫ó╫ץ╫ש╫á╫ץ╫¬ (Silos) ╫ץ╫⌐╫ש╫פ╫ץ╫ש ╫ק╫₧╫ץ╫¿ ╫ס╫º╫ס╫£╫¬ ╫פ╫ק╫£╫ר╫ץ╫¬',
        relatedPathologies: ['SC'],
        diagnosticQuestions: [
          '╫₧╫פ╫ץ ╫⌐╫ש╫פ╫ץ╫ש ╫º╫ס╫£╫¬ ╫פ╫פ╫ק╫£╫ר╫ץ╫¬ ╫פ╫₧╫₧╫ץ╫ª╫ó (Decision Latency) ╫ס╫ש╫₧╫ש╫¥?',
          '╫¢╫₧╫פ ╫¬╫פ╫£╫ש╫¢╫ש ╫£╫ש╫ס╫פ ╫₧╫¬╫ץ╫ó╫ף╫ש╫¥ ╫ץ╫á╫ע╫ש╫⌐╫ש╫¥?',
          '╫₧╫פ╫ש ╫פ╫ó╫£╫ץ╫¬ ╫פ╫¢╫í╫ñ╫ש╫¬ ╫⌐╫£ ╫ק╫ץ╫í╫¿ ╫פ╫ע╫ף╫¿╫¬ ╫í╫₧╫¢╫ץ╫ש╫ץ╫¬?',
        ],
        kpis: ['Decision Latency (days)', 'Documented Processes (%)', 'Silo Friction Cost (Γג¬/month)'],
      },
    ],
  },
  {
    part: 4,
    nameHe: '╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש╫ץ╫¬ ╫ץ╫º╫ש╫ס╫ó╫ץ╫ƒ ╫£╫₧╫ש╫ף╫פ',
    nameEn: 'Cognitive & Learning Fixation Pathologies',
    description: '╫ק╫ץ╫í╫¿ ╫ש╫¢╫ץ╫£╫¬ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫£╫ó╫¢╫£ ╫₧╫ש╫ף╫ó ╫ק╫ף╫⌐ ╫ץ╫£╫פ╫í╫ש╫º ╫₧╫í╫º╫á╫ץ╫¬ ╫ó╫₧╫ץ╫º╫ץ╫¬',
    primitiveIds: ['P7', 'P3', 'P12'],
    subTopics: [
      {
        id: 'old',
        nameHe: '╫ע╫ש╫¿╫ó╫ץ╫ƒ ╫£╫₧╫ש╫ף╫פ ╫נ╫¿╫ע╫ץ╫á╫ש (OLD)',
        nameEn: 'Organizational Learning Deficit',
        description: '╫¢╫⌐╫£ ╫ס╫₧╫ó╫ס╫¿ ╫£╫£╫₧╫ש╫ף╫פ ╫ף╫ץ-╫£╫ץ╫£╫נ╫¬╫ש╫¬ Γאפ ╫ר╫ש╫ñ╫ץ╫£ ╫ס╫í╫ש╫₧╫ñ╫ר╫ץ╫₧╫ש╫¥ ╫ס╫₧╫º╫ץ╫¥ ╫ס╫נ╫₧╫ץ╫á╫ץ╫¬ ╫ש╫í╫ץ╫ף (Argyris)',
        relatedPathologies: ['OLD', 'UC'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫¬╫º╫ץ╫ó ╫ס╫£╫₧╫ש╫ף╫פ ╫ק╫ף-╫£╫ץ╫£╫נ╫¬╫ש╫¬ Γאפ ╫נ╫ץ╫¬╫ƒ ╫¬╫º╫£╫ץ╫¬ ╫ק╫ץ╫צ╫¿╫ץ╫¬?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ╫¬╫ק╫º╫ש╫¿╫ש╫¥ ╫⌐╫פ╫ץ╫ס╫ש╫£╫ץ ╫£╫⌐╫ש╫á╫ץ╫ש ╫₧╫ס╫á╫ש ╫נ╫₧╫ש╫¬╫ש?',
          '╫פ╫נ╫¥ ╫פ╫á╫פ╫£╫פ ╫₧╫í╫ץ╫ע╫£╫¬ ╫£╫נ╫¬╫ע╫¿ ╫נ╫¬ ╫פ╫á╫ק╫ץ╫¬ ╫פ╫ש╫í╫ץ╫ף ╫⌐╫£╫פ?',
        ],
        kpis: ['Recurring Incident Rate (%)', 'AAR-to-Change Ratio', 'Assumption Challenge Index'],
      },
      {
        id: 'conceptia-fixation',
        nameHe: '╫º╫ש╫ס╫ó╫ץ╫ƒ ╫º╫ץ╫á╫í╫ñ╫ª╫ש╫פ ╫ץ╫¢╫⌐╫£ ╫¬╫ק╫º╫ץ╫¿',
        nameEn: 'Conceptia Fixation & AAR Malfunction',
        description: '╫¬╫ק╫º╫ש╫¿╫ש╫¥ ╫¢╫צ╫ש╫¿╫¬ ╫נ╫⌐╫₧╫ש╫¥, ╫ף╫ק╫ש╫ש╫¬ ╫ó╫ץ╫ס╫ף╫ץ╫¬ ╫פ╫í╫ץ╫¬╫¿╫ץ╫¬ ╫נ╫¬ ╫נ╫₧╫ץ╫á╫¬ ╫פ╫פ╫á╫פ╫£╫פ',
        relatedPathologies: ['OLD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫¬╫פ╫£╫ש╫¢╫ש AAR ╫₧╫¬╫á╫פ╫£╫ש╫¥ ╫¢╫₧╫ע╫á╫á╫פ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש╫¬?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ╫פ╫ק╫£╫ר╫ץ╫¬ ╫⌐╫á╫ף╫ק╫ץ ╫£╫₧╫¿╫ץ╫¬ ╫ó╫ף╫ץ╫ש╫ץ╫¬ ╫í╫ץ╫¬╫¿╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫ש╫⌐╫á╫פ "╫ó╫ש╫ץ╫ץ╫¿╫ץ╫ƒ ╫º╫ץ╫á╫í╫ñ╫ר╫ץ╫נ╫£╫ש" Γאפ ╫ף╫ס╫º╫ץ╫¬ ╫ס╫¬╫ץ╫¢╫á╫ש╫¬ ╫פ╫₧╫º╫ץ╫¿╫ש╫¬?',
        ],
        kpis: ['Defensive Routine Frequency', 'Evidence Rejection Rate (%)', 'Post-Mortem Quality Score'],
      },
      {
        id: 'clt',
        nameHe: '╫₧╫£╫¢╫ץ╫ף╫¬ ╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש (CLT)',
        nameEn: 'Cognitive Load Trap',
        description: '╫⌐╫ק╫ש╫º╫¬ ╫º╫⌐╫ס ╫ó╫º╫ס Context Switching ╫ץ╫ñ╫í╫ץ╫£╫¬ ╫º╫ץ╫ף AI Γאפ "╫í╫ק╫ש╫ñ╫פ ╫נ╫¿╫¢╫ש╫ר╫º╫ר╫ץ╫á╫ש╫¬"',
        relatedPathologies: ['CLT', 'SC'],
        diagnosticQuestions: [
          '╫¢╫₧╫פ Context Switches ╫ס╫ש╫ץ╫¥ ╫ק╫ץ╫ץ╫פ ╫₧╫פ╫á╫ף╫í ╫ס╫¢╫ש╫¿?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ ╫פ╫º╫ץ╫ף ╫⌐╫á╫¢╫¬╫ס ╫ó"╫ש AI ╫£╫£╫נ Review ╫נ╫á╫ץ╫⌐╫ש?',
          '╫¢╫₧╫פ ╫נ╫ק╫ץ╫צ ╫₧╫צ╫₧╫ƒ ╫פ╫₧╫ñ╫¬╫ק╫ש╫¥ ╫₧╫ץ╫⌐╫º╫ó ╫ס╫¬╫ש╫º╫ץ╫ƒ ╫ק╫ץ╫ס ╫ר╫¢╫á╫ש?',
        ],
        kpis: ['Context Switches/day', 'AI Code Without Review (%)', 'Tech Debt Time Tax (%)'],
      },
    ],
  },
  {
    part: 5,
    nameHe: '╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫ק╫ץ╫í╫ƒ ╫ץ╫⌐╫ק╫ש╫º╫פ',
    nameEn: 'Resilience & Burnout Pathologies',
    description: '╫ף╫£╫ף╫ץ╫£ ╫נ╫á╫¿╫ע╫ש╫פ ╫₧╫ó╫¿╫¢╫¬╫ש╫¬, ╫⌐╫ס╫ש╫¿╫¬ ╫á╫נ╫₧╫á╫ץ╫¬ ╫ץ╫º╫ש╫ñ╫נ╫ץ╫ƒ ╫¢╫ץ╫ק ╫נ╫ף╫¥',
    primitiveIds: ['P6', 'P9', 'P4'],
    subTopics: [
      {
        id: 'distorted-reciprocity',
        nameHe: '╫פ╫ף╫ף╫ש╫ץ╫¬ ╫₧╫ó╫ץ╫ץ╫¬╫¬ (DR)',
        nameEn: 'Distorted Reciprocity',
        description: '╫º╫¿╫ש╫í╫¬ ╫פ╫ק╫ץ╫צ╫פ ╫פ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש Γאפ ╫ñ╫ש╫ר╫ץ╫¿╫ש╫¥ ╫£╫₧╫ó╫ƒ ╫פ╫¬╫ש╫ש╫ó╫£╫ץ╫¬ ╫פ╫ץ╫á╫ש╫¬',
        relatedPathologies: ['DR'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫ס╫ש╫ª╫ó ╫ñ╫ש╫ר╫ץ╫¿╫ש╫¥ ╫נ╫ע╫¿╫í╫ש╫ס╫ש╫ש╫¥ ╫ס-12 ╫ק╫ץ╫ף╫⌐╫ש╫¥ ╫פ╫נ╫ק╫¿╫ץ╫á╫ש╫¥?',
          '╫₧╫פ╫ץ ╫₧╫ף╫ף ╫פ╫á╫נ╫₧╫á╫ץ╫¬ ╫£╫₧╫ץ╫ª╫¿ ╫£╫נ╫ק╫¿ ╫ע╫£╫ש ╫º╫ש╫ª╫ץ╫ª╫ש╫¥?',
          '╫פ╫נ╫¥ ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫ס╫¢╫ש╫¿╫ש╫¥ ╫₧╫¿╫ע╫ש╫⌐╫ש╫¥ ╫⌐"╫פ╫פ╫⌐╫º╫ó╫פ ╫⌐╫£╫פ╫¥ ╫£╫נ ╫á╫¿╫נ╫ש╫¬"?',
        ],
        kpis: ['Psychological Contract Breach Index', 'Voluntary Turnover (%)', 'Product Loyalty Score'],
      },
      {
        id: 'systemic-burnout',
        nameHe: '╫⌐╫ק╫ש╫º╫פ ╫₧╫ó╫¿╫¢╫¬╫ש╫¬ ╫ץ╫נ╫ñ╫º╫ר ╫¿╫ש╫ס╫נ╫ץ╫á╫ף',
        nameEn: 'Systemic Burnout & Rebound Effect',
        description: '╫פ╫ק╫צ╫¿╫פ ╫¢╫ñ╫ץ╫ש╫פ ╫£╫ש╫ó╫ף╫ש╫¥ ╫ס╫£╫¬╫ש-╫נ╫ñ╫⌐╫¿╫ש╫ש╫¥ ╫₧╫ש╫ף ╫נ╫ק╫¿╫ש ╫₧╫⌐╫ס╫¿',
        relatedPathologies: ['DR', 'CLT'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫פ╫á╫פ╫£╫פ ╫פ╫ע╫ף╫ש╫£╫פ KPIs ╫₧╫ש╫ף ╫£╫נ╫ק╫¿ ╫₧╫⌐╫ס╫¿ (Rebound)?',
          '╫₧╫פ╫ץ ╫⌐╫ש╫ó╫ץ╫¿ MBI Γאפ Maslach Burnout Inventory Γאפ ╫ס╫º╫¿╫ס ╫₧╫á╫פ╫£╫ש╫¥?',
          '╫פ╫נ╫¥ ╫ש╫⌐╫á╫פ ╫₧╫á╫פ╫ש╫ע╫ץ╫¬ ╫¿╫ע╫⌐╫ש╫¬ ╫נ╫ץ ╫¿╫º ╫₧╫á╫פ╫ש╫ע╫ץ╫¬ ╫₧╫ץ╫á╫ק╫ש╫¬-╫¬╫ץ╫ª╫נ╫ץ╫¬?',
        ],
        kpis: ['MBI Score (team avg)', 'KPI Ramp-up Post-Crisis (%)', 'Emotional Leadership Index'],
      },
      {
        id: 'miluim-multiplier',
        nameHe: '╫₧╫¢╫ñ╫ש╫£ ╫פ╫₧╫ש╫£╫ץ╫נ╫ש╫¥ ╫ץ╫í╫ר╫ע╫á╫ª╫ש╫פ ╫⌐╫º╫ר╫פ',
        nameEn: 'The Miluim Multiplier & Silent Stagnation',
        description: '╫ף╫ó╫ש╫¢╫¬ ╫ש╫ף╫ó ╫í╫₧╫ץ╫ש ╫ס╫ó╫º╫ס╫ץ╫¬ ╫פ╫ש╫ó╫ף╫¿╫ץ╫ש╫ץ╫¬ Γאפ ╫פ╫í╫¬╫ע╫¿╫ץ╫¬ ╫ס╫₧╫ª╫ס ╫פ╫ש╫⌐╫¿╫ף╫ץ╫¬',
        relatedPathologies: ['DR', 'OLD', 'CLT'],
        diagnosticQuestions: [
          '╫¢╫₧╫פ ╫ס╫¢╫ש╫¿╫ש╫¥ ╫á╫ó╫ף╫¿╫ש╫¥ ╫¢╫¿╫ע╫ó ╫ס╫⌐╫£ ╫₧╫ש╫£╫ץ╫נ╫ש╫¥ ╫ץ╫₧╫פ ╫נ╫ץ╫¿╫ת ╫פ╫פ╫ש╫ó╫ף╫¿╫ץ╫¬?',
          '╫₧╫פ╫ץ ╫צ╫₧╫ƒ ╫₧╫ק╫ª╫ש╫¬ ╫פ╫ק╫ש╫ש╫¥ ╫⌐╫£ ╫פ╫צ╫ש╫¢╫¿╫ץ╫ƒ ╫פ╫פ╫º╫⌐╫¿╫ש ╫£╫נ╫ק╫¿ ╫ó╫צ╫ש╫ס╫¬ ╫₧╫ñ╫¬╫ק ╫ס╫¢╫ש╫¿?',
          '╫פ╫נ╫¥ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫פ╫á╫ץ╫¬╫¿╫ש╫¥ ╫ó╫ס╫¿╫ץ ╫£"╫₧╫ª╫ס ╫פ╫ש╫⌐╫¿╫ף╫ץ╫¬" ╫₧╫º╫ª╫ץ╫ó╫ש?',
        ],
        kpis: ['Tacit Knowledge Half-Life (days)', 'Absentee Senior Ratio (%)', 'Silent Stagnation Index'],
      },
    ],
  },
  {
    part: 6,
    nameHe: '╫¬╫ק╫£╫ץ╫נ╫פ ╫¢╫ñ╫ץ╫£╫פ ╫ץ╫ק╫ץ╫º╫ש ╫¿╫ª╫ú',
    nameEn: 'Comorbidity & Sequencing Rules',
    description: '╫í╫ף╫¿ ╫ñ╫ó╫ץ╫£╫ץ╫¬ ╫ף╫ר╫¿╫₧╫ש╫á╫ש╫í╫ר╫ש ╫ס╫ó╫¬ ╫פ╫ץ╫ñ╫ó╫¬ ╫₧╫í╫ñ╫¿ ╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫ש╫ק╫ף',
    primitiveIds: ['P12', 'P8', 'P11'],
    subTopics: [
      {
        id: 'cascade-state',
        nameHe: '╫₧╫ª╫ס ╫º╫í╫º╫ף╫פ (CS)',
        nameEn: 'Cascade State',
        description: '╫¢╫⌐╫£ ╫₧╫ó╫¿╫¢╫¬╫ש ╫¿╫ץ╫ק╫ס╫ש ╫פ╫₧╫ó╫ª╫ש╫¥ ╫נ╫¬ ╫¢╫£ ╫פ╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫ס╫₧╫º╫ס╫ש╫£',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC', 'ZSG_SAFETY', 'ZSG_CULTURE', 'CLT', 'OLD'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫ש╫⌐ ╫º╫¿╫ש╫í╫¬ ╫נ╫₧╫ץ╫ƒ + ╫צ╫ש╫á╫ץ╫º ╫ס╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש + ╫⌐╫ש╫פ╫ץ╫ש ╫פ╫ק╫£╫ר╫ץ╫¬ ╫ס╫ץ-╫צ╫₧╫á╫ש╫¬?',
          '╫פ╫נ╫¥ 3 ╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫ץ╫¬ ╫⌐╫ץ╫á╫ץ╫¬ ╫ס╫¿╫₧╫פ ╫ק╫₧╫ץ╫¿╫פ ╫ñ╫ó╫ש╫£╫ץ╫¬ ╫ס╫₧╫º╫ס╫ש╫£?',
          '╫פ╫נ╫¥ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫₧╫ª╫ץ╫ש ╫ס"╫⌐╫ש╫¬╫ץ╫º ╫פ╫ק╫£╫ר╫ץ╫¬" ╫₧╫ץ╫ק╫£╫ר?',
        ],
        kpis: ['Concurrent Severe Pathologies Count', 'System Paralysis Index', 'Total Entropy Score'],
      },
      {
        id: 'burke-litwin',
        nameHe: '╫פ╫ש╫¿╫¿╫¢╫ש╫פ ╫í╫ש╫ס╫¬╫ש╫¬',
        nameEn: 'Burke-Litwin Causal Model',
        description: '╫פ╫ס╫ק╫á╫פ ╫ס╫ש╫ƒ ╫₧╫ק╫ץ╫£╫£╫ש ╫⌐╫ש╫á╫ץ╫ש ╫ר╫¿╫á╫í╫ñ╫ץ╫¿╫₧╫ר╫ש╫ס╫ש╫ש╫¥ ╫£╫ר╫¿╫á╫צ╫º╫ª╫ש╫ץ╫á╫ש╫ש╫¥',
        relatedPathologies: ['DR', 'SC', 'ZSG_SAFETY', 'ZSG_CULTURE'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫פ╫¢╫⌐╫£ ╫פ╫ץ╫נ ╫ס╫¿╫₧╫¬ ╫פ╫¬╫¿╫ס╫ץ╫¬/╫ק╫צ╫ץ╫ƒ (╫ר╫¿╫á╫í╫ñ╫ץ╫¿╫₧╫ר╫ש╫ס╫ש) ╫נ╫ץ ╫ס╫¿╫₧╫¬ ╫פ╫¬╫פ╫£╫ש╫¢╫ש╫¥ (╫ר╫¿╫á╫צ╫º╫ª╫ש╫ץ╫á╫ש)?',
          '╫פ╫נ╫¥ ╫⌐╫ש╫á╫ץ╫ש ╫ס╫₧╫á╫פ╫ש╫ע╫ץ╫¬ ╫ש╫ñ╫¬╫ץ╫¿ ╫נ╫¬ ╫פ╫ס╫ó╫ש╫פ, ╫נ╫ץ ╫⌐╫ף╫¿╫ץ╫⌐ ╫⌐╫ש╫á╫ץ╫ש ╫₧╫ס╫á╫ש?',
          '╫₧╫פ╫ש ╫⌐╫¢╫ס╫¬ ╫פ╫ע╫ץ╫¿╫¥ ╫פ╫í╫ש╫ס╫¬╫ש ╫פ╫¿╫נ╫⌐╫ש╫¬?',
        ],
        kpis: ['Transformational vs Transactional Score', 'Leadership Impact Factor'],
      },
      {
        id: 'sequencing-logic',
        nameHe: '╫¢╫£╫£╫ש ╫í╫ש╫º╫ץ╫ץ╫á╫í╫ש╫á╫ע',
        nameEn: 'Comorbidity Sequencing Logic',
        description: '╫ק╫ץ╫º╫ש╫¥: ZSG (╫í╫¢╫ץ╫¥-╫נ╫ñ╫í) ╫£╫ñ╫á╫ש OLD, CLT ╫£╫ñ╫á╫ש SC; ╫ש╫ª╫ש╫ס╫ץ╫¬ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש╫¬ ╫£╫ñ╫á╫ש ╫£╫₧╫ש╫ף╫פ ╫₧╫ר╫ó╫ץ╫ש╫ץ╫¬',
        relatedPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'OLD', 'CLT', 'SC'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫á╫ש╫í╫ש╫ץ╫ƒ ╫£╫ף╫¿╫ץ╫⌐ ╫£╫₧╫ש╫ף╫פ (OLD) ╫á╫¢╫⌐╫£ ╫ס╫ע╫£╫£ ╫¬╫¿╫ס╫ץ╫¬ ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í (ZSG) ╫ץ╫ס╫ש╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש ╫á╫₧╫ץ╫ת?',
          '╫פ╫נ╫¥ ╫⌐╫ש╫á╫ץ╫ש ╫₧╫ס╫á╫ש (SC) ╫á╫ק╫í╫¥ ╫ס╫ע╫£╫£ ╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש (CLT)?',
          '╫₧╫פ╫ץ ╫í╫ף╫¿ ╫פ╫ñ╫ó╫ץ╫£╫ץ╫¬ ╫פ╫á╫¢╫ץ╫ƒ ╫ó╫£ ╫ñ╫ש ╫פ╫ש╫¿╫¿╫¢╫ש╫ש╫¬ ╫פ╫í╫ש╫ס╫¬╫ש╫ץ╫¬?',
        ],
        kpis: ['Sequencing Compliance (%)', 'Iatrogenic Damage Incidents'],
      },
    ],
  },
  {
    part: 7,
    nameHe: '╫ñ╫¿╫ץ╫ר╫ץ╫º╫ץ╫£╫ש ╫פ╫¬╫ó╫¿╫ס╫ץ╫¬ ╫º╫£╫ש╫á╫ש╫¬',
    nameEn: 'Intervention Playbooks',
    description: '╫í╫ñ╫¿╫ש╫ש╫¬ ╫¢╫£╫ש╫¥ ╫ץ╫ñ╫¿╫º╫ר╫ש╫º╫ץ╫¬ ╫£╫¿╫ש╫ñ╫ץ╫ש ╫₧╫ס╫ץ╫í╫í╫ש ╫¿╫ñ╫ץ╫נ╫¬ ╫₧╫ó╫¿╫¢╫ץ╫¬',
    primitiveIds: ['P1', 'P11', 'P12'],
    subTopics: [
      {
        id: 'just-culture',
        nameHe: '╫¬╫¿╫ס╫ץ╫¬ ╫ª╫ץ╫ף╫º╫¬ ╫ץ╫¬╫ק╫º╫ש╫¿ ╫₧╫ץ╫º╫ש╫¿',
        nameEn: 'Just Culture & Appreciative Inquiry',
        description: '╫¿╫⌐╫¬ ╫₧╫ץ╫ע╫á╫¬ ╫£╫פ╫ץ╫ף╫נ╫פ ╫ס╫ר╫ó╫ץ╫ש╫ץ╫¬ Γאפ ECRI + ╫£╫₧╫ש╫ף╫פ ╫₧╫פ╫ª╫£╫ק╫ץ╫¬',
        relatedPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'OLD'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫¥ ╫₧╫á╫ע╫á╫ץ╫ƒ ╫פ╫ס╫ק╫á╫פ ╫ס╫ש╫ƒ ╫ר╫ó╫ץ╫¬ ╫נ╫á╫ץ╫⌐, ╫פ╫¬╫á╫פ╫ע╫ץ╫¬ ╫₧╫í╫ץ╫¢╫á╫¬, ╫ץ╫ñ╫צ╫ש╫צ╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫ש╫⌐╫á╫ץ ╫ñ╫ץ╫¿╫ץ╫¥ Triage ╫£╫ף╫ש╫ץ╫ץ╫ק╫ש Near-Miss?',
          '╫פ╫נ╫¥ ╫פ╫נ╫¿╫ע╫ץ╫ƒ ╫ק╫ץ╫º╫¿ ╫פ╫ª╫£╫ק╫ץ╫¬, ╫£╫נ ╫¿╫º ╫¢╫⌐╫£╫ש╫¥?',
        ],
        kpis: ['Just Culture Adoption (%)', 'Near-Miss Forum Activity', 'AI Success Investigation Rate'],
      },
      {
        id: 'nudge-mvc',
        nameHe: '╫₧╫ש╫á╫ץ╫ƒ ╫⌐╫ש╫á╫ץ╫ש ╫₧╫ש╫á╫ש╫₧╫£╫ש',
        nameEn: 'Minimum Viable Change & Nudge Management',
        description: '╫פ╫¬╫ó╫¿╫ס╫ץ╫ש╫ץ╫¬ 15 ╫ף╫º╫ץ╫¬ ╫₧╫º╫í╫ש╫₧╫ץ╫¥ Γאפ ╫¢╫£╫¢╫£╫פ ╫פ╫¬╫á╫פ╫ע╫ץ╫¬╫ש╫¬ ╫á╫ע╫ף ╫ó╫ש╫ש╫ñ╫ץ╫¬ ╫⌐╫ש╫á╫ץ╫ש',
        relatedPathologies: ['CLT', 'UC'],
        diagnosticQuestions: [
          '╫₧╫פ╫ץ ╫פ-MED ╫פ╫á╫ץ╫¢╫ק╫ש Γאפ ╫₧╫ש╫á╫ץ╫ƒ ╫נ╫ñ╫º╫ר╫ש╫ס╫ש ╫₧╫ש╫á╫ש╫₧╫£╫ש ╫⌐╫£ ╫פ╫¬╫ó╫¿╫ס╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫á╫ó╫⌐╫פ ╫⌐╫ש╫₧╫ץ╫⌐ ╫ס-Focus Blocks ╫ץ╫פ╫⌐╫פ╫ש╫ש╫¬ ╫¬╫º╫⌐╫ץ╫¿╫¬ ╫נ╫í╫ש╫á╫¢╫¿╫ץ╫á╫ש╫¬?',
          '╫₧╫פ╫ש ╫¿╫₧╫¬ ╫ó╫ש╫ש╫ñ╫ץ╫¬ ╫פ╫⌐╫ש╫á╫ץ╫ש ╫פ╫á╫ץ╫¢╫ק╫ש╫¬?',
        ],
        kpis: ['MVC Compliance (%)', 'Focus Block Hours/week', 'Change Fatigue Score (1-10)'],
      },
      {
        id: 'structural-engineering',
        nameHe: '╫פ╫á╫ף╫í╫פ ╫נ╫¿╫ע╫ץ╫á╫ש╫¬ (DACI, RevOps, CoS)',
        nameEn: 'Organizational Engineering',
        description: '╫ñ╫¬╫¿╫ץ╫á╫ץ╫¬ ╫₧╫ס╫á╫ש╫ש╫¥ Γאפ DACI, RevOps, Chief of Staff ╫¢╫ס╫ץ╫£╫₧╫ש ╫צ╫ó╫צ╫ץ╫ó╫ש╫¥',
        relatedPathologies: ['SC', 'DR'],
        diagnosticQuestions: [
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫¥ ╫₧╫ץ╫ף╫£ DACI ╫£╫º╫ס╫£╫¬ ╫פ╫ק╫£╫ר╫ץ╫¬?',
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫₧╫¬ ╫ñ╫ץ╫á╫º╫ª╫ש╫ש╫¬ RevOps ╫£╫ע╫ש╫⌐╫ץ╫¿ ╫ס╫ש╫ƒ ╫₧╫¢╫ש╫¿╫ץ╫¬, ╫⌐╫ש╫ץ╫ץ╫º ╫ץ╫¬╫ñ╫ó╫ץ╫£?',
          '╫פ╫נ╫¥ ╫º╫ש╫ש╫¥ Chief of Staff ╫⌐╫ñ╫ץ╫ó╫£ ╫¢╫ס╫ץ╫£╫¥ ╫צ╫ó╫צ╫ץ╫ó╫ש╫¥ ╫₧╫ץ╫£ ╫פ╫á╫פ╫£╫פ?',
        ],
        kpis: ['DACI Coverage (%)', 'Cross-Functional Friction Score', 'CoS Effectiveness Rating'],
      },
    ],
  },
]

// ΓפאΓפאΓפא Red Flags ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export type RedFlagSeverity = 'low' | 'medium' | 'critical'

export interface RedFlag {
  id: number
  nameHe: string
  nameEn: string
  severity: RedFlagSeverity
  description: string
  symptomExample: string
  relatedPathologies: ExtendedPathologyCode[]
}

export const RED_FLAGS: RedFlag[] = [
  {
    id: 1, severity: 'low',
    nameHe: '╫í╫ק╫ש╫ñ╫פ ╫í╫₧╫á╫ר╫ש╫¬ ╫ץ╫í╫ש╫í╫₧╫נ╫ץ╫¬ ╫¿╫ש╫º╫ץ╫¬',
    nameEn: 'Semantic Drift & Empty Slogans',
    description: '╫ó╫¿╫¢╫ש ╫£╫ש╫ס╫פ ╫ץ╫á╫פ╫£╫ש╫¥ ╫₧╫נ╫ס╫ף╫ש╫¥ ╫₧╫⌐╫₧╫ó╫ץ╫¬ Γאפ ╫פ╫ץ╫ñ╫¢╫ש╫¥ ╫£╫¢╫£╫ש ╫⌐╫ש╫ץ╫ץ╫º╫ש ╫ª╫ש╫á╫ש',
    symptomExample: '╫פ╫ª╫פ╫¿╫ץ╫¬ ╫¢╫₧╫ץ "╫ק╫ף╫⌐╫á╫ץ╫¬ ╫₧╫⌐╫ס╫⌐╫¬" ╫נ╫ץ "╫º╫ש╫ש╫₧╫ץ╫¬" ╫£╫£╫נ ╫¢╫ש╫í╫ץ╫ש ╫¬╫ñ╫ó╫ץ╫£╫ש',
    relatedPathologies: ['UC', 'OLD'],
  },
  {
    id: 2, severity: 'low',
    nameHe: '╫ס╫ש╫ר╫ץ╫£ ╫¬╫⌐╫¬╫ש╫ץ╫¬ ╫¬╫ץ╫₧╫¢╫ץ╫¬ ╫₧╫¬╫ץ╫ת "╫¬╫ץ╫ף╫ó╫¬ ╫₧╫ק╫í╫ץ╫¿"',
    nameEn: 'Support Infrastructure Cuts',
    description: '╫º╫ש╫ª╫ץ╫Ñ ╫פ╫ף╫¿╫¢╫ץ╫¬ ╫ץ╫¿╫ץ╫ץ╫ק╫פ ╫¢"╫ק╫ש╫í╫¢╫ץ╫ƒ" Γאפ ╫ק╫á╫ש╫º╫¬ ╫ק╫₧╫ª╫ƒ ╫פ╫₧╫ó╫¿╫¢╫¬',
    symptomExample: '╫ס╫ש╫ר╫ץ╫£ ╫¬╫º╫ª╫ש╫ס╫ש ╫פ╫¢╫⌐╫¿╫פ ╫ץ╫¿╫ץ╫ץ╫ק╫פ ╫£╫₧╫¿╫ץ╫¬ ╫í╫ש╫₧╫á╫ש ╫⌐╫ק╫ש╫º╫פ ╫ס╫¿╫ץ╫¿╫ש╫¥',
    relatedPathologies: ['DR', 'CLT'],
  },
  {
    id: 3, severity: 'low',
    nameHe: '╫נ╫⌐╫£╫ש╫ש╫¬ ╫פ╫ש╫¿╫¿╫¢╫ש╫פ ╫⌐╫ר╫ץ╫ק╫פ',
    nameEn: 'Flat Hierarchy Illusion',
    description: '╫פ╫ש╫₧╫á╫ó╫ץ╫¬ ╫₧╫⌐╫¿╫⌐╫¿╫¬ ╫ñ╫ש╫º╫ץ╫ף Γאפ ╫ף╫ש╫ץ╫á╫ש╫¥ ╫נ╫ש╫á╫í╫ץ╫ñ╫ש╫ש╫¥ ╫ץ╫₧╫ש╫º╫¿╫ץ-╫á╫ש╫פ╫ץ╫£',
    symptomExample: '╫¢╫£ ╫פ╫ק╫£╫ר╫פ ╫ñ╫¬╫ץ╫ק╫פ ╫£╫ף╫ש╫ץ╫ƒ ╫₧╫ק╫ץ╫ף╫⌐; ╫⌐╫ש╫פ╫ץ╫ש ╫פ╫ק╫£╫ר╫ץ╫¬ ╫¢╫¿╫ץ╫á╫ש',
    relatedPathologies: ['SC', 'DR'],
  },
  {
    id: 4, severity: 'medium',
    nameHe: '╫¬╫ץ╫ª╫נ╫ץ╫¬ ╫ק╫ש╫ץ╫ס╫ש╫ץ╫¬ ╫¢╫ץ╫צ╫ס╫ץ╫¬ ╫ס╫í╫º╫¿╫ש eNPS',
    nameEn: 'False Positive eNPS Scores',
    description: '╫í╫º╫¿╫ש╫¥ ╫₧╫¿╫נ╫ש╫¥ "╫פ╫¢╫£ ╫ס╫í╫ף╫¿" ╫נ╫ת ╫ñ╫£╫ר╫ñ╫ץ╫¿╫₧╫ץ╫¬ ╫נ╫á╫ץ╫á╫ש╫₧╫ש╫ץ╫¬ ╫ק╫ץ╫⌐╫ñ╫ץ╫¬ ╫í╫ר╫ע╫á╫ª╫ש╫פ ╫⌐╫º╫ר╫פ',
    symptomExample: 'eNPS ╫ע╫ס╫ץ╫פ ╫ס╫ó╫ץ╫ף ╫ס-Blind/Reddit ╫⌐╫ש╫ק ╫ó╫£ "╫₧╫ª╫ס ╫פ╫ש╫⌐╫¿╫ף╫ץ╫¬"',
    relatedPathologies: ['DR', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
  {
    id: 5, severity: 'medium',
    nameHe: '╫פ╫ש╫ó╫ף╫¿ ╫ף╫ש╫ץ╫ץ╫ק╫ש Near-Miss',
    nameEn: 'Zero Near-Miss Reports',
    description: '╫ª╫ץ╫ץ╫¬╫ש╫¥ "╫á╫ר╫ץ╫£╫ש ╫ס╫ó╫ש╫ץ╫¬" Γאפ ╫í╫ש╫₧╫ƒ ╫£╫¬╫¿╫ס╫ץ╫¬ ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í (ZSG); ╫ס╫ש╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש ╫á╫₧╫ץ╫ת ╫¢╫נ╫ש╫á╫ף╫ש╫º╫ר╫ץ╫¿',
    symptomExample: '╫נ╫ñ╫í ╫ף╫ש╫ץ╫ץ╫ק╫ש ╫¢╫₧╫ó╫ר-╫¬╫º╫£╫פ Γאפ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫₧╫ñ╫ק╫ף╫ש╫¥ ╫₧╫ó╫á╫ש╫⌐╫פ',
    relatedPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'ND'],
  },
  {
    id: 6, severity: 'medium',
    nameHe: '╫£╫₧╫ש╫ף╫פ ╫ק╫ף-╫£╫ץ╫£╫נ╫¬╫ש╫¬ ╫ץ╫¬╫ק╫º╫ש╫¿╫ש╫¥ ╫₧╫ס╫ץ╫í╫í╫ש ╫נ╫⌐╫₧╫פ',
    nameEn: 'Single-Loop & Blame-Based AAR',
    description: '╫ñ╫ץ╫í╫ר-╫₧╫ץ╫¿╫ר╫¥ = "╫₧╫ש ╫ñ╫ש╫⌐╫£?" ╫ס╫₧╫º╫ץ╫¥ ╫⌐╫נ╫£╫ץ╫¬ ╫ש╫í╫ץ╫ף',
    symptomExample: 'AAR ╫₧╫í╫¬╫ש╫ש╫¥ ╫ס╫פ╫נ╫⌐╫₧╫ץ╫¬ ╫פ╫ף╫ף╫ש╫ץ╫¬ ╫ץ╫¬╫ש╫º╫ץ╫á╫ש ╫ר╫£╫נ╫ש',
    relatedPathologies: ['OLD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
  {
    id: 7, severity: 'medium',
    nameHe: '╫פ╫ש╫ñ╫ץ╫ת ╫ש╫ק╫í ╫º╫ש╫ף╫ץ╫ף: ╫⌐╫¢╫ñ╫ץ╫£ AI ╫₧╫á╫ª╫ק Refactoring',
    nameEn: 'AI Duplication Over Refactoring',
    description: '╫ª╫á╫ש╫ק╫פ ╫ס╫⌐╫ש╫ñ╫ץ╫¿ ╫º╫ץ╫ף ╫£╫ó╫ץ╫₧╫¬ ╫ó╫£╫ש╫ש╫פ ╫ס╫º╫ץ╫ף ╫₧╫ץ╫ó╫¬╫º Γאפ ╫נ╫ץ╫ס╫ף╫ƒ ╫פ╫º╫⌐╫¿ ╫נ╫¿╫¢╫ש╫ר╫º╫ר╫ץ╫á╫ש',
    symptomExample: '╫ש╫¿╫ש╫ף╫פ ╫⌐╫£ 60% ╫ס-Refactoring, ╫ó╫£╫ש╫ש╫פ ╫ף╫¿╫₧╫ר╫ש╫¬ ╫ס╫º╫ץ╫ף Copy/Paste',
    relatedPathologies: ['CLT', 'OLD'],
  },
  {
    id: 8, severity: 'critical',
    nameHe: '╫á╫¿╫₧╫ץ╫£ ╫í╫ר╫ש╫ש╫פ ╫¢╫í╫ר╫á╫ף╫¿╫ר ╫ó╫ס╫ץ╫ף╫פ (NOD)',
    nameEn: 'NOD as Standard Practice',
    description: '╫ó╫º╫ש╫ñ╫פ ╫⌐╫ש╫ר╫¬╫ש╫¬ ╫⌐╫£ QA Γאפ ╫₧╫á╫ץ╫¿╫₧╫£╫¬ ╫ץ╫₧╫º╫ץ╫ס╫£╫¬ ╫ס╫נ╫¿╫ע╫ץ╫ƒ',
    symptomExample: '╫פ╫¬╫ó╫£╫₧╫ץ╫¬ ╫⌐╫ש╫ר╫¬╫ש╫¬ ╫₧╫á╫ץ╫¿╫ץ╫¬ ╫נ╫צ╫פ╫¿╫פ ╫¢╫ף╫ש ╫£╫ó╫₧╫ץ╫ף ╫ס╫ף╫ף╫£╫ש╫ש╫á╫ש╫¥',
    relatedPathologies: ['ND'],
  },
  {
    id: 9, severity: 'critical',
    nameHe: '╫צ╫ש╫á╫ץ╫º ╫ס╫¬╫ש╫º╫ץ╫á╫ש ╫ק╫ש╫¿╫ץ╫¥ (Hotfixes)',
    nameEn: 'Exponential Hotfix Spike',
    description: '╫º╫ñ╫ש╫ª╫פ ╫₧-14 ╫£-51 Hotfixes/1000 commits Γאפ ╫í╫ק╫ש╫ñ╫פ ╫נ╫¿╫¢╫ש╫ר╫º╫ר╫ץ╫á╫ש╫¬',
    symptomExample: '╫ñ╫¿╫ש╫í╫¬ ╫º╫ץ╫ף AI ╫£╫£╫נ ╫ñ╫ש╫º╫ץ╫ק Γזע ╫ק╫ץ╫ס ╫ר╫¢╫á╫ש Γזע ╫¬╫ש╫º╫ץ╫á╫ש ╫ק╫ש╫¿╫ץ╫¥ ╫ש╫ץ╫₧╫ש╫ש╫¥',
    relatedPathologies: ['CLT', 'ND'],
  },
  {
    id: 10, severity: 'critical',
    nameHe: '╫נ╫º╫צ╫ש╫ר ╫á╫¬╫ñ╫í ╫¢"╫₧╫á╫ע╫á╫ץ╫ƒ ╫₧╫ש╫£╫ץ╫ר"',
    nameEn: 'M&A as Escape Mechanism',
    description: '╫ó╫í╫º╫נ╫ץ╫¬ ╫ó╫á╫º ╫á╫¬╫ñ╫í╫ץ╫¬ ╫¢╫ס╫¿╫ש╫ק╫פ, ╫£╫נ ╫¢╫פ╫ש╫⌐╫ע Γאפ ╫נ╫¿╫ע╫ץ╫ƒ ╫₧╫ף╫₧╫¥',
    symptomExample: '╫ע╫ש╫ץ╫í ╫פ╫ץ╫ƒ ╫ó╫á╫º ╫נ╫ת ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫₧╫¬╫נ╫¿╫ש╫¥ ╫צ╫נ╫¬ ╫¢"╫ס╫¿╫ש╫ק╫פ ╫₧╫£╫ק╫Ñ"',
    relatedPathologies: ['DR'],
  },
]

// ΓפאΓפאΓפא Sequencing Rules ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export interface SequencingRule {
  id: string
  condition: string
  prerequisite: ExtendedPathologyCode
  blocked: ExtendedPathologyCode
  rationale: string
  severity: 'mandatory' | 'recommended'
}

export const SEQUENCING_RULES: SequencingRule[] = [
  {
    id: 'zsg-safety-before-old',
    condition: 'IF ZSG_SAFETY ΓיÑ 2 AND OLD ΓיÑ 2',
    prerequisite: 'ZSG_SAFETY',
    blocked: 'OLD',
    rationale:
      '╫נ╫ש ╫נ╫ñ╫⌐╫¿ ╫£╫ף╫¿╫ץ╫⌐ ╫£╫₧╫ש╫ף╫פ ╫₧╫ר╫ó╫ץ╫ש╫ץ╫¬ (OLD) ╫¢╫⌐╫ס╫ש╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש ╫á╫₧╫ץ╫ת ╫₧╫ץ╫á╫ó ╫ף╫ש╫ץ╫ץ╫ק ╫¢╫á╫פ. ╫ש╫⌐ ╫£╫ש╫ש╫ª╫ס ╫ס╫ר╫ש╫ק╫ץ╫¬ ╫£╫ñ╫á╫ש ╫ף╫¿╫ש╫⌐╫¬ ╫£╫₧╫ש╫ף╫פ.',
    severity: 'mandatory',
  },
  {
    id: 'zsg-culture-before-old',
    condition: 'IF ZSG_CULTURE ΓיÑ 2 AND OLD ΓיÑ 2',
    prerequisite: 'ZSG_CULTURE',
    blocked: 'OLD',
    rationale:
      '╫נ╫ש ╫נ╫ñ╫⌐╫¿ ╫£╫ף╫¿╫ץ╫⌐ ╫£╫₧╫ש╫ף╫פ ╫₧╫ר╫ó╫ץ╫ש╫ץ╫¬ (OLD) ╫¢╫⌐╫¬╫¿╫ס╫ץ╫¬ ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í ╫ע╫ץ╫¿╫₧╫¬ ╫£╫פ╫í╫¬╫¿╫¬ ╫¢╫⌐╫£╫ש╫¥ ╫ץ╫£╫₧╫נ╫ס╫º╫ש ╫ס╫ó╫£╫ץ╫¬. ╫ש╫⌐ ╫£╫ש╫ש╫⌐╫¿ ╫¬╫₧╫¿╫ש╫ª╫ש╫¥ ╫£╫ñ╫á╫ש ╫£╫₧╫ש╫ף╫פ.',
    severity: 'mandatory',
  },
  {
    id: 'clt-before-sc',
    condition: 'IF CLT ΓיÑ 2 AND SC ΓיÑ 2',
    prerequisite: 'CLT',
    blocked: 'SC',
    rationale: '╫⌐╫ש╫á╫ץ╫ש ╫₧╫ס╫á╫ש (SC) ╫ף╫ץ╫¿╫⌐ ╫º╫ש╫ס╫ץ╫£╫¬ ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש╫¬. ╫נ╫¥ CLT ╫ע╫ס╫ץ╫פ, ╫פ╫ª╫ץ╫ץ╫¬╫ש╫¥ ╫£╫נ ╫ש╫ª╫£╫ש╫ק╫ץ ╫£╫ó╫¢╫£ ╫⌐╫ש╫á╫ץ╫ש ╫₧╫ס╫á╫ש. ╫ש╫⌐ ╫£╫פ╫ñ╫ק╫ש╫¬ ╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש ╫º╫ץ╫ף╫¥.',
    severity: 'mandatory',
  },
  {
    id: 'zsg-safety-before-nd',
    condition: 'IF ZSG_SAFETY ΓיÑ 2 AND ND ΓיÑ 2',
    prerequisite: 'ZSG_SAFETY',
    blocked: 'ND',
    rationale:
      '╫ñ╫¬╫¿╫ץ╫ƒ ╫á╫¿╫₧╫ץ╫£ ╫í╫ר╫ש╫ץ╫¬ (ND) ╫ף╫ץ╫¿╫⌐ ╫ף╫ש╫ץ╫ץ╫ק ╫¢╫á╫פ. ╫ס╫£╫ש ╫ס╫ר╫ק╫ץ╫ƒ ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש Γאפ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫ש╫₧╫⌐╫ש╫¢╫ץ ╫£╫פ╫í╫¬╫ש╫¿ ╫₧╫ó╫º╫ñ╫ש╫¥.',
    severity: 'mandatory',
  },
  {
    id: 'zsg-culture-before-nd',
    condition: 'IF ZSG_CULTURE ΓיÑ 2 AND ND ΓיÑ 2',
    prerequisite: 'ZSG_CULTURE',
    blocked: 'ND',
    rationale:
      '╫ñ╫¬╫¿╫ץ╫ƒ ╫á╫¿╫₧╫ץ╫£ ╫í╫ר╫ש╫ץ╫¬ (ND) ╫ף╫ץ╫¿╫⌐ ╫ף╫ש╫ץ╫ץ╫ק ╫¢╫á╫פ. ╫¢╫£ ╫ó╫ץ╫ף ╫í╫¢╫ץ╫¥-╫נ╫ñ╫í ╫ñ╫á╫ש╫₧╫ש ╫£╫נ ╫₧╫ר╫ץ╫ñ╫£ Γאפ ╫פ╫ó╫ץ╫ס╫ף╫ש╫¥ ╫ש╫₧╫⌐╫ש╫¢╫ץ ╫£╫פ╫í╫¬╫ש╫¿ ╫₧╫ó╫º╫ñ╫ש╫¥.',
    severity: 'mandatory',
  },
  {
    id: 'dr-before-old',
    condition: 'IF DR ΓיÑ 3 AND OLD ΓיÑ 2',
    prerequisite: 'DR',
    blocked: 'OLD',
    rationale: '╫¢╫⌐╫ש╫⌐ ╫פ╫ף╫ף╫ש╫ץ╫¬ ╫₧╫ó╫ץ╫ץ╫¬╫¬ ╫ק╫₧╫ץ╫¿╫פ, ╫פ╫ץ╫ף╫נ╫פ ╫ס╫ר╫ó╫ץ╫¬ = ╫ק╫ץ╫£╫⌐╫פ. ╫ש╫⌐ ╫£╫¬╫º╫ƒ ╫נ╫¬ ╫פ╫ק╫ץ╫צ╫פ ╫פ╫ñ╫í╫ש╫¢╫ץ╫£╫ץ╫ע╫ש ╫£╫ñ╫á╫ש ╫ף╫¿╫ש╫⌐╫פ ╫£╫£╫₧╫ש╫ף╫פ.',
    severity: 'recommended',
  },
]

// ΓפאΓפאΓפא Anti-Fragility Protocols ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export interface AntifragilityProtocol {
  id: string
  nameHe: string
  nameEn: string
  mechanism: string
  howToExploit: string
  competitiveAdvantage: string
}

export const ANTIFRAGILITY_PROTOCOLS: AntifragilityProtocol[] = [
  {
    id: 'first-schema-advantage',
    nameHe: '╫ש╫¬╫¿╫ץ╫ƒ ╫פ╫í╫¢╫₧╫פ ╫פ╫¿╫נ╫⌐╫ץ╫á╫ש╫¬ ╫ץ╫º╫ץ╫ñ╫¬ ╫נ╫ע╫¿╫פ',
    nameEn: 'First Schema Advantage & Algorithmic Tollbooth',
    mechanism: '╫פ╫ñ╫ó╫£╫¬ "╫ס╫ש╫º╫ץ╫¿╫ץ╫¬ ╫פ╫ñ╫í╫ף-╫₧╫á╫פ╫ש╫ע" (Loss-Leader Audits) ╫ס╫צ╫₧╫ƒ ╫₧╫⌐╫ס╫¿ ╫⌐╫ץ╫º ╫£╫⌐╫נ╫ש╫ס╫¬ ╫á╫¬╫ץ╫á╫ש╫¥',
    howToExploit: '╫₧╫¬╫ע ╫נ╫¬ ╫₧╫ף╫ף ╫פ╫ק╫ץ╫í╫ƒ ╫¢"╫₧╫ע╫ƒ ╫₧╫⌐╫ñ╫ר╫ש" (Fiduciary Shield) ╫ó╫ס╫ץ╫¿ ╫ף╫ש╫¿╫º╫ר╫ץ╫¿╫ש╫ץ╫á╫ש╫¥ Γאפ ╫¢╫£ ╫ó╫í╫º╫¬ M&A ╫¬╫ף╫¿╫ץ╫⌐ ╫נ╫ץ╫¬╫ץ',
    competitiveAdvantage: '╫á╫ó╫ש╫£╫¬ ╫נ╫º╫ץ╫£╫ץ╫ע╫ש╫פ ╫⌐╫£╫₧╫פ ╫í╫ס╫ש╫ס ╫í╫ר╫á╫ף╫¿╫ר ╫פ╫נ╫ס╫ק╫ץ╫ƒ ╫⌐╫£╫ת Γאפ "╫º╫ץ╫ñ╫¬ ╫נ╫ע╫¿╫פ ╫נ╫£╫ע╫ץ╫¿╫ש╫¬╫₧╫ש╫¬"',
  },
  {
    id: 'shadow-absorption',
    nameHe: '╫í╫ñ╫ש╫ע╫¬ ╫ª╫£╫£╫ש╫¥ Γאפ ╫⌐╫נ╫ש╫ס╫¬ ╫ש╫ף╫ó ╫₧╫₧╫¬╫ק╫¿╫ש╫¥ ╫º╫ץ╫¿╫í╫ש╫¥',
    nameEn: 'Shadow Absorption Strategy',
    mechanism: '╫á╫ש╫ª╫ץ╫£ Horizontal Migration Γאפ ╫⌐╫נ╫ש╫ס╫¬ ╫ר╫נ╫£╫á╫ר╫ש╫¥ ╫₧╫ק╫ס╫¿╫ץ╫¬ ╫º╫ץ╫¿╫í╫ץ╫¬ ╫ó"╫ש ╫פ╫ª╫ó╫¬ ╫ס╫פ╫ש╫¿╫ץ╫¬ ╫₧╫ס╫á╫ש╫¬ ╫ץ╫₧╫⌐╫₧╫ó╫ץ╫¬',
    howToExploit: '╫ס╫צ╫₧╫ƒ ╫⌐╫₧╫¬╫ק╫¿╫ש╫¥ ╫ר╫ץ╫ס╫ó╫ש╫¥ ╫ס╫ó╫ץ╫₧╫í ╫º╫ץ╫ע╫á╫ש╫ר╫ש╫ס╫ש ╫ץ╫º╫ץ╫ף AI ╫£╫º╫ץ╫ש, ╫פ╫ª╫ó ╫í╫ס╫ש╫ס╫פ ╫á╫ר╫ץ╫£╫¬ ╫¿╫ó╫ש╫£╫ץ╫¬',
    competitiveAdvantage: '╫ע╫צ╫ש╫¿╫¬ "╫ñ╫⌐╫ש╫ר╫¬ ╫¿╫ע╫£ ╫ר╫¢╫á╫ץ╫£╫ץ╫ע╫ש╫¬" ╫ó╫£ ╫₧╫¬╫ק╫¿╫ש╫¥ ╫ó"╫ש ╫⌐╫נ╫ש╫ס╫¬ ╫פ╫ש╫ף╫ó ╫פ╫í╫₧╫ץ╫ש ╫⌐╫£╫פ╫¥',
  },
  {
    id: 'double-loop-leverage',
    nameHe: '╫£╫₧╫ש╫ף╫פ ╫ף╫ץ-╫£╫ץ╫£╫נ╫¬╫ש╫¬ ╫¢╫á╫⌐╫º ╫נ╫ע╫¿╫í╫ש╫ס╫ש',
    nameEn: 'Double-Loop Learning as Offensive Weapon',
    mechanism: '╫á╫ש╫ñ╫ץ╫Ñ ╫פ╫á╫ק╫ץ╫¬ ╫ש╫í╫ץ╫ף ╫⌐╫£ ╫פ╫⌐╫ץ╫º ╫ס╫צ╫₧╫ƒ ╫₧╫⌐╫ס╫¿ + Appreciative Inquiry ╫£╫⌐╫¢╫ñ╫ץ╫£ ╫פ╫ª╫£╫ק╫ץ╫¬',
    howToExploit: '╫ס╫₧╫º╫ץ╫¥ "╫₧╫ש ╫ñ╫ש╫⌐╫£" Γאפ ╫ק╫º╫ץ╫¿ ╫נ╫ש╫ñ╫פ ╫פ╫₧╫ó╫¿╫¢╫¬ ╫פ╫ª╫£╫ש╫ק╫פ ╫¬╫ק╫¬ ╫¢╫נ╫ץ╫í ╫ץ╫⌐╫¢╫ñ╫£ ╫£╫₧╫ק╫£╫º╫ץ╫¬ ╫נ╫ק╫¿╫ץ╫¬',
    competitiveAdvantage: '╫פ╫ó╫£╫נ╫¬ ╫ñ╫¿╫ש╫ץ╫ƒ ╫₧╫ó╫ס╫¿ ╫£╫¿╫₧╫פ ╫⌐╫£╫ñ╫á╫ש ╫פ╫₧╫⌐╫ס╫¿ Γאפ ╫פ╫ñ╫ש╫¢╫¬ ╫£╫ק╫Ñ ╫£╫₧╫á╫ץ╫ú',
  },
]

// ΓפאΓפאΓפא Intervention Playbook Extensions ΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפאΓפא

export interface ExtendedIntervention {
  id: string
  nameHe: string
  nameEn: string
  triggerPathologies: ExtendedPathologyCode[]
  horizon: string
  steps: string[]
  leadingMetrics: string[]
  changeFatigueRisk: 'low' | 'medium' | 'high'
}

export const EXTENDED_INTERVENTIONS: ExtendedIntervention[] = [
  {
    id: 'just-culture-protocol',
    nameHe: '╫ñ╫¿╫ץ╫ר╫ץ╫º╫ץ╫£ ╫¬╫¿╫ס╫ץ╫¬ ╫ª╫ץ╫ף╫º╫¬ (ECRI)',
    nameEn: 'Just Culture Protocol',
    triggerPathologies: ['ZSG_SAFETY', 'ZSG_CULTURE', 'OLD'],
    horizon: '╫ק╫ץ╫ף╫⌐╫ש╫¥ 1-3',
    steps: [
      '╫פ╫¢╫⌐╫¿╫¬ ╫₧╫á╫פ╫£╫ש╫¥ ╫£╫פ╫ס╫ק╫á╫פ: ╫ר╫ó╫ץ╫¬ ╫נ╫á╫ץ╫⌐ / ╫פ╫¬╫á╫פ╫ע╫ץ╫¬ ╫₧╫í╫ץ╫¢╫á╫¬ / ╫ñ╫צ╫ש╫צ╫ץ╫¬',
      '╫פ╫º╫₧╫¬ ╫ñ╫ץ╫¿╫ץ╫¥ Triage ╫⌐╫ס╫ץ╫ó╫ש ╫£╫ף╫ש╫ץ╫ץ╫ק╫ש Near-Miss',
      '╫₧╫ץ╫ף╫£╫ש╫á╫ע ╫ñ╫ע╫ש╫ó╫ץ╫¬ ╫₧╫á╫פ╫ש╫ע╫ץ╫¬╫ש Γאפ ╫פ╫á╫פ╫£╫פ ╫₧╫ץ╫ף╫פ ╫ס╫ר╫ó╫ץ╫ש╫ץ╫¬ ╫ñ╫ץ╫₧╫ס╫ש╫¬',
      '╫₧╫ó╫ס╫¿ ╫₧"╫₧╫ש ╫נ╫⌐╫¥?" ╫£"╫₧╫פ ╫á╫⌐╫ס╫¿ ╫ס╫₧╫ó╫¿╫¢╫¬?"',
    ],
    leadingMetrics: ['Near-Miss Reports Γזס', 'PSI Score Γזס', 'Blame Incidents Γזף'],
    changeFatigueRisk: 'medium',
  },
  {
    id: 'nudge-mvc',
    nameHe: 'Nudge Management + ╫₧╫ש╫á╫ץ╫ƒ ╫₧╫ש╫á╫ש╫₧╫£╫ש (MVC)',
    nameEn: 'Nudge Management & Minimum Viable Change',
    triggerPathologies: ['CLT', 'UC'],
    horizon: '╫ק╫ץ╫ף╫⌐╫ש╫¥ 1-2',
    steps: [
      '╫פ╫ע╫ף╫¿╫¬ Focus Blocks Γאפ 90 ╫ף╫º╫ץ╫¬ ╫£╫£╫נ ╫פ╫ñ╫¿╫ó╫ץ╫¬',
      '╫פ╫⌐╫פ╫ש╫ש╫¬ ╫¬╫º╫⌐╫ץ╫¿╫¬ ╫נ-╫í╫ש╫á╫¢╫¿╫ץ╫á╫ש╫¬ (Async-First Policy)',
      '╫פ╫¬╫ó╫¿╫ס╫ץ╫ש╫ץ╫¬ ╫₧╫º╫í╫ש╫₧╫ץ╫¥ 15 ╫ף╫º╫ץ╫¬ Γאפ MED ╫נ╫¿╫ע╫ץ╫á╫ש',
      'Nudge ╫ף╫ש╫ע╫ש╫ר╫£╫ש: ╫ף╫ק╫ש╫ñ╫ץ╫¬ ╫ó╫ף╫ש╫á╫ץ╫¬ ╫ס╫₧╫₧╫⌐╫º╫ש ╫ó╫ס╫ץ╫ף╫פ',
    ],
    leadingMetrics: ['Context Switches Γזף', 'Deep Work Hours Γזס', 'Change Fatigue Score Γזף'],
    changeFatigueRisk: 'low',
  },
  {
    id: 'daci-revops',
    nameHe: '╫פ╫á╫ף╫í╫¬ ╫נ╫¿╫ע╫ץ╫ƒ Γאפ DACI + RevOps + Chief of Staff',
    nameEn: 'Organizational Engineering (DACI/RevOps/CoS)',
    triggerPathologies: ['SC', 'DR'],
    horizon: '╫ק╫ץ╫ף╫⌐╫ש╫¥ 2-6',
    steps: [
      '╫₧╫ש╫ñ╫ץ╫ש ╫ץ╫פ╫ר╫₧╫ó╫¬ ╫₧╫ץ╫ף╫£ DACI Γאפ Driver, Approver, Contributor, Informed',
      '╫פ╫º╫₧╫¬ RevOps ╫£╫ע╫ש╫⌐╫ץ╫¿ ╫ס╫ש╫ƒ ╫₧╫¢╫ש╫¿╫ץ╫¬-╫⌐╫ש╫ץ╫ץ╫º-╫¬╫ñ╫ó╫ץ╫£',
      '╫₧╫ש╫á╫ץ╫ש Chief of Staff ╫¢"╫ס╫ץ╫£╫¥ ╫צ╫ó╫צ╫ץ╫ó╫ש╫¥" ╫₧╫ץ╫£ ╫ש╫צ╫₧╫ש╫¥',
      '╫פ╫ע╫ף╫¿╫¬ Decision Rights + SLA ╫£╫¢╫£ ╫í╫ץ╫ע ╫פ╫ק╫£╫ר╫פ',
    ],
    leadingMetrics: ['Decision Latency Γזף', 'Cross-Dept Friction Γזף', 'Escalation Rate Γזף'],
    changeFatigueRisk: 'high',
  },
  {
    id: 'cascade-halt',
    nameHe: '╫ñ╫¿╫ץ╫ר╫ץ╫º╫ץ╫£ ╫ó╫ª╫ש╫¿╫¬ ╫º╫í╫º╫ף╫פ',
    nameEn: 'Cascade State Halt Protocol',
    triggerPathologies: ['DR', 'ND', 'UC', 'SC', 'ZSG_SAFETY', 'ZSG_CULTURE', 'CLT', 'OLD'],
    horizon: '╫₧╫ש╫ש╫ף╫ש (0-7 ╫ש╫₧╫ש╫¥)',
    steps: [
      '╫ó╫ª╫ש╫¿╫¬ ╫¢╫£ ╫פ╫ש╫ץ╫צ╫₧╫ץ╫¬ ╫פ╫נ╫¿╫ע╫ץ╫á╫ש╫ץ╫¬ (Organizational Halt)',
      '╫ר╫¿╫ש╫נ╫צ\' ╫ק╫ש╫¿╫ץ╫¥ Γאפ ╫צ╫ש╫פ╫ץ╫ש ╫פ╫ñ╫¬╫ץ╫£╫ץ╫ע╫ש╫פ ╫פ╫ף╫ץ╫₧╫ש╫á╫á╫ר╫ש╫¬',
      '╫פ╫ñ╫ó╫£╫¬ Sprint ╫ק╫ץ╫í╫¥ ╫ó╫ץ╫¿╫º╫ש╫¥ ╫ó╫£ ╫פ╫ª╫ש╫¿ ╫פ╫º╫¿╫ש╫ר╫ש ╫ס╫ש╫ץ╫¬╫¿',
      '╫ס╫á╫ש╫ש╫¬ ╫¬╫ץ╫¢╫á╫ש╫¬ Sequencing ╫£╫ñ╫ש ╫ק╫ץ╫º╫ש ╫פ╫º╫ץ╫₧╫ץ╫¿╫ס╫ש╫ף╫ש╫ץ╫¬',
    ],
    leadingMetrics: ['System Paralysis Index Γזף', 'Halt Duration (days)', 'Recovery Trajectory'],
    changeFatigueRisk: 'high',
  },
]

// ── Full Diagnostic Context ─────────────────────────────────────────────────

/**
 * Get full diagnostic context for a pathology:
 * TAM signature + USTT primitives + cross-category mechanism
 */
export function getFullDiagnosticContext(code: ExtendedPathologyCode) {
  const tam = TAM_SIGNATURES[code]
  const primitives = getPrimitivesForPathology(code)
  const mechanism = getCrossCategoryMechanism(code)
  const map = PATHOLOGY_PRIMITIVE_MAP.find(m => m.pathology === code)

  return {
    pathology: code,
    tam,
    primitives,
    crossCategory: map?.crossCategory ?? null,
    mechanism,
  }
}
