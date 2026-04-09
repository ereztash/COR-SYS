import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  /** Render a circle instead of a rounded rectangle */
  circle?: boolean
}

export function CorSkeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-slate-800 shimmer-bar',
        circle ? 'rounded-full' : 'rounded-lg',
        className,
      )}
    />
  )
}
