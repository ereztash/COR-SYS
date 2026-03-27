# Color Semantics Governance Spec

## Goal

Ensure color usage directly supports fast and accurate decision-making in COR-SYS.
Color must encode meaning consistently across diagnostic, recommendation, and execution surfaces.

## Design Principles

- Semantic-first: use role/meaning tokens, not ad-hoc color utilities.
- One meaning, one visual family: identical intent maps to identical token families.
- Redundancy for accessibility: color is never the only signal (always pair with label/icon/value).
- Contrast safety: decision-critical text must meet WCAG AA contrast in dark theme.

## Semantic Layers

### Layer 1: Intent Tokens

- `status-info`, `text-intent-info`
- `status-success`, `text-intent-success`
- `status-warning`, `text-intent-warning`
- `status-danger`, `text-intent-danger`

Use for global state intent (guidance, success, attention, urgency).

### Layer 2: Domain Tokens

- `axis-dr`, `panel-dr`
- `axis-nd`, `panel-nd`
- `axis-uc`, `panel-uc`
- `axis-sc`, `panel-sc`

Use only for pathology/diagnostic axis encoding.

### Layer 3: Action Tokens

- `cta-primary`

Use for primary call-to-action buttons in decision paths.

## Decision Surface Mapping

- Severity label: `status-*` by severity level.
- Urgency badge: `status-*` by urgency signal.
- Axis number/heading: `axis-*`.
- Axis container/background: `panel-*`.
- Primary recommendation action: `cta-primary`.
- Risk/loss text: `text-intent-danger`.
- Positive value/recovery text: `text-intent-success`.

## Guardrails

- Prohibited on decision surfaces:
  - direct Tailwind color utilities like `text-red-*`, `bg-blue-*`, `border-yellow-*`.
- Allowed:
  - semantic classes (`status-*`, `text-intent-*`, `axis-*`, `panel-*`, `cta-primary`)
  - neutral classes (`text-slate-*`, `bg-slate-*`, `border-slate-*`).

## Accessibility Requirements

- Do not rely on hue alone for severity/urgency communication.
- Keep labels explicit (`critical`, `at-risk`, `healthy`, etc.).
- Preserve `focus-visible` styling for keyboard flows.
- Validate contrast for small text in badges and metrics.

## Scope

This policy is mandatory for core decision surfaces:

- `src/components/diagnostic/RecommendationPanel.tsx`
- `src/components/ui/DecisionSpine.tsx`
- `src/app/clients/[clientId]/diagnostic/new/DiagnosticWizard.tsx`
- `src/app/page.tsx`
- `src/app/services/calculator/page.tsx`

## Migration Rule

When touching UI code:

1. Replace direct non-neutral color utility with semantic token.
2. If no semantic token exists, add it in `src/app/globals.css`.
3. Keep token naming stable and additive.

## QA Checklist

- Same intent renders same color family across the app.
- Same axis renders same color family across the app.
- No direct non-neutral utility classes in scoped decision surfaces.
- Small text on colored backgrounds remains readable.
