/**
 * COR-SYS Pathology Knowledge Base
 *
 * TWO taxonomies run in parallel:
 *
 * 1. SEVERITY taxonomy (PathologyProfile) — original 4-level scale
 *    Used for quick triage and sprint urgency.
 *
 * 2. TYPE taxonomy (PathologyType) — DSM-Org 5-pathology model
 *    Maps organisational symptoms to structural disease types.
 *    Each type carries a T/A/M signature (Time / Attention / Money, 1–5 scale).
 *    CS (Chronic Stress) is a systemic amplifier, not a standalone pathology.
 *
 * Theoretical grounding:
 *   — Hobfoll COR theory (Conservation of Resources spirals)
 *   — Vaughan Normalization of Deviance (Challenger disaster)
 *   — Edmondson Psychological Safety → canonical type ZSG_SAFETY; zero-sum / silo incentives → ZSG_CULTURE
 *   — Argyris & Schön Double-Loop Learning
 *   — Sweller Cognitive Load Theory (CLT)
 *   — Floridi Ontological Friction & Semantic Drift
 *   — Gloria Mark — context-switching cost (23 min recovery)
 *   — Israeli high-tech cases 2024–2026: Playtika, Firebolt, Cariad, Replit, Humane AI
 *
 * Comorbidity cascade (from DSM-Org HTML):
 *   CS → NOD, CS → CLT, NOD → OLD, ZSG_* → OLD, ZSG_* → CS, CLT → NOD
 *   CS is the system amplifier: accelerates all other pathologies.
 */

import type { QuestionnaireAnswer } from '../corsys-questionnaire'
import { computePsiFromAnswers } from '../corsys-questionnaire'
import type { DiagnosticAxis } from './questions'

// ─── Severity taxonomy (original) ────────────────────────────────────────────

export type PathologyProfile = 'healthy' | 'at-risk' | 'critical' | 'systemic-collapse'

export interface PathologyEntry {
  profile: PathologyProfile
  dr_range: [number, number]
  nd_range: [number, number]
  uc_range: [number, number]
  label_he: string
  description: string
}

