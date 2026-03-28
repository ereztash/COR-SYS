# COR-SYS

**Organizational Resilience Engineering Platform**

**Name it. Face it. Fix it.**

COR-SYS diagnoses three structural pathologies that drive decision latency, entropy loss, and intervention failure in organizations. It combines a DSM-style diagnostic engine, a Case-Based Reasoning (CBR) retrieval system, and a mathematical resilience formula to provide evidence-based, loss-framed intervention recommendations for consultants and organizational development teams.

> **COR** — Conservation of Resources (Hobfoll): organizations act to preserve resources; loss is felt 2.25× more acutely than equivalent gain.
> **SYS** — Systems: every intervention is structural, never personal.

The guarantee: *for every hour of engagement — the organization saves at least one work-hour per week, for the remainder of the process.*

---

## Axis pathologies (questionnaire → scores)

| Code | Name | Theoretical Basis |
|------|------|-------------------|
| **DR** | Distorted Reciprocity | Różycka-Tran BZSG scale (N=10,000) — internal competition destroying cross-departmental collaboration |
| **ND** | Normalization of Deviance | Vaughan (1996) Challenger — 5-stage procedural drift toward systemic failure |
| **UC** | Unrepresentative Calibration | Edmondson (1999) Psychological Safety + Floridi (2014) Ontological Friction |
| **SC** | Structural clarity (decision rights / ownership) | Complements DR/ND/UC — ambiguity in who decides and owns outcomes |

**DSM-Org organizational types** (synthesis from axis scores + questionnaire): `NOD`, `ZSG_SAFETY`, `ZSG_CULTURE`, `OLD`, `CLT`, `CS` (plus optional CS “amplifier” flag). Legacy snapshots may still contain `ZSG`; the engine normalizes to the split variants where needed.

Severity profiles: `healthy` → `at-risk` → `critical` → `systemic-collapse`

---

## What It Does

