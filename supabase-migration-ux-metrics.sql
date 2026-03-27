-- UX Metrics Events table
-- Stores client-side telemetry for KPI tracking (services/live-analysis flow).

create table if not exists public.ux_metrics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_ts timestamptz not null default now(),
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ux_metrics_events_event_name_idx
  on public.ux_metrics_events (event_name);

create index if not exists ux_metrics_events_event_ts_idx
  on public.ux_metrics_events (event_ts desc);

-- Minimal RLS policy for authenticated product users.
alter table public.ux_metrics_events enable row level security;

drop policy if exists "ux_metrics_events_insert_authenticated" on public.ux_metrics_events;
create policy "ux_metrics_events_insert_authenticated"
  on public.ux_metrics_events
  for insert
  to authenticated
  with check (true);

drop policy if exists "ux_metrics_events_select_authenticated" on public.ux_metrics_events;
create policy "ux_metrics_events_select_authenticated"
  on public.ux_metrics_events
  for select
  to authenticated
  using (true);

