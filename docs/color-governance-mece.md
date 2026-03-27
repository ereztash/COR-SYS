# COR-SYS Color Governance (MECE)

## 10 rules

1. Primary CTA must use `cta-primary` only.
2. Semantic status must use `status-info|success|warning|danger` only.
3. Axis labels must use `axis-dr|axis-nd|axis-uc` only.
4. Axis metric cards must use `panel-dr|panel-nd|panel-uc` only.
5. Revenue/positive value text must use `text-intent-success`.
6. Risk/loss text must use `text-intent-danger`.
7. Explanatory neutral copy must use `text-slate-400|500` only.
8. No direct `bg-*-600` on core decision surfaces (use semantic helpers).
9. No mixed intent colors in same component role.
10. New components must map role -> semantic token before UI implementation.

## Role map

- Info/Guidance -> `status-info`, `text-intent-info`
- Success/Value -> `status-success`, `text-intent-success`
- Warning/Attention -> `status-warning`, `text-intent-warning`
- Danger/Urgency -> `status-danger`, `text-intent-danger`
- DR/ND/UC metrics -> `panel-dr|panel-nd|panel-uc`
