# COR-SYS — Agent Entry Point

## GATE 0 — Session Init (BLOCKING — before ANY tool call)

Read in this exact order:

| # | File | Tokens | What it gives you |
|---|------|--------|-------------------|
| 1 | `LOG.md` (repo root) | ~600 | Environment facts, anti-patterns, session history |
| 2 | `~/.claude/projects/.../memory/MEMORY.md` | ~200 | Project state index, quick orientation |
| 3 | `skill.md` (repo root) | ~300 | Heuristic skills + slash command reference |
| 4 | `CLAUDE.md` (this file) | ~400 | Quick rules, stack, architecture |

**Tier 1 — load only when task requires it:**
- `index/CLAUDE.md` — full pipelines + Board (multi-step or strategic task)
- `docs/cbr-execution-roadmap.md` — Phase 3 work

**Context health:** >70% context → MONITOR mode. 2 self-corrections → /clear.

If LOG.md not yet read this session → **read it now. Do not proceed without it.**

## Quick Rules (expanded in index/CLAUDE.md)

- **Plan-Validate-Execute** — never jump to code. Use `plan` skill first.
- **Explore before writing** — always read existing patterns in the codebase before creating new files.
- **Never ask for secrets in chat** — always point to `.env.local`.
- **Supabase queries** — use `createClient` from `@/lib/supabase/server`, not from `@supabase/supabase-js`.
- **gh CLI is NOT installed** — use GitHub URLs directly, never `gh` commands.
- **Windows environment** — `claude` is not in PATH. Don't suggest terminal commands for it.

## Architecture

- **Stack:** Next.js 16 + Supabase + Tailwind v4 + TypeScript
- **DSM Engine:** DR/ND/UC scoring → `src/lib/dsm-engine.ts`
- **CBR Engine:** Retrieve-Reuse-Revise-Retain → `src/lib/cbr/`
- **Resilience Formula:** LG = 0.571(-ΔDR) + 0.429(ΔPSI) → `src/lib/resilience-formula.ts`
- **Full architecture:** see `index/CLAUDE.md`
