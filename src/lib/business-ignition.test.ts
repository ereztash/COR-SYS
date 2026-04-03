import { describe, it, expect } from 'vitest'
import { computeIgnitionProfile } from '@/lib/business-ignition'

describe('computeIgnitionProfile', () => {
  it('returns null for team context', () => {
    expect(
      computeIgnitionProfile(
        { ignitionPrimaryVector: 'internal_push', operatingContext: 'team' },
        'team'
      )
    ).toBeNull()
  })

  it('returns null when primary vector missing', () => {
    expect(computeIgnitionProfile({ operatingContext: 'one_man_show' }, 'one_man_show')).toBeNull()
  })

  it('returns profile with busy_motion and never_recent — high urgency and sprint nudge', () => {
    const p = computeIgnitionProfile(
      {
        operatingContext: 'one_man_show',
        ignitionPrimaryVector: 'market_pull',
        ignitionDominantTrap: 'busy_motion',
        ignitionLastCommercialAsk: 'never_recent',
      },
      'one_man_show'
    )
    expect(p).not.toBeNull()
    expect(p!.urgency).toBe('high')
    expect(p!.suggestsSprintNudge).toBe(true)
    expect(p!.firstMoveTag).toBe('direct_commercial_touch')
    expect(p!.narrativeHe).toContain('\u05DE\u05E9\u05D9\u05DB\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05D1\u05D9\u05E7\u05D5\u05E9')
  })

  it('internal_push with none_clear uses bricolage first move', () => {
    const p = computeIgnitionProfile(
      {
        ignitionPrimaryVector: 'internal_push',
        ignitionDominantTrap: 'none_clear',
        ignitionLastCommercialAsk: 'within_7d',
        operatingContext: 'one_man_show',
      },
      'one_man_show'
    )
    expect(p?.firstMoveTag).toBe('bricolage_next_step')
  })
})
