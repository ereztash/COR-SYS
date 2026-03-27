import { Skeleton } from '@/components/ui/Skeleton'

export default function ClientsLoading() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bento-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-56" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