export const PATHOLOGY_KB: PathologyEntry[] = [
  {
    profile: 'healthy',
    dr_range: [0, 2.5],
    nd_range: [0, 2.5],
    uc_range: [0, 2.5],
    label_he: '\u05EA\u05E7\u05D9\u05DF',
    description: `
Organisation demonstrates low decision latency: decisions are made at the appropriate level
within 24–72 hours, escalations are rare and justified, and there is a clear owner for each
decision type. Teams operate under psychological safety — mistakes are surfaced early,
post-mortems focus on system improvement rather than blame, and people request help without
fear. Normative alignment is strong: written procedures match actual behaviour, quality gates
and code review processes are followed consistently, and exceptions are documented rather than
silently bypassed. Calibration is realistic: the organisation knows what it does not know,
product roadmap is revised based on feedback, technical debt is measured and actively managed.
Resource conservation (Hobfoll) is maintained — people finish the week with enough cognitive
capacity to plan ahead. Knowledge transfer processes exist and are used; key-person dependency
is low. In Israeli high-tech context: the "samoach" culture is channelled productively —
improvisation happens within guardrails, not instead of them.
    `.trim(),
  },
  {
    profile: 'at-risk',
    dr_range: [2.5, 5],
    nd_range: [2.5, 5],
    uc_range: [2.5, 5],
    label_he: '\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF',
    description: `
Organisation shows early warning signs of systemic stress. Decision latency is creeping upward:
managers hesitate to decide without senior approval, meetings multiply without outputs, and
"let's align" becomes a delay mechanism. Psychological safety is declining — people filter
feedback upward, problems surface late or only in corridors, and retrospectives lose candour.
Normalization of deviance is beginning: corners are cut "just this sprint", QA is deprioritised
under delivery pressure, and exceptions quietly become the norm (Vaughan incubation period).
Calibration drifts: roadmap commitments are made without realistic capacity assessment,
key engineers carry disproportionate knowledge load, and onboarding takes longer than planned.
In Israeli context: "dugri" directness has tipped into blame culture in some teams.
Reserve (miluim) absences or rapid headcount changes are straining team continuity.
Early signs of silent stagnation — people are compliant but no longer proactively problem-solving.
COR loss spiral has started: people are protecting remaining resources by doing less.
    `.trim(),
  },
  {
    profile: 'critical',
    dr_range: [5, 7.5],
    nd_range: [5, 7.5],
    uc_range: [5, 7.5],
    label_he: '\u05E7\u05E8\u05D9\u05D8\u05D9',
    description: `
Organisation is operating in Edmondson's "anxiety zone" — high accountability demands with low
psychological safety. Decision latency is severe: weeks pass between identifying a problem and
acting on it, escalations are blocked by political friction or unclear authority, and the gap
between those who know and those who decide is wide. Normalization of deviance is entrenched:
unsafe practices are standard procedure, post-incident reviews identify the same root causes
repeatedly without structural change, code ships without review under production pressure.
Calibration failure is evident: the organisation consistently misjudges scope, effort, and risk;
key-person dependency is extreme — single engineers hold tacit knowledge with no backup;
technical debt is untracked and compounding. Resource depletion is advanced: burnout is visible,
turnover is rising, tribal knowledge is leaving with departing employees. In Israeli context:
miluim multiplier is in full effect — key personnel absences have created critical gaps not
covered by documented processes. AI tools are being used to paper over capacity gaps
(Replit-style architecture drift). Strategic decisions are reactive rather than anticipatory.
Leadership is in "hyperbolic discounting" mode — trading long-term stability for short-term KPIs.
    `.trim(),
  },
  {
    profile: 'systemic-collapse',
    dr_range: [7.5, 10],
    nd_range: [7.5, 10],
    uc_range: [7.5, 10],
    label_he: '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA',
    description: `
Organisation has crossed the threshold of irreversible resource loss spiral (Hobfoll).
Decision-making has effectively stopped at the operational level — only the CEO or senior VP
makes decisions, creating a catastrophic bottleneck. The organisation cannot respond to market
signals because internal information flow is broken: people have stopped reporting problems
because reporting has no effect. Normalization of deviance has become structural reality —
the gap between stated policy and actual practice is so wide that the policy is meaningless
(Floridi semantic drift: values have been hollowed out). Calibration is absent: the organisation
operates on wishful projections disconnected from operational reality, as seen in Humane AI Pin
($700 product with negative unit economics) and Cariad (Big Bang ERP-style reform against
200 legacy vendors). Key people have either left or checked out — remaining engineers are
maintaining systems they did not build and do not fully understand, producing a 9x increase
in code churn. Psychological collapse is visible: attrition accelerates, the employer brand is
damaged, and the organisation cannot attract talent. In Israeli context: the distorted reciprocity
pathology is active — employees who survived war-time sacrifice now face layoffs with no
acknowledgement (Playtika sixth layoff cycle, Firebolt despite $100M reserves). Trust in
leadership is near zero. Without immediate structural intervention (tourniquet, not patch),
the organisation will face either forced acquisition at discount, bankruptcy, or forced
privatisation by PE at cost of human capital.
    `.trim(),
  },
]

// ─── Type taxonomy (DSM-Org: NOD + ZSG split + OLD + CLT + CS) ───────────────

export type PathologyType = 'NOD' | 'ZSG_SAFETY' | 'ZSG_CULTURE' | 'OLD' | 'CLT' | 'CS'

export interface TamSignature {
  t: number  // Time cost 1–5
  a: number  // Attention cost 1–5
  m: number  // Money cost 1–5
}

export interface PathologyTypeEntry {
  type: PathologyType
  label_he: string
  label_en: string
  tam: TamSignature
  primary_axes: DiagnosticAxis[]  // which DR/ND/UC axes this pathology activates
  is_amplifier: boolean           // CS is a system-level amplifier, not a standalone type
  description: string             // rich semantic text for embedding
}

