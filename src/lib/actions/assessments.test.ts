/**
 * Unit tests for action validation gates — no real DB required.
 * Tests that run before any Supabase call are pure synchronous checks.
 * Tests that need Supabase mock it via vi.mock.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock next/cache (used by actions) ───────────────────────────────────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// ─── Mock email module to avoid Resend API key requirement at import time ─────
vi.mock('@/lib/email', () => ({
  sendAssessmentCompletedEmail: vi.fn().mockResolvedValue(undefined),
}))

// ─── saveAssessmentAnswers — token validation gate ────────────────────────────
// This gate runs before createClient(), so no Supabase mock needed.

describe('saveAssessmentAnswers — token validation gate', () => {
  it('returns { ok: false } immediately for empty token', async () => {
    // Import after mocks are set up
    const { saveAssessmentAnswers } = await import('./assessments')
    const result = await saveAssessmentAnswers('', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('חסר token')
  })
})

// ─── savePlanFromQuestionnaire — clientId validation gate ─────────────────────
// This gate also runs before createClient().

describe('savePlanFromQuestionnaire — clientId validation gate', () => {
  it('returns { ok: false } for non-UUID clientId', async () => {
    const { savePlanFromQuestionnaire } = await import('./plans')
    const result = await savePlanFromQuestionnaire('not-a-uuid', 'Test', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('מזהה לקוח לא חוקי')
  })

  it('returns { ok: false } for empty clientId', async () => {
    const { savePlanFromQuestionnaire } = await import('./plans')
    const result = await savePlanFromQuestionnaire('', 'Test', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('מזהה לקוח לא חוקי')
  })

  it('returns { ok: false } for SQL-injection-like clientId', async () => {
    const { savePlanFromQuestionnaire } = await import('./plans')
    const result = await savePlanFromQuestionnaire("'; DROP TABLE clients; --", 'Test', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('מזהה לקוח לא חוקי')
  })
})

// ─── createAssessment — unauthenticated gate (Supabase mock) ──────────────────

describe('createAssessment — auth gate', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns { ok: false, error: "נדרשת התחברות" } when no user session', async () => {
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }),
    }))

    const { createAssessment } = await import('./assessments')
    const result = await createAssessment(null)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('נדרשת התחברות')
  })
})
