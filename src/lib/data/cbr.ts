/**
 * CBR Data Helpers — read-only queries for the CBR tables
 *
 * Used by server pages (followup, client detail) to load CBR records.
 * Pattern follows src/lib/data/clients.ts — createClient from @/lib/supabase/server.
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  DsmDiagnosticSnapshot,
  OrganizationContext,
  InterventionAndFeedback,
} from '@/types/database'

// ─── Private helpers ──────────────────────────────────────────────────────────

async function fetchOrgContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string
): Promise<OrganizationContext | null> {
  const { data, error } = await supabase
    .from('organizations_context')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error || !data) return null
  return data as unknown as OrganizationContext
}

export interface LatestInterventionData {
  org: OrganizationContext
  snapshot: DsmDiagnosticSnapshot
  intervention: InterventionAndFeedback
}

/**
 * Fetch the most recent intervention record for a given client.
 *
 * Join path:
 *   clients.id → organizations_context.client_id
 *              → dsm_diagnostic_snapshots.org_id (latest)
 *              → interventions_and_feedback.snapshot_id (latest)
 *
 * Returns null if no CBR data exists for the client yet.
 */
export async function getLatestInterventionForClient(
  clientId: string
): Promise<LatestInterventionData | null> {
  const supabase = await createClient()

  // Step 1: org context for this client
  const org = await fetchOrgContext(supabase, clientId)
  if (!org) return null

  // Step 2: latest snapshot for this org
  const { data: snapRaw, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('org_id', org.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (snapErr || !snapRaw) return null
  const snapshot = snapRaw as unknown as DsmDiagnosticSnapshot

  // Step 3: latest intervention for this snapshot
  const { data: intRaw, error: intErr } = await supabase
    .from('interventions_and_feedback')
    .select('*')
    .eq('snapshot_id', snapshot.snapshot_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (intErr || !intRaw) return null
  const intervention = intRaw as unknown as InterventionAndFeedback

  return { org, snapshot, intervention }
}

/**
 * Fetch the most recent snapshot for a client (via org context).
 * Used by client detail page to show the RecommendationPanel.
 * Returns null if no CBR data exists yet.
 *
 * Optimization: fires org + snapshot queries in parallel once org_id is known.
 * React.cache() deduplicates across the same server request.
 */
export const getLatestSnapshotForClient = cache(async function getLatestSnapshotForClient(
  clientId: string
): Promise<{ snapshot: DsmDiagnosticSnapshot; org: OrganizationContext } | null> {
  const supabase = await createClient()

  const org = await fetchOrgContext(supabase, clientId)
  if (!org) return null

  const { data: snapRaw, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('org_id', org.org_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (snapErr || !snapRaw) return null
  return { snapshot: snapRaw as unknown as DsmDiagnosticSnapshot, org }
})

/**
 * Fetch recent interventions for a client (via org context).
 * Used by client detail page to show Recommended vs Actual trend.
 */
export async function getInterventionHistoryForClient(
  clientId: string,
  limit = 5
): Promise<Array<Pick<InterventionAndFeedback, 'intervention_id' | 'recommended_cta' | 'actual_cta' | 'consultant_override' | 'override_reason' | 'learning_gain' | 'lambda_eigenvalue' | 'created_at'>>> {
  const supabase = await createClient()
  const org = await fetchOrgContext(supabase, clientId)
  if (!org) return []

  // Get all snapshots for this org
  const { data: snaps } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('snapshot_id')
    .eq('org_id', org.org_id)

  if (!snaps || snaps.length === 0) return []
  const snapIds = snaps.map((s: { snapshot_id: string }) => s.snapshot_id)

  const { data, error } = await supabase
    .from('interventions_and_feedback')
    .select('intervention_id, recommended_cta, actual_cta, consultant_override, override_reason, learning_gain, lambda_eigenvalue, created_at')
    .in('snapshot_id', snapIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as unknown as Array<Pick<InterventionAndFeedback, 'intervention_id' | 'recommended_cta' | 'actual_cta' | 'consultant_override' | 'override_reason' | 'learning_gain' | 'lambda_eigenvalue' | 'created_at'>>
}

/**
 * Fetch all snapshots for an org, sorted ascending by created_at.
 * Used by trajectory.ts to compute λ trend.
 */
export async function getSnapshotsByOrgId(
  orgId: string
): Promise<DsmDiagnosticSnapshot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[data/cbr] getSnapshotsByOrgId', error.message)
    return []
  }
  return (data ?? []) as unknown as DsmDiagnosticSnapshot[]
}
