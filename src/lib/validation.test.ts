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
  })
})

describe('clampRevenue', () => {
  it('clamps to 0–100M', () => {
    expect(clampRevenue(-1)).toBe(0)
    expect(clampRevenue(50_000)).toBe(50_000)
    expect(clampRevenue(200_000_000)).toBe(100_000_000)
  })
})

describe('clampHours', () => {
  it('clamps to 0–9999', () => {
    expect(clampHours(-1)).toBe(0)
    expect(clampHours(100)).toBe(100)
    expect(clampHours(20000)).toBe(9999)
  })
})
