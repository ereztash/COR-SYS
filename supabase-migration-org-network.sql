-- Organizational network layer for autopoietic analysis.

create table if not exists public.org_network (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  node_id text not null,
  node_type text not null check (node_type in ('team', 'leader', 'system', 'workflow', 'hub')),
  adjacency jsonb not null default '{}'::jsonb,
  node_label text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, node_id)
);

create table if not exists public.org_network_metrics (
  metric_id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  density double precision,
  diameter double precision,
  clustering_coefficient double precision,
  betweenness_centrality jsonb,
  computed_at timestamptz not null default now()
);

create index if not exists idx_org_network_client on public.org_network(client_id, node_type);
create index if not exists idx_org_network_metrics_client on public.org_network_metrics(client_id, computed_at desc);

drop trigger if exists trg_org_network_touch_updated_at on public.org_network;
create trigger trg_org_network_touch_updated_at
before update on public.org_network
for each row execute function public.touch_updated_at();

alter table public.org_network enable row level security;
alter table public.org_network_metrics enable row level security;

drop policy if exists "org_network_select_all" on public.org_network;
create policy "org_network_select_all" on public.org_network for select using (true);
drop policy if exists "org_network_write_all" on public.org_network;
create policy "org_network_write_all" on public.org_network for all using (true) with check (true);

drop policy if exists "org_network_metrics_select_all" on public.org_network_metrics;
create policy "org_network_metrics_select_all" on public.org_network_metrics for select using (true);
drop policy if exists "org_network_metrics_write_all" on public.org_network_metrics;
create policy "org_network_metrics_write_all" on public.org_network_metrics for all using (true) with check (true);
