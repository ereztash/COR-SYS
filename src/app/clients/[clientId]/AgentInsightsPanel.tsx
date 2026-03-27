import { buildDeltaPayload } from '@/lib/agents/delta'

interface Props {
  planId: string
}

function loopTone(loop: string | null): { label: string; className: string } {
  if (loop === 'runaway') return { label: 'Runaway', className: 'status-badge status-danger' }
  if (loop === 'negative') return { label: 'Balancing', className: 'status-badge status-success' }
  if (loop === 'positive') return { label: 'Amplifying', className: 'status-badge status-warning' }
  return { label: 'N/A', className: 'status-badge status-info' }
}

function boldnessLabel(value: number): { label: string; className: string } {
  if (value >= 0.75) return { label: 'Bold', className: 'text-intent-danger' }
  if (value >= 0.45) return { label: 'Balanced', className: 'text-intent-warning' }
  return { label: 'Safe', className: 'text-intent-success' }
}

export async function AgentInsightsPanel({ planId }: Props) {
  try {
    const payload = await buildDeltaPayload(planId)
    const loop = loopTone(payload.gamma.feedbackLoopType ?? null)

    return (
      <div className="space-y-4" dir="rtl">
        <div className="rounded-2xl border border-white/6 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="type-h2 text-white">Autopoietic Agents</h2>
            <span className="status-badge status-info">Alpha · Beta · Gamma · Delta</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/6 bg-slate-900/40 p-4">
              <p className="type-meta mb-2">Alpha · Boundary Map</p>
              <div className="flex flex-wrap gap-2">
                {payload.alphaSummary.boundedContexts.length > 0 ? (
                  payload.alphaSummary.boundedContexts.map((context) => (
                    <span key={context.label} className="px-3 py-1 rounded-full text-xs border border-indigo-500/20 text-indigo-200 bg-indigo-950/20">
                      {context.label} · {(context.confidence * 100).toFixed(0)}%
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">עדיין לא נשמרה מפת גבולות.</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Contradiction Loss: {payload.alphaSummary.contradictionLoss != null ? payload.alphaSummary.contradictionLoss.toFixed(2) : '—'}
              </p>
            </div>

            <div className="rounded-xl border border-white/6 bg-slate-900/40 p-4">
              <p className="type-meta mb-2">Gamma · Active Signals</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">KL Drift</p>
                  <p className="font-black text-white">{payload.gamma.semanticDriftKl.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">J(t)</p>
                  <p className="font-black text-white">{payload.gamma.currentJ.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Emergence</p>
                  <p className="font-black text-white">{payload.gamma.emergenceSignal}</p>
                </div>
                <div>
                  <p className="text-slate-500">Loop</p>
                  <p className="font-black text-white">{payload.gamma.feedbackLoopType ?? '—'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={loop.className}>{loop.label}</span>
                {payload.gamma.alert ? (
                  <span className="text-xs text-intent-danger type-kpi">Alert: {payload.gamma.alert}</span>
                ) : (
                  <span className="text-xs text-slate-500">No active alert</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/6 bg-slate-950/40 p-5">
            <p className="type-meta mb-3">Beta · Monte Carlo</p>
            <div className="space-y-3">
              {payload.simulations.map((simulation) => (
                <div key={simulation.interventionType} className="rounded-xl border border-white/6 bg-slate-900/30 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-bold text-white">{simulation.interventionType}</p>
                    <span className="text-xs text-slate-400">{simulation.sampleCount} cases</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
                      style={{ width: `${Math.max(10, Math.min(100, (simulation.roiPercentiles.p50 + 1) * 40))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    ROI P5/P50/P95: {simulation.roiPercentiles.p5.toFixed(2)} / {simulation.roiPercentiles.p50.toFixed(2)} / {simulation.roiPercentiles.p95.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Benefit median ₪{Math.round(simulation.benefitPercentiles.p50).toLocaleString('he-IL')} · Risk median ₪{Math.round(simulation.riskPercentiles.p50).toLocaleString('he-IL')}
                  </p>
                  <p className={`text-xs mt-1 ${boldnessLabel(simulation.roiPercentiles.p50).className}`}>
                    {boldnessLabel(simulation.roiPercentiles.p50).label} execution profile
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/6 bg-slate-950/40 p-5">
            <p className="type-meta mb-3">Delta · Reasoning Trace</p>
            <div className="space-y-3">
              {payload.reasoningTrace.map((step) => (
                <div key={step.title} className="rounded-xl border border-white/6 bg-slate-900/30 p-4">
                  <p className="text-sm font-bold text-white">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
              <p className="type-meta mb-2 text-amber-300">Double-loop prompts</p>
              <ul className="space-y-2 text-xs text-slate-300">
                {payload.socraticQuestions.map((question) => (
                  <li key={question}>• {question}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  } catch {
    return (
      <div className="rounded-2xl border border-white/6 bg-slate-950/40 p-5" dir="rtl">
        <p className="type-meta text-slate-400 mb-2">Autopoietic Agents</p>
        <p className="text-sm text-slate-500">עדיין אין מספיק נתונים כדי להציג תובנות סוכנים.</p>
      </div>
    )
  }
}
