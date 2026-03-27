interface Props {
  beginner: string
  advanced?: string
  research?: string
  className?: string
}

export function ModeBlurb({ beginner, advanced, research, className = '' }: Props) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs text-slate-400 mode-beginner-only">{beginner}</p>
      {advanced ? <p className="text-xs text-slate-500 mode-advanced">{advanced}</p> : null}
      {research ? <p className="text-xs text-slate-500 mode-research">{research}</p> : null}
    </div>
  )
}
