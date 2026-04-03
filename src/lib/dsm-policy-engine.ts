/**
 * DSM Policy Engine — Decision Support Layer
 *
 * Sits above dsm-engine.ts and transforms a DSMDiagnosis into:
 *   1. Research-module metadata (benchmark context per pathology)
 *   2. Golden-question answers (4 structured outputs for the consultant)
 *   3. Decision rules / policy (CTA, intervention priority, time-to-act)
 *   4. Feedback schema (for continuous calibration over time)
 *
 * Design principles:
 *   - Rules are data, not code: DECISION_RULES table drives all CTA logic.
 *   - Extension points: add a new PathologyCode or Rule without touching consumers.
 *   - No UI coupling: pure functions that return typed data.
 *
 * Research basis:
 *   - Vaughan (1996) NOD five-stage progression
 *   - Edmondson (1999) Psychological Safety
 *   - Argyris (1977) Double-Loop Learning
 *   - Floridi (2014) Ontological Friction / Semantic Drift
 *   - Borgatti et al. (2009) Network Analysis in Organizations
 *   - McKinsey OHI (2017) Organizational Health Index benchmarks
 *   - CultureAmp / Qualtrics benchmark cohorts (2022-2024)
 */

import type { DSMDiagnosis, PathologyCode, SeverityLevel } from './dsm-engine'

// ─── Benchmark Context (\u05D0\u05E4\u05D9\u05E7 \u05D0\u05F3 — \u05DE\u05D4 \u05E2\u05E9\u05D5 \u05D1\u05E2\u05D5\u05DC\u05DD) ─────────────────────────────

/**
 * Cohort percentile benchmarks derived from:
 * - McKinsey OHI N=1,500 orgs
 * - CultureAmp engagement dataset N=6,000 orgs
 * - COR-SYS heuristic model N=10,000 simulation
 *
 * Maps score range → estimated percentile within similar-size orgs.
 * Intentionally conservative (heuristic, not empirical per client cohort).
 */
export interface BenchmarkContext {
  pathologyCode: PathologyCode
  scoreRange: [number, number]
  percentileEstimate: string   // e.g. "top 20% (low pathology)"
  cohortNote: string           // context sentence for the UI
  referenceTools: string[]     // comparable tools that measure this dimension
}

export const BENCHMARK_CONTEXTS: BenchmarkContext[] = [
  // DR benchmarks
  {
    pathologyCode: 'DR',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — \u05E8\u05DE\u05EA \u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05EA \u05E0\u05DE\u05D5\u05DB\u05D4',
    cohortNote: '\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05DD \u05D1\u05D8\u05D5\u05D5\u05D7 \u05D6\u05D4 \u05DE\u05E6\u05D9\u05D2\u05D9\u05DD \u05E9\u05D9\u05EA\u05D5\u05E3 \u05E4\u05E2\u05D5\u05DC\u05D4 \u05D1\u05D9\u05DF-\u05DE\u05D7\u05DC\u05E7\u05EA\u05D9 \u05D2\u05D1\u05D5\u05D4 (OHI: "Direction" ≥ 75th)',
    referenceTools: ['McKinsey OHI — Direction', 'CultureAmp — Collaboration'],
  },
  {
    pathologyCode: 'DR',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 40–70 — \u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05EA \u05DE\u05EA\u05D5\u05E0\u05D4',
    cohortNote: '\u05D8\u05D9\u05E4\u05D5\u05E1\u05D9 \u05DC\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05DD \u05D1\u05E6\u05DE\u05D9\u05D7\u05D4 (50–300 \u05E2\u05D5\u05D1\u05D3\u05D9\u05DD) \u05D1\u05E9\u05DC\u05D1 \u05DE\u05E2\u05D1\u05E8 \u05DE\u05D1\u05E0\u05D9\u05D5\u05EA',
    referenceTools: ['McKinsey OHI — Direction', 'Atlassian Health Monitor — Shared Understanding'],
  },
  {
    pathologyCode: 'DR',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 30% — \u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4',
    cohortNote: '\u05DE\u05EA\u05D0\u05DD \u05E9\u05DC\u05D9\u05DC\u05D9 \u05E2\u05DD ROI \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9 (Różycka-Tran BZSG r=−.41, N=10,000)',
    referenceTools: ['McKinsey OHI — Direction', 'Qualtrics EmployeeXM — Conflict Index'],
  },
  // ND benchmarks
  {
    pathologyCode: 'ND',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — \u05E2\u05DE\u05D9\u05D3\u05D4 \u05D2\u05D1\u05D5\u05D4\u05D4 \u05D1\u05E0\u05D4\u05DC\u05D9\u05DD',
    cohortNote: '\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05DD \u05D1\u05D8\u05D5\u05D5\u05D7 \u05D6\u05D4 \u05DE\u05E6\u05D9\u05D2\u05D9\u05DD BIA accuracy \u05D2\u05D1\u05D5\u05D4 \u05D5-near-miss reporting \u05D0\u05E4\u05E7\u05D8\u05D9\u05D1\u05D9',
    referenceTools: ['ISO 22301 BCM Maturity', 'Atlassian Health Monitor — Health Checks'],
  },
  {
    pathologyCode: 'ND',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — NOD \u05DE\u05EA\u05D5\u05DF',
    cohortNote: 'Vaughan Stage 2–3: \u05E1\u05D8\u05D9\u05D5\u05EA \u05DE\u05D5\u05DB\u05E8\u05D5\u05EA \u05D0\u05DA \u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05DE\u05E0\u05D5\u05E8\u05DE\u05DC\u05D5\u05EA \u05DC\u05D7\u05DC\u05D5\u05D8\u05D9\u05DF',
    referenceTools: ['ISO 22301', 'CultureAmp — Process Adherence'],
  },
  {
    pathologyCode: 'ND',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — NOD \u05D7\u05DE\u05D5\u05E8',
    cohortNote: 'Vaughan Stage 4–5: \u05E1\u05D8\u05D9\u05D5\u05EA \u05D4\u05E4\u05DB\u05D5 \u05DC\u05E0\u05D5\u05E8\u05DE\u05D4; \u05E1\u05D9\u05DB\u05D5\u05DF \u05D2\u05D1\u05D5\u05D4 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2\u05D9 BCM',
    referenceTools: ['ISO 22301', 'Qualtrics EmployeeXM — Risk Culture'],
  },
  // UC benchmarks
  {
    pathologyCode: 'UC',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 20% — \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4',
    cohortNote: 'Edmondson Psychological Safety ≥ 4.2/5; Double-Loop learning \u05DE\u05EA\u05D5\u05E2\u05D3',
    referenceTools: ['Edmondson PSYCH-SAFE scale', 'CultureAmp — Learning & Development'],
  },
  {
    pathologyCode: 'UC',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — \u05DC\u05DE\u05D9\u05D3\u05D4 \u05DE\u05E2\u05D5\u05E8\u05D1\u05EA',
    cohortNote: 'Single-loop \u05D1\u05E2\u05D9\u05E7\u05E8; AAR \u05DE\u05EA\u05D1\u05E6\u05E2 \u05D0\u05DA \u05DE\u05DE\u05E6\u05D0\u05D9\u05DD \u05DC\u05D0 \u05DE\u05EA\u05D5\u05E8\u05D2\u05DE\u05D9\u05DD \u05DC\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05D1\u05E0\u05D9',
    referenceTools: ['CultureAmp — Learning', 'Qualtrics EmployeeXM — Feedback Culture'],
  },
  {
    pathologyCode: 'UC',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — \u05DB\u05E9\u05DC \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D7\u05DE\u05D5\u05E8',
    cohortNote: 'Semantic drift \u05D2\u05D1\u05D5\u05D4 + \u05EA\u05E8\u05D1\u05D5\u05EA \u05D4\u05D0\u05E9\u05DE\u05D4; Floridi Ontological Friction > threshold',
    referenceTools: ['Edmondson PSYCH-SAFE scale', 'McKinsey OHI — Innovation & Learning'],
  },
  // SC benchmarks
  {
    pathologyCode: 'SC',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — \u05D1\u05D4\u05D9\u05E8\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4',
    cohortNote: 'RACI \u05D1\u05E8\u05D5\u05E8, \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9 \u05DC\u05D9\u05D1\u05D4 \u05DE\u05EA\u05D5\u05E2\u05D3\u05D9\u05DD, \u05D5-decision rights \u05DE\u05D5\u05D2\u05D3\u05E8\u05D9\u05DD',
    referenceTools: ['RACI Audit', 'Gartner Org Design Maturity'],
  },
  {
    pathologyCode: 'SC',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — \u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9\u05EA',
    cohortNote: '\u05DE\u05D1\u05E0\u05D4 \u05D7\u05DC\u05E7\u05D9 \u05E2\u05DD \u05D7\u05D9\u05DB\u05D5\u05DB\u05D9 handoff \u05D5\u05E9\u05D8\u05D7\u05D9\u05DD \u05D0\u05E4\u05D5\u05E8\u05D9\u05DD \u05D1\u05D9\u05DF \u05D9\u05D7\u05D9\u05D3\u05D5\u05EA',
    referenceTools: ['Operating Model Health Check', 'Process Documentation Audit'],
  },
  {
    pathologyCode: 'SC',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — \u05DB\u05E9\u05DC \u05DE\u05D1\u05E0\u05D9 \u05D7\u05DE\u05D5\u05E8',
    cohortNote: '\u05D7\u05D5\u05E1\u05E8 \u05D1\u05D4\u05D9\u05E8\u05D5\u05EA \u05E1\u05DE\u05DB\u05D5\u05EA\u05D9\u05EA \u05D5\u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05EA \u05E9\u05DE\u05D9\u05D9\u05E6\u05E8 \u05E2\u05D9\u05DB\u05D5\u05D1 \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05D5\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D9\u05EA \u05DE\u05E2\u05E7\u05E4\u05D9\u05DD',
    referenceTools: ['RACI Heatmap', 'Decision Rights Assessment'],
  },
]

