'use client'
import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider',
      STATUS_COLORS[status] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      className
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
