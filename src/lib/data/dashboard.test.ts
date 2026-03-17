import { describe, it, expect } from 'vitest'
import type { ClientDiagnosticSummary } from '@/types/database'
import { computePortfolioAnalytics } from './dashboard'

type DiagnosticRow = { client_id: string; created_at: string; dsm_summary: ClientDiagnosticSummary }

describe('computePortfolioAnalytics', () => {
  it('returns null when no diagnostics', () => {
    expect(computePortfolioAnalytics([])).toBeNull()
  })

  it('counts severity profiles correctly', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 2, ndScore: 2, ucScore: 2, severityProfile: 'healthy', entropyScore: 0.3 } },
      { client_id: 'b', created_at: '2025-01-02', dsm_summary: { drScore: 5, ndScore: 5, ucScore: 5, severityProfile: 'at-risk', entropyScore: 0.5 } },
      { client_id: 'c', created_at: '2025-01-03', dsm_summary: { drScore: 8, ndScore: 8, ucScore: 8, severityProfile: 'critical', entropyScore: 0.8 } },
      { client_id: 'd', created_at: '2025-01-04', dsm_summary: { drScore: 10, ndScore: 10, ucScore: 10, severityProfile: 'systemic-collapse', entropyScore: 1 } },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    expect(result!.byProfile.healthy).toBe(1)
    expect(result!.byProfile.atRisk).toBe(1)
    expect(result!.byProfile.critical).toBe(1)
    expect(result!.byProfile.systemicCollapse).toBe(1)
  })

  it('uses latest diagnostic per client', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 2, ndScore: 2, ucScore: 2, severityProfile: 'healthy', entropyScore: 0.3 } },
      { client_id: 'a', created_at: '2025-01-10', dsm_summary: { drScore: 8, ndScore: 8, ucScore: 8, severityProfile: 'critical', entropyScore: 0.8 } },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    expect(result!.byProfile.healthy).toBe(0)
    expect(result!.byProfile.critical).toBe(1)
    expect(result!.totalClientsWithDiagnostics).toBe(1)
  })

  it('computes averages correctly', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 4, ndScore: 6, ucScore: 8, severityProfile: 'at-risk', entropyScore: 0.5 } },
      { client_id: 'b', created_at: '2025-01-02', dsm_summary: { drScore: 6, ndScore: 4, ucScore: 2, severityProfile: 'at-risk', entropyScore: 0.4 } },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    expect(result!.avgDR).toBe(5)
    expect(result!.avgND).toBe(5)
    expect(result!.avgUC).toBe(5)
  })

  it('identifies most common pathology (level >= 7)', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 8, ndScore: 3, ucScore: 3, severityProfile: 'critical', entropyScore: 0.6 } },
      { client_id: 'b', created_at: '2025-01-02', dsm_summary: { drScore: 8, ndScore: 3, ucScore: 3, severityProfile: 'critical', entropyScore: 0.6 } },
      { client_id: 'c', created_at: '2025-01-03', dsm_summary: { drScore: 3, ndScore: 9, ucScore: 3, severityProfile: 'critical', entropyScore: 0.6 } },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    expect(result!.mostCommonPathology).toBe('DR')
  })

  it('returns null for mostCommonPathology when all scores are below 7', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 3, ndScore: 4, ucScore: 5, severityProfile: 'healthy', entropyScore: 0.2 } },
      { client_id: 'b', created_at: '2025-01-02', dsm_summary: { drScore: 2, ndScore: 6, ucScore: 1, severityProfile: 'at-risk', entropyScore: 0.3 } },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    expect(result!.mostCommonPathology).toBeNull()
  })

  it('handles unknown severityProfile gracefully (falls back to healthy)', () => {
    const diagnostics: DiagnosticRow[] = [
      { client_id: 'a', created_at: '2025-01-01', dsm_summary: { drScore: 5, ndScore: 5, ucScore: 5, severityProfile: 'unknown-future-value', entropyScore: 0.5 } as unknown as ClientDiagnosticSummary },
    ]
    const result = computePortfolioAnalytics(diagnostics)
    expect(result).not.toBeNull()
    // Unknown profile falls back to 'healthy' bucket
    expect(result!.byProfile.healthy).toBe(1)
    expect(result!.totalClientsWithDiagnostics).toBe(1)
  })
})