export function getBenchmarkForScore(code: PathologyCode, score: number): BenchmarkContext | undefined {
  return BENCHMARK_CONTEXTS.find(
    (b) => b.pathologyCode === code && score >= b.scoreRange[0] && score <= b.scoreRange[1]
  )
}

// ─── Research Modules (\u05D0\u05E4\u05D9\u05E7 \u05D1\u05F3 — \u05E1\u05D9\u05E0\u05EA\u05D6\u05EA \u05DE\u05D0\u05DE\u05E8\u05D9\u05DD) ────────────────────────────

/**
 * Each research module encodes a theoretical construct as a typed object.
 * Parameters marked `calibratable` can be tuned per cohort without code changes.
 */
export interface ResearchModule {
  id: string
  name: string
  theoreticalBasis: string
  measuredConstruct: string       // \u05DE\u05D4 \u05D4\u05DE\u05D5\u05D3\u05D5\u05DC \u05DE\u05D5\u05D3\u05D3
  dependentVariable: string       // \u05DE\u05E9\u05EA\u05E0\u05D4 \u05EA\u05DC\u05D5\u05D9
  empiricalEvidence: string       // N, effect size, context
  pathologyMapping: PathologyCode[]
  calibratableParams: {
    name: string
    currentValue: number | string
    description: string
  }[]
}

