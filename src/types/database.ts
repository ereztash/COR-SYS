import type { SeverityProfile } from '@/lib/dsm-engine'

export type ClientStatus = 'active' | 'prospect' | 'churned' | 'paused' | 'volunteer'
export type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export interface Client {
  id: string
  name: string
  company: string | null
  industry: string | null
  status: ClientStatus
  hourly_rate: number | null
  monthly_retainer: number | null
  decision_latency_hours: number | null
  engagement_start: string | null
  notes: string | null
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

export interface ClientBusinessPlan {
  id: string
  client_id: string
  status: ClientBusinessPlanStatus
  title: string | null
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
}

// Insert helpers
export interface OrganizationContextInsert {
  client_id?: string | null
  industry_sector: string
  employee_size_band: EmployeeSizeBand
  culture_archetype?: string | null
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