export const PATHOLOGY_TYPE_KB: PathologyTypeEntry[] = [
  {
    type: 'NOD',
    label_he: '\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4 \u05E9\u05DC \u05E1\u05D8\u05D9\u05D9\u05D4',
    label_en: 'Normalization of Deviance',
    tam: { t: 4, a: 3, m: 5 },
    primary_axes: ['ND', 'DR'],
    is_amplifier: false,
    description: `
Normalization of Deviance (Vaughan): the gradual process by which deviations from written
standards become the informal operating norm, generating a growing delta between de jure process
and de facto practice. The "incubation period" is silent — no single decision feels dangerous.
Teams skip QA "just this sprint". Code review gates become optional under delivery pressure.
Security guardrails are bypassed because "we trust the team". Each shortcut feels local and
reversible. Collectively, they compound into structural fragility.

T/A/M signature: T=4 (every shortcut today becomes a hotfix tomorrow; QA time saved becomes
2× debugging time), A=3 (the deviance itself requires no additional attention — it IS normal —
but the resulting hotfixes demand constant context-switching), M=5 (exponential cost accumulation
as fixes build on top of previous bypassed fixes; technical debt surface area grows with each
copy-paste workaround).

Israeli high-tech manifestation: Replit AI deleted a production database — not a technology
failure but a NOD failure. The normalisation of using AI without guardrails became standard
practice. Humane AI Pin: each gate review accepted a slightly lower "market-ready" standard than
the previous. NOD in product development is indistinguishable from normal iteration until the
market renders its verdict. Cariad: 200 legacy vendors integrated without interface standardisation
because exceptions became the standard. In Israeli context, "yihyeh beseder" culture accelerates
NOD incubation — trust substitutes for documentation, and intuition substitutes for procedure.

Differential: CLT causes skipping because there is no capacity. NOD causes skipping because
it is no longer seen as a skip. In CLT, if you give people time, they want to do QA. In NOD,
they do not. This distinction drives intervention selection.

Comorbidities: NOD → OLD (deviance prevents learning from failures). CS → NOD (under chronic
stress, deviations normalise faster). CLT → NOD (when overloaded, shortcuts become habits).
    `.trim(),
  },
  {
    type: 'ZSG_SAFETY',
    label_he: '\u05D2\u05D9\u05E8\u05E2\u05D5\u05DF \u05D1\u05D1\u05D9\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9',
    label_en: 'Psychological Safety Deficit (Edmondson)',
    tam: { t: 2, a: 4, m: 3 },
    primary_axes: ['ND', 'UC'],
    is_amplifier: false,
    description: `
Psychological safety deficit (canonical code ZSG_SAFETY): people do not surface errors, risks,
or half-baked ideas early. Reporting feels personally costly; near-miss and learning signals
are suppressed. Edmondson PSI and voice-channel quality are primary discriminators.

T/A/M: T=2, A=4 (attention dominated by impression management and fear), M=3.

Comorbidities: ZSG_SAFETY → OLD (without safety, double-loop learning cannot start).
ZSG_SAFETY often co-occurs with ZSG_CULTURE (zero-sum incentives amplify fear of speaking up).
    `.trim(),
  },
  {
    type: 'ZSG_CULTURE',
    label_he: '\u05EA\u05E8\u05D1\u05D5\u05EA \u05E0\u05D9\u05DB\u05D5\u05E8 \u05E4\u05E0\u05D9\u05DD-\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA (\u05E1\u05DB\u05D5\u05DD-\u05D0\u05E4\u05E1)',
    label_en: 'Zero-Sum Game Culture',
    tam: { t: 3, a: 3, m: 5 },
    primary_axes: ['ND', 'DR'],
    is_amplifier: false,
    description: `
Zero-Sum Game Culture (canonical code ZSG_CULTURE): internal competition, information hoarding,
and silo dynamics create contradiction loss — local optimisations destroy system-level performance.
Resources, credit, and visibility are treated as finite. Post-mortems become blame assignments.

T/A/M signature: T=3, A=3, M=5. MBI: depersonalisation / territorial defence more salient than
pure exhaustion.

Israeli high-tech: Playtika cycles, HQ-vs-branch dynamics, miluim-related key-person leverage.

Intervention: shared metrics, RevOps/CoS, incentive realignment — not "culture workshop" alone.

Comorbidities: ZSG_CULTURE → OLD; ZSG_CULTURE → CS under sustained threat.
    `.trim(),
  },
  {
    type: 'OLD',
    label_he: '\u05DE\u05D5\u05D2\u05D1\u05DC\u05D5\u05D9\u05D5\u05EA \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA',
    label_en: 'Organizational Learning Disabilities',
    tam: { t: 3, a: 4, m: 4 },
    primary_axes: ['ND', 'UC'],
    is_amplifier: false,
    description: `
Organizational Learning Disabilities (OLD, Argyris & Schön): the organisation repeatedly
fights the same fires because governing variables and mental models are never questioned.
Single-loop learning corrects errors within existing assumptions. Double-loop learning
(Argyris) questions the assumptions themselves. OLD organisations are stuck in single-loop:
every post-mortem concludes with "we should communicate better" without asking why communication
structurally breaks down. The same action items appear in successive retrospectives. Root cause
analysis never reaches the second order.

T/A/M signature: T=3 (medium-high: time burned on recurring fires that were "solved" before),
A=4 (high: cognitive load from uncertainty — "this happened before, I'm not sure why we keep
hitting it"; emotional load of pattern without explanation), M=4 (high: direct cost of rebuild
and rework; indirect cost of customer trust erosion from repeated failures).

Mechanisms: OLD is often a downstream consequence of NOD (normalised deviance prevents
recognising what needs to change) and ZSG variants (blame / zero-sum suppress the psychological safety
required for genuine retrospection). The Replit AI case illustrates OLD: the same type of
AI-without-guardrails failure recurred across different tools, different teams, different
incidents — no cross-incident learning mechanism existed. The learning disability is structural,
not motivational.

Israeli context: Israeli startups prize speed over process. "We'll fix it later" is a cultural
norm. This accelerates OLD formation — the organisation builds technical and process debt
faster than it can repay it. When a crisis hits, the team has never built the retrospection
muscle required to change governing variables.

Retro health indicator: if Recurring Action Items (items appearing in more than one retrospective)
exceed 40% of total action items, OLD is clinically significant. Target: <20%.

Differential: NOD means the organisation does not see the deviation. OLD means the organisation
sees the deviation but cannot change the pattern. NOD is a visibility problem; OLD is a
learning structure problem.

Comorbidities: NOD → OLD (primary cascade). ZSG_SAFETY / ZSG_CULTURE → OLD (blame prevents learning).
    `.trim(),
  },
  {
    type: 'CLT',
    label_he: '\u05E2\u05D5\u05DE\u05E1 \u05E7\u05D5\u05D2\u05E0\u05D9\u05D8\u05D9\u05D1\u05D9 \u05DB\u05E8\u05D5\u05E0\u05D9',
    label_en: 'Chronic Cognitive Load / Stimulus Overload',
    tam: { t: 2, a: 5, m: 4 },
    primary_axes: ['UC', 'DR'],
    is_amplifier: false,
    description: `
Chronic Cognitive Load (CLT, Sweller): the architecture of work consistently demands more
attentional processing than human working memory capacity can sustain. Unlike Chronic Stress,
the source is architectural — it is the structure of the workday itself that is broken, not
emotional or existential pressure. The organisation can be diagnosed with CLT even in a
"healthy culture" if the system design produces chronic context-switching.

T/A/M signature: T=2 (CLT does not delay processes directly — it slows everything uniformly,
like friction applied to the entire system), A=5 (critical: the dominant cost vector; fragmented
knowledge work, constant interruptions, notification overload; Gloria Mark UC Irvine: context
switch costs 23 minutes to recover; 15 context switches/day = 5.75 hours burned on recovery
alone, leaving 2.25 hours of actual focused work in an 8-hour day), M=4 (high: reduced
throughput, quality degradation from partial attention, increased error rate in complex tasks).

Structural sources: meetings without clear output (information-not-decision meetings).
Fragmented tools requiring cross-platform synthesis. Real-time notification culture (Slack,
email, Jira all demanding simultaneous attention). Unclear task prioritisation forcing constant
context-switching to assess relative urgency. The "always-on" Israeli startup norm amplifies
CLT: boundaries between deep work and responsive work do not exist.

The 23-minute recovery metric (Gloria Mark) is the diagnostic anchor: every interrupt event
that breaks deep focus costs 23 minutes of productive capacity. In a meeting-dense organisation,
an engineer may have zero deep work sessions per day regardless of hours worked.

Differential: CLT = architectural overload (fix the system). CS = emotional/existential overload
(fix the environment and support). In CLT, Focus Time blocks work immediately. In CS, Focus
Time does not resolve the underlying exhaustion. NOD: in CLT people skip because there is no
capacity; in NOD they skip because the skip has been normalised.

Comorbidities: CLT → NOD (shortcuts become habits when overloaded). CS → CLT
(emotional exhaustion reduces available cognitive capacity, amplifying architectural overload).
    `.trim(),
  },
  {
    type: 'CS',
    label_he: '\u05DC\u05D7\u05E5 \u05DB\u05E8\u05D5\u05E0\u05D9 \u05D5\u05E1\u05E4\u05D9\u05E8\u05DC\u05D5\u05EA \u05D4\u05E4\u05E1\u05D3',
    label_en: 'Chronic Stress & Loss Spirals',
    tam: { t: 4, a: 5, m: 5 },
    primary_axes: ['DR', 'UC'],
    is_amplifier: true,
    description: `
Chronic Stress & Loss Spirals (CS, Hobfoll COR theory): persistent pressure that converts
resource loss into self-reinforcing loss spirals, eroding organisational resilience and
increasing systemic entropy. CS carries the highest combined T/A/M load (14/15) because it
does not present as a standalone pathology — it is a systemic amplifier that accelerates every
other pathology simultaneously.

T/A/M signature: T=4 (executive function degradation under chronic stress increases decision
latency — people in loss spirals make slower and lower-quality decisions), A=5 (attention
available for complex work collapses; emotional load dominates working memory),
M=5 (critical: the financial cost cascades through all downstream pathologies CS amplifies).

CS amplifier mechanism: CS → NOD (under chronic stress, deviations normalise faster because
people lack the capacity to enforce standards). CS → ZSG_CULTURE (internal competition increases when
people feel their survival is threatened). CS → OLD (learning capacity diminishes; the brain
under sustained cortisol load cannot engage double-loop reflection). CS → CLT (emotional
exhaustion reduces the cognitive buffer, amplifying architectural overload).

MBI profile: CS activates Emotional Exhaustion dimension primarily (people feel depleted before
the day begins), unlike ZSG_CULTURE which activates Depersonalisation. When MBI Emotional Exhaustion
score > 27, the organisation is clinically within CS territory.

Israeli context: CS is structurally amplified in Israeli high-tech 2023–2026. October 7 created
a macro-level loss event (Hobfoll: losses are more psychologically powerful than equivalent
gains). Extended reserve duty (miluim) creates chronic uncertainty and key-person absence.
Organisations that cut headcount during wartime trigger distorted reciprocity collapse: employees
who absorbed the sacrifice now face arbitrary termination. The psychological contract breaks,
and COR loss spirals activate across the remaining workforce.

Diagnostic indicator: when all three axes (DR, ND, UC) are simultaneously elevated above 6,
CS amplifier is likely active. Intervention must address the amplifier before pathology-specific
treatment — a tourniquet on a system under CS will have reduced efficacy.
    `.trim(),
  },
]

