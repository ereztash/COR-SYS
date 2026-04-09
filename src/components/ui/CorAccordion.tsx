'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  id: string
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  titleClassName?: string
}

export function CorAccordion({ id, title, children, className = '', titleClassName = '' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-right p-3 hover:bg-slate-700/50 flex justify-between items-center transition-colors"
      >
        <span className={titleClassName}>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-0 border-t border-slate-700/50 text-xs text-slate-300/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
