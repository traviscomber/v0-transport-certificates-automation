import { classifyJobHealth, jobSlaMinutes, worstHealth } from '@/lib/cronos-health'

describe('Cronos semantic health', () => {
  const now = new Date('2026-08-07T22:20:00.000Z')

  it('keeps recent completed jobs healthy', () => {
    expect(classifyJobHealth({ job_name: 'prt_import_stream', status: 'completed', started_at: '2026-08-07T22:12:00.000Z', failed_count: 0 }, now).health).toBe('healthy')
  })

  it('marks stale jobs degraded', () => {
    expect(classifyJobHealth({ job_name: 'sii_transportistas', status: 'completed', started_at: '2026-08-07T21:00:00.000Z' }, now).health).toBe('degraded')
  })

  it('marks failed jobs broken', () => {
    expect(classifyJobHealth({ job_name: 'document_ocr', status: 'failed', started_at: '2026-08-07T22:19:00.000Z', error_message: 'boom' }, now).health).toBe('broken')
  })

  it('marks long-running jobs stuck', () => {
    expect(classifyJobHealth({ job_name: 'f30_backfill', status: 'running', started_at: '2026-08-07T21:50:00.000Z' }, now).health).toBe('stuck')
  })

  it('uses daily SLA for discovery', () => {
    expect(jobSlaMinutes('prt_discovery')).toBe(26 * 60)
  })

  it('returns the worst aggregate health', () => {
    expect(worstHealth(['healthy', 'degraded', 'broken'])).toBe('broken')
  })
})
