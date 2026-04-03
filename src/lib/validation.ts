/**
 * \u05D5\u05DC\u05D9\u05D3\u05E6\u05D9\u05D4 \u05DC\u05E6\u05D3 \u05E9\u05E8\u05EA — actions \u05D5\u05BEdata.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuid(s: string): boolean {
  return typeof s === 'string' && UUID_REGEX.test(s)
}

export const CLIENT_STATUSES = ['active', 'prospect', 'churned', 'paused', 'volunteer'] as const
export const SPRINT_STATUSES = ['planned', 'active', 'completed', 'cancelled'] as const
export const TASK_STATUSES = ['todo', 'in_progress', 'done', 'blocked'] as const
export const TASK_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

export function isClientStatus(s: string): s is (typeof CLIENT_STATUSES)[number] {
  return CLIENT_STATUSES.includes(s as (typeof CLIENT_STATUSES)[number])
}

export const CLIENT_OPERATING_CONTEXTS = ['team', 'one_man_show'] as const

export function isClientOperatingContext(
  s: string | null | undefined
): s is (typeof CLIENT_OPERATING_CONTEXTS)[number] {
  if (s == null || s === '') return false
  return CLIENT_OPERATING_CONTEXTS.includes(s as (typeof CLIENT_OPERATING_CONTEXTS)[number])
}

import {
  IGNITION_PRIMARY_VECTORS,
  type IgnitionPrimaryVector,
} from '@/lib/ignition-types'

/** \u05D1\u05D3\u05D9\u05E7\u05EA \u05E2\u05E8\u05DA \u05E9\u05D0\u05DC\u05D5\u05DF \u05D4\u05EA\u05E0\u05E2\u05D4 (\u05E2\u05E6\u05DE\u05D0\u05D9\u05DD) */
export function isIgnitionPrimaryVector(s: string | undefined): s is IgnitionPrimaryVector {
  return s != null && IGNITION_PRIMARY_VECTORS.includes(s as IgnitionPrimaryVector)
}

export function isSprintStatus(s: string): s is (typeof SPRINT_STATUSES)[number] {
  return SPRINT_STATUSES.includes(s as (typeof SPRINT_STATUSES)[number])
}

export function isTaskStatus(s: string): s is (typeof TASK_STATUSES)[number] {
  return TASK_STATUSES.includes(s as (typeof TASK_STATUSES)[number])
}

export function isTaskPriority(s: string): s is (typeof TASK_PRIORITIES)[number] {
  return TASK_PRIORITIES.includes(s as (typeof TASK_PRIORITIES)[number])
}

/** \u05DE\u05D7\u05D6\u05D9\u05E8 \u05DE\u05E1\u05E4\u05E8 \u05EA\u05E7\u05D9\u05DF \u05D0\u05D5 null; \u05DE\u05D5\u05E0\u05E2 NaN/Infinity. */
export function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** \u05D8\u05D5\u05D5\u05D7 \u05E1\u05D1\u05D9\u05E8: \u05E9\u05E2\u05E8\u05D9\u05D5\u05EA (0–100k), \u05D4\u05DB\u05E0\u05E1\u05D5\u05EA (0–100M). */
export function clampRevenue(n: number): number {
  return Math.max(0, Math.min(100_000_000, n))
}

export function clampHours(n: number): number {
  return Math.max(0, Math.min(9999, n))
}
