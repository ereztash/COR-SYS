export type UxEventName =
  | 'live_analysis_opened'
  | 'first_interaction'
  | 'preset_applied'
  | 'group_switched'
  | 'slider_changed'
  | 'copy_summary_clicked'
  | 'outbound_roi_clicked'
  | 'outbound_delay_clicked'
  // DSM-Org screen events
  | 'section_opened'
  | 'pathology_viewed'
  | 'protocol_clicked'
  | 'dsm_export_clicked'
  // Critical business flows
  | 'diagnostic_completed'
  | 'plan_opened'
  | 'intervention_saved'
  | 'followup_started'
  | 'cbr_cold_start_shown'

export interface UxEvent {
  name: UxEventName
  ts: number
  data?: Record<string, string | number | boolean>
}

export interface UxKpiSnapshot {
  sessions: number
  firstInteractionRate: number
  avgTimeToFirstInteractionMs: number
  copySummaryRate: number
  outboundRoiRate: number
  outboundDelayRate: number
  recentEvents: UxEvent[]
}

/** Stable empty snapshot — must match SSR + getServerSnapshot for useSyncExternalStore (UxKpiPanel). */
export const EMPTY_UX_KPI_SNAPSHOT: UxKpiSnapshot = {
  sessions: 0,
  firstInteractionRate: 0,
  avgTimeToFirstInteractionMs: 0,
  copySummaryRate: 0,
  outboundRoiRate: 0,
  outboundDelayRate: 0,
  recentEvents: [],
}

/** localStorage key — exported for subscribe() in UxKpiPanel. */
export const UX_EVENTS_STORAGE_KEY = 'corsys_ux_events_v1'

/** Same-tab updates: `storage` does not fire in the writing tab. */
export const UX_EVENTS_CHANGED_EVENT = 'corsys-ux-events-changed'

const STORAGE_KEY = UX_EVENTS_STORAGE_KEY

const MAX_EVENTS = 400

const sendEventToServer = (event: UxEvent): void => {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify(event)
    // Use Beacon when available for non-blocking telemetry.
    if ('sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/ux-metrics/event', blob)
      return
    }
    void fetch('/api/ux-metrics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  } catch {
    // silent: telemetry must never block UX
  }
}

export const logUxEvent = (event: UxEvent): void => {
  if (typeof window === 'undefined') return
  try {
    const current = readUxEvents()
    const next = [...current, event].slice(-MAX_EVENTS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(UX_EVENTS_CHANGED_EVENT))
    sendEventToServer(event)
  } catch {
    // ignore storage errors in private mode
  }
}

export const readUxEvents = (): UxEvent[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UxEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const computeUxKpis = (events: UxEvent[]): UxKpiSnapshot => {
  const opens = events.filter((e) => e.name === 'live_analysis_opened')
  const sessions = opens.length

  // Pair each open with the next first_interaction event in time.
  const firstInteractions: number[] = []
  for (const open of opens) {
    const next = events.find((e) => e.name === 'first_interaction' && e.ts >= open.ts)
    if (next) firstInteractions.push(next.ts - open.ts)
  }

  const firstInteractionRate = sessions > 0 ? firstInteractions.length / sessions : 0
  const avgTimeToFirstInteractionMs =
    firstInteractions.length > 0
      ? Math.round(firstInteractions.reduce((a, b) => a + b, 0) / firstInteractions.length)
      : 0

  const copies = events.filter((e) => e.name === 'copy_summary_clicked').length
  const roiClicks = events.filter((e) => e.name === 'outbound_roi_clicked').length
  const delayClicks = events.filter((e) => e.name === 'outbound_delay_clicked').length

  return {
    sessions,
    firstInteractionRate,
    avgTimeToFirstInteractionMs,
    copySummaryRate: sessions > 0 ? copies / sessions : 0,
    outboundRoiRate: sessions > 0 ? roiClicks / sessions : 0,
    outboundDelayRate: sessions > 0 ? delayClicks / sessions : 0,
    recentEvents: events.slice(-8).reverse(),
  }
}

/** Cached snapshot for useSyncExternalStore — must return same reference when data unchanged (React requirement). */
let kpiSnapshotCache: UxKpiSnapshot = EMPTY_UX_KPI_SNAPSHOT
let kpiSnapshotCacheKey = ''

/**
 * Returns a stable object reference when KPI inputs are unchanged.
 * Prevents infinite re-renders with useSyncExternalStore(getSnapshot).
 */
export function getUxKpiSnapshotStable(): UxKpiSnapshot {
  const fresh = computeUxKpis(readUxEvents())
  const key = JSON.stringify(fresh)
  if (key !== kpiSnapshotCacheKey) {
    kpiSnapshotCacheKey = key
    kpiSnapshotCache = fresh
  }
  return kpiSnapshotCache
}

export const formatPct = (v: number): string => `${Math.round(v * 100)}%`

