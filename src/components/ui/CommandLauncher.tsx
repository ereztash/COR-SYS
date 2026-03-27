'use client'

/**
 * CommandLauncher — Cmd+K / Ctrl+K command palette
 *
 * Provides keyboard-first access to the most frequent consultant actions:
 *   - Navigate to clients, sprints, financials
 *   - Start new diagnostic
 *   - Open follow-up
 *
 * Single-user optimization: no auth checks, no server calls.
 * Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// ─── Command definitions ──────────────────────────────────────────────────────

interface Command {
  id: string
  label: string
  labelHe: string
  icon: string
  action: (router: ReturnType<typeof useRouter>, clientId?: string) => void
  requiresClient?: boolean
  keywords: string[]
}

const COMMANDS: Command[] = [
  {
    id: 'goto-clients',
    label: 'Clients',
    labelHe: 'לקוחות',
    icon: '👥',
    action: (router) => router.push('/clients'),
    keywords: ['clients', 'לקוחות', 'client'],
  },
  {
    id: 'goto-sprints',
    label: 'Sprints',
    labelHe: 'ספרינטים',
    icon: '⚡',
    action: (router) => router.push('/sprints'),
    keywords: ['sprints', 'ספרינטים', 'sprint'],
  },
  {
    id: 'goto-financials',
    label: 'Financials',
    labelHe: 'כספים',
    icon: '₪',
    action: (router) => router.push('/financials'),
    keywords: ['financials', 'כספים', 'finance', 'money'],
  },
  {
    id: 'goto-dashboard',
    label: 'Dashboard',
    labelHe: 'דשבורד',
    icon: '⊞',
    action: (router) => router.push('/'),
    keywords: ['dashboard', 'דשבורד', 'home', 'בית'],
  },
  {
    id: 'new-diagnostic',
    label: 'New Diagnostic',
    labelHe: 'אבחון חדש',
    icon: '🔬',
    action: (router, clientId) => {
      if (clientId) router.push(`/clients/${clientId}/diagnostic/new`)
      else router.push('/clients')
    },
    requiresClient: true,
    keywords: ['diagnostic', 'אבחון', 'new', 'חדש', 'wizard'],
  },
  {
    id: 'new-sprint',
    label: 'New Sprint',
    labelHe: 'ספרינט חדש',
    icon: '🚀',
    action: (router, clientId) => {
      if (clientId) router.push(`/clients/${clientId}/sprints/new`)
      else router.push('/clients')
    },
    requiresClient: true,
    keywords: ['sprint', 'ספרינט', 'new', 'חדש'],
  },
  {
    id: 'followup',
    label: 'Follow-up Measurement',
    labelHe: 'מדידה חוזרת',
    icon: '📊',
    action: (router, clientId) => {
      if (clientId) router.push(`/clients/${clientId}/followup`)
      else router.push('/clients')
    },
    requiresClient: true,
    keywords: ['followup', 'follow-up', 'מדידה', 'measurement', 'חוזרת'],
  },
  {
    id: 'dsm-org',
    label: 'DSM-Org Clinical Reference',
    labelHe: 'DSM-Org — מדריך קליני',
    icon: '🧬',
    action: (router) => router.push('/knowledge/dsm-org'),
    keywords: ['dsm', 'dsm-org', 'clinical', 'קליני', 'pathology', 'פתולוגיה', 'nod', 'zsg', 'old', 'clt', 'cs', 'knowledge', 'ידע'],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandLauncher() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Extract clientId from current path if on a client page
  const clientIdMatch = pathname?.match(/\/clients\/([^/]+)/)
  const currentClientId = clientIdMatch?.[1]

  // Filter commands by query
  const filtered = query.trim()
    ? COMMANDS.filter(cmd => {
        const q = query.toLowerCase()
        return (
          cmd.labelHe.includes(q) ||
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords.some(k => k.includes(q))
        )
      })
    : COMMANDS

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelected(0)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const runCommand = useCallback((cmd: Command) => {
    closePalette()
    cmd.action(router, currentClientId)
  }, [router, currentClientId, closePalette])

  // Global keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) closePalette()
        else openPalette()
      }
      if (!open) return
      if (e.key === 'Escape') { closePalette(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) { runCommand(filtered[selected]) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, selected, openPalette, closePalette, runCommand])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Selection reset is handled in the onChange handler below (avoids set-state-in-effect lint)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={closePalette}
        aria-hidden
      />

      {/* Palette */}
      <div
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-md z-50"
        role="dialog"
        aria-modal
        aria-label="Command Launcher"
      >
        <div className="mx-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            <span className="text-slate-500 text-sm">⌘</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(0) }}
              placeholder="חפש פעולה..."
              className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
              dir="rtl"
            />
            <kbd className="text-[10px] text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          {/* Commands */}
          <div className="py-2 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-6">לא נמצאו פעולות</p>
            ) : (
              filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => runCommand(cmd)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors ${
                    i === selected ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base w-6 shrink-0">{cmd.icon}</span>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium">{cmd.labelHe}</p>
                    {cmd.requiresClient && !currentClientId && (
                      <p className="text-[10px] text-slate-600">בחר לקוח תחילה</p>
                    )}
                  </div>
                  {i === selected && (
                    <kbd className="text-[10px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded shrink-0">↵</kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[10px] text-slate-600">↑↓ ניווט · ↵ בצע · ESC סגור</p>
            <p className="text-[10px] text-slate-700">⌘K</p>
          </div>
        </div>
      </div>
    </>
  )
}
