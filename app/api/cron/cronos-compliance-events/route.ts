import { NextRequest } from 'next/server'
import { GET as runComplianceEvents } from '@/app/api/cron/compliance-events/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const JOB_NAME = 'compliance_events'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runComplianceEvents(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, unknown>
    const claimed = Number(payload.claimed ?? payload.processed ?? 0)
    const processed = Number(payload.processed ?? 0)
    const ignored = Number(payload.ignored ?? 0)
    const failed = response.ok ? 0 : Math.max(1, claimed)

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: claimed,
      succeededCount: response.ok ? processed + ignored : 0,
      failedCount: failed,
      result: {
        processed,
        ignored,
        recalculatedPeriods: payload.recalculatedPeriods ?? 0,
        reason: payload.reason ?? null,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown compliance events error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
