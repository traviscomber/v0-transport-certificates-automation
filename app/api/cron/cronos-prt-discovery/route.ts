import { NextRequest } from 'next/server'
import { GET as runPrtDiscovery } from '@/app/api/cron/prt-discovery/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60
export const runtime = 'nodejs'

const JOB_NAME = 'prt_discovery'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runPrtDiscovery(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, any>
    const discovered = Number(payload.discovered ?? 0)
    const inserted = Number(payload.inserted ?? 0)

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: discovered,
      succeededCount: response.ok ? inserted : 0,
      failedCount: response.ok ? 0 : Math.max(1, discovered),
      result: {
        discovered,
        inserted,
        fileCount: Array.isArray(payload.files) ? payload.files.length : 0,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT discovery cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      failedCount: 1,
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
