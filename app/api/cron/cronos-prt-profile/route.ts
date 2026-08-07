import { NextRequest } from 'next/server'
import { GET as runPrtProfile } from '@/app/api/cron/prt-profile/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120
export const runtime = 'nodejs'

const JOB_NAME = 'prt_profile'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runPrtProfile(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, any>
    const profiled = Number(payload.profiled ?? 0)
    const attempted = profiled > 0 || payload.batchId ? 1 : 0
    const failed = response.ok ? 0 : attempted || 1

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: attempted,
      succeededCount: response.ok ? profiled : 0,
      failedCount: failed,
      result: {
        profiled,
        reason: payload.reason ?? null,
        batchId: payload.batch?.id ?? payload.batchId ?? null,
        period: payload.batch?.period ?? null,
        recordType: payload.batch?.recordType ?? null,
        archiveEntry: payload.profile?.archiveEntry ?? null,
        workbookSizeBytes: payload.profile?.workbookSizeBytes ?? null,
        sheetCount: Array.isArray(payload.profile?.sheetNames) ? payload.profile.sheetNames.length : null,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT profiling cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      failedCount: 1,
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
