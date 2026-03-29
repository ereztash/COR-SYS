import { describe, it, expect } from 'vitest'
import {
  buildPlanFromQuestionnaire,
  computeEntropyScore,
  buildDynamicSummary,
  mergeOperatingContextFromClient,
  effectiveOperatingContext,
  resolveQuestionnaireSteps,
  type QuestionnaireAnswer,
} from '@/lib/corsys-questionnaire'
import { computeIgnitionProfile } from '@/lib/business-ignition'

// ─── mergeOperatingContextFromClient ─────────────────────────────────────────

describe('mergeOperatingContextFromClient', () => {
  it('fills operatingContext from client when answers omit it', () => {
    const m = mergeOperatingContextFromClient(
      { championRole: 'ceo' },
      { operating_context: 'one_man_show' }
    )
    expect(m.operatingContext).toBe('one_man_show')
  })

  it('keeps explicit answers.operatingContext over client', () => {
    const m = mergeOperatingContextFromClient(
      { operatingContext: 'team' },
      { operating_context: 'one_man_show' }
    )
    expect(m.operatingContext).toBe('team')
  })
})

describe('effectiveOperatingContext', () => {
  it('uses client fallback when answers lack operatingContext', () => {
    expect(effectiveOperatingContext({}, 'one_man_show')).toBe('one_man_show')
    expect(effectiveOperatingContext({}, null)).toBe('team')
  })
})

describe('resolveQuestionnaireSteps', () => {
  it('omits ignition step for team context', () => {
    const steps = resolveQuestionnaireSteps('team')
    expect(steps.some((s) => s.id === 'ignition')).toBe(false)
  })

  it('includes ignition step for one_man_show', () => {
    const steps = resolveQuestionnaireSteps('one_man_show')
    expect(steps.some((s) => s.id === 'ignition')).toBe(true)
  })
})

// ─── computeEntropyScore ──────────────────────────────────────────────────────

describe('computeEntropyScore', () => {
  it('returns 0 when no high-severity pathologies', () => {
    expect(computeEntropyScore({})).toBe(0)
    expect(computeEntropyScore({
      pathologyNod: 'medium',
      pathologyZeroSum: 'occasional',
      pathologyLearning: 'mixed',
      pathologySemantic: 'medium_drift',
    })).toBe(0)
  })

  it('returns 2 for two high-severity pathologies', () => {
    expect(computeEntropyScore({
      pathologyNod: 'high',
      pathologyLearning: 'single_loop',
    })).toBe(2)
  })

  it('returns 4 when all pathologies at highest severity', () => {
    expect(computeEntropyScore({
      pathologyNod: 'high',
      pathologyZeroSum: 'frequent',
      pathologyLearning: 'single_loop',
      pathologySemantic: 'high_drift',
    })).toBe(4)
  })
})

// ─── buildPlanFromQuestionnaire — title ──────────────────────────────────────