1. **Diagnose** — structured questionnaire (ICP + pathologies + metrics + Edmondson PSI) produces DR/ND/UC/**SC** scores (0–10 each) and a severity profile
2. **Benchmark** — compares scores against McKinsey OHI (N=1,500), CultureAmp (N=6,000), and Qualtrics cohorts
3. **Retrieve** — finds the most similar historical intervention cases via embedding-based CBR search (pgvector HNSW)
4. **Recommend** — ranks interventions with Wilson-score confidence, daily loss framing (₪/day), and eigenvalue trajectory
5. **Track** — measures delta (pre/post) to validate whether interventions moved the needle; feeds Bayesian calibration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase PostgreSQL + pgvector (HNSW ANN indexing) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 (strict) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| AI SDK | `@anthropic-ai/sdk` (Claude) |
| PDF | `@react-pdf/renderer` |
| Email | Resend (optional) |
| Testing | Vitest |

---

## Core Engines

### DSM Engine — `src/lib/dsm-engine.ts`
Maps questionnaire answers to **DR / ND / UC / SC** pathology codes and severity levels (1–3). Computes comorbidity edges and outputs structured **long-horizon** intervention protocols (multi-month “building phase” blocks). Based on N=10,000 simulation model.

### Unified treatment pipeline — `src/lib/diagnostic/unified-pipeline.ts` + `src/lib/diagnostic.ts`

Single CDSS path for **plan page, assess results, PDF, wizard, and live calculator**: `computeDiagnostic()` calls `runUnifiedTreatmentPipelineFromDiagnosis()`, which ranks **short-horizon** `ActionPlanItem[]` via IUS scoring, constraint envelope, comorbidity sequencing rules, and attaches metadata (narrative, triggers, gate reviews, sequencing alerts). Long-horizon protocols from `getInterventionProtocols()` are exposed as `unifiedTreatmentPlan.longHorizonProtocols`.

- **Shadow / regression:** set `UNIFIED_PIPELINE_SHADOW=true` to log a server-side diff between legacy protocol ids and unified intervention ids (no UI change).
- **Persistence:** when a plan is saved (`savePlanFromQuestionnaire`), a **`unified_action_plan_snapshot`** object is merged into `client_business_plans.questionnaire_response` for stable replays and PDFs for older clients (see `UnifiedActionPlanSnapshot` in `src/types/database.ts`).

### DSM-Org synthesis — `src/lib/diagnostic/dsm-synthesis.ts`
Maps axis scores (+ optional answers) to primary organizational pathology type and CS amplifier, shared by the unified pipeline and fast triage UIs.

### DSM Policy Engine — `src/lib/dsm-policy-engine.ts`
Decision support layer above the DSM engine. Transforms a diagnosis into:
- **Benchmark context** — percentile estimates vs. OHI/CultureAmp/Qualtrics cohorts
- **Golden-question answers** — system state, bottleneck narrative, economic impact, recommended CTA
- **Policy rules** — `DECISION_RULES` table (data-driven; extend by adding rows, no code changes)
- **Feedback schema** — session-level input/output snapshots for continuous threshold calibration

### Resilience Formula — `src/lib/resilience-formula.ts`

```
LG = 0.571 × (−ΔDR) + 0.429 × (ΔPSI)
λ  = 1 + κ × LG
```

| Constant | Value | Source |
|----------|-------|--------|
| 0.571 | DR weight | Kahneman & Tversky Loss Aversion Ratio (2.25:1) |
| 0.429 | PSI weight | Edmondson innovation multiplication |
| κ = 0.5 | Learning absorption coefficient | Default; calibrated per organization |
| Critical threshold | κ×LG ≤ −0.15 | Maladaptive regime — structural change required |

Trajectory: `growth` (λ>1) / `stable` (λ≈1) / `decay` (0<λ<1) / `bifurcation` (λ≤0)

Dynamic runtime extensions:
- `kappa` can be computed dynamically when not explicitly provided.
- `EoC` (Edge of Chaos) is exposed as `1 - |λ - 1|` (clamped to `[0,1]`) for intervention boldness/ranking signals.

### CBR Pipeline — `src/lib/cbr/`

Implements Aamodt & Plaza (1994) Retrieve–Reuse–Revise–Retain:

```
1. Embed   → normalize DR/ND/UC/DLI/PSI (0–1) + contextual header + OpenAI embedding
2. Filter  → SQL WHERE (industry + severity + DLI ≤ max) → ~100 candidates
3. Search  → HNSW pgvector ANN (cosine distance) → Top-20
4. Re-rank → cosine + severity bonus + learning_gain bonus − λ penalty → Top-5
5. Return  → intervention type, outcomes, confidence, cold_start flag
```

Contextual header (Anthropic Contextual Retrieval pattern, −49% retrieval failure):
```
[CONTEXT: industry | size_band | severity_profile]
[SCORES: DR=x/10, ND=x/10, UC=x/10]
[METRICS: DLI=xd, J=x, Entropy=x, PSI=x]
[NARRATIVE: bottleneck_text]
```

---

## API Routes

Most JSON API routes below require a logged-in Supabase session (the auth proxy in `src/proxy.ts` exempts /api/*).

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cbr/similar/[snapshotId]` | GET | Returns Top-K similar historical cases. Param: `top_k` (default 5). Returns `cold_start: true` when no matching cases exist. |
| `/api/cbr/recommend/[snapshotId]` | GET | Full CBR pipeline: retrieval, Wilson-scored recommendations, cold-start fallback, and telemetry event. |
| `/api/cbr/metrics` | GET | Live CBR quality and coverage metrics (follow-up coverage, LG coverage, PSI fill-rate, CTA breakdown). |
| `/api/cbr/eval` | GET | Retrieval harness evaluation on synthetic golden set (MRR, Hit@K, failure rate). |
| `/api/diagnostic/analyze` | POST | Embedding-assisted diagnostic analysis (profile/type inference + ranked matches). |
| `/api/diagnostic/config` | GET | Runtime diagnostic config from DB (trigger rules, evidence profiles, gate reviews). |
| `/api/diagnostic/pdf` | POST | Generates a diagnostic PDF by invoking Python (`scripts/generate_diagnostic_pdf.py`). |
| `/api/ux-metrics/event` | POST | Non-blocking UX telemetry ingestion endpoint. |
| `/api/plans/[clientId]/pdf` | GET | Generates a plan PDF report (diagnosis + unified treatment plan items + long-horizon protocols + recommendations) with `@react-pdf/renderer`. |
| `/api/agents/alpha/analyze` | POST | Alpha agent analysis: bounded contexts, contradiction loss, and optional persistence (`use_cache`, `ttl_minutes`). |
| `/api/agents/beta/simulate` | POST | Beta Monte Carlo simulation (ROI/risk percentiles) from recommendations and similar cases (`use_cache`, `ttl_minutes`). |
| `/api/agents/gamma/metrics` | GET | Gamma entropy metrics (KL drift, J, loop classification, emergence), optional persistence (`persist=1`). |
| `/api/agents/delta/recommendation/[planId]` | GET | Delta explainability payload (reasoning trace, simulation evidence, Socratic prompts). |
| `/api/agents/cron/process` | POST | Requires `Authorization: Bearer <CRON_SECRET>` and `SUPABASE_SERVICE_ROLE_KEY` (service role). Claims/executes due `agent_jobs`. |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — active clients, sprints, tasks, monthly revenue, portfolio analytics (severity distribution, avg DR/ND/UC) |
| `/clients` | Client list and management |
| `/clients/[clientId]` | Client detail — diagnostics, actions (sprint, plan, assessment) |
| `/clients/[clientId]/plan` | 4-step questionnaire (ICP → pathologies → metrics → PSI) → DSM diagnosis + CTA recommendation |
| `/assess/[token]` | Public assessment — external stakeholders complete questionnaire without auth |
| `/assess/[token]/results` | Results page — severity profile, pathology scores, intervention recommendations |
| `/services` | Service portfolio — 3 channels (L1/L2/L3), 10 offerings with pricing |
| `/services/calculator` | Free Decision Latency Index calculator (lead generation) |
| `/sprints` | Sprint list across all clients |
| `/financials` | Revenue tracking, invoicing, payment status |
| `/about` | Architecture, research basis, methodology |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `clients` | Client master data — industry, status, decision latency, hourly rate, retainer |
| `sprints` | Sprint planning, status (planned/active/completed/cancelled), retrospectives |
| `tasks` | Sprint tasks — priority (critical/high/medium/low), status, estimated/actual hours |
| `financials` | Revenue, invoicing, payment tracking per client per month |
| `client_assessments` | Assessment tokens + JSONB responses (external stakeholder flow) |
| `client_diagnostics` | DSM diagnosis history per client (answers + dsm_summary JSONB) |
| `client_business_plans` | Plan records — `questionnaire_response` (answers + optional `unified_action_plan_snapshot`), recommended channel/option, next steps |
| `organizations_context` | CBR: org metadata (industry_sector, employee_size_band, culture_archetype) |
| `dsm_diagnostic_snapshots` | CBR: historical DSM snapshots + `VECTOR(1536)` feature embeddings |
| `interventions_and_feedback` | CBR: intervention outcomes, consultant overrides, delta metrics, learning_gain, λ eigenvalue |
| `trigger_rules` | Diagnostic runtime IF-THEN trigger rules (DB-managed). |
| `intervention_evidence_profiles` | Evidence certainty + notes per intervention tag (DB-managed). |
| `gate_reviews` | 90-day gate definitions (week/title/pass criteria). |
| `gate_runs` | Per-client gate execution outcomes (pending/passed/failed). |
| `agent_jobs` | Hybrid cron queue for autonomous agent runs (claim/retry/status/outcome). |
| `agent_change_requests` | Human oversight layer for high-impact agent mutations (approve/reject flow). |
| `org_network` | Organizational graph nodes and adjacency data (hubs/silos/team topology). |
| `org_network_metrics` | Computed graph metrics (density, diameter, clustering, betweenness). |
| `feedback_events` | Emergence/loop events emitted by Gamma (negative/positive/runaway/phase-transition). |
| `feedback_actions` | Follow-up actions generated from feedback events (alerts/recommendations/jobs). |
| `agent_memories` | Persisted per-agent cache keyed by input hash + TTL to avoid recomputation. |

**RPC:** `get_similar_cases_with_stats(query_embedding, target_industry, target_severity, max_dli, match_limit)`

---

## Migration Order (Supabase)

Run migrations in this order for a clean setup:

1. `supabase-schema.sql`
2. `supabase-migration-client-plans.sql`
3. `supabase-migration-client-assessments.sql`
4. `supabase-migration-client-diagnostics.sql`
5. `supabase-migration-cbr.sql`
6. `supabase-migration-cbr-calibration.sql`
7. `migration-add-score-sc.sql`
8. `supabase-migration-ux-metrics.sql`
9. `supabase-migration-rls.sql`
10. `supabase-migration-rls-authenticated.sql`
11. `supabase-migration-diagnostic-config.sql`
12. `supabase-migration-diagnostic-evidence-seed.sql`
13. `supabase-migration-agents-runtime.sql`
14. `supabase-migration-org-network.sql`
15. `supabase-migration-emergence-feedback.sql`
16. `supabase-migration-agent-memory.sql`
17. `supabase-migration-rls-authenticated-agent-tables.sql`

Optional seed: `seed-cbr-cases.sql`

**Important:** enable `pgvector` first:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Environment Variables

```env
# Required — Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required for CBR similarity search
OPENAI_API_KEY=sk-...

# Optional — transactional email (assessment completion notifications)
RESEND_API_KEY=
RESEND_FROM=COR-SYS <onboarding@resend.dev>
RESEND_TO=

# Optional — log legacy vs unified intervention ids on the server (computeDiagnostic)
# UNIFIED_PIPELINE_SHADOW=true
```

---

## Local Development

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

# Start dev server
npm run dev
# → http://localhost:3000

# Run tests
npm run test

# Build for production
npm run build
```

### Diagnostic PDF prerequisites (Python)

`/api/diagnostic/pdf` invokes `scripts/generate_diagnostic_pdf.py`, which requires Python 3 and:

```bash
pip install reportlab python-bidi
```

If your font paths differ from Linux defaults, adjust font constants inside `scripts/generate_diagnostic_pdf.py`.

**Supabase prerequisite:** enable `pgvector` in your Supabase project dashboard before running CBR migrations.

### Agent Memory Cache (optional but recommended)

All `/api/agents/*` endpoints support persisted cache reads/writes:

- `use_cache=0` disables cache for a single request (forces recompute).
- `ttl_minutes=<number>` overrides cache TTL for that request.

Examples:

```bash
# Force fresh Gamma computation + persistence, skip cache
curl "http://localhost:3000/api/agents/gamma/metrics?clientId=<CLIENT_ID>&persist=1&use_cache=0"

# Use cache with custom TTL for Beta simulation
curl -X POST "http://localhost:3000/api/agents/beta/simulate?ttl_minutes=90" \
  -H "Content-Type: application/json" \
  -d '{"snapshotId":"<SNAPSHOT_ID>"}'
```

---

## Research Foundation

| Construct | Source | Evidence |
|-----------|--------|----------|
| Decision Latency | Eisenhardt (1989); McKinsey (2019) | Fast-decision orgs: +30% ROI; 70% managers report >10h/week lost |
| Normalization of Deviance | Vaughan (1996) Challenger | 5-stage model; present in 67% of medical errors (Banja 2010) |
| Psychological Safety | Edmondson (1999) | α=.82, r=.35 team learning; mediates 40% of safety outcomes |
| Loss Aversion (DR weight) | Kahneman & Tversky (1991) | Ratio 2.25:1; underpins 0.571 DR coefficient |
| Network Comorbidity | Borgatti et al. (2009) | COR-SYS N=10,000: DR↔ND r=.19, DR↔UC r=−.27, ND↔UC r=.28 |
| Semantic Drift | Floridi (2014); Weick (1995) | Sensemaking failures precede 80% of org crises |
| OHI Benchmarks | McKinsey (2017) | N=1,500 orgs |
| Engagement Benchmarks | CultureAmp / Qualtrics (2022–2024) | N=6,000+ orgs |

---

## Development Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Auth + Row Level Security | Done |
| Phase 1 | CBR data layer, DB migration, resilience formula, Edmondson PSI questionnaire | Done |
| Phase 2 | Embedding service, similarity search, CBR API endpoints | Done |
| Phase 3 | Recommendation engine, loss-framed UI, override flow, follow-up loop, Bayesian Tier-2 calibration | Done |
| Phase 4 | Diagnostic wizard hardening (unified treatment pipeline, IUS + envelope, ZSG safety/culture split, plan snapshot, PDF/UI alignment, telemetry polish) | In progress |

---

## ICP

- **Size:** 50–300 employees, Growth stage (Series A–C)
- **Sectors:** Cybersecurity, Fintech, AI/Healthtech, complex B2B
- **Champions:** COO, CFO, CEO
