export type F30BackfillTerminalStatus = 'valid' | 'warning' | 'rut_mismatch' | 'analysis_failed'

export type F30BackfillOutcome = {
  status: F30BackfillTerminalStatus
  persistTerminalState: boolean
  details?: Record<string, unknown>
}

const TERMINAL_STATUSES = new Set<F30BackfillTerminalStatus>([
  'valid',
  'warning',
  'rut_mismatch',
  'analysis_failed',
])

export function resolveF30BackfillOutcome(input: {
  httpOk: boolean
  httpStatus: number
  payload: any
}): F30BackfillOutcome {
  const { httpOk, httpStatus, payload } = input

  if (!httpOk || payload?.success !== true) {
    const error = payload?.error || `HTTP ${httpStatus}`
    return {
      status: 'analysis_failed',
      persistTerminalState: true,
      details: {
        detected: false,
        warnings: ['backfill_failed'],
        error,
      },
    }
  }

  if (payload?.saved !== true) {
    return {
      status: 'analysis_failed',
      persistTerminalState: true,
      details: {
        detected: Boolean(payload?.f30?.details?.detected),
        warnings: ['backfill_not_saved'],
        error: 'F30 analysis completed but canonical state was not saved',
      },
    }
  }

  const parsedStatus = payload?.f30?.status
  if (TERMINAL_STATUSES.has(parsedStatus)) {
    return {
      status: parsedStatus,
      persistTerminalState: false,
    }
  }

  return {
    status: 'analysis_failed',
    persistTerminalState: true,
    details: {
      detected: false,
      warnings: ['f30_not_detected'],
      error: 'F30 candidate was analyzed but the document content was not confirmed as F30',
      usedOcrFallback: Boolean(payload?.usedOcrFallback),
    },
  }
}
