# COR-SYS — Agent Entry Point

## STOP — Before ANY tool call, read these files:

1. **LOG.md** (this repo root) — environment facts, anti-patterns, lessons
2. **index/CLAUDE.md** — full agent architecture (Board, pipelines, skills)

If you haven't read LOG.md yet in this session, **read it now**. Do not proceed without it.

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
