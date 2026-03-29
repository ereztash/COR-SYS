/**
 * שכבת "התנעה עסקית" לעצמאים — נפרדת ממנוע DSM.
 * מבוסס על MECE (דחיפה פנימית / משיכת שוק / הון / תנע מועבר) ומלכודות תנועה-מול-פעולה.
 */

import {
  IGNITION_PRIMARY_VECTORS,
  type IgnitionAnswerFields,
  type IgnitionCommercialAsk,
  type IgnitionDominantTrap,
  type IgnitionFirstMoveTag,
  type IgnitionLifecycleStage,
  type IgnitionPrimaryVector,
  type IgnitionProfile,
  type IgnitionUrgency,
} from '@/lib/ignition-types'

export type {
  IgnitionCommercialAsk,
  IgnitionDominantTrap,
  IgnitionFirstMoveTag,
  IgnitionLifecycleStage,
  IgnitionPrimaryVector,
  IgnitionProfile,
  IgnitionUrgency,
} from '@/lib/ignition-types'
export { IGNITION_PRIMARY_VECTORS } from '@/lib/ignition-types'

const VECTOR_LABEL_HE: Record<IgnitionPrimaryVector, string> = {
  internal_push: 'דחיפה מבוססת משאבים פנימיים (מה שיש עכשיו)',
  market_pull: 'משיכה מבוססת ביקוש / כאב שוק (אימות לפני בנייה כבדה)',
  capital_blitz: 'הנעה מבוססת הון או מסה (פריצה עם משאבים גדולים)',
  momentum_transfer: 'תנע מועבר (זיכיון, רכישה, רכיבה על גל חיצוני)',
}

const TRAP_LABEL_HE: Record<IgnitionDominantTrap, string> = {
  prep_trap: 'מלכודת הכנה (פורטפוליו, אתר, מיתוג — בלי הצעה מסחרית)',
  over_learn: 'אגירת לימוד (קורסים ותוכן — בלי סגירה)',
  free_value: 'תקוות חינם (ערך בקבוצות בלי מסלול לתשלום)',
  busy_motion: 'תנועה חברתית (נטוורקינג/תוכן) בלי בקשה מסחרית חדה',
  none_clear: 'לא מזהה מלכודת דומיננטית — רוצה מיקוד',
}

const ASK_LABEL_HE: Record<IgnitionCommercialAsk, string> = {
  within_7d: 'בשבוע האחרון',
  within_30d: 'בחודש האחרון',
  within_90d: 'בשלושת החודשים האחרונים',
  over_90d: 'לפני יותר מ־90 יום',
  never_recent: 'לא בזמן האחרון / כמעט לא',
}

function baseUrgency(trap: IgnitionDominantTrap, ask: IgnitionCommercialAsk): IgnitionUrgency {
  const staleAsk = ask === 'never_recent' || ask === 'over_90d'
  if (staleAsk && (trap === 'busy_motion' || trap === 'prep_trap' || trap === 'over_learn')) return 'high'
  if (staleAsk || trap === 'busy_motion') return 'medium'
  if (ask === 'within_7d' && trap === 'none_clear') return 'low'
  return 'medium'
}

