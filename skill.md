# COR-SYS Heuristic Skills — Quick Reference

> Fast-path decision trees. Invoke BEFORE loading full pipeline files.
> Full definitions: `index/CLAUDE.md` → "Heuristic Skills" section.

---

## 4 Core Skills

### `delta-diagnostic`
**When:** Gap measurement, J Quotient, "מה שבור", deviation analysis, PE calculation
**Signals:** "מדוד", "פער", "delta", "מה שבור", "deviation", "entropy"
**Cascade:** → auto-invoke `symmetry-classifier` at stage 4
**Cascade:** + identified axis → auto-load `axis-router`

---

### `axis-router`
**When:** Cross-domain connection, anchor term identification, "same mechanism different domain"
**Signals:** "ציר", "axis", "אותו מנגנון", "isomorphism", "cross-domain"
**Cascade:** Triggered by `delta-diagnostic` when axis is identified

---

### `stress-probe`
**When:** Pre-sprint, post-incident, resilience stress test, TTE (Time to Entropy) analysis
**Signals:** "stress probe", "לפני ספרינט", "מה נחשף", "TTE", "perturbation"
**Cascade:** Results feed into `delta-diagnostic`

---

### `symmetry-classifier`
**When:** Reversibility assessment, intervention type classification, boundary conditions
**Signals:** "הפיך", "reversible", "סוג התערבות", "transition", "boundary"
**Cascade:** Auto-triggered by `delta-diagnostic` stage 4

---

## Claude Code Skills (slash commands)

| Skill | When |
|-------|------|
| `/plan` | Before any multi-file change (Iron Rule) |
| `/cor-checkpoint` | Mid-session state capture |
| `/cor-debrief` | End of session — double-loop learning |
| `/cor-migrate` | Supabase migration workflow |
| `/cor-ship` | Commit → push → PR |
| `/cor-formula` | Research → code translation |
| `/compress-context` | Context > 70% or noise high |
| `/simplify` | After writing code — quality review |

---

## Invocation Rules

- One skill at a time. Never mix pipelines mid-execution.
- `profile/identity.md` cannot be overridden by any skill.
- If task contradicts values → report, don't skip.
