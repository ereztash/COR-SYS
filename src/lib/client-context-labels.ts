import type { OperatingContext } from '@/lib/corsys-questionnaire'

/** כותרות ותוויות UI לפי הקשר תפעולי (צוות מול עצמאי) */
export function contextAwareLabels(ctx: OperatingContext) {
  const oms = ctx === 'one_man_show'
  return {
    entropyMetric: oms ? 'אנטרופיה תפעולית' : 'אנטרופיה ארגונית',
    heroFallbackParagraph: oms
      ? 'ניתוח מעמיק של דפוסי עומס, החלטות ומסירה בהקשר עצמאי / One man show.'
      : 'ניתוח מעמיק של הדינמיקות הארגוניות ומפת הפתולוגיות הפעילות.',
    pathologyGridTitle: oms
      ? 'פרופיל עומס — 4 ממדים (הקשר עצמאי)'
      : 'פרופיל פתולוגיות — 4 ממדים MECE',
    dsmBadgeLine: oms ? 'אבחון DSM · הקשר עצמאי' : 'אבחון DSM ארגוני',
    roleSectionTitle: oms ? 'הקשר עסקי ועומס' : 'תפקיד ושלב ארגוני',
    diagnosisSectionTitle: oms ? 'ניתוח אבחוני (עצמאי)' : 'ניתוח אבחוני',
  }
}
