import { describe, expect, it } from 'vitest'
import { analyzeAlpha } from './alpha'

describe('alpha agent', () => {
  it('extracts bounded contexts and network metrics without persisting', async () => {
    const result = await analyzeAlpha({
      clientId: '00000000-0000-0000-0000-000000000001',
      answers: {
        strategyExecution: 'Leadership says roadmap is clear but teams report prioritization conflicts.',
        communication: 'Communication between delivery and commercial is siloed.',
      },
      documents: [
        {
          title: 'Operating memo',
          content: 'Decision authority is unclear, managers override workflow, and trust is low.',
        },
      ],
      network: {
        teams: ['Leadership', 'Delivery', 'Commercial'],
        communicationMode: 'centralized',
        hubs: ['Leadership'],
        silos: ['Commercial'],
      },
      apply: false,
    })

    expect(result.boundedContexts.length).toBeGreaterThan(1)
    expect(result.contradictionLoss).toBeGreaterThan(0)
    expect(result.networkMetrics.density).toBeGreaterThan(0)
    expect(result.governance.canWrite).toBe(false)
  })
})
