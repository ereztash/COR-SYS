/**
 * \u05E2\u05E8\u05D5\u05E6\u05D9\u05DD \u05D5\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA — \u05DE\u05E7\u05D5\u05E8 \u05D0\u05DE\u05EA \u05DC\u05EA\u05DE\u05D7\u05D5\u05E8 \u05D5\u05DC\u05E4\u05D5\u05E8\u05D8\u05E4\u05D5\u05DC\u05D9\u05D5.
 * \u05DE\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D5\u05DB\u05DF \u05DE\u05D3\u05E3 "\u05DE\u05E1\u05D7\u05D5\u05E8" (\u05D6\u05D4\u05D5\u05EA \u05E2\u05E1\u05E7\u05D9\u05EA).
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
  { id: 'l1', nameHe: 'L1: Top of Funnel', slug: 'l1-funnel', description: 'Lead Gen \u05D5-Trust', sortOrder: 1 },
  { id: 'l2', nameHe: 'L2: Mid/Bottom Funnel', slug: 'l2-funnel', description: '\u05DE\u05DB\u05D9\u05E8\u05D4 \u05D5\u05D4\u05E4\u05E2\u05DC\u05D4', sortOrder: 2 },
  { id: 'l3', nameHe: 'L3: Scale', slug: 'l3-scale', description: '\u05D4\u05E8\u05D7\u05D1\u05D4 \u05D5\u05E8\u05D9\u05E9\u05D5\u05D9', sortOrder: 3 },
]

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'live-demo', channelId: 'l1', nameHe: 'Live Demo \u05D0\u05D1\u05D7\u05D5\u05E0\u05D9', description: '\u05D7\u05D9\u05E0\u05DD. \u05DE\u05E1\u05DE\u05DB\u05D9\u05DD → NotebookLM → \u05D4\u05D5\u05DB\u05D7\u05D4 \u05DE\u05EA\u05DE\u05D8\u05D9\u05EA. Jaw-Drop.', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '\u05D7\u05D9\u05E0\u05DD', sortOrder: 1 },
  { id: 'latency-calc', channelId: 'l1', nameHe: '\u05DE\u05D7\u05E9\u05D1\u05D5\u05DF Decision Latency', description: 'Lead Gen', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '\u05D7\u05D9\u05E0\u05DD', sortOrder: 2 },
  { id: 'self-audit', channelId: 'l1', nameHe: 'Self-Audit \u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D9\u05EA \u05E1\u05D8\u05D9\u05D9\u05D4', description: '\u05E9\u05D0\u05DC\u05D5\u05DF \u05E2\u05E6\u05DE\u05D9', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '\u05D7\u05D9\u05E0\u05DD', sortOrder: 3 },
  { id: 'webinar', channelId: 'l1', nameHe: '\u05D5\u05D5\u05D1\u05D9\u05E0\u05E8 "\u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA \u05D4\u05D7\u05D5\u05E1\u05DF"', description: 'Trust-Led', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '\u05D7\u05D9\u05E0\u05DD', sortOrder: 4 },
  { id: 'sprint', channelId: 'l2', nameHe: '\u05E1\u05E4\u05E8\u05D9\u05E0\u05D8 \u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD (14 \u05D9\u05D5\u05DD)', description: '\u05D0\u05D1\u05D7\u05D5\u05DF + DDD + Tech Tourniquet + Handover', priceRangeMin: 40_000, priceRangeMax: 80_000, priceUnit: 'one_time', priceLabel: '40k–80k ₪ (One-Time)', sortOrder: 5 },
  { id: 'retainer', channelId: 'l2', nameHe: 'Resilience Retainer (SaaS)', description: '\u05EA\u05D7\u05D6\u05D5\u05E7\u05D4 \u05E8\u05D1\u05E2\u05D5\u05E0\u05D9\u05EA, TTX \u05D3\u05D9\u05E0\u05DE\u05D9', priceRangeMin: 5_000, priceRangeMax: 15_000, priceUnit: 'monthly', priceLabel: '5k–15k ₪/\u05D7\u05D5\u05D3\u05E9', sortOrder: 6 },
  { id: 'workshop', channelId: 'l2', nameHe: '\u05E1\u05D3\u05E0\u05EA AI \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA', description: '\u05D4\u05E4\u05E2\u05DC\u05D4 \u05DE\u05E2\u05E9\u05D9\u05EA', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '\u05DC\u05E4\u05D9 \u05D4\u05E6\u05E2\u05D4', sortOrder: 7 },
  { id: 'cert', channelId: 'l3', nameHe: '\u05D4\u05E1\u05DE\u05DB\u05EA \u05D9\u05D5\u05E2\u05E6\u05D9\u05DD "\u05E0\u05D0\u05DE\u05E0\u05D9 \u05D7\u05D5\u05E1\u05DF"', description: 'Royalty', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: 'Royalty', sortOrder: 8 },
  { id: 'api-license', channelId: 'l3', nameHe: '\u05E8\u05D9\u05E9\u05D5\u05D9 API \u05DC\u05D0\u05E0\u05D8\u05E8\u05E4\u05E8\u05D9\u05D9\u05D6', description: '\u05E1\u05D5\u05DB\u05E0\u05D9\u05DD', priceRangeMin: 0, priceRangeMax: 0, priceUnit: 'monthly', priceLabel: '\u05DC\u05E4\u05D9 \u05D4\u05E6\u05E2\u05D4', sortOrder: 9 },
  { id: 'keynote', channelId: 'l3', nameHe: '\u05D4\u05E8\u05E6\u05D0\u05D5\u05EA Keynote', description: '$10K+', priceRangeMin: 10_000, priceRangeMax: 0, priceUnit: 'one_time', priceLabel: '$10K+', sortOrder: 10 },
]

export function getOptionsByChannel(channelId: string): ServiceOption[] {
  return SERVICE_OPTIONS.filter(o => o.channelId === channelId).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getOptionById(id: string): ServiceOption | undefined {
  return SERVICE_OPTIONS.find(o => o.id === id)
}
