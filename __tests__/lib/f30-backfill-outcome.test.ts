import { resolveF30BackfillOutcome } from '@/lib/f30-backfill-outcome'

describe('resolveF30BackfillOutcome', () => {
  it('keeps parser terminal statuses without overwriting them', () => {
    expect(resolveF30BackfillOutcome({
      httpOk: true,
      httpStatus: 200,
      payload: { success: true, saved: true, f30: { status: 'valid' } },
    })).toEqual({ status: 'valid', persistTerminalState: false })
  })

  it('terminalizes successful responses where F30 content was not confirmed', () => {
    const result = resolveF30BackfillOutcome({
      httpOk: true,
      httpStatus: 200,
      payload: { success: true, saved: true, f30: null, usedOcrFallback: true },
    })

    expect(result.status).toBe('analysis_failed')
    expect(result.persistTerminalState).toBe(true)
    expect(result.details).toMatchObject({
      detected: false,
      warnings: ['f30_not_detected'],
      usedOcrFallback: true,
    })
  })

  it('terminalizes successful analysis that was not saved', () => {
    const result = resolveF30BackfillOutcome({
      httpOk: true,
      httpStatus: 200,
      payload: { success: true, saved: false, f30: { status: 'valid', details: { detected: true } } },
    })

    expect(result.status).toBe('analysis_failed')
    expect(result.persistTerminalState).toBe(true)
    expect(result.details).toMatchObject({
      detected: true,
      warnings: ['backfill_not_saved'],
    })
  })

  it('terminalizes HTTP and application failures', () => {
    expect(resolveF30BackfillOutcome({
      httpOk: false,
      httpStatus: 500,
      payload: { error: 'boom' },
    })).toMatchObject({
      status: 'analysis_failed',
      persistTerminalState: true,
      details: { error: 'boom' },
    })
  })
})
