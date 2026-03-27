-- Tighten RLS: agent/feedback/network/memory tables were open to anon (using (true)).
-- Authenticated consultants retain access; service_role (cron) bypasses RLS.

-- agent_jobs
drop policy if exists "agent_jobs_select_all" on public.agent_jobs;
drop policy if exists "agent_jobs_write_all" on public.agent_jobs;
create policy "agent_jobs_select_authenticated" on public.agent_jobs for select to authenticated using (true);
create policy "agent_jobs_insert_authenticated" on public.agent_jobs for insert to authenticated with check (true);
create policy "agent_jobs_update_authenticated" on public.agent_jobs for update to authenticated using (true) with check (true);
create policy "agent_jobs_delete_authenticated" on public.agent_jobs for delete to authenticated using (true);

-- agent_change_requests
drop policy if exists "agent_change_requests_select_all" on public.agent_change_requests;
drop policy if exists "agent_change_requests_write_all" on public.agent_change_requests;
create policy "agent_change_requests_select_authenticated" on public.agent_change_requests for select to authenticated using (true);
create policy "agent_change_requests_insert_authenticated" on public.agent_change_requests for insert to authenticated with check (true);
create policy "agent_change_requests_update_authenticated" on public.agent_change_requests for update to authenticated using (true) with check (true);
create policy "agent_change_requests_delete_authenticated" on public.agent_change_requests for delete to authenticated using (true);

-- agent_memories
drop policy if exists "agent_memories_select_all" on public.agent_memories;
drop policy if exists "agent_memories_write_all" on public.agent_memories;
create policy "agent_memories_select_authenticated" on public.agent_memories for select to authenticated using (true);
create policy "agent_memories_insert_authenticated" on public.agent_memories for insert to authenticated with check (true);
create policy "agent_memories_update_authenticated" on public.agent_memories for update to authenticated using (true) with check (true);
create policy "agent_memories_delete_authenticated" on public.agent_memories for delete to authenticated using (true);

-- feedback_events
drop policy if exists "feedback_events_select_all" on public.feedback_events;
drop policy if exists "feedback_events_write_all" on public.feedback_events;
create policy "feedback_events_select_authenticated" on public.feedback_events for select to authenticated using (true);
create policy "feedback_events_insert_authenticated" on public.feedback_events for insert to authenticated with check (true);
create policy "feedback_events_update_authenticated" on public.feedback_events for update to authenticated using (true) with check (true);
create policy "feedback_events_delete_authenticated" on public.feedback_events for delete to authenticated using (true);

-- feedback_actions
drop policy if exists "feedback_actions_select_all" on public.feedback_actions;
drop policy if exists "feedback_actions_write_all" on public.feedback_actions;
create policy "feedback_actions_select_authenticated" on public.feedback_actions for select to authenticated using (true);
create policy "feedback_actions_insert_authenticated" on public.feedback_actions for insert to authenticated with check (true);
create policy "feedback_actions_update_authenticated" on public.feedback_actions for update to authenticated using (true) with check (true);
create policy "feedback_actions_delete_authenticated" on public.feedback_actions for delete to authenticated using (true);

-- org_network
drop policy if exists "org_network_select_all" on public.org_network;
drop policy if exists "org_network_write_all" on public.org_network;
create policy "org_network_select_authenticated" on public.org_network for select to authenticated using (true);
create policy "org_network_insert_authenticated" on public.org_network for insert to authenticated with check (true);
create policy "org_network_update_authenticated" on public.org_network for update to authenticated using (true) with check (true);
create policy "org_network_delete_authenticated" on public.org_network for delete to authenticated using (true);

-- org_network_metrics
drop policy if exists "org_network_metrics_select_all" on public.org_network_metrics;
drop policy if exists "org_network_metrics_write_all" on public.org_network_metrics;
create policy "org_network_metrics_select_authenticated" on public.org_network_metrics for select to authenticated using (true);
create policy "org_network_metrics_insert_authenticated" on public.org_network_metrics for insert to authenticated with check (true);
create policy "org_network_metrics_update_authenticated" on public.org_network_metrics for update to authenticated using (true) with check (true);
create policy "org_network_metrics_delete_authenticated" on public.org_network_metrics for delete to authenticated using (true);
