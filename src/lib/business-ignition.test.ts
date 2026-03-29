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
    expect(p!.narrativeHe).toContain('משיכה מבוססת ביקוש')
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
