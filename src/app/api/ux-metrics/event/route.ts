import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'

interface IncomingUxEvent {
  name: string
  ts: number
  data?: Record<string, string | number | boolean>
}
interface UxMetricsEventInsert {
  event_name: string
  event_ts: string
  event_data: Record<string, string | number | boolean>
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser()
    if (!auth.ok) return auth.response

    const body = (await req.json()) as IncomingUxEvent
    if (!body?.name || !body?.ts) {
      return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 })
    }

    const { supabase } = auth
    const payload: UxMetricsEventInsert = {
      event_name: body.name,
      event_ts: new Date(body.ts).toISOString(),
      event_data: body.data ?? {},
    }

    // Table is created via supabase-migration-ux-metrics.sql.
    // Keep runtime resilient if migration not applied yet.
    const { error } = await supabase.from('ux_metrics_events').insert(payload as never)

    if (error) {
      // Do not fail UX if telemetry table is absent / RLS denied.
      return NextResponse.json({ ok: false, warning: error.message }, { status: 202 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    )
  }
}

