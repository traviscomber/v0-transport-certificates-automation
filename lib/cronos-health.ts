export type CronosHealth = 'healthy' | 'degraded' | 'stuck' | 'broken'

type JobRun = {
  job_name?: string | null
  status?: string | null
  started_at?: string | null
  completed_at?: string | null
  duration_ms?: number | null
  failed_count?: number | null
  error_message?: string | null
}

export type JobHealth = {
  health: CronosHealth
  ageMinutes: number | null
  reason: string
}

const SLA_MINUTES: Record<string, number> = {
  compliance_events: 10,
  compliance_intelligence: 20,
  document_ocr: 30,
  document_text_extract: 15,
  f30_backfill: 5,
  pdf_ocr_backfill: 10,
  prt_import: 30,
  prt_import_stream: 30,
  prt_inspect: 30,
  prt_profile: 30,
  sii_transportistas: 15,
  vehicle_fleet_recovery: 30,
  expiration_alerts: 26 * 60,
  prt_discovery: 26 * 60,
}

export function jobSlaMinutes(jobName: string) {
  return SLA_MINUTES[jobName] ?? 60
}

export function classifyJobHealth(run: JobRun, now = new Date()): JobHealth {
  const status = String(run.status ?? '')
  const startedAt = run.started_at ? new Date(run.started_at) : null
  const ageMinutes = startedAt && !Number.isNaN(startedAt.getTime())
    ? Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 60000))
    : null
  const sla = jobSlaMinutes(String(run.job_name ?? ''))

  if (status === 'failed' || Number(run.failed_count ?? 0) > 0 || run.error_message) {
    return { health: 'broken', ageMinutes, reason: run.error_message || 'La última ejecución registró fallos.' }
  }

  if (status === 'running') {
    const runtimeMinutes = startedAt ? Math.max(0, (now.getTime() - startedAt.getTime()) / 60000) : 0
    if (runtimeMinutes > Math.max(10, sla)) {
      return { health: 'stuck', ageMinutes, reason: `Ejecución activa por ${Math.floor(runtimeMinutes)} min.` }
    }
    return { health: 'degraded', ageMinutes, reason: 'Ejecución en curso.' }
  }

  if (!startedAt) return { health: 'degraded', ageMinutes: null, reason: 'Sin ejecución registrada.' }
  if (ageMinutes !== null && ageMinutes > sla) {
    return { health: 'degraded', ageMinutes, reason: `Sin ejecución reciente dentro del SLA de ${sla} min.` }
  }

  if (status === 'partial' || status === 'skipped') {
    return { health: 'degraded', ageMinutes, reason: `Último estado: ${status}.` }
  }

  return { health: 'healthy', ageMinutes, reason: 'Ejecución reciente sin fallos.' }
}

export function worstHealth(values: CronosHealth[]): CronosHealth {
  const rank: Record<CronosHealth, number> = { healthy: 0, degraded: 1, stuck: 2, broken: 3 }
  return values.reduce<CronosHealth>((worst, value) => rank[value] > rank[worst] ? value : worst, 'healthy')
}
