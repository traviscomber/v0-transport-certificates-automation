import { NextRequest } from 'next/server'
import { GET as runExpirationAlerts } from '@/app/api/company/alerts/check-expiring-documents/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120
export const runtime = 'nodejs'

const JOB_NAME = 'expiration_alerts'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runExpirationAlerts(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, any>

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: 1,
      succeededCount: response.ok ? 1 : 0,
      failedCount: response.ok ? 0 : 1,
      result: {
        success: payload.success ?? false,
        source: payload.source ?? null,
        timestamp: payload.timestamp ?? null,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown expiration alerts cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      processedCount: 1,
      failedCount: 1,
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
