export function EntropyDots({ score }: { score: number }) {
  const colors = ['bg-emerald-500', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500']
  const labels = ['נמוכה', 'בינונית', 'גבוהה', 'קריטית']
  const level = score === 0 ? 0 : score <= 1 ? 1 : score <= 2 ? 2 : 3
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < score ? colors[Math.min(score - 1, 3)] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-slate-400">
        {score}/4 פתולוגיות —{' '}
        <span className={score >= 3 ? 'text-red-400' : score >= 2 ? 'text-orange-400' : score >= 1 ? 'text-yellow-400' : 'text-emerald-400'}>
          אנטרופיה {labels[level]}
        </span>
      </span>
    </div>
  )
}
