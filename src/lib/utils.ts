import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  prospect: 'פוטנציאלי',
  churned: 'עזב',
  paused: 'מושהה',
  volunteer: 'התנדבות',
  planned: 'מתוכנן',
  completed: 'הושלם',
  cancelled: 'בוטל',
  todo: 'לביצוע',
  in_progress: 'בביצוע',
  done: 'הושלם',
  blocked: 'חסום',
  critical: 'קריטי',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  volunteer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paused: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  churned: 'bg-red-500/20 text-red-300 border-red-500/30',
  planned: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  todo: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  blocked: 'bg-red-500/20 text-red-300 border-red-500/30',
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}