describe('buildPlanFromQuestionnaire', () => {
  it('returns title with client name', () => {
    const r = buildPlanFromQuestionnaire('Test Client', {})
    expect(r.title).toBe('תוכנית עסקית — Test Client')
  })

  // ─── Rule 3: L1 Live Demo ─────────────────────────────────────────────────

  it('recommends live-demo for audit_only goal', () => {
    const r = buildPlanFromQuestionnaire('C', { interventionGoal: 'audit_only' })
    expect(r.recommendedChannelId).toBe('l1')
    expect(r.recommendedOptionId).toBe('live-demo')
  })

  it('recommends live-demo when latency low and urgency low', () => {
    const r = buildPlanFromQuestionnaire('C', {
      decisionLatency: 'under_5',
      urgencyLevel: 'low',
    })
    expect(r.recommendedChannelId).toBe('l1')
    expect(r.recommendedOptionId).toBe('live-demo')
  })

  it('recommends live-demo for small org with low entropy', () => {
    const r = buildPlanFromQuestionnaire('C', {
      companySize: 'under_50',
      pathologyNod: 'low',
    })
    expect(r.recommendedChannelId).toBe('l1')
    expect(r.recommendedOptionId).toBe('live-demo')
  })

  // ─── Rule 1: L2 Sprint ────────────────────────────────────────────────────

  it('recommends sprint when decision_latency is over_15', () => {
    const r = buildPlanFromQuestionnaire('C', { decisionLatency: 'over_15' })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('sprint')
  })

  it('recommends sprint for large org (150_300) with entropy >= 2', () => {
    const r = buildPlanFromQuestionnaire('C', {
      companySize: '150_300',
      pathologyNod: 'high',
      pathologyZeroSum: 'frequent',
    })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('sprint')
  })

  it('recommends sprint for over_300 org with entropy >= 2', () => {
    const r = buildPlanFromQuestionnaire('C', {
      companySize: 'over_300',
      pathologyLearning: 'single_loop',
      pathologySemantic: 'high_drift',
    })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('sprint')
  })

  it('recommends sprint when goal is both and urgency is high', () => {
    const r = buildPlanFromQuestionnaire('C', {
      interventionGoal: 'both',
      urgencyLevel: 'high',
    })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('sprint')
  })

  // ─── Rule 2: L2 Retainer ─────────────────────────────────────────────────

  it('recommends retainer for cfo with single_loop learning', () => {
    const r = buildPlanFromQuestionnaire('C', {
      companySize: '50_150',
      championRole: 'cfo',
      pathologyLearning: 'single_loop',
      decisionLatency: '5_to_15',
      interventionGoal: 'reduce_entropy',
    })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('retainer')
  })

  it('recommends retainer for ceo with high_drift semantic', () => {
    const r = buildPlanFromQuestionnaire('C', {
      companySize: '50_150',
      championRole: 'ceo',
      pathologySemantic: 'high_drift',
      decisionLatency: '5_to_15',
      interventionGoal: 'reduce_latency',
    })
    expect(r.recommendedChannelId).toBe('l2')
    expect(r.recommendedOptionId).toBe('retainer')
  })

  // ─── entropyScore in result ───────────────────────────────────────────────

  it('returns correct entropyScore in result', () => {
    const r = buildPlanFromQuestionnaire('C', {
      pathologyNod: 'high',
      pathologyZeroSum: 'frequent',
      pathologyLearning: 'single_loop',
      pathologySemantic: 'high_drift',
    })
    expect(r.entropyScore).toBe(4)
  })

  // ─── summary and nextSteps ────────────────────────────────────────────────

  it('summary contains ICP note for 50_150', () => {
    const r = buildPlanFromQuestionnaire('Acme', { companySize: '50_150' })
    expect(r.summary).toContain('התאמה ל-ICP')
    expect(r.nextSteps.length).toBeGreaterThan(0)
  })

  it('summary notes non-ICP for under_50', () => {
    const r = buildPlanFromQuestionnaire('Acme', { companySize: 'under_50' })
    expect(r.summary).toContain('חורג מ-ICP')
  })

  it('summary notes One man show path when operatingContext is one_man_show', () => {
    const r = buildPlanFromQuestionnaire('Solo', {
      operatingContext: 'one_man_show',
      companySize: 'oms_solo',
    })
    expect(r.summary).toContain('One man show')
  })

  it('recommends live-demo for OMS with low entropy', () => {
    const r = buildPlanFromQuestionnaire('Solo', {
      operatingContext: 'one_man_show',
      companySize: 'oms_solo',
      pathologyNod: 'low',
    })
    expect(r.recommendedOptionId).toBe('live-demo')
  })

  // ─── dynamicSummary ───────────────────────────────────────────────────────

  it('dynamicSummary has all three paragraphs', () => {
    const r = buildPlanFromQuestionnaire('C', {
      championRole: 'coo',
      companySize: '150_300',
      pathologyNod: 'high',
      pathologyLearning: 'single_loop',
      decisionLatency: 'over_15',
    })
    expect(r.dynamicSummary.roleParagraph.length).toBeGreaterThan(0)
    expect(r.dynamicSummary.diagnosisParagraph.length).toBeGreaterThan(0)
    expect(r.dynamicSummary.ctaParagraph.length).toBeGreaterThan(0)
  })

  it('dynamicSummary roleParagraph mentions COO and Dunbar for large org', () => {
    const r = buildPlanFromQuestionnaire('C', {
      championRole: 'coo',
      companySize: '150_300',
    })
    expect(r.dynamicSummary.roleParagraph).toContain('COO')
    expect(r.dynamicSummary.roleParagraph).toContain('דאנבר')
  })

  it('dynamicSummary ctaParagraph mentions sprint for sprint recommendation', () => {
    const r = buildPlanFromQuestionnaire('C', { decisionLatency: 'over_15' })
    expect(r.dynamicSummary.ctaParagraph).toContain('ספרינט')
  })

  it('OMS ignition nudge upgrades live-demo to sprint when commercial action is stale', () => {
    const r = buildPlanFromQuestionnaire('Solo', {
      operatingContext: 'one_man_show',
      companySize: 'oms_solo',
      championRole: 'ceo',
      industrySector: 'other',
      pathologyNod: 'low',
      pathologyZeroSum: 'rare',
      pathologyLearning: 'double_loop',
      pathologySemantic: 'low_drift',
      decisionLatency: 'under_5',
      urgencyLevel: 'low',
      interventionGoal: 'reduce_entropy',
      ignitionPrimaryVector: 'market_pull',
      ignitionDominantTrap: 'busy_motion',
      ignitionLastCommercialAsk: 'never_recent',
    })
    expect(r.recommendedOptionId).toBe('sprint')
    expect(r.dynamicSummary.ignitionParagraph).toBeTruthy()
  })

  it('OMS audit_only keeps live-demo despite ignition nudge', () => {
    const r = buildPlanFromQuestionnaire('Solo', {
      operatingContext: 'one_man_show',
      companySize: 'oms_solo',
      interventionGoal: 'audit_only',
      ignitionPrimaryVector: 'market_pull',
      ignitionDominantTrap: 'busy_motion',
      ignitionLastCommercialAsk: 'never_recent',
    })
    expect(r.recommendedOptionId).toBe('live-demo')
  })
})

