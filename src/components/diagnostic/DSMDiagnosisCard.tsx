import { SEVERITY_PROFILES, LEVEL_COLORS, type DSMDiagnosis } from '@/lib/dsm-engine'

export function DSMDiagnosisCard({ diagnosis }: { diagnosis: DSMDiagnosis }) {
  const profile = SEVERITY_PROFILES[diagnosis.severityProfile]
  return (
    <div className={`bento-card p-6 border-t-4 ${profile.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase">אבחון DSM ארגוני</p>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.bgColor} ${profile.color}`}>
          {profile.labelHe}
        </span>
      </div>
      <div className="space-y-3">
        {diagnosis.pathologies.map((p) => {
          const colors = LEVEL_COLORS[p.level]
          return (
            <div key={p.code} className="flex items-center gap-3">
              <code className={`text-lg font-black font-mono ${colors.text} w-14 shrink-0`}>
                {p.code}-{p.level}
              </code>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">{p.nameHe}</span>
                  <span className={`text-xs font-bold ${colors.text}`}>{p.score.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${(p.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