export const RESEARCH_MODULES: ResearchModule[] = [
  {
    id: 'decision-latency',
    name: 'Decision Latency Index',
    theoreticalBasis: 'Cyert & March (1963) Behavioral Theory of the Firm; Eisenhardt (1989) Speed in Strategic Decision Making',
    measuredConstruct: '\u05E9\u05E2\u05D5\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC\u05D9\u05D5\u05EA \u05E9\u05D1\u05D5\u05E2\u05D9\u05D5\u05EA \u05E9\u05E0\u05E9\u05E8\u05E4\u05D5\u05EA \u05E2\u05DC \u05D4\u05DE\u05EA\u05E0\u05D4, \u05DB\u05D9\u05D1\u05D5\u05D9 \u05E9\u05E8\u05D9\u05E4\u05D5\u05EA \u05D5\u05E4\u05D2\u05D9\u05E9\u05D5\u05EA \u05E2\u05D5\u05D3\u05E4\u05D5\u05EA',
    dependentVariable: 'J-Quotient = C(t)/E(t) — \u05D9\u05D7\u05E1 \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D6\u05DE\u05D9\u05E0\u05D4 \u05DC\u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4',
    empiricalEvidence: 'Eisenhardt (1989): \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05DD \u05E2\u05DD decision latency \u05E0\u05DE\u05D5\u05DA \u05DE\u05E6\u05D9\u05D2\u05D9\u05DD ROI \u05D2\u05D1\u05D5\u05D4 \u05D1-30%; McKinsey (2019): 70% \u05DE\u05D4\u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05DE\u05D3\u05D5\u05D5\u05D7\u05D9\u05DD \u05E2\u05DC >10h/\u05E9\u05D1\u05D5\u05E2 \u05D0\u05D1\u05D5\u05D3',
    pathologyMapping: ['DR', 'ND', 'UC'],
    calibratableParams: [
      { name: 'hoursThresholdCritical', currentValue: 15, description: '\u05E9\u05E2\u05D5\u05EA \u05D0\u05D1\u05D5\u05D3\u05D5\u05EA/\u05E9\u05D1\u05D5\u05E2 \u05E9\u05DE\u05D2\u05D3\u05D9\u05E8\u05D5\u05EA latency \u05E7\u05E8\u05D9\u05D8\u05D9' },
      { name: 'hoursThresholdModerate', currentValue: 5, description: '\u05E9\u05E2\u05D5\u05EA \u05D0\u05D1\u05D5\u05D3\u05D5\u05EA/\u05E9\u05D1\u05D5\u05E2 \u05E9\u05DE\u05D2\u05D3\u05D9\u05E8\u05D5\u05EA latency \u05DE\u05EA\u05D5\u05DF' },
      { name: 'workingHoursPerMonth', currentValue: 160, description: '\u05E9\u05E2\u05D5\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4 \u05D7\u05D5\u05D3\u05E9\u05D9\u05D5\u05EA \u05DC\u05D7\u05D9\u05E9\u05D5\u05D1 \u05E2\u05DC\u05D5\u05EA \u05E9\u05E2\u05D4' },
    ],
  },
  {
    id: 'psychological-safety',
    name: 'Psychological Safety / Learning Mode',
    theoreticalBasis: 'Edmondson (1999) Psychological Safety and Learning Behavior in Work Teams; Munn et al. (2023)',
    measuredConstruct: '\u05DE\u05D9\u05D3\u05EA \u05D4\u05D1\u05D8\u05D7\u05D5\u05DF \u05E9\u05DC \u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05DC\u05D3\u05D5\u05D5\u05D7 \u05E2\u05DC \u05D8\u05E2\u05D5\u05D9\u05D5\u05EA, \u05DC\u05D1\u05E7\u05E9 \u05E2\u05D6\u05E8\u05D4 \u05D5\u05DC\u05D4\u05E6\u05D9\u05E2 \u05E8\u05E2\u05D9\u05D5\u05E0\u05D5\u05EA',
    dependentVariable: 'UC score — \u05DB\u05E9\u05DC \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9',
    empiricalEvidence: 'Edmondson (1999): α=.82, r=.35 \u05E2\u05DD team learning; Munn et al. (2023): PS mediates 40% of safety outcomes',
    pathologyMapping: ['UC'],
    calibratableParams: [
      { name: 'ucLearningWeight', currentValue: 0.4, description: '\u05DE\u05E9\u05E7\u05DC \u05E8\u05DB\u05D9\u05D1 \u05D4\u05DC\u05DE\u05D9\u05D3\u05D4 \u05D1\u05D7\u05D9\u05E9\u05D5\u05D1 UC' },
      { name: 'ucSemanticWeight', currentValue: 0.25, description: '\u05DE\u05E9\u05E7\u05DC \u05E8\u05DB\u05D9\u05D1 \u05D4\u05E1\u05DE\u05E0\u05D8\u05D9\u05E7\u05D4 \u05D1\u05D7\u05D9\u05E9\u05D5\u05D1 UC' },
      { name: 'ucPsiWeight', currentValue: 0.2, description: '\u05DE\u05E9\u05E7\u05DC \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 \u05DE\u05E0\u05D5\u05E8\u05DE\u05DC (PSI normalized)' },
      { name: 'ucAdaptiveWeight', currentValue: 0.15, description: '\u05DE\u05E9\u05E7\u05DC \u05D9\u05DB\u05D5\u05DC\u05EA \u05D4\u05E1\u05EA\u05D2\u05DC\u05D5\u05EA \u05E7\u05D3\u05D9\u05DE\u05D4 (UC-Forward)' },
      { name: 'singleLoopHighDriftFloor', currentValue: 7, description: '\u05E6\u05D9\u05D5\u05DF \u05DE\u05D9\u05E0\u05D9\u05DE\u05DC\u05D9 \u05DC-UC \u05DB\u05E9\u05D9\u05E9 \u05D2\u05DD single_loop \u05D5\u05D2\u05DD high_drift' },
    ],
  },
  {
    id: 'normalization-of-deviance',
    name: 'Normalization of Deviance (NOD)',
    theoreticalBasis: 'Vaughan (1996) The Challenger Launch Decision; Banja (2010) Medical Errors and Moral Injury',
    measuredConstruct: '\u05EA\u05D3\u05D9\u05E8\u05D5\u05EA \u05E2\u05E7\u05D9\u05E4\u05EA \u05E0\u05D4\u05DC\u05D9\u05DD \u05E8\u05E9\u05DE\u05D9\u05D9\u05DD \u05EA\u05D7\u05EA \u05DC\u05D7\u05E5 \u05D9\u05D9\u05E6\u05D5\u05E8',
    dependentVariable: 'ND score — \u05E8\u05DE\u05EA \u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D9\u05EA \u05D4\u05E1\u05D8\u05D9\u05D9\u05D4',
    empiricalEvidence: 'Vaughan (1996): 5-stage NOD progression; Banja (2010): NOD present in 67% of medical errors',
    pathologyMapping: ['ND'],
    calibratableParams: [
      { name: 'ndHighThreshold', currentValue: 8.5, description: '\u05E6\u05D9\u05D5\u05DF \u05D1\u05E1\u05D9\u05E1 \u05DC-NOD \u05D2\u05D1\u05D5\u05D4 (high)' },
      { name: 'ndMediumThreshold', currentValue: 5.0, description: '\u05E6\u05D9\u05D5\u05DF \u05D1\u05E1\u05D9\u05E1 \u05DC-NOD \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9 (medium)' },
      { name: 'ndLowThreshold', currentValue: 1.5, description: '\u05E6\u05D9\u05D5\u05DF \u05D1\u05E1\u05D9\u05E1 \u05DC-NOD \u05E0\u05DE\u05D5\u05DA (low)' },
    ],
  },
  {
    id: 'semantic-drift',
    name: 'Semantic Drift / Ontological Friction',
    theoreticalBasis: 'Floridi (2014) The Ethics of Artificial Intelligence; Weick (1995) Sensemaking in Organizations',
    measuredConstruct: '\u05E4\u05E2\u05E8\u05D9\u05DD \u05D1\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E2\u05D1\u05D5\u05D3\u05D4, \u05D2\u05D1\u05D5\u05DC\u05D5\u05EA \u05D0\u05D7\u05E8\u05D9\u05D5\u05EA \u05D5\u05DE\u05D5\u05E9\u05D2\u05D9 \u05D9\u05E1\u05D5\u05D3 \u05D1\u05D9\u05DF \u05DE\u05D7\u05DC\u05E7\u05D5\u05EA',
    dependentVariable: 'UC score (\u05E8\u05DB\u05D9\u05D1 \u05E1\u05DE\u05E0\u05D8\u05D9) — \u05DB\u05D9\u05D5\u05DC \u05DC\u05D0-\u05DE\u05D9\u05D9\u05E6\u05D2',
    empiricalEvidence: 'Weick (1995): sensemaking failures precede 80% of organizational crises; Floridi: ontological friction ∝ coordination cost',
    pathologyMapping: ['UC'],
    calibratableParams: [
      { name: 'semanticHighScore', currentValue: 8.0, description: '\u05E6\u05D9\u05D5\u05DF \u05D1\u05E1\u05D9\u05E1 \u05DC\u05E1\u05D7\u05D9\u05E4\u05D4 \u05E1\u05DE\u05E0\u05D8\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4' },
      { name: 'semanticMediumScore', currentValue: 4.5, description: '\u05E6\u05D9\u05D5\u05DF \u05D1\u05E1\u05D9\u05E1 \u05DC\u05E1\u05D7\u05D9\u05E4\u05D4 \u05E1\u05DE\u05E0\u05D8\u05D9\u05EA \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9\u05EA' },
    ],
  },
  {
    id: 'network-comorbidity',
    name: 'Network Effects / Comorbidity',
    theoreticalBasis: 'Borgatti et al. (2009) Network Analysis in the Social Sciences; Borsboom (2017) Network Theory of Mental Disorders',
    measuredConstruct: '\u05E7\u05E9\u05E8\u05D9 \u05D2\u05D5\u05DE\u05DC\u05D9\u05DF \u05D1\u05D9\u05DF \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA: DR↔ND, DR↔UC, ND↔UC, SC↔DR, SC↔ND, SC↔UC',
    dependentVariable: 'totalEntropyScore — \u05E1\u05DB\u05D5\u05DD \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9',
    empiricalEvidence: 'COR-SYS N=10,000: DR↔ND r=.19, DR↔UC r=−.27, ND↔UC r=.28, SC↔DR r=.32, SC↔ND r=.24, SC↔UC r=.18',
    pathologyMapping: ['DR', 'ND', 'UC', 'SC'],
    calibratableParams: [
      { name: 'systemicCollapseEntropyThreshold', currentValue: 29, description: '\u05E1\u05E3 totalEntropyScore \u05DC\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA' },
      { name: 'comorbidityActiveLevel', currentValue: 2, description: '\u05E8\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D4 \u05DE\u05D9\u05E0\u05D9\u05DE\u05DC\u05D9\u05EA \u05DC\u05E7\u05E9\u05E8 \u05E7\u05D5\u05DE\u05D5\u05E8\u05D1\u05D9\u05D3\u05D9\u05D5\u05EA \u05E4\u05E2\u05D9\u05DC' },
    ],
  },
  {
    id: 'greiner-moderator',
    name: 'Greiner Stage Moderator',
    theoreticalBasis: 'Greiner (1972) Evolution and Revolution as Organizations Grow',
    measuredConstruct: '\u05E9\u05DC\u05D1 \u05DE\u05E9\u05D1\u05E8 \u05E6\u05DE\u05D9\u05D7\u05D4 \u05E9\u05DE\u05DE\u05EA\u05DF \u05D0\u05EA \u05E1\u05E4\u05D9 \u05D4\u05D7\u05D5\u05DE\u05E8\u05D4 \u05DC\u05E4\u05D9 \u05E6\u05D9\u05E8 \u05DE\u05D1\u05E0\u05D9/\u05EA\u05D4\u05DC\u05D9\u05DB\u05D9',
    dependentVariable: 'axis-specific severity thresholds (SC/ND/UC)',
    empiricalEvidence: 'Phase 3/4/5 crises correlate with control, red-tape, and renewal bottlenecks in growth-stage firms',
    pathologyMapping: ['SC', 'ND', 'UC'],
    calibratableParams: [
      { name: 'phase3ScThresholdDelta', currentValue: -1.0, description: '\u05D4\u05E0\u05DE\u05DB\u05EA \u05E1\u05E3 SC \u05D1-Phase 3' },
      { name: 'phase4NdThresholdDelta', currentValue: -1.0, description: '\u05D4\u05E0\u05DE\u05DB\u05EA \u05E1\u05E3 ND \u05D1-Phase 4' },
      { name: 'phase5UcThresholdDelta', currentValue: -1.0, description: '\u05D4\u05E0\u05DE\u05DB\u05EA \u05E1\u05E3 UC \u05D1-Phase 5' },
    ],
  },
  {
    id: 'engagement-proxy',
    name: 'Engagement Outcome Proxy',
    theoreticalBasis: 'Kahn (1990), Maslach & Leiter (2016), JD-R model',
    measuredConstruct: '\u05E8\u05DE\u05EA \u05D0\u05E0\u05E8\u05D2\u05D9\u05D4 \u05D5\u05DE\u05D7\u05D5\u05D1\u05E8\u05D5\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC\u05D9\u05EA \u05DB\u05DE\u05D3\u05D3 \u05EA\u05D5\u05E6\u05D0\u05D4 (\u05DC\u05D0 \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4)',
    dependentVariable: 'validation consistency \u05DE\u05D5\u05DC totalEntropyScore',
    empiricalEvidence: 'Engagement erosion is typically downstream outcome of structural/cultural pathology clusters',
    pathologyMapping: ['DR', 'ND', 'UC', 'SC'],
    calibratableParams: [
      { name: 'engagementAlertThreshold', currentValue: 'burnout', description: '\u05E8\u05DE\u05EA \u05E1\u05D9\u05DB\u05D5\u05DF \u05E9\u05DE\u05E4\u05E2\u05D9\u05DC\u05D4 \u05D4\u05EA\u05E8\u05D0\u05D4 \u05DC\u05D1\u05D3\u05D9\u05E7\u05EA \u05E2\u05D5\u05DE\u05E7' },
      { name: 'anomalyGapThreshold', currentValue: 3, description: '\u05E4\u05E2\u05E8 \u05D1\u05D9\u05DF \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 \u05D2\u05D1\u05D5\u05D4\u05D4 \u05DC\u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05D7\u05D5\u05D1\u05E8\u05D5\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4' },
    ],
  },
]