// ─── buildDynamicSummary ──────────────────────────────────────────────────────

describe('buildDynamicSummary', () => {
  it('CFO role paragraph mentions CFO', () => {
    const ds = buildDynamicSummary({ championRole: 'cfo' }, { channelId: 'l1', optionId: 'live-demo' })
    expect(ds.roleParagraph).toContain('CFO')
  })

  it('CEO role paragraph mentions מנכ"ל', () => {
    const ds = buildDynamicSummary({ championRole: 'ceo' }, { channelId: 'l1', optionId: 'live-demo' })
    expect(ds.roleParagraph).toContain('מנכ"ל')
  })

  it('retainer CTA mentions retainer', () => {
    const ds = buildDynamicSummary({}, { channelId: 'l2', optionId: 'retainer' })
    expect(ds.ctaParagraph).toContain('Retainer')
  })

  it('live-demo CTA mentions Live Demo', () => {
    const ds = buildDynamicSummary({}, { channelId: 'l1', optionId: 'live-demo' })
    expect(ds.ctaParagraph).toContain('Live Demo')
  })

  it('includes ignitionParagraph when profile provided', () => {
    const prof = computeIgnitionProfile(
      {
        operatingContext: 'one_man_show',
        ignitionPrimaryVector: 'internal_push',
        ignitionDominantTrap: 'prep_trap',
        ignitionLastCommercialAsk: 'over_90d',
      },
      'one_man_show'
    )
    expect(prof).not.toBeNull()
    const ds = buildDynamicSummary({}, { channelId: 'l1', optionId: 'live-demo' }, prof)
    expect(ds.ignitionParagraph).toContain('צעד ראשון מומלץ')
  })
})
