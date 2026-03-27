-- Autopoietic agents runtime: governance layers, jobs, and client-level agent state.

alter table public.clients
  add column if not exists bounded_contexts jsonb,
  add column if not exists contradiction_loss double precision,
  add column if not exists current_j_quotient double precision,
  add column if not exists semantic_drift_kl double precision,
  add column if not exists edge_of_chaos_score double precision,
  add column if not exists runaway_loop_detected boolean default false,
  add column if not exists agent_notes text;

alter table public.organizations_context
  add column if not exists kappa double precision default 0.5,
  add column if not exists kappa_source text default 'default',
  add column if not exists kappa_updated_at timestamptz default now();

create table if not exists public.agent_jobs (
  job_id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('gamma-monitor', 'feedback-eval', 'network-refresh', 'delta-refresh')),
  client_id uuid references public.clients(id) on delete cascade,
  org_id uuid references public.organizations_context(org_id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'completed', 'failed', 'awaiting_approval')),
  approval_required boolean not null default false,
  approved_at timestamptz,
  not_before timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  last_error text,
  result jsonb,
  job_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_agent_jobs_job_key on public.agent_jobs(job_key) where job_key is not null;
create index if not exists idx_agent_jobs_status_due on public.agent_jobs(status, not_before, approval_required);
create index if not exists idx_agent_jobs_client on public.agent_jobs(client_id, created_at desc);

create table if not exists public.agent_change_requests (
  request_id uuid primary key default gen_random_uuid(),
  agent_name text not null check (agent_name in ('alpha', 'beta', 'gamma', 'delta')),
  client_id uuid not null references public.clients(id) on delete cascade,
  change_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_agent_change_requests_client on public.agent_change_requests(client_id, status, requested_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_agent_jobs_touch_updated_at on public.agent_jobs;
create trigger trg_agent_jobs_touch_updated_at
before update on public.agent_jobs
for each row execute function public.touch_updated_at();

alter table public.agent_jobs enable row level security;
alter table public.agent_change_requests enable row level security;

drop policy if exists "agent_jobs_select_all" on public.agent_jobs;
create policy "agent_jobs_select_all" on public.agent_jobs for select using (true);
drop policy if exists "agent_jobs_write_all" on public.agent_jobs;
create policy "agent_jobs_write_all" on public.agent_jobs for all using (true) with check (true);

drop policy if exists "agent_change_requests_select_all" on public.agent_change_requests;
create policy "agent_change_requests_select_all" on public.agent_change_requests for select using (true);
drop policy if exists "agent_change_requests_write_all" on public.agent_change_requests;
create policy "agent_change_requests_write_all" on public.agent_change_requests for all using (true) with check (true);
