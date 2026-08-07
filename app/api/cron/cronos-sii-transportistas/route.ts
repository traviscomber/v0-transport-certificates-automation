import { NextRequest } from 'next/server'
import { GET as runSiiTransportistas } from '@/app/api/cron/sii-transportistas/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60
export const runtime = 'nodejs'

const JOB_NAME = 'sii_transportistas'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runSiiTransportistas(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, any>
    const results = Array.isArray(payload.results) ? payload.results : []
    const processed = Number(payload.processed ?? results.length ?? 0)
    const successful = Number(payload.successful ?? 0)
    const entityFailures = results.filter((item: Record<string, any>) => item?.status === 'failed').length

    await finishSystemJobRun(jobRun, {
      status: response.ok ? 'completed' : 'failed',
      processedCount: processed,
      succeededCount: response.ok ? successful : 0,
      failedCount: response.ok ? entityFailures : Math.max(1, processed),
      result: {
        status: payload.status ?? null,
        parserVersion: payload.parserVersion ?? null,
        batchSize: payload.batchSize ?? null,
        pauseMs: payload.pauseMs ?? null,
        remaining: payload.remaining ?? null,
        retryAfter: payload.retryAfter ?? null,
        entityFailures,
      },
      errorMessage: response.ok ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SII transportista cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      failedCount: 1,
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
