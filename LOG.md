# COR-SYS — Insight Log

> Double-Loop Learning artifact. Updated after every session.
> If you are Claude and reading this: **this file prevents you from repeating mistakes.**

---

## Environment Facts (verified — do not re-discover)

| Fact | Value | Discovered |
|---|---|---|
| OS | Windows 11 | 2026-03-17 |
| gh CLI | **NOT INSTALLED** — use GitHub URL directly | 2026-03-17 |
| claude CLI | **NOT IN PATH** — don't suggest terminal commands | 2026-03-18 |
| Supabase client pattern | `createClient` from `@/lib/supabase/server` (SSR) | 2026-03-18 |
| Supabase RPC typing | SSR client doesn't infer custom `Functions` type — use explicit cast | 2026-03-18 |
| MCP config format | `"command": "npx"` + `"args"` array, NOT `"type": "http"` | 2026-03-18 |
| Git user | local config only, GitHub auth via Credential Manager | 2026-03-17 |
| Node/npm | Installed, works from cmd | 2026-03-17 |
| OPENAI_API_KEY | Configured in .env.local (2026-03-18) — account has 429 quota issue, needs billing top-up | 2026-03-18 |
| Supabase project ref | `iwguetjjnbrinppeswyj` (eu-west-1, ACTIVE) | 2026-03-18 |

## Pre-Build Validation Protocol (run BEFORE any Phase)

Before writing code for any Phase, validate ALL external dependencies:

```bash
# OpenAI API key + quota (30 seconds → saves 3 hours)
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"text-embedding-3-small","input":"test"}' | head -c 200

# Supabase connection
# Run any SELECT query via MCP execute_sql

# Build state of current branch
npm run build 2>&1 | tail -5
```

**Rule:** If an external API can fail with 429/401/503 → validate it in <1 min before building anything that depends on it.

## Anti-Patterns (mistakes — never repeat)

| # | What went wrong | Root cause | Rule |
|---|---|---|---|
| 1 | Asked user to paste token in chat | No safety-first thinking | **NEVER ask for secrets in chat. Point to .env.local** |
| 2 | Created MCP config with wrong format | Didn't research MCP docs first | **Research config format before generating config files** |
| 3 | 3 rounds of TypeScript errors on Supabase queries | Didn't read existing codebase patterns | **ALWAYS Explore existing patterns before writing new modules** |
| 4 | Used `gh pr create` — not installed | Didn't check, same error in previous session | **Check this log before using any CLI tool** |
| 5 | Told user to run `claude` in cmd.exe | Didn't verify it's in PATH | **Verify tool availability before suggesting commands** |
| 6 | pgvector extension not in migration file | Defensive coding failure | **Always include prerequisites at TOP of migration files** |
| 7 | Skipped Plan step, jumped to code | Violated Plan-Validate-Execute | **Use `plan` skill before any multi-file change** |
| 8 | Didn't read MEMORY.md / index/CLAUDE.md | Global instruction not enforced | **This LOG.md IS the enforcement mechanism** |
| 9 | Tried `execute_sql` then `apply_migration` for DML — both read-only | Didn't check MCP tool semantics first | **Supabase MCP: `execute_sql`=read-only, `apply_migration`=DDL only. DML must go via SQL Editor manually** |
| 10 | Seed data has NULL feature_vectors — HNSW search returns no matches | Embeddings require OpenAI, seeded without them | **Seed data without embeddings breaks CBR similarity. Either embed on insert, or document that cold_start is expected until embeddings generated** |
| 11 | Next.js 16 route params need `Promise<{...}>` type — pre-existing error caught at build | Didn't run build check after Phase 2 | **Always run `npm run build` after a Phase completes, before committing** |
| 12 | `ROUND(double_precision / 4.0, 2)` fails in PostgreSQL — no matching function | `score_dr` etc. are `double precision`, ROUND needs `numeric` | **Always cast: `(expr)::numeric` before ROUND with decimal places** |

## Codebase Patterns (copy these, don't invent new ones)

### Supabase Query Pattern
```typescript
// CORRECT — always use this:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data, error } = await supabase.from('table').select('*')

// WRONG — never use this:
import { createClient } from '@supabase/supabase-js'
```

### Type Assertion for New Tables
```typescript
// Supabase SSR generic doesn't infer custom table types.
// Use explicit cast after query:
const { data: raw } = await supabase.from('new_table').select('*').single()
const typed = raw as unknown as MyType
```

### RPC Call Pattern
```typescript
// SSR client RPC doesn't infer custom Functions type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = supabase.rpc as (...args: any[]) => any
const { data, error } = await rpc('function_name', { ...args })
```

## Session History

### 2026-03-17 — Initial setup + Git + Research
- Mapped project state after credit gap
- Pushed to GitHub `ereztash/COR-SYS`
- Created branch `feat/tooling-and-project-memory`
- Read PDF research on DSM engine + CBR
- Created `cbr-research-synthesis.md` + `cbr-execution-roadmap.md`
- **Friction:** gh not found, git config issues

### 2026-03-18 — Phase 1 + Phase 2 CBR
- Phase 1: migration SQL, database types, resilience formula, PSI questionnaire
- Phase 2: embedding service, similarity search, barrel export, API endpoint
- Connected Supabase MCP
- **Friction:** MCP config format, token in chat, TypeScript RPC typing (3 iterations), claude not in PATH
- **Key lesson:** ALWAYS read existing codebase patterns before writing new Supabase code

### 2026-03-25 — MVP Stabilization
- Build: ✅ clean (Next.js 16, zero TypeScript errors)
- Committed 16 files: Phase 3 CBR engine, score_sc dimension, UI polish
- Pushed to `feat/tooling-and-project-memory`
- Migration `add_score_sc` applied manually via SQL Editor (MCP read-only confirmed again)
- ROUND fix: `(expr)::numeric` cast required in PostgreSQL for `ROUND(x, 2)`
- CBR embeddings still cold-start — OpenAI quota pending
- **Open:** PR → master, OpenAI billing top-up

### 2026-03-18 — Phase 3 CBR Intelligence Layer
- Phase 3: `recommend.ts` (Wilson-score), `calibration.ts` (Bayesian), `trajectory.ts` (λ eigenvalue)
- UI: `RecommendationPanel.tsx`, `InterventionForm.tsx`, `CBRSection.tsx`, `followup/page.tsx`
- API: `/api/cbr/recommend/[snapshotId]` with policy-engine fallback
- Data: `data/cbr.ts`, `actions/cbr.ts`
- Build fix: Next.js 16 `params: Promise<{...}>` in route handlers
- Seed data: 10 CBR cases inserted manually via SQL Editor (MCP is read-only for DML)
- E2E test: API reached OpenAI but got 429 (quota) — key configured, billing needed
- **Friction:** MCP DML read-only (tried 2 tools), seed vectors NULL breaks HNSW, build not run after Phase 2
- **Key lesson:** Run `npm run build` after EVERY phase. Supabase MCP cannot do DML — plan for manual SQL Editor steps.

### 2026-03-28 — Valuation framework + calibration grounding (commit 069aba2)
- `docs/valuation-framework.md` + link מ-`docs/icp-and-sales.md`
- `docs/calibration-casebook.md`, `src/lib/calibration-cases.ts`, `src/lib/osint-display-policy.ts`
- UI: About → הפתרון (ביסוס שדה); CBR cold-start (דוגמאות ציבוריות)
- `npm test` (110) + `npm run build` — exit 0