function pickFirstMove(
  vector: IgnitionPrimaryVector,
  trap: IgnitionDominantTrap
): { tag: IgnitionFirstMoveTag; he: string } {
  if (trap === 'prep_trap') {
    return {
      tag: 'direct_commercial_touch',
      he: 'להפסיק ללטש חומרים: לבחור הצעה אחת ממוקדת ולשלוח היום ל־3–5 אנשים רלוונטיים בקשה מסחרית ברורה (מחיר או היקף).',
    }
  }
  if (trap === 'over_learn') {
    return {
      tag: 'smallest_paid_ask',
      he: 'לקצר למסלול הכי קטן שגובה תשלום או התחייבות: הצעת שירות אחת, מחיר, תאריך התחלה — בלי קורס נוסף לפני שיש "כן" בשוק.',
    }
  }
  if (trap === 'free_value') {
    return {
      tag: 'smallest_paid_ask',
      he: 'להגדיר גבול חינם (זמן/תוצר) ולצרף הצעת המשך בתשלום; לשלוח אותה באופן אישי לפחות לשני לקוחות פוטנציאליים.',
    }
  }
  if (trap === 'busy_motion') {
    return {
      tag: 'direct_commercial_touch',
      he: 'לחתוך פעילות "נראית עמוסה": פגישה אחת או הודעה אחת שמבקשת החלטה (כן/לא) על הצעה מסחרית — לא עוד תוכן כללי.',
    }
  }

  switch (vector) {
    case 'internal_push':
      return {
        tag: 'bricolage_next_step',
        he: 'לרשום מה יש בהישג יד (קשרים, מיומנות, לקוח 0) ולבנות מהם הצעת ערך לשבוע הקרוב — צעד אחד קטן שנמדד בשיחה עם שוק.',
      }
    case 'market_pull':
      return {
        tag: 'validate_demand_fast',
        he: 'לנסח כאב לקוח אחד חד, דף/הודעה קצרה, ולבקש תשלום מקדמה או התחייבות לפני הרחבת הפיתוח.',
      }
    case 'capital_blitz':
      return {
        tag: 'focus_single_offer',
        he: 'אם יש הון — לרכז אותו בהצעה אחת ובערוץ אחד עד שיש מדד המרה; לא לפזר לכמה וקטורים במקביל.',
      }
    case 'momentum_transfer':
      return {
        tag: 'attach_external_wave',
        he: 'לאתר תנועה קיימת (רגולציה, שינוי שוק, קהילה חמה) ולצמיד אליה הצעה קונקרטית תוך 14 יום.',
      }
  }
  return {
    tag: 'direct_commercial_touch',
    he: 'לבחור פעולה מסחרית אחת מדידה השבוע ולבצע אותה עד הסוף.',
  }
}

function buildNarrativeHe(
  vector: IgnitionPrimaryVector,
  trap: IgnitionDominantTrap,
  ask: IgnitionCommercialAsk,
  urgency: IgnitionUrgency
): string {
  const v = VECTOR_LABEL_HE[vector]
  const t = TRAP_LABEL_HE[trap]
  const a = ASK_LABEL_HE[ask]
  const u =
    urgency === 'high'
      ? 'רמת דחיפות גבוהה: יש פער בין מאמץ לבין חשיפה מסחרית מסוכנת.'
      : urgency === 'low'
        ? 'רמת דחיפות נמוכה יחסית — עדיין כדאי לשמור על קצב פעולה מסחרית קבוע.'
        : 'רמת דחיפות בינונית — כדאי לנעול פעולה אחת מדידה השבוע.'
  return `וקטור התנעה: ${v}. דפוס בולט: ${t}. פעולה מסחרית אחרונה מול לקוח: ${a}. ${u}`
}

/**
 * מחזיר פרופיל רק ל־one_man_show וכשמולא לפחות וקטור התנעה.
 * `effectiveCtx` מחושב בקורא (למשל effectiveOperatingContext מ־corsys-questionnaire).
 */
export function computeIgnitionProfile(
  answers: IgnitionAnswerFields,
  effectiveCtx: 'team' | 'one_man_show'
): IgnitionProfile | null {
  if (effectiveCtx !== 'one_man_show') return null
  const v = answers.ignitionPrimaryVector
  if (!v || !IGNITION_PRIMARY_VECTORS.includes(v as IgnitionPrimaryVector)) return null

  const vector = v as IgnitionPrimaryVector
  const trap = (answers.ignitionDominantTrap ?? 'none_clear') as IgnitionDominantTrap
  const ask = (answers.ignitionLastCommercialAsk ?? 'never_recent') as IgnitionCommercialAsk
  const lifecycle = answers.ignitionLifecycleStage as IgnitionLifecycleStage | undefined

  const urgency = baseUrgency(trap, ask)
  const { tag, he: firstMoveHe } = pickFirstMove(vector, trap)
  const narrativeHe = buildNarrativeHe(vector, trap, ask, urgency)

  const suggestsSprintNudge =
    urgency === 'high' &&
    (ask === 'never_recent' || ask === 'over_90d' || trap === 'busy_motion')

  return {
    primaryVector: vector,
    dominantTrap: trap,
    lastCommercialAsk: ask,
    lifecycleStage: lifecycle,
    urgency,
    firstMoveTag: tag,
    narrativeHe,
    firstMoveHe,
    suggestsSprintNudge,
  }
}

export function ignitionProfileForDisplay(profile: IgnitionProfile | null): {
  vectorHe: string
  trapHe: string
  askHe: string
} | null {
  if (!profile) return null
  return {
    vectorHe: VECTOR_LABEL_HE[profile.primaryVector],
    trapHe: TRAP_LABEL_HE[profile.dominantTrap],
    askHe: ASK_LABEL_HE[profile.lastCommercialAsk],
  }
}
