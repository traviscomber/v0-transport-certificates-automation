import { NextRequest } from 'next/server'
import { GET as runVehicleFleetRecovery } from '@/app/api/cron/vehicle-fleet-recovery/route'
import { finishSystemJobRun, startSystemJobRun } from '@/lib/system-job-runs'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const JOB_NAME = 'vehicle_fleet_recovery'

export async function GET(request: NextRequest) {
  const jobRun = await startSystemJobRun(JOB_NAME)

  try {
    const response = await runVehicleFleetRecovery(request)
    const payload = await response.clone().json().catch(() => ({})) as Record<string, unknown>
    const scanned = Number(payload.scanned ?? payload.processed ?? 0)
    const failed = Number(payload.failed ?? 0)
    const succeeded = Math.max(0, scanned - failed)
    const skipped = response.status === 409 || payload.status === 'locked'

    await finishSystemJobRun(jobRun, {
      status: skipped ? 'skipped' : response.ok ? (failed > 0 ? 'partial' : 'completed') : 'failed',
      processedCount: scanned,
      succeededCount: succeeded,
      failedCount: failed,
      result: {
        prtMatched: payload.prtMatched ?? 0,
        vehiclesCreated: payload.vehiclesCreated ?? 0,
        vehiclesUpdated: payload.vehiclesUpdated ?? 0,
        queuedForOcr: payload.queuedForOcr ?? 0,
        ownerConflicts: payload.ownerConflicts ?? 0,
        unresolved: payload.unresolved ?? 0,
        remainingCandidates: payload.remainingCandidates ?? null,
      },
      errorMessage: response.ok || skipped ? null : String(payload.error ?? `HTTP ${response.status}`),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown vehicle fleet recovery cron error'
    await finishSystemJobRun(jobRun, {
      status: 'failed',
      errorMessage: message,
      result: { stage: 'wrapper' },
    })
    throw error
  }
}
