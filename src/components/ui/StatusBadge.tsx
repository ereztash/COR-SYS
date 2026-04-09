'use client'
import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  const isActive = status === 'active'
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider transition-all duration-200',
      isActive && 'shadow-sm',
      STATUS_COLORS[status] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      className
    )}>
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
