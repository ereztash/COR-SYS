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
    expect(STATUS_LABELS.active).toBe('פעיל')
    expect(STATUS_LABELS.prospect).toBe('פוטנציאלי')
  })
  it('has sprint statuses', () => {
    expect(STATUS_LABELS.planned).toBe('מתוכנן')
    expect(STATUS_COLORS.active).toBeDefined()
  })
})
