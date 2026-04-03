import type { SeverityProfile } from '@/lib/dsm-engine'

export type ClientStatus = 'active' | 'prospect' | 'churned' | 'paused' | 'volunteer'
export type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

/** \u05DE\u05E7\u05D5\u05E8 \u05D0\u05DE\u05EA \u05DC\u05D4\u05E7\u05E9\u05E8 \u05E9\u05D0\u05DC\u05D5\u05E0\u05D9\u05DD \u05D5\u05EA\u05D5\u05DB\u05DF \u05DE\u05E0\u05D5\u05E1\u05D7: \u05E6\u05D5\u05D5\u05EA \u05DE\u05D5\u05DC \u05E2\u05E6\u05DE\u05D0\u05D9 */
export type ClientOperatingContext = 'team' | 'one_man_show'

export interface Client {
  id: string
  name: string
  company: string | null
  industry: string | null
  status: ClientStatus
  /** \u05D0\u05D7\u05E8\u05D9 \u05DE\u05D9\u05D2\u05E8\u05E6\u05D9\u05D4 `supabase-migration-client-operating-context.sql`; \u05E2\u05D3 \u05D0\u05D6 \u05E2\u05E9\u05D5\u05D9 \u05DC\u05D4\u05D9\u05D5\u05EA undefined */
  operating_context?: ClientOperatingContext | null
  hourly_rate: number | null
  monthly_retainer: number | null
  decision_latency_hours: number | null
  engagement_start: string | null
  notes: string | null
  bounded_contexts?: Record<string, unknown>[] | null
  contradiction_loss?: number | null
  current_j_quotient?: number | null
  semantic_drift_kl?: number | null
  edge_of_chaos_score?: number | null
  runaway_loop_detected?: boolean | null
  agent_notes?: string | null
  created_at: string
  updated_at: string
}

export interface Sprint {
  id: string
  client_id: string
  sprint_number: number
  title: string
  start_date: string
  end_date: string
  status: SprintStatus
  goal: string | null
  retrospective: string | null
  created_at: string
  clients?: Client
}

export interface Task {
  id: string
  sprint_id: string
  client_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  estimated_hours: number | null
  actual_hours: number | null
  due_date: string | null
  completed_at: string | null
  tags: string[]
  created_at: string
  updated_at: string
  sprints?: Sprint
}

export interface Financial {
  id: string
  client_id: string
  period_month: string
  revenue: number
  invoiced: boolean
  invoice_date: string | null
  paid_date: string | null
  notes: string | null
  created_at: string
  clients?: Client
}

export type ClientBusinessPlanStatus = 'draft' | 'active' | 'archived'

/**
 * Stored under `questionnaire_response.unified_action_plan_snapshot` when plans are saved
 * from the questionnaire (see `savePlanFromQuestionnaire`). Shape mirrors unified pipeline output subset.
 */
export interface UnifiedActionPlanSnapshot {
  version: string
  generated_at: string
  narrative_primary_he: string
  primary_type: string
  cs_amplifier: boolean
  intervention_ids: string[]
  items: unknown[]
}

export interface ClientBusinessPlan {
  id: string
  client_id: string
  status: ClientBusinessPlanStatus
  title: string | null
  /** Raw questionnaire answers; may include `unified_action_plan_snapshot` (see {@link UnifiedActionPlanSnapshot}). */
  questionnaire_response: Record<string, unknown> | null
  recommended_channel_id: string | null
  recommended_option_id: string | null
  summary: string | null
  next_steps: string | null
  created_at: string
  updated_at: string
}

