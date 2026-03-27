'use client'

import { useSyncExternalStore } from 'react'
import {
  EMPTY_UX_KPI_SNAPSHOT,
  formatPct,
  getUxKpiSnapshotStable,
  UX_EVENTS_CHANGED_EVENT,
  UX_EVENTS_STORAGE_KEY,
} from '@/lib/ux-metrics'

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 10_000)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') onStoreChange()
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === UX_EVENTS_STORAGE_KEY) onStoreChange()
  }
  const onSameTab = () => onStoreChange()
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('storage', onStorage)
  window.addEventListener(UX_EVENTS_CHANGED_EVENT, onSameTab)
  return () => {
    window.clearInterval(id)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(UX_EVENTS_CHANGED_EVENT, onSameTab)
  }
}

function getClientSnapshot() {
  return getUxKpiSnapshotStable()
}

function getServerSnapshot() {
  return EMPTY_UX_KPI_SNAPSHOT
}

export function UxKpiPanel() {
  const kpi = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  return (
    <section
      className="bento-card motion-card p-4 border-t-4 border-t-emerald-500"
      aria-labelledby="ux-kpi-heading"
    >
      <div className="flex items-center justify-between mb-3">
        <p id="ux-kpi-heading" className="type-meta">
          UX KPI Live
        </p>
        <span className="status-badge status-success">instrumented</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2" role="list" aria-live="polite">
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">sessions</p>
          <p className="type-kpi text-white font-bold tabular-nums">{kpi.sessions}</p>
        </div>
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">first interaction</p>
          <p className="type-kpi text-white font-bold tabular-nums">{formatPct(kpi.firstInteractionRate)}</p>
        </div>
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">TTFI</p>
          <p className="type-kpi text-white font-bold tabular-nums">
            {kpi.avgTimeToFirstInteractionMs > 0 ? `${Math.round(kpi.avgTimeToFirstInteractionMs / 1000)}s` : '—'}
          </p>
        </div>
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">copy summary</p>
          <p className="type-kpi text-white font-bold tabular-nums">{formatPct(kpi.copySummaryRate)}</p>
        </div>
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">ROI click</p>
          <p className="type-kpi text-white font-bold tabular-nums">{formatPct(kpi.outboundRoiRate)}</p>
        </div>
        <div className="surface-strong motion-card rounded-lg p-2.5" role="listitem">
          <p className="type-meta normal-case">Delay click</p>
          <p className="type-kpi text-white font-bold tabular-nums">{formatPct(kpi.outboundDelayRate)}</p>
        </div>
      </div>
    </section>
  )
}

