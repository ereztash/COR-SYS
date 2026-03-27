-- Emergence monitoring, feedback loops, and dynamic resilience fields.

alter table public.dsm_diagnostic_snapshots
  add column if not exists emergence_signal text check (emergence_signal in ('continuous', 'discontinuous')),
  add column if not exists edge_of_chaos_score double precision;

alter table public.interventions_and_feedback
  add column if not exists dynamic_kappa double precision,
  add column if not exists edge_of_chaos_score double precision,
  add column if not exists feedback_loop_type text check (feedback_loop_type in ('negative', 'positive', 'runaway'));

create table if not exists public.feedback_events (
  event_id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  snapshot_id uuid references public.dsm_diagnostic_snapshots(snapshot_id) on delete set null,
  intervention_id uuid references public.interventions_and_feedback(intervention_id) on delete set null,
  event_type text not null check (event_type in ('negative-feedback', 'positive-feedback', 'runaway-detected', 'phase-transition')),
  loop_type text check (loop_type in ('negative', 'positive', 'runaway')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_actions (
  action_id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.feedback_events(event_id) on delete cascade,
  action_type text not null check (action_type in ('alert', 'recommendation', 'job-enqueue', 'approval-request')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  result jsonb,
  processed_at timestamptz
);

create index if not exists idx_feedback_events_client on public.feedback_events(client_id, created_at desc);
create index if not exists idx_feedback_events_type on public.feedback_events(event_type, loop_type);
create index if not exists idx_feedback_actions_event on public.feedback_actions(event_id, status);

alter table public.feedback_events enable row level security;
alter table public.feedback_actions enable row level security;

drop policy if exists "feedback_events_select_all" on public.feedback_events;
create policy "feedback_events_select_all" on public.feedback_events for select using (true);
drop policy if exists "feedback_events_write_all" on public.feedback_events;
create policy "feedback_events_write_all" on public.feedback_events for all using (true) with check (true);

drop policy if exists "feedback_actions_select_all" on public.feedback_actions;
create policy "feedback_actions_select_all" on public.feedback_actions for select using (true);
drop policy if exists "feedback_actions_write_all" on public.feedback_actions;
create policy "feedback_actions_write_all" on public.feedback_actions for all using (true) with check (true);
