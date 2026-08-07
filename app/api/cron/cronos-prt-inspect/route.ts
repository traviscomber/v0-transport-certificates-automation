import { NextRequest } from 'next/server'
import { GET as runPrtInspect } from '@/app/api/cron/prt-inspect/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60
export const runtime = 'nodejs'

const JOB_NAME = 'prt_inspect'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runPrtInspect(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, any>
    const inspected = Number(payload.inspected ?? 0)
    const attempted = inspected > 0 || payload.batchId ? 1 : 0
    const failed = response.ok ? 0 : attempted || 1

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: attempted,
      succeededCount: response.ok ? inspected : 0,
      failedCount: failed,
      result: {
        inspected,
        message: payload.message ?? null,
        batchId: payload.batch?.id ?? payload.batchId ?? null,
        period: payload.batch?.period ?? null,
        recordType: payload.batch?.recordType ?? null,
        sourceSizeBytes: payload.batch?.sourceSizeBytes ?? null,
        entryCount: Array.isArray(payload.batch?.entries) ? payload.batch.entries.length : null,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT inspection cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      failedCount: 1,
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
