'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
  ghost:
    'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-transparent hover:border-slate-700/40',
  danger:
    'bg-red-600/80 hover:bg-red-600 text-white border border-red-500/40',
} as const

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-5 py-3 rounded-xl gap-2.5',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-colors min-h-[44px] select-none',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
