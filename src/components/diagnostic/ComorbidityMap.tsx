import { LEVEL_COLORS, type DSMDiagnosis, type ComorbidityEdge } from '@/lib/dsm-engine'

export function ComorbidityMap({ edges, diagnosis }: { edges: ComorbidityEdge[]; diagnosis: DSMDiagnosis }) {
  const activeEdges = edges.filter((e) => e.active)
  if (activeEdges.length === 0 && diagnosis.severityProfile === 'healthy') return null

  const nodes: { code: string; cx: number; cy: number; nameHe: string }[] = [
    { code: 'SC', cx: 150, cy: 32, nameHe: 'עמימות מבנית' },
    { code: 'DR', cx: 58, cy: 142, nameHe: 'הדדיות מעוותת' },
    { code: 'ND', cx: 150, cy: 178, nameHe: 'נורמליזציית סטייה' },
    { code: 'UC', cx: 242, cy: 142, nameHe: 'כיול לא-מייצג' },
  ]
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.code, n]))
  const pathologyMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))

  return (
    <div className="bento-card p-6">
      <p className="text-xs font-bold text-slate-500 uppercase mb-3">מפת קומורבידיות</p>
      <div className="w-full max-w-full overflow-hidden">
        <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto" direction="ltr">
        {edges.map((edge) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null
          const color = edge.direction === 'positive' ? '#3b82f6' : '#f97316'
          const opacity = edge.active ? 0.9 : 0.2
          const strokeWidth = edge.active ? 2.5 : 1
          const dashArray = edge.active ? 'none' : '4,4'
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeDasharray={dashArray}
              />
              {edge.active && (
                <text
                  x={(from.cx + to.cx) / 2}
                  y={(from.cy + to.cy) / 2 - 6}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400"
                >
                  r={edge.correlation.toFixed(2)}
                </text>
              )}
            </g>
          )
        })}
        {nodes.map((node) => {
          const p = pathologyMap[node.code]
          const colors = p ? LEVEL_COLORS[p.level] : LEVEL_COLORS[1]
          return (
            <g key={node.code}>
              <circle cx={node.cx} cy={node.cy} r={22} className={`${colors.bg} opacity-20`} fill="currentColor" />
              <circle cx={node.cx} cy={node.cy} r={18} className={`${colors.bg} opacity-60`} fill="currentColor" />
              <text x={node.cx} y={node.cy + 4} textAnchor="middle" className="text-xs font-bold fill-white">
                {node.code}
              </text>
            </g>
          )
        })}
        </svg>
      </div>
      {activeEdges.length > 0 && (
        <div className="mt-3 space-y-2">
          {activeEdges.map((edge) => (
            <div key={`${edge.from}-${edge.to}-desc`} className="text-xs text-slate-400 leading-relaxed">
              <span className={edge.direction === 'positive' ? 'text-blue-400' : 'text-orange-400'}>
                {edge.from} ↔ {edge.to} (r={edge.correlation.toFixed(2)})
              </span>
              {' — '}
              {edge.mechanism}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