// ─── Public API ───────────────────────────────────────────────────────────────

export function getPathologyByProfile(profile: string): PathologyEntry | null {
  return PATHOLOGY_KB.find(p => p.profile === profile) ?? null
}

export function getPathologyTypeEntry(type: PathologyType): PathologyTypeEntry | null {
  return PATHOLOGY_TYPE_KB.find(p => p.type === type) ?? null
}

/**
 * Detect CS amplifier: all three axes simultaneously elevated.
 * When active, CS accelerates all other pathologies.
 */
export function detectCsAmplifier(scores: { dr: number; nd: number; uc: number }): boolean {
  const threshold = 6
  return scores.dr >= threshold && scores.nd >= threshold && scores.uc >= threshold
}

/**
 * Infer DR/ND/UC scores from a matched pathology profile + similarity score.
 * Uses midpoint of the range, weighted toward the extreme by (1 - similarity).
 */
export function inferScoresFromProfile(
  entry: PathologyEntry,
  similarity: number
): { dr: number; nd: number; uc: number } {
  const weight = (range: [number, number]) => {
    const mid = (range[0] + range[1]) / 2
    return parseFloat(mid.toFixed(1))
  }
  return {
    dr: weight(entry.dr_range),
    nd: weight(entry.nd_range),
    uc: weight(entry.uc_range),
  }
}

