import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

describe('formatCurrency', () => {
  it('returns — for null/undefined', () => {
    expect(formatCurrency(null)).toBe('—')
    expect(formatCurrency(undefined)).toBe('—')
  })
  it('formats number as ILS', () => {
    expect(formatCurrency(1000)).toMatch(/1,000|1\.000/)
    expect(formatCurrency(720000)).toMatch(/720/)
  })
})

describe('formatDate', () => {
  it('returns — for empty/null', () => {
    expect(formatDate('')).toBe('—')
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
  })
  it('formats valid date string', () => {
    const out = formatDate('2025-03-15')
    expect(out).toMatch(/\d/)
    expect(out.length).toBeGreaterThan(1)
  })
})

describe('STATUS_LABELS / STATUS_COLORS', () => {
  it('has client statuses', () => {
    expect(STATUS_LABELS.active).toBe('\u05E4\u05E2\u05D9\u05DC')
    expect(STATUS_LABELS.prospect).toBe('\u05E4\u05D5\u05D8\u05E0\u05E6\u05D9\u05D0\u05DC\u05D9')
  })
  it('has sprint statuses', () => {
    expect(STATUS_LABELS.planned).toBe('\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF')
    expect(STATUS_COLORS.active).toBeDefined()
  })
})
