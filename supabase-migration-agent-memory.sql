-- Agent memory cache to avoid recomputing identical analyses.

create table if not exists public.agent_memories (
  memory_id uuid primary key default gen_random_uuid(),
  agent_name text not null check (agent_name in ('alpha', 'beta', 'gamma', 'delta')),
  subject_type text not null check (subject_type in ('client', 'snapshot', 'plan')),
  subject_id text not null,
  input_hash text not null,
  result jsonb not null,
  confidence double precision,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_name, subject_type, subject_id, input_hash)
);

create index if not exists idx_agent_memories_lookup
  on public.agent_memories(agent_name, subject_type, subject_id, input_hash, expires_at desc);

drop trigger if exists trg_agent_memories_touch_updated_at on public.agent_memories;
create trigger trg_agent_memories_touch_updated_at
before update on public.agent_memories
for each row execute function public.touch_updated_at();

alter table public.agent_memories enable row level security;

drop policy if exists "agent_memories_select_all" on public.agent_memories;
create policy "agent_memories_select_all" on public.agent_memories for select using (true);
drop policy if exists "agent_memories_write_all" on public.agent_memories;
create policy "agent_memories_write_all" on public.agent_memories for all using (true) with check (true);