export interface ClientAssessment {
  id: string
  token: string
  client_id: string | null
  status: 'pending' | 'in_progress' | 'completed'
  answers: Record<string, unknown> | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ClientDiagnosticSummary {
  drScore: number
  ndScore: number
  ucScore: number
  severityProfile: SeverityProfile
  entropyScore: number
}

export interface ClientDiagnostic {
  id: string
  client_id: string
  created_at: string
  answers: Record<string, unknown>
  dsm_summary: ClientDiagnosticSummary
}

export interface TriggerRuleRow {
  id: string
  if_condition: string
  then_action: string
  severity: 'high' | 'medium'
  is_active: boolean
  updated_at: string
}

export interface InterventionEvidenceProfileRow {
  intervention_tag: string
  evidence_level: 'high' | 'contextual' | 'gap'
  citations: string[]
  evidence_note: string
  updated_at: string
}

export interface GateReviewRow {
  id: 'gate-1' | 'gate-2' | 'gate-3' | 'gate-4'
  week: 2 | 4 | 8 | 12
  title_he: string
  pass_criteria: string[]
  is_active: boolean
  updated_at: string
}

export interface GateRunRow {
  run_id: string
  gate_id: GateReviewRow['id']
  client_id: string
  status: 'pending' | 'passed' | 'failed'
  notes: string | null
  evaluated_at: string
}

export interface AgentJobRow {
  job_id: string
  job_type: 'gamma-monitor' | 'feedback-eval' | 'network-refresh' | 'delta-refresh'
  client_id: string | null
  org_id: string | null
  payload: Record<string, unknown>
  status: 'pending' | 'claimed' | 'completed' | 'failed' | 'awaiting_approval'
  approval_required: boolean
  approved_at: string | null
  not_before: string | null
  started_at: string | null
  finished_at: string | null
  attempts: number
  max_attempts: number
  last_error: string | null
  result: Record<string, unknown> | null
  job_key: string | null
  created_at: string
  updated_at: string
}

export interface AgentChangeRequestRow {
  request_id: string
  agent_name: 'alpha' | 'beta' | 'gamma' | 'delta'
  client_id: string
  change_type: string
  payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at: string | null
}

export interface OrgNetworkRow {
  id: string
  client_id: string
  node_id: string
  node_type: 'team' | 'leader' | 'system' | 'workflow' | 'hub'
  adjacency: Record<string, unknown>
  node_label: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface OrgNetworkMetricRow {
  metric_id: string
  client_id: string
  density: number | null
  diameter: number | null
  clustering_coefficient: number | null
  betweenness_centrality: Record<string, number> | null
  computed_at: string
}

export interface FeedbackEventRow {
  event_id: string
  client_id: string
  snapshot_id: string | null
  intervention_id: string | null
  event_type: 'negative-feedback' | 'positive-feedback' | 'runaway-detected' | 'phase-transition'
  loop_type: 'negative' | 'positive' | 'runaway' | null
  payload: Record<string, unknown>
  created_at: string
}

export interface FeedbackActionRow {
  action_id: string
  event_id: string
  action_type: 'alert' | 'recommendation' | 'job-enqueue' | 'approval-request'
  status: 'pending' | 'completed' | 'failed'
  result: Record<string, unknown> | null
  processed_at: string | null
}

export interface AgentMemoryRow {
  memory_id: string
  agent_name: 'alpha' | 'beta' | 'gamma' | 'delta'
  subject_type: 'client' | 'snapshot' | 'plan'
  subject_id: string
  input_hash: string
  result: Record<string, unknown>
  confidence: number | null
  expires_at: string
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// CBR Layer Types — Phase 1 Data Layer
// Source: supabase-migration-cbr.sql + cbr-execution-roadmap.md
// Academic: Aamodt & Plaza (1994), Edmondson (1999), Kahneman & Tversky (1991)
// ---------------------------------------------------------------------------

export type SeverityProfileCbr =
  | 'Healthy'
  | 'At-risk'
  | 'Critical'
  | 'Systemic-collapse'

export type EmployeeSizeBand = 'under_50' | '50_150' | '150_300' | 'over_300'

export interface OrganizationContext {
  org_id: string
  client_id: string | null
  industry_sector: string
  employee_size_band: EmployeeSizeBand
  culture_archetype: string | null
  kappa?: number | null
  kappa_source?: string | null
  kappa_updated_at?: string | null
  created_at: string
}

export interface DsmDiagnosticSnapshot {
  snapshot_id: string
  org_id: string
  created_at: string
  // DSM scores (0-10)
  score_dr: number
  score_nd: number
  score_uc: number
  score_sc: number   // Structural Clarity Deficit — Phase 4 4th dimension
  total_entropy: number
  // Operational metrics
  j_quotient: number | null
  decision_latency: number | null
  psi_score: number | null          // Edmondson PSI average (1-7)
  // Qualitative
  severity_profile: SeverityProfileCbr
  bottleneck_text: string | null
  feature_vector: number[] | null   // VECTOR(1536) — stored as float array
  emergence_signal?: 'continuous' | 'discontinuous' | null
  edge_of_chaos_score?: number | null
}

export interface InterventionAndFeedback {
  intervention_id: string
  snapshot_id: string
  // Intervention
  recommended_cta: string
  consultant_override: boolean
  actual_cta: string
  override_reason: string | null
  // Follow-up outcomes
  followup_date: string | null
  delta_entropy: number | null
  delta_j_quotient: number | null
  delta_psi: number | null
  delta_dr: number | null
  // Mathematical model outputs
  learning_gain: number | null      // LG = 0.571×(-ΔDR) + 0.429×(ΔPSI)
  lambda_eigenvalue: number | null  // λ = 1 + κ×LG
  dynamic_kappa?: number | null
  edge_of_chaos_score?: number | null
  feedback_loop_type?: 'negative' | 'positive' | 'runaway' | null
  success_label: number | null      // FLOAT (not boolean) — continuous metric
  created_at: string
}

/** Output shape from get_similar_cases_with_stats RPC */
export interface SimilarCaseResult {
  case_id: string
  org_industry: string
  severity: string
  intervention_type: string
  delta_total_entropy: number | null
  j_quotient_recovered: number | null
  learning_gain: number | null
  lambda_eigenvalue: number | null
  similarity_score: number
}

/** Ranked recommendation from the CBR engine */
export interface RecommendationResult {
  intervention_type: string
  success_rate: number              // raw fraction
  wilson_score: number              // lower-bound Wilson confidence
  confidence_level: 'high' | 'medium' | 'low' | 'insufficient'
  supporting_cases: number          // N cases
  avg_j_quotient_recovered: number | null
  daily_loss_estimate: number | null  // J-Quotient / 30 — for loss framing
  avg_lambda: number | null          // expected λ eigenvalue
  avg_eoc_score?: number | null
  recommendation_boldness?: 'safe' | 'balanced' | 'bold'
}

// Insert helpers
export interface OrganizationContextInsert {
  client_id?: string | null
  industry_sector: string
  employee_size_band: EmployeeSizeBand
  culture_archetype?: string | null
  kappa?: number | null
  kappa_source?: string | null
  kappa_updated_at?: string | null
}

export interface DsmDiagnosticSnapshotInsert {
  org_id: string
  score_dr: number
  score_nd: number
  score_uc: number
  score_sc?: number  // defaults to 5.0 in DB if omitted
  total_entropy: number
  j_quotient?: number | null
  decision_latency?: number | null
  psi_score?: number | null
  severity_profile: SeverityProfileCbr
  bottleneck_text?: string | null
  feature_vector?: number[] | null
  emergence_signal?: 'continuous' | 'discontinuous' | null
  edge_of_chaos_score?: number | null
}

export interface InterventionAndFeedbackInsert {
  snapshot_id: string
  recommended_cta: string
  consultant_override?: boolean
  actual_cta: string
  override_reason?: string | null
  followup_date?: string | null
  delta_entropy?: number | null
  delta_j_quotient?: number | null
  delta_psi?: number | null
  delta_dr?: number | null
  learning_gain?: number | null
  lambda_eigenvalue?: number | null
  dynamic_kappa?: number | null
  edge_of_chaos_score?: number | null
  feedback_loop_type?: 'negative' | 'positive' | 'runaway' | null
  success_label?: number | null
}

// ---------------------------------------------------------------------------
// Explicit Insert / Update helpers — aligned 1:1 with the SQL migrations.
// These replace the previous Omit<Row, ...> approach which caused Postgrest
// type-inference to collapse to `never` for tables with jsonb columns.
// ---------------------------------------------------------------------------

/** client_assessments — INSERT (token, id, timestamps all have DB defaults) */
export interface ClientAssessmentInsert {
  client_id?: string | null
  token?: string
  status?: 'pending' | 'in_progress' | 'completed'
  answers?: Record<string, unknown> | null
  completed_at?: string | null
}

/** client_assessments — UPDATE */
export interface ClientAssessmentUpdate {
  client_id?: string | null
  status?: 'pending' | 'in_progress' | 'completed'
  answers?: Record<string, unknown> | null
  completed_at?: string | null
  updated_at?: string
}

/** client_diagnostics — INSERT (id, created_at have DB defaults) */
export interface ClientDiagnosticInsert {
  client_id: string
  answers: Record<string, unknown>
  dsm_summary: ClientDiagnosticSummary
  created_at?: string
}

/** client_business_plans — INSERT */
export interface ClientBusinessPlanInsert {
  client_id: string
  status?: ClientBusinessPlanStatus
  title?: string | null
  questionnaire_response?: Record<string, unknown> | null
  recommended_channel_id?: string | null
  recommended_option_id?: string | null
  summary?: string | null
  next_steps?: string | null
  updated_at?: string
}

/** client_business_plans — UPDATE / UPSERT payload */
export type ClientBusinessPlanUpsert = ClientBusinessPlanInsert

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      client_assessments: {
        Row: ClientAssessment
        Insert: ClientAssessmentInsert
        Update: ClientAssessmentUpdate
        Relationships: []
      }
      client_diagnostics: {
        Row: ClientDiagnostic
        Insert: ClientDiagnosticInsert
        Update: Record<string, never>
        Relationships: []
      }
      client_business_plans: {
        Row: ClientBusinessPlan
        Insert: ClientBusinessPlanInsert
        Update: Partial<ClientBusinessPlanInsert>
        Relationships: []
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      sprints: {
        Row: Sprint
        Insert: Omit<Sprint, 'id' | 'created_at' | 'clients'>
        Update: Partial<Omit<Sprint, 'id' | 'created_at' | 'clients'>>
        Relationships: []
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'sprints'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'sprints'>>
        Relationships: []
      }
      financials: {
        Row: Financial
        Insert: Omit<Financial, 'id' | 'created_at' | 'clients'>
        Update: Partial<Omit<Financial, 'id' | 'created_at' | 'clients'>>
        Relationships: []
      }
      organizations_context: {
        Row: OrganizationContext
        Insert: OrganizationContextInsert
        Update: Partial<OrganizationContextInsert>
        Relationships: []
      }
      dsm_diagnostic_snapshots: {
        Row: DsmDiagnosticSnapshot
        Insert: DsmDiagnosticSnapshotInsert
        Update: Partial<DsmDiagnosticSnapshotInsert>
        Relationships: []
      }
      interventions_and_feedback: {
        Row: InterventionAndFeedback
        Insert: InterventionAndFeedbackInsert
        Update: Partial<InterventionAndFeedbackInsert>
        Relationships: []
      }
      trigger_rules: {
        Row: TriggerRuleRow
        Insert: Omit<TriggerRuleRow, 'updated_at'>
        Update: Partial<Omit<TriggerRuleRow, 'updated_at'>>
        Relationships: []
      }
      intervention_evidence_profiles: {
        Row: InterventionEvidenceProfileRow
        Insert: Omit<InterventionEvidenceProfileRow, 'updated_at'>
        Update: Partial<Omit<InterventionEvidenceProfileRow, 'updated_at'>>
        Relationships: []
      }
      gate_reviews: {
        Row: GateReviewRow
        Insert: Omit<GateReviewRow, 'updated_at'>
        Update: Partial<Omit<GateReviewRow, 'updated_at'>>
        Relationships: []
      }
      gate_runs: {
        Row: GateRunRow
        Insert: Omit<GateRunRow, 'run_id' | 'evaluated_at'>
        Update: Partial<Omit<GateRunRow, 'run_id' | 'evaluated_at'>>
        Relationships: []
      }
      agent_jobs: {
        Row: AgentJobRow
        Insert: Omit<AgentJobRow, 'job_id' | 'created_at' | 'updated_at' | 'started_at' | 'finished_at' | 'approved_at' | 'last_error' | 'result'>
        Update: Partial<Omit<AgentJobRow, 'job_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      agent_change_requests: {
        Row: AgentChangeRequestRow
        Insert: Omit<AgentChangeRequestRow, 'request_id' | 'requested_at' | 'reviewed_at'>
        Update: Partial<Omit<AgentChangeRequestRow, 'request_id' | 'requested_at'>>
        Relationships: []
      }
      org_network: {
        Row: OrgNetworkRow
        Insert: Omit<OrgNetworkRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OrgNetworkRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      org_network_metrics: {
        Row: OrgNetworkMetricRow
        Insert: Omit<OrgNetworkMetricRow, 'metric_id' | 'computed_at'>
        Update: Partial<Omit<OrgNetworkMetricRow, 'metric_id' | 'computed_at'>>
        Relationships: []
      }
      feedback_events: {
        Row: FeedbackEventRow
        Insert: Omit<FeedbackEventRow, 'event_id' | 'created_at'>
        Update: Partial<Omit<FeedbackEventRow, 'event_id' | 'created_at'>>
        Relationships: []
      }
      feedback_actions: {
        Row: FeedbackActionRow
        Insert: Omit<FeedbackActionRow, 'action_id' | 'processed_at'>
        Update: Partial<Omit<FeedbackActionRow, 'action_id'>>
        Relationships: []
      }
      agent_memories: {
        Row: AgentMemoryRow
        Insert: Omit<AgentMemoryRow, 'memory_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AgentMemoryRow, 'memory_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
    }
    Views: Record<string, { Row: Record<string, unknown>; Relationships: [] }>
    Functions: {
      get_similar_cases_with_stats: {
        Args: {
          query_embedding: number[]
          target_industry: string
          target_severity: string
          max_dli: number
          match_limit?: number
        }
        Returns: SimilarCaseResult[]
      }
    }
    Enums: Record<string, string>
  }
}