// ─── Golden Questions (todo 3 — 4 \u05E9\u05D0\u05DC\u05D5\u05EA \u05D6\u05D4\u05D1) ────────────────────────────────

export interface GoldenQuestionAnswers {
  /** \u05E9\u05D0\u05DC\u05D4 1: \u05DE\u05D4 \u05DE\u05E6\u05D1 \u05D4‑DSM \u05D4\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9? */
  systemState: {
    profile: string
    primaryPathology: PathologyCode
    codes: string[]
    narrativeHe: string
  }
  /** \u05E9\u05D0\u05DC\u05D4 2: \u05D0\u05D9\u05E4\u05D4 \u05E6\u05D5\u05D5\u05D0\u05E8 \u05D4\u05D1\u05E7\u05D1\u05D5\u05E7 \u05D4\u05E8\u05D0\u05E9\u05D9? */
  bottleneck: {
    pathologyCode: PathologyCode
    score: number
    level: SeverityLevel
    activeComorbidities: string[]
    bottleneckNarrativeHe: string
  }
  /** \u05E9\u05D0\u05DC\u05D4 3: \u05DB\u05DE\u05D4 \u05DB\u05E1\u05E3/\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D4\u05D5\u05DC\u05DB\u05D9\u05DD \u05DC\u05D0\u05D9\u05D1\u05D5\u05D3? */
  economicImpact: {
    annualWasteILS: number
    weeklyWasteILS: number
    jQuotient: number
    jInterpretationHe: string
    urgencySignal: 'critical' | 'elevated' | 'moderate'
  }
  /** \u05E9\u05D0\u05DC\u05D4 4: \u05DE\u05D4 \u05DE\u05D4\u05DC\u05DA \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05D4\u05DE\u05D5\u05DE\u05DC\u05E5? */
  recommendedAction: {
    ctaType: 'sprint' | 'retainer' | 'live-demo'
    ctaLabelHe: string
    timeToActMonths: number
    rationale: string
    primaryProtocolId: string | null
  }
}

