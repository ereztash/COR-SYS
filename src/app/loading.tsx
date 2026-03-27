export default function Loading() {
  return (
    <div className="p-6 lg:p-8 animate-fade-up space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 shimmer-bar" />
        <div className="h-6 w-48 rounded-lg bg-slate-800 shimmer-bar" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bento-card p-4 border border-slate-700/30 space-y-2"
          >
            <div className="h-3 w-20 rounded bg-slate-800 shimmer-bar" />
            <div className="h-7 w-16 rounded bg-slate-800 shimmer-bar" />
            <div className="h-2.5 w-24 rounded bg-slate-800 shimmer-bar" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bento-card p-6 border border-slate-700/30 space-y-3"
          >
            <div className="h-4 w-32 rounded bg-slate-800 shimmer-bar" />
            <div className="h-3 w-full rounded bg-slate-800/60 shimmer-bar" />
            <div className="h-3 w-3/4 rounded bg-slate-800/40 shimmer-bar" />
          </div>
        ))}
      </div>
    </div>
  )
}
