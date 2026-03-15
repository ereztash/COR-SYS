-- COR-SYS Database Schema
-- Run this in Supabase SQL Editor

-- Clients
CREATE TABLE clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  company text,
  industry text,
  status text NOT NULL DEFAULT 'prospect' CHECK (status IN ('active', 'prospect', 'churned', 'paused', 'volunteer')),
  hourly_rate numeric(10,2),
  monthly_retainer numeric(10,2),
  decision_latency_hours numeric(5,2),
  engagement_start date,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Sprints
CREATE TABLE sprints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  sprint_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  goal text,
  retrospective text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Tasks
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id uuid REFERENCES sprints(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  estimated_hours numeric(4,1),
  actual_hours numeric(4,1),
  due_date date,
  completed_at timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Financials
CREATE TABLE financials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  period_month date NOT NULL,
  revenue numeric(10,2) NOT NULL DEFAULT 0,
  invoiced boolean DEFAULT false,
  invoice_date date,
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed: your 2 existing clients
INSERT INTO clients (name, company, status, decision_latency_hours, engagement_start) VALUES
  ('לקוחה 1', 'חברה א', 'volunteer', 5, CURRENT_DATE),
  ('לקוחה 2', 'חברה ב', 'active', 8, CURRENT_DATE);