export function buildGoldenQuestions(
  diagnosis: DSMDiagnosis,
  economicParams: { managers: number; hoursPerWeek: number; monthlySalary: number }
): GoldenQuestionAnswers {
  const { managers, hoursPerWeek, monthlySalary } = economicParams
  const hourlyRate = monthlySalary / 160
  const weeklyWaste = managers * hoursPerWeek * hourlyRate
  const annualWaste = weeklyWaste * 52
  const jQuotient = Math.max((40 - hoursPerWeek) / 40, 0)

  // Q1 — System State
  const stateNarrative = buildStateNarrative(diagnosis)

  // Q2 — Bottleneck
  const primary = diagnosis.pathologies.find((p) => p.code === diagnosis.primaryDiagnosis)!
  const activeComorbidities = buildActiveComorbidities(diagnosis)
  const bottleneckNarrative = buildBottleneckNarrative(primary, activeComorbidities)

  // Q3 — Economic Impact
  const urgencySignal: 'critical' | 'elevated' | 'moderate' =
    jQuotient < 0.35 ? 'critical' : jQuotient < 0.6 ? 'elevated' : 'moderate'
  const jInterpretation =
    jQuotient < 0.35
      ? '\u05D0\u05D6\u05D5\u05E8 \u05E7\u05E8\u05D9\u05E1\u05D4 \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05EA — \u05E4\u05D7\u05D5\u05EA \u05DE-35% \u05DE\u05D4\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D4\u05E0\u05D9\u05D4\u05D5\u05DC\u05D9\u05EA \u05D6\u05DE\u05D9\u05E0\u05D4 \u05DC\u05E2\u05D1\u05D5\u05D3\u05D4 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05EA'
      : jQuotient < 0.6
        ? '\u05D0\u05D6\u05D5\u05E8 \u05D7\u05D5\u05D1 \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA — 35–60% \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D6\u05DE\u05D9\u05E0\u05D4; \u05E6\u05D5\u05D5\u05D0\u05E8 \u05D1\u05E7\u05D1\u05D5\u05E7 \u05DE\u05EA\u05E4\u05EA\u05D7'
        : '\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC\u05D9\u05EA \u05D6\u05DE\u05D9\u05E0\u05D4 — \u05DE\u05E2\u05DC 60% \u05DE\u05D4\u05D6\u05DE\u05DF \u05DE\u05D5\u05E7\u05D3\u05E9 \u05DC\u05E2\u05D1\u05D5\u05D3\u05D4 \u05E2\u05E8\u05DB\u05D9\u05EA'

  // Q4 — Recommended Action (Policy Engine)
  const policy = computePolicy(diagnosis, jQuotient)

  return {
    systemState: {
      profile: diagnosis.severityProfile,
      primaryPathology: diagnosis.primaryDiagnosis,
      codes: diagnosis.codes,
      narrativeHe: stateNarrative,
    },
    bottleneck: {
      pathologyCode: primary.code,
      score: primary.score,
      level: primary.level,
      activeComorbidities,
      bottleneckNarrativeHe: bottleneckNarrative,
    },
    economicImpact: {
      annualWasteILS: annualWaste,
      weeklyWasteILS: weeklyWaste,
      jQuotient,
      jInterpretationHe: jInterpretation,
      urgencySignal,
    },
    recommendedAction: policy,
  }
}

