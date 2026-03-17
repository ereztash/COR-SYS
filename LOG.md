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
| OPENAI_API_KEY | Not configured yet (2026-03-18) | 2026-03-18 |
| Supabase project ref | `iwguetjjnbrinppeswyj` (eu-west-1, ACTIVE) | 2026-03-18 |

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
