'use client'

import { useEffect, useState } from 'react'

type UserMode = 'beginner' | 'advanced' | 'research'

const LABELS: Record<UserMode, string> = {
  beginner: 'מתחיל',
  advanced: 'מתקדם',
  research: 'חוקר',
}

export function UserModeSwitcher() {
  const [mode, setMode] = useState<UserMode>('advanced')

  useEffect(() => {
    const saved = localStorage.getItem('corsys_user_mode') as UserMode | null
    const next = saved && (saved === 'beginner' || saved === 'advanced' || saved === 'research') ? saved : 'advanced'
    setMode(next)
    document.documentElement.dataset.userMode = next
  }, [])

  function setUserMode(next: UserMode) {
    setMode(next)
    localStorage.setItem('corsys_user_mode', next)
    document.documentElement.dataset.userMode = next
  }

  return (
    <div className="fixed top-3 right-3 z-[60] rounded-xl border border-slate-700 bg-slate-900/95 px-2 py-1.5 shadow-xl backdrop-blur">
      <p className="text-[10px] text-slate-500 px-1 mb-1">מצב תצוגה</p>
      <div className="flex items-center gap-1">
        {(Object.keys(LABELS) as UserMode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setUserMode(key)}
            className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-colors ${
              mode === key
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  )
}