function buildStateNarrative(diagnosis: DSMDiagnosis): string {
  const { severityProfile, totalEntropyScore, pathologies } = diagnosis
  const level3 = pathologies.filter((p) => p.level === 3).map((p) => p.code)
  const level2 = pathologies.filter((p) => p.level === 2).map((p) => p.code)

  if (severityProfile === 'systemic-collapse') {
    return `\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA: ${level3.join(' + ')} \u05D1\u05E8\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D4 3 \u05E2\u05DD \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 \u05DB\u05D5\u05DC\u05DC\u05EA ${totalEntropyScore.toFixed(1)}/30. \u05DE\u05E1\u05E4\u05E8 \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D7\u05DE\u05D5\u05E8\u05D5\u05EA \u05E4\u05D5\u05E2\u05DC\u05D5\u05EA \u05D1\u05DE\u05E7\u05D1\u05D9\u05DC \u05D5\u05DE\u05D7\u05D6\u05E7\u05D5\u05EA \u05D6\u05D5 \u05D0\u05EA \u05D6\u05D5.`
  }
  if (severityProfile === 'critical') {
    return `\u05DE\u05E6\u05D1 \u05E7\u05E8\u05D9\u05D8\u05D9: ${level3[0]} \u05D1\u05E8\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D4 3. \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05E8\u05D0\u05E9\u05D9\u05EA \u05D3\u05D5\u05DE\u05D9\u05E0\u05E0\u05D8\u05D9\u05EA \u05E2\u05DD \u05E4\u05D5\u05D8\u05E0\u05E6\u05D9\u05D0\u05DC \u05DC\u05D4\u05EA\u05E4\u05E9\u05D8\u05D5\u05EA.`
  }
  if (severityProfile === 'at-risk') {
    return `\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF: ${level2.join(' + ')} \u05D1\u05E8\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D4 2. \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05EA\u05D5\u05E0\u05D4 — \u05D7\u05DC\u05D5\u05DF \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7 \u05DC\u05E4\u05E0\u05D9 \u05D4\u05E1\u05DC\u05DE\u05D4.`
  }
  return '\u05DE\u05E6\u05D1 \u05EA\u05E7\u05D9\u05DF: \u05DB\u05DC \u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D1\u05E8\u05DE\u05EA subclinical. \u05DE\u05D5\u05DE\u05DC\u05E5 \u05DE\u05E2\u05E7\u05D1 \u05DE\u05E0\u05D9\u05E2\u05EA\u05D9.'
}

function buildActiveComorbidities(diagnosis: DSMDiagnosis): string[] {
  const scoreMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))
  const active: string[] = []
  if (scoreMap['DR'].level >= 2 && scoreMap['ND'].level >= 2) active.push('DR→ND (\u05DC\u05D7\u05E5 \u05D9\u05D9\u05E6\u05D5\u05E8 \u05DE\u05E0\u05E8\u05DE\u05DC \u05E1\u05D8\u05D9\u05D5\u05EA)')
  if (scoreMap['DR'].level >= 2 && scoreMap['UC'].level >= 2) active.push('DR→UC (\u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05D5\u05D2\u05E2\u05EA \u05D1\u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9)')
  if (scoreMap['ND'].level >= 2 && scoreMap['UC'].level >= 2) active.push('ND→UC (\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4 \u05DE\u05D1\u05D8\u05DC\u05EA trigger \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['DR'].level >= 2) active.push('SC→DR (\u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA \u05DE\u05D9\u05D9\u05E6\u05E8\u05EA \u05D7\u05D9\u05DB\u05D5\u05DA \u05E1\u05DE\u05DB\u05D5\u05EA\u05D9)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['ND'].level >= 2) active.push('SC→ND (\u05D7\u05D5\u05E1\u05E8 \u05DE\u05D1\u05E0\u05D4 \u05DE\u05E0\u05E8\u05DE\u05DC \u05DE\u05E2\u05E7\u05E4\u05D9\u05DD)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['UC'].level >= 2) active.push('SC→UC (\u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D7\u05DC\u05D9\u05E9\u05D4 \u05DB\u05D9\u05D5\u05DC \u05D5\u05DC\u05DE\u05D9\u05D3\u05D4)')
  return active
}

function buildBottleneckNarrative(
  primary: { code: PathologyCode; score: number; level: SeverityLevel; nameHe: string },
  activeComorbidities: string[]
): string {
  const base = `\u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D4\u05D3\u05D5\u05DE\u05D9\u05E0\u05E0\u05D8\u05D9\u05EA \u05D4\u05D9\u05D0 ${primary.nameHe} (${primary.code}) \u05E2\u05DD \u05E6\u05D9\u05D5\u05DF ${primary.score.toFixed(1)}/10.`
  if (activeComorbidities.length === 0) return base + ' \u05D0\u05D9\u05DF \u05E7\u05E9\u05E8\u05D9 \u05E7\u05D5\u05DE\u05D5\u05E8\u05D1\u05D9\u05D3\u05D9\u05D5\u05EA \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD.'
  return base + ` \u05E7\u05E9\u05E8\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD: ${activeComorbidities.join('; ')}.`
}

// ─── Decision Rules / Policy Engine (todo 4) ─────────────────────────────────

/**
 * Rules are data: each rule has a condition function and a resulting CTA.
 * Rules are evaluated in priority order; first match wins.
 * To add a rule: push to DECISION_RULES. No other code changes needed.
 */
interface DecisionRule {
  id: string
  priority: number
  description: string
  condition: (d: DSMDiagnosis, j: number) => boolean
  result: {
    ctaType: 'sprint' | 'retainer' | 'live-demo'
    ctaLabelHe: string
    timeToActMonths: number
    rationale: string
    primaryProtocolId: string | null
  }
}

