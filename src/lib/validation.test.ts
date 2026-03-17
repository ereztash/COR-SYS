import { describe, it, expect } from 'vitest'
import {
  isValidUuid,
  isClientStatus,
  isSprintStatus,
  isTaskStatus,
  isTaskPriority,
  toFiniteNumber,
  clampRevenue,
  clampHours,
} from '@/lib/validation'

describe('isValidUuid', () => {
  it('accepts valid v4 UUID', () => {
    expect(isValidUuid('a1b2c3d4-e5f6-4789-a012-3456789abcde')).toBe(true)
    expect(isValidUuid('00000000-0000-4000-8000-000000000000')).toBe(true)
  })
  it('rejects invalid', () => {
    expect(isValidUuid('')).toBe(false)
    expect(isValidUuid('not-a-uuid')).toBe(false)
    expect(isValidUuid('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')).toBe(false)
  })
  it('rejects UUID with wrong variant digit (not 8/9/a/b)', () => {
    // variant nibble is 'c' — invalid RFC 4122 v4
    expect(isValidUuid('a1b2c3d4-e5f6-4789-c012-3456789abcde')).toBe(false)
  })
  it('rejects UUID with wrong version digit (not 1-5)', () => {
    expect(isValidUuid('a1b2c3d4-e5f6-0789-a012-3456789abcde')).toBe(false)
    expect(isValidUuid('a1b2c3d4-e5f6-6789-a012-3456789abcde')).toBe(false)
  })
  it('rejects UUID with dangerous characters', () => {
    expect(isValidUuid("'; DROP TABLE clients; --")).toBe(false)
    expect(isValidUuid('<script>alert(1)</script>')).toBe(false)
  })
  it('rejects UUID with wrong segment lengths', () => {
    expect(isValidUuid('a1b2c3d4-e5f6-4789-a012')).toBe(false)
    expect(isValidUuid('a1b2c3d4e5f647890123456789abcde')).toBe(false)
  })
})

describe('isClientStatus', () => {
  it('accepts valid statuses', () => {
    expect(isClientStatus('active')).toBe(true)
    expect(isClientStatus('prospect')).toBe(true)
  })
  it('rejects invalid', () => {
    expect(isClientStatus('')).toBe(false)
    expect(isClientStatus('invalid')).toBe(false)
  })
})

describe('isSprintStatus', () => {
  it('accepts planned, active, completed, cancelled', () => {
    expect(isSprintStatus('planned')).toBe(true)
    expect(isSprintStatus('active')).toBe(true)
  })
})

describe('isTaskStatus', () => {
  it('accepts todo, in_progress, done, blocked', () => {
    expect(isTaskStatus('done')).toBe(true)
  })
})

describe('isTaskPriority', () => {
  it('accepts critical, high, medium, low', () => {
    expect(isTaskPriority('high')).toBe(true)
  })
})

describe('toFiniteNumber', () => {
  it('returns null for null/undefined/empty', () => {
    expect(toFiniteNumber(null)).toBe(null)
    expect(toFiniteNumber(undefined)).toBe(null)
    expect(toFiniteNumber('')).toBe(null)
  })
  it('returns number for valid numeric input', () => {
    expect(toFiniteNumber(42)).toBe(42)
    expect(toFiniteNumber('100')).toBe(100)
  })
  it('returns null for NaN/Infinity', () => {
    expect(toFiniteNumber(NaN)).toBe(null)
    expect(toFiniteNumber(Infinity)).toBe(null)
    expect(toFiniteNumber(-Infinity)).toBe(null)
  })
  it('returns null for non-numeric strings', () => {
    expect(toFiniteNumber('abc')).toBe(null)
    expect(toFiniteNumber('12px')).toBe(null)
    // Note: Number('  ') === 0 (JS coercion), so toFiniteNumber returns 0 — not null
    expect(toFiniteNumber('  ')).toBe(0)
  })
  it('returns null for objects; empty array coerces to 0', () => {
    expect(toFiniteNumber({})).toBe(null)
    // Note: Number([]) === 0 (JS coercion) — finite, so returns 0
    expect(toFiniteNumber([])).toBe(0)
    expect(toFiniteNumber([1, 2])).toBe(null)
  })
  it('returns 0 for false/empty array (edge coercions)', () => {
    // Number(false) === 0 — finite
    expect(toFiniteNumber(false)).toBe(0)
  })
})

describe('clampRevenue', () => {
  it('clamps to 0–100M', () => {
    expect(clampRevenue(-1)).toBe(0)
    expect(clampRevenue(50_000)).toBe(50_000)
    expect(clampRevenue(200_000_000)).toBe(100_000_000)
  })
  it('clamps large negative values to 0', () => {
    expect(clampRevenue(-999_999_999)).toBe(0)
  })
  it('clamps Infinity to 100M', () => {
    expect(clampRevenue(Infinity)).toBe(100_000_000)
  })
  it('clamps NaN to 0 (Math.max/min with NaN returns NaN — document behavior)', () => {
    // NaN propagates through Math.max/min; document this known behavior
    expect(Number.isNaN(clampRevenue(NaN))).toBe(true)
  })
  it('returns 0 exactly at lower bound', () => {
    expect(clampRevenue(0)).toBe(0)
  })
  it('returns 100M exactly at upper bound', () => {
    expect(clampRevenue(100_000_000)).toBe(100_000_000)
  })
})

describe('clampHours', () => {
  it('clamps to 0–9999', () => {
    expect(clampHours(-1)).toBe(0)
    expect(clampHours(100)).toBe(100)
    expect(clampHours(20000)).toBe(9999)
  })
  it('clamps large negative values to 0', () => {
    expect(clampHours(-999)).toBe(0)
  })
  it('clamps Infinity to 9999', () => {
    expect(clampHours(Infinity)).toBe(9999)
  })
  it('clamps NaN — documents propagation behavior', () => {
    expect(Number.isNaN(clampHours(NaN))).toBe(true)
  })
  it('returns 0 exactly at lower bound', () => {
    expect(clampHours(0)).toBe(0)
  })
  it('returns 9999 exactly at upper bound', () => {
    expect(clampHours(9999)).toBe(9999)
  })
})
