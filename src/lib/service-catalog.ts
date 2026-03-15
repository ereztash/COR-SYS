/**
 * ערוצים ואפשרויות שירות — מקור אמת לתמחור ולפורטפוליו.
 * מתאים לתוכן מדף "מסחור" (זהות עסקית).
 */

export interface ServiceChannel {
  id: string
  nameHe: string
  slug: string
  description: string
  sortOrder: number
}

export interface ServiceOption {
  id: string
  channelId: string
  nameHe: string
  description: string
  priceRangeMin: number
  priceRangeMax: number
  priceUnit: 'one_time' | 'monthly' | 'per_sprint'
  priceLabel: string
  sortOrder: number
}

export const SERVICE_CHANNELS: ServiceChannel[] = [
  { id: 'l1', nameHe: 'L1: Top of Funnel', slug: 'l1-funnel', description: 'Lead Gen ו-Trust', sortOrder: 1 },
  { id: 'l2', nameHe: 'L2: Mid/Bottom Funnel', slug: 'l2-funnel', description: 'מכירה והפעלה', sortOrder: 2 },
  { id: 'l3', nameHe: 'L3: Scale', slug: 'l3-scale', description: 'הרחבה ורישוי', sortOrder: 3 },
]

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'live-demo', channelId: 'l1', nameHe: 'Live Demo אבחוני', description: 'חינם. מסמכים → NotebookLM → הוכחה מתמטית. Jaw-Drop.', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'חינם', sortOrder: 1 },
  { id: 'latency-calc', channelId: 'l1', nameHe: 'מחשבון Decision Latency', description: 'Lead Gen', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'חינם', sortOrder: 2 },
  { id: 'self-audit', channelId: 'l1', nameHe: 'Self-Audit נורמליזציית סטייה', description: 'שאלון עצמי', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'חינם', sortOrder: 3 },
  { id: 'webinar', channelId: 'l1', nameHe: 'וובינר "ארכיטקטורת החוסן"', description: 'Trust-Led', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'חינם', sortOrder: 4 },
  { id: 'sprint', channelId: 'l2', nameHe: 'ספרינט חוסם עורקים (14 יום)', description: 'אבחון + DDD + Tech Tourniquet + Handover', priceRangeMin: 40_000, priceRangeMax: 80_000, priceUnit: 'one_time', priceLabel: '40k–80k ₪ (One-Time)', sortOrder: 5 },
  { id: 'retainer', channelId: 'l2', nameHe: 'Resilience Retainer (SaaS)', description: 'תחזוקה רבעונית, TTX דינמי', priceRangeMin: 5_000, priceRangeMax: 15_000, priceUnit: 'monthly', priceLabel: '5k–15k ₪/חודש', sortOrder: 6 },
  { id: 'workshop', channelId: 'l2', nameHe: 'סדנת AI ארגונית', description: 'הפעלה מעשית', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'לפי הצעה', sortOrder: 7 },
  { id: 'cert', channelId: 'l3', nameHe: 'הסמכת יועצים "נאמני חוסן"', description: 'Royalty', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'Royalty', sortOrder: 8 },
  { id: 'api-license', channelId: 'l3', nameHe: 'רישוי API לאנטרפרייז', description: 'סוכנים', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'monthly', priceLabel: 'לפי הצעה', sortOrder: 9 },
  { id: 'keynote', channelId: 'l3', nameHe: 'הרצאות Keynote', description: '$10K+', priceRangeMin: 10_000, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '$10K+', sortOrder: 10 },
]

export function getOptionsByChannel(channelId: string): ServiceOption[] {
  return SERVICE_OPTIONS.filter(o => o.channelId === channelId).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getOptionById(id: string): ServiceOption | undefined {
  return SERVICE_OPTIONS.find(o => o.id === id)
}