const DECISION_RULES: DecisionRule[] = [
  {
    id: 'systemic-collapse-sprint',
    priority: 1,
    description: '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA → Sprint \u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD \u05DE\u05D9\u05D9\u05D3\u05D9',
    condition: (d) => d.severityProfile === 'systemic-collapse',
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint \u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD — 14 \u05D9\u05D5\u05DD',
      timeToActMonths: 0,
      rationale: '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA \u05E2\u05DD 2+ \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D7\u05DE\u05D5\u05E8\u05D5\u05EA. \u05DB\u05DC \u05D9\u05D5\u05DD \u05E9\u05DC \u05D4\u05DE\u05EA\u05E0\u05D4 \u05DE\u05D2\u05D1\u05D9\u05E8 \u05D0\u05EA \u05D4\u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4. Sprint \u05DE\u05D9\u05D9\u05D3\u05D9 \u05DC\u05D7\u05D9\u05EA\u05D5\u05DA \u05E6\u05D5\u05D5\u05D0\u05E8\u05D9 \u05D1\u05E7\u05D1\u05D5\u05E7.',
      primaryProtocolId: 'integrated-system',
    },
  },
  {
    id: 'critical-j-sprint',
    priority: 2,
    description: '\u05DE\u05E6\u05D1 \u05E7\u05E8\u05D9\u05D8\u05D9 + J \u05E0\u05DE\u05D5\u05DA → Sprint',
    condition: (d, j) => d.severityProfile === 'critical' && j < 0.35,
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint \u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD — 14 \u05D9\u05D5\u05DD',
      timeToActMonths: 0,
      rationale: '\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D7\u05DE\u05D5\u05E8\u05D4 + \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC\u05D9\u05EA \u05E7\u05E8\u05D9\u05D8\u05D9\u05EA (J < 0.35). \u05E9\u05D9\u05DC\u05D5\u05D1 \u05D6\u05D4 \u05DE\u05E6\u05D1\u05D9\u05E2 \u05E2\u05DC \u05D3\u05D9\u05DE\u05D5\u05DD \u05E7\u05D5\u05D2\u05E0\u05D9\u05D8\u05D9\u05D1\u05D9 \u05E4\u05E2\u05D9\u05DC.',
      primaryProtocolId: 'nod-bia-remediation',
    },
  },
  {
    id: 'nd-dr-safety-debt',
    priority: 3,
    description: 'DR + ND \u05D2\u05D1\u05D5\u05D4\u05D9\u05DD → \u05D7\u05D5\u05D1 \u05D1\u05D8\u05D9\u05D7\u05D5\u05EA, Sprint',
    condition: (d) => {
      const scoreMap = Object.fromEntries(d.pathologies.map((p) => [p.code, p]))
      return scoreMap['DR'].level >= 2 && scoreMap['ND'].level >= 3
    },
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint — \u05D8\u05D9\u05E4\u05D5\u05DC \u05D1\u05D7\u05D5\u05D1 \u05D1\u05D8\u05D9\u05D7\u05D5\u05EA',
      timeToActMonths: 1,
      rationale: 'DR \u05DE\u05EA\u05D5\u05DF + ND \u05D7\u05DE\u05D5\u05E8: \u05DC\u05D7\u05E5 \u05D9\u05D9\u05E6\u05D5\u05E8 \u05DE\u05E0\u05E8\u05DE\u05DC \u05E1\u05D8\u05D9\u05D5\u05EA. \u05E1\u05D9\u05DB\u05D5\u05DF \u05D2\u05D1\u05D5\u05D4 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2 BCM. NOD→BIA Remediation \u05D1\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA.',
      primaryProtocolId: 'nod-bia-remediation',
    },
  },
  {
    id: 'uc-high-retainer',
    priority: 4,
    description: 'UC \u05D7\u05DE\u05D5\u05E8 \u05D1\u05DC\u05D9 \u05E7\u05E8\u05D9\u05E1\u05D4 → Retainer \u05DC\u05D1\u05E0\u05D9\u05D9\u05EA \u05DC\u05DE\u05D9\u05D3\u05D4',
    condition: (d) => {
      const scoreMap = Object.fromEntries(d.pathologies.map((p) => [p.code, p]))
      return scoreMap['UC'].level === 3 && d.severityProfile !== 'systemic-collapse'
    },
    result: {
      ctaType: 'retainer',
      ctaLabelHe: 'Resilience Retainer — \u05DC\u05D9\u05D5\u05D5\u05D9 \u05E9\u05D5\u05D8\u05E3 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      timeToActMonths: 1,
      rationale: 'UC \u05D7\u05DE\u05D5\u05E8 \u05D3\u05D5\u05E8\u05E9 \u05D1\u05E0\u05D9\u05D9\u05EA \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 \u05D5\u05DC\u05DE\u05D9\u05D3\u05D4 \u05D3\u05D5-\u05DC\u05D5\u05DC\u05D0\u05EA\u05D9\u05EA \u05DC\u05D0\u05D5\u05E8\u05DA \u05D6\u05DE\u05DF. \u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E4\u05EA\u05D5\u05E8 \u05D1-Sprint \u05D1\u05D5\u05D3\u05D3.',
      primaryProtocolId: 'learning-exercise-design',
    },
  },
  {
    id: 'at-risk-elevated-j',
    priority: 5,
    description: '\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF + J \u05DE\u05D5\u05D2\u05D1\u05E8 → Live Demo + Retainer',
    condition: (d, j) => d.severityProfile === 'at-risk' && j < 0.6,
    result: {
      ctaType: 'retainer',
      ctaLabelHe: 'Live Demo + Resilience Retainer',
      timeToActMonths: 2,
      rationale: '\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05EA\u05D5\u05E0\u05D4 \u05E2\u05DD J \u05DE\u05D5\u05D2\u05D1\u05E8. \u05D7\u05DC\u05D5\u05DF \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7 — Retainer \u05DE\u05D5\u05E0\u05E2 \u05D4\u05E1\u05DC\u05DE\u05D4 \u05DC\u05E8\u05DE\u05D4 \u05E7\u05E8\u05D9\u05D8\u05D9\u05EA.',
      primaryProtocolId: null,
    },
  },
  {
    id: 'default-live-demo',
    priority: 6,
    description: '\u05D1\u05E8\u05D9\u05E8\u05EA \u05DE\u05D7\u05D3\u05DC — Live Demo \u05D0\u05D1\u05D7\u05D5\u05E0\u05D9',
    condition: () => true,
    result: {
      ctaType: 'live-demo',
      ctaLabelHe: 'Live Demo \u05D0\u05D1\u05D7\u05D5\u05E0\u05D9 — \u05D7\u05D9\u05E0\u05DE\u05D9',
      timeToActMonths: 3,
      rationale: '\u05E8\u05DE\u05EA \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 \u05E0\u05DE\u05D5\u05DB\u05D4. Live Demo \u05D9\u05E1\u05E4\u05E7 \u05D4\u05D5\u05DB\u05D7\u05D4 \u05DE\u05EA\u05DE\u05D8\u05D9\u05EA \u05DC\u05E2\u05E8\u05DA \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05DC\u05E4\u05E0\u05D9 \u05DE\u05D7\u05D5\u05D9\u05D1\u05D5\u05EA.',
      primaryProtocolId: null,
    },
  },
]

