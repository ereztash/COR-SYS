import { describe, it, expect } from 'vitest'
import {
  diagnose,
  diagnoseFromScores,
  getComorbidityMap,
  getInterventionProtocols,
} from './dsm-engine'
import type { QuestionnaireAnswer } from './corsys-questionnaire'

describe('DSM Engine', () => {
  describe('diagnose()', () => {
    it('returns healthy profile for all-low answers', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'low',
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
        decisionLatency: 'under_5',
      }
      const result = diagnose(answers)

      expect(result.severityProfile).toBe('healthy')
      expect(result.codes).toEqual(['DR-1', 'ND-1', 'UC-1'])
      expect(result.pathologies.every((p) => p.level === 1)).toBe(true)
    })

    it('returns systemic-collapse for all-high answers', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'frequent',
        pathologyNod: 'high',
        pathologyLearning: 'single_loop',
        pathologySemantic: 'high_drift',
        decisionLatency: 'over_15',
      }
      const result = diagnose(answers)

      expect(result.severityProfile).toBe('systemic-collapse')
      expect(result.codes).toEqual(['DR-3', 'ND-3', 'UC-3'])
      expect(result.pathologies.every((p) => p.level === 3)).toBe(true)
      expect(result.totalEntropyScore).toBeGreaterThan(20)
    })

    it('returns at-risk when one pathology is moderate', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'occasional',
        pathologyNod: 'low',
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
        decisionLatency: 'under_5',
      }
      const result = diagnose(answers)

      expect(result.severityProfile).toBe('at-risk')
      expect(result.pathologies.find((p) => p.code === 'DR')!.level).toBe(2)
    })

    it('returns critical when one pathology is severe', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'frequent',
        pathologyNod: 'low',
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
        decisionLatency: 'over_15',
      }
      const result = diagnose(answers)

      expect(result.severityProfile).toBe('critical')
      expect(result.primaryDiagnosis).toBe('DR')
    })

    it('applies decision latency modifier only to elevated pathologies', () => {
      const base: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',       // DR = 1.5 (no modifier)
        pathologyNod: 'high',           // ND = 8.5 (gets modifier)
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
        decisionLatency: 'over_15',
      }
      const result = diagnose(base)

      // DR stays low (no modifier applied since base <= 3.0)
      expect(result.pathologies.find((p) => p.code === 'DR')!.score).toBe(1.5)
      // ND gets +1.5 modifier
      expect(result.pathologies.find((p) => p.code === 'ND')!.score).toBe(10) // clamped
    })

    it('identifies primary diagnosis as the highest-scoring pathology', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'high',
        pathologyLearning: 'mixed',
        pathologySemantic: 'medium_drift',
      }
      const result = diagnose(answers)
      expect(result.primaryDiagnosis).toBe('ND')
    })

    it('UC score is average of learning and semantic', () => {
      const answers: QuestionnaireAnswer = {
        pathologyLearning: 'single_loop',  // 8.0
        pathologySemantic: 'low_drift',    // 1.0
        decisionLatency: 'under_5',
      }
      const result = diagnose(answers)
      const uc = result.pathologies.find((p) => p.code === 'UC')!
      expect(uc.score).toBe(4.5) // (8.0 + 1.0) / 2
    })
  })

  describe('diagnoseFromScores()', () => {
    it('works with direct numeric scores', () => {
      const result = diagnoseFromScores(8, 9, 7, 20)
      expect(result.severityProfile).toBe('systemic-collapse')
      expect(result.codes).toEqual(['DR-3', 'ND-3', 'UC-3'])
    })

    it('returns healthy for low scores', () => {
      const result = diagnoseFromScores(1, 2, 1, 0)
      expect(result.severityProfile).toBe('healthy')
    })

    it('clamps scores to 0-10 range', () => {
      const result = diagnoseFromScores(15, -5, 5, 0)
      expect(result.pathologies.find((p) => p.code === 'DR')!.score).toBeLessThanOrEqual(10)
      expect(result.pathologies.find((p) => p.code === 'ND')!.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getComorbidityMap()', () => {
    it('returns 3 edges', () => {
      const diagnosis = diagnoseFromScores(5, 5, 5)
      const map = getComorbidityMap(diagnosis)
      expect(map).toHaveLength(3)
    })

    it('has correct research correlations', () => {
      const diagnosis = diagnoseFromScores(5, 5, 5)
      const map = getComorbidityMap(diagnosis)

      const drNd = map.find((e) => e.from === 'DR' && e.to === 'ND')!
      expect(drNd.correlation).toBe(0.19)
      expect(drNd.direction).toBe('positive')

      const drUc = map.find((e) => e.from === 'DR' && e.to === 'UC')!
      expect(drUc.correlation).toBe(-0.27)
      expect(drUc.direction).toBe('negative')

      const ndUc = map.find((e) => e.from === 'ND' && e.to === 'UC')!
      expect(ndUc.correlation).toBe(0.28)
      expect(ndUc.direction).toBe('positive')
    })

    it('marks edges as active when both pathologies are Level 2+', () => {
      const diagnosis = diagnoseFromScores(6, 6, 6) // all moderate
      const map = getComorbidityMap(diagnosis)
      expect(map.every((e) => e.active)).toBe(true)
    })

    it('marks edges as inactive when pathologies are low', () => {
      const diagnosis = diagnoseFromScores(1, 1, 1)
      const map = getComorbidityMap(diagnosis)
      expect(map.every((e) => !e.active)).toBe(true)
    })
  })

  describe('getInterventionProtocols()', () => {
    it('returns no protocols for healthy diagnosis', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'low',
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols).toHaveLength(0)
    })

    it('returns NOD→BIA protocol when ND is Level 2+', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'medium',
        pathologyLearning: 'double_loop',
        pathologySemantic: 'low_drift',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols.some((p) => p.id === 'nod-bia-remediation')).toBe(true)
    })

    it('returns Learning→Exercise protocol when UC is Level 2+', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'low',
        pathologyLearning: 'single_loop',
        pathologySemantic: 'medium_drift',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols.some((p) => p.id === 'learning-exercise-design')).toBe(true)
    })

    it('returns Blame→Reporting protocol when UC elevated + high_drift', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'low',
        pathologyLearning: 'single_loop',
        pathologySemantic: 'high_drift',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols.some((p) => p.id === 'blame-reporting')).toBe(true)
    })

    it('does NOT return Blame→Reporting when semantic drift is low', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'rare',
        pathologyNod: 'low',
        pathologyLearning: 'single_loop',
        pathologySemantic: 'low_drift',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols.some((p) => p.id === 'blame-reporting')).toBe(false)
    })

    it('returns Integrated System protocol when 2+ pathologies at Level 2+', () => {
      const answers: QuestionnaireAnswer = {
        pathologyZeroSum: 'frequent',
        pathologyNod: 'high',
        pathologyLearning: 'single_loop',
        pathologySemantic: 'high_drift',
        decisionLatency: 'over_15',
      }
      const diagnosis = diagnose(answers)
      const protocols = getInterventionProtocols(diagnosis, answers)
      expect(protocols.some((p) => p.id === 'integrated-system')).toBe(true)
    })
  })
})
