import { claimAgeMinutes, reconcileClaims } from '@/lib/cronos-reconciliation'

describe('Cronos reconciliation', () => {
  const now = new Date('2026-08-07T23:00:00.000Z')

  it('calculates claim age', () => {
    expect(claimAgeMinutes('2026-08-07T22:45:00.000Z', now)).toBe(15)
  })

  it('keeps fresh claims healthy', () => {
    const summary = reconcileClaims([
      { source: 'documents', id: 'doc-1', state: 'processing', claimedAt: '2026-08-07T22:50:00.000Z', staleAfterMinutes: 30 },
    ], now)
    expect(summary.staleCount).toBe(0)
    expect(summary.healthyCount).toBe(1)
  })

  it('reports stale claims without mutating them', () => {
    const summary = reconcileClaims([
      { source: 'prt_import_batches', id: 'batch-1', state: 'importing', claimedAt: '2026-08-07T22:00:00.000Z', staleAfterMinutes: 30 },
    ], now)
    expect(summary.staleCount).toBe(1)
    expect(summary.issues[0].source).toBe('prt_import_batches')
    expect(summary.issues[0].ageMinutes).toBe(60)
  })
})