/**
 * When ND is elevated and decision reciprocity (DR) is weak, choose ZSG_SAFETY vs ZSG_CULTURE
 * using questionnaire signals; score-only fallback if answers absent.
 */
export function inferZsgVariant(
  scores: { dr: number; nd: number; uc: number },
  answers?: QuestionnaireAnswer | null
): 'ZSG_SAFETY' | 'ZSG_CULTURE' {
  if (answers) {
    const psi = computePsiFromAnswers(answers)
    if (psi != null && psi < 4) return 'ZSG_SAFETY'
    if (answers.pathologyZeroSum === 'frequent' || answers.pathologyZeroSum === 'occasional') {
      return 'ZSG_CULTURE'
    }
    if (
      answers.voiceInfrastructure === 'no_channel' ||
      answers.voiceInfrastructure === 'unused_channel'
    ) {
      return 'ZSG_SAFETY'
    }
  }
  if (scores.uc >= 6 && scores.nd >= 5) return 'ZSG_SAFETY'
  return 'ZSG_CULTURE'
}

/** Map persisted or legacy string codes to current PathologyType (snapshots, imports). */
export function normalizeLegacyPathologyType(raw: string): PathologyType {
  if (raw === 'ZSG') return 'ZSG_CULTURE'
  const allowed: PathologyType[] = [
    'NOD',
    'ZSG_SAFETY',
    'ZSG_CULTURE',
    'OLD',
    'CLT',
    'CS',
  ]
  if (allowed.includes(raw as PathologyType)) return raw as PathologyType
  return 'NOD'
}

/**
 * Map DR/ND/UC dominant axis to most likely PathologyType.
 * CS detection is handled separately via detectCsAmplifier.
 */
export function axisToPathologyType(
  dominantAxis: DiagnosticAxis,
  scores: { dr: number; nd: number; uc: number },
  answers?: QuestionnaireAnswer | null
): PathologyType {
  if (dominantAxis === 'UC') {
    if (scores.nd >= scores.dr) return 'OLD'
    return 'CLT'
  }
  if (dominantAxis === 'DR') {
    if (scores.nd >= scores.uc) return 'NOD'
    return 'NOD'
  }
  if (dominantAxis === 'ND') {
    if (scores.dr < 5 && scores.nd >= 5) return inferZsgVariant(scores, answers)
    return 'NOD'
  }
  return 'NOD'
}
