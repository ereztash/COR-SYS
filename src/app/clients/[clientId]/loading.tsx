import { CorSkeleton as Skeleton } from '@/components/ui/CorSkeleton'

export default function ClientDetailLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      {/* Header skeleton */}
      <div className="border-b border-white/5 px-6 pt-6 pb-8">
        <Skeleton className="h-4 w-16 mb-5" />
        <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}
