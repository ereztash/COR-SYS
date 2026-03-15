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

export interface Database {
  public: {
    Tables: {
      client_business_plans: {
        Row: ClientBusinessPlan
        Insert: Omit<ClientBusinessPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ClientBusinessPlan, 'id' | 'created_at' | 'updated_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      sprints: {
        Row: Sprint
        Insert: Omit<Sprint, 'id' | 'created_at' | 'clients'>
        Update: Partial<Omit<Sprint, 'id' | 'created_at' | 'clients'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'sprints'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'sprints'>>
      }
      financials: {
        Row: Financial
        Insert: Omit<Financial, 'id' | 'created_at' | 'clients'>
        Update: Partial<Omit<Financial, 'id' | 'created_at' | 'clients'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