function computePolicy(
  diagnosis: DSMDiagnosis,
  jQuotient: number
): GoldenQuestionAnswers['recommendedAction'] {
  const matchedRule = DECISION_RULES
    .sort((a, b) => a.priority - b.priority)
    .find((rule) => rule.condition(diagnosis, jQuotient))

  return matchedRule?.result ?? DECISION_RULES[DECISION_RULES.length - 1].result
}

// ─── Continuous Learning / Feedback Schema (todo 6) ──────────────────────────

/**
 * Schema for collecting consultant feedback after each calculator session.
 * Stored per-session; aggregated for periodic threshold calibration.
 */
export interface DiagnosticFeedback {
  sessionId: string
  timestamp: string
  inputSnapshot: {
    drScore: number
    ndScore: number
    ucScore: number
    hoursPerWeek: number
    managers: number
    monthlySalary: number
  }
  outputSnapshot: {
    severityProfile: string
    ctaType: string
    jQuotient: number
    totalEntropyScore: number
  }
  consultantFeedback: {
    ctaAccurate: boolean | null          // \u05D4\u05D0\u05DD \u05D4-CTA \u05D4\u05D9\u05D4 \u05DE\u05D3\u05D5\u05D9\u05E7?
    wouldChooseDifferent: boolean | null // \u05D4\u05D0\u05DD \u05D4\u05D9\u05D9\u05EA \u05D1\u05D5\u05D7\u05E8 \u05D0\u05D7\u05E8\u05EA?
    alternativeCta?: 'sprint' | 'retainer' | 'live-demo'
    overrideReason?: string              // \u05DC\u05DE\u05D4 \u05E2\u05E7\u05E4\u05EA \u05D0\u05EA \u05D4\u05DE\u05D7\u05E9\u05D1\u05D5\u05DF?
    confidenceRating: 1 | 2 | 3 | 4 | 5 // \u05DB\u05DE\u05D4 \u05E1\u05DE\u05DB\u05EA \u05E2\u05DC \u05D4\u05D0\u05D1\u05D7\u05D5\u05DF?
  }
}

/**
 * Trend analysis: compares two snapshots for the same client/org over time.
 * Used to validate whether interventions moved the needle.
 */
export interface DiagnosticTrend {
  clientId: string
  baselineSnapshot: DiagnosticFeedback['inputSnapshot'] & { date: string }
  followupSnapshot: DiagnosticFeedback['inputSnapshot'] & { date: string }
  delta: {
    drDelta: number   // positive = improvement (score decreased)
    ndDelta: number
    ucDelta: number
    jDelta: number
    entropyDelta: number
  }
  interventionApplied: string | null
  outcomeValidated: boolean
}

export function computeTrend(
  baseline: DiagnosticFeedback['inputSnapshot'] & { date: string },
  followup: DiagnosticFeedback['inputSnapshot'] & { date: string },
  clientId: string,
  interventionApplied: string | null = null
): DiagnosticTrend {
  const jBaseline = Math.max((40 - baseline.hoursPerWeek) / 40, 0)
  const jFollowup = Math.max((40 - followup.hoursPerWeek) / 40, 0)

  return {
    clientId,
    baselineSnapshot: baseline,
    followupSnapshot: followup,
    delta: {
      drDelta: baseline.drScore - followup.drScore,
      ndDelta: baseline.ndScore - followup.ndScore,
      ucDelta: baseline.ucScore - followup.ucScore,
      jDelta: jFollowup - jBaseline,
      entropyDelta: (baseline.drScore + baseline.ndScore + baseline.ucScore) -
                    (followup.drScore + followup.ndScore + followup.ucScore),
    },
    interventionApplied,
    outcomeValidated: false,
  }
}

/**
 * Aggregates feedback records to surface calibration signals.
 * Returns override rate per CTA type — high override = threshold needs tuning.
 */
export interface CalibrationSignal {
  ctaType: 'sprint' | 'retainer' | 'live-demo'
  totalSessions: number
  overrideRate: number        // 0–1: fraction where consultant chose differently
  avgConfidence: number       // 1–5
  calibrationNeeded: boolean  // true if overrideRate > 0.3
}

export function computeCalibrationSignals(feedbacks: DiagnosticFeedback[]): CalibrationSignal[] {
  const ctaTypes: Array<'sprint' | 'retainer' | 'live-demo'> = ['sprint', 'retainer', 'live-demo']

  return ctaTypes.map((ctaType) => {
    const relevant = feedbacks.filter((f) => f.outputSnapshot.ctaType === ctaType)
    if (relevant.length === 0) {
      return { ctaType, totalSessions: 0, overrideRate: 0, avgConfidence: 0, calibrationNeeded: false }
    }
    const overrides = relevant.filter((f) => f.consultantFeedback.wouldChooseDifferent === true)
    const overrideRate = overrides.length / relevant.length
    const avgConfidence =
      relevant.reduce((sum, f) => sum + f.consultantFeedback.confidenceRating, 0) / relevant.length

    return {
      ctaType,
      totalSessions: relevant.length,
      overrideRate,
      avgConfidence,
      calibrationNeeded: overrideRate > 0.3,
    }
  })
}
