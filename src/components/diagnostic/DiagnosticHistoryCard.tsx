import type { ClientDiagnostic } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

const PROFILE_LABELS: Record<string, string> = {
  healthy: 'תקין',
  'at-risk': 'בסיכון',
  critical: 'קריטי',
  'systemic-collapse': 'קריסה מערכתית',
}

function TrendArrow({ prev, curr }: { prev: number; curr: number }) {
  if (prev === curr) return <span className="text-slate-500">→</span>
  if (curr < prev) return <span className="text-emerald-400">↓</span>
  return <span className="text-red-400">↑</span>
}

export function DiagnosticHistoryCard({ diagnostics }: { diagnostics: ClientDiagnostic[] }) {
  if (diagnostics.length === 0) return null
  if (diagnostics.length === 1) {
    const d = diagnostics[0]
    const s = d.dsm_summary
    return (
      <div className="bento-card p-6 border-t-4 border-t-slate-600">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3">היסטוריית אבחונים</p>
        <ModeBlurb
          className="mb-3"
          beginner="השוואה פשוטה בין המדידה הקודמת למדידה הנוכחית."
          advanced="Recent diagnostic timeline with directional trend indicators."
          research="Short-horizon trajectory trace for state-transition analysis."
        />
        <p className="text-sm text-slate-400 mb-2">אבחון יחיד — {formatDate(d.created_at)}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-400">DR {s.drScore.toFixed(1)}</span>
          <span className="text-yellow-400">ND {s.ndScore.toFixed(1)}</span>
          <span className="text-orange-400">UC {s.ucScore.toFixed(1)}</span>
          <span className="text-slate-500">{PROFILE_LABELS[s.severityProfile] ?? s.severityProfile}</span>
        </div>
      </div>
    )
  }

  const [latest, prev] = [diagnostics[0], diagnostics[1]]
  const ls = latest.dsm_summary
  const ps = prev.dsm_summary

  return (
    <div className="bento-card p-6 border-t-4 border-t-slate-600">
      <p className="text-xs font-bold text-slate-500 uppercase mb-3">היסטוריית אבחונים</p>
      <ModeBlurb
        className="mb-3"
        beginner="השוואה פשוטה בין המדידה הקודמת למדידה הנוכחית."
        advanced="Recent diagnostic timeline with directional trend indicators."
        research="Short-horizon trajectory trace for state-transition analysis."
      />
      <div className="space-y-3">
        {diagnostics.slice(0, 5).map((d, i) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-400 shrink-0 w-24">{formatDate(d.created_at)}</span>
            <span className="text-blue-400">DR {d.dsm_summary.drScore.toFixed(1)}</span>
            <span className="text-yellow-400">ND {d.dsm_summary.ndScore.toFixed(1)}</span>
            <span className="text-orange-400">UC {d.dsm_summary.ucScore.toFixed(1)}</span>
            <span className="text-slate-500 text-xs">{PROFILE_LABELS[d.dsm_summary.severityProfile] ?? d.dsm_summary.severityProfile}</span>
            {i === 0 && prev && (
              <span className="flex gap-1 text-xs" title="השוואה לאבחון הקודם">
                <TrendArrow prev={ps.drScore} curr={ls.drScore} />
                <TrendArrow prev={ps.ndScore} curr={ls.ndScore} />
                <TrendArrow prev={ps.ucScore} curr={ls.ucScore} />
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        חץ ירוק = שיפור, אדום = החמרה (ביחס לאבחון הקודם)
      </p>
    </div>
  )
}
