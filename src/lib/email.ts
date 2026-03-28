import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM ?? 'COR-SYS <onboarding@resend.dev>'

/** Avoid `new Resend()` at module load — Resend throws when the key is missing (common in local dev). */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) return null
  return new Resend(key)
}

export interface AssessmentCompletedPayload {
  clientName: string
  resultsUrl: string
  dsmCodes: string[]
}

/** שולח מייל התראה לאחר מילוי שאלון הערכה — ליועץ */
export async function sendAssessmentCompletedEmail(
  to: string,
  payload: AssessmentCompletedPayload
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send')
    return { ok: true }
  }
  const { clientName, resultsUrl, dsmCodes } = payload
  const codesText = dsmCodes.length ? dsmCodes.join(', ') : '—'
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `הערכה הושלמה — ${clientName} | COR-SYS`,
      html: `
        <h2>הערכה ארגונית הושלמה</h2>
        <p><strong>לקוח:</strong> ${escapeHtml(clientName)}</p>
        <p><strong>קודי DSM:</strong> ${escapeHtml(codesText)}</p>
        <p><a href="${escapeHtml(resultsUrl)}">צפייה בתוצאות והמלצות</a></p>
      `,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[email] sendAssessmentCompletedEmail', msg)
    return { ok: false, error: msg }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
