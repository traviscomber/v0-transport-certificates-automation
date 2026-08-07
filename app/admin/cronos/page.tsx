export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw, ShieldAlert } from 'lucide-react'
import { classifyJobHealth, jobSlaMinutes, worstHealth, type CronosHealth } from '@/lib/cronos-health'

function number(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function healthMeta(health: CronosHealth) {
  if (health === 'healthy') return { label: 'Healthy', className: 'text-emerald-400', Icon: CheckCircle2 }
  if (health === 'degraded') return { label: 'Degraded', className: 'text-amber-400', Icon: RefreshCw }
  if (health === 'stuck') return { label: 'Stuck', className: 'text-orange-400', Icon: Clock3 }
  return { label: 'Broken', className: 'text-red-400', Icon: AlertTriangle }
}

function formatDuration(ms: unknown) {
  const value = number(ms)
  if (!value) return '—'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

export default async function CronosOperationsPage() {
  const supabase = createAdminClient()
  const [{ data: latest }, { data: recent }, { data: prtBatches }] = await Promise.all([
    supabase.from('system_job_latest_runs').select('*').order('job_name'),
    supabase.from('system_job_runs').select('*').order('started_at', { ascending: false }).limit(40),
    supabase.from('prt_import_batches').select('id,period,record_type,status,source_cursor,rows_read,rows_valid,rows_rejected,rows_duplicates,error_message,updated_at').order('period', { ascending: false }).order('record_type'),
  ])

  const now = new Date()
  const rows = (latest ?? []).map((row) => ({ ...row, semantic: classifyJobHealth(row, now) }))
  const healthCounts = rows.reduce<Record<CronosHealth, number>>((acc, row) => {
    const health = row.semantic.health as CronosHealth
    acc[health] += 1
    return acc
  }, { healthy: 0, degraded: 0, stuck: 0, broken: 0 })
  const overall = worstHealth(rows.map((row) => row.semantic.health as CronosHealth))
  const overallMeta = healthMeta(overall)
  const OverallIcon = overallMeta.Icon
  const activePrt = (prtBatches ?? []).filter((batch) => batch.status !== 'imported')

  const metrics = [
    { label: 'Jobs observados', value: rows.length, icon: Activity },
    { label: 'Healthy', value: healthCounts.healthy, icon: CheckCircle2 },
    { label: 'Degraded / Stuck', value: healthCounts.degraded + healthCounts.stuck, icon: RefreshCw },
    { label: 'Broken', value: healthCounts.broken, icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cronos Control Plane</h1>
          <p className="text-muted-foreground">Salud semántica, SLA, sincronizaciones y estado canónico de workers.</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${overallMeta.className}`}>
          <OverallIcon className="h-4 w-4" /> Estado global: {overallMeta.label}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-slate-700/60 bg-slate-900/50">
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold">{value.toLocaleString('es-CL')}</p></div>
              <Icon className="h-5 w-5 text-orange-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Salud operacional</h2><p className="text-sm text-muted-foreground">Clasificación basada en estado, fallos, runtime y frescura respecto del SLA.</p></div>
            <ShieldAlert className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-3">
            {rows.map((row) => {
              const meta = healthMeta(row.semantic.health as CronosHealth)
              const Icon = meta.Icon
              return (
                <div key={row.job_name} className="grid gap-3 rounded-lg border border-slate-700/60 bg-slate-950/50 p-4 lg:grid-cols-[1.3fr_.75fr_.65fr_.7fr_.8fr_1fr] lg:items-center">
                  <div><p className="font-medium">{row.job_name}</p><p className="mt-1 font-mono text-xs text-slate-500">{row.deployment_sha ? String(row.deployment_sha).slice(0, 12) : 'sin SHA'}</p></div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${meta.className}`}><Icon className="h-4 w-4" /> {meta.label}</div>
                  <div className="text-sm"><span className="text-xs text-muted-foreground">SLA</span><p>{jobSlaMinutes(String(row.job_name))} min</p></div>
                  <div className="text-sm"><span className="text-xs text-muted-foreground">Edad</span><p>{row.semantic.ageMinutes === null ? '—' : `${row.semantic.ageMinutes} min`}</p></div>
                  <div className="text-sm"><span className="text-xs text-muted-foreground">Procesados</span><p>{number(row.processed_count).toLocaleString('es-CL')}</p></div>
                  <div className="text-sm"><span className="text-xs text-muted-foreground">Duración</span><p>{formatDuration(row.duration_ms)}</p></div>
                  {row.semantic.health !== 'healthy' && <div className="lg:col-span-6 rounded bg-slate-900 px-3 py-2 text-xs text-slate-300">{row.semantic.reason}</div>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">PRT import pipeline</h2><p className="text-sm text-muted-foreground">Batches pendientes y progreso canónico.</p></div><Database className="h-5 w-5 text-orange-400" /></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-slate-800"><th className="py-2 pr-4">Periodo</th><th className="py-2 pr-4">Tipo</th><th className="py-2 pr-4">Estado</th><th className="py-2 pr-4">Cursor</th><th className="py-2 pr-4">Válidos</th><th className="py-2 pr-4">Duplicados</th><th className="py-2">Actualizado</th></tr></thead>
              <tbody>
                {activePrt.map((batch) => <tr key={batch.id} className="border-b border-slate-800/70 last:border-0"><td className="py-3 pr-4">{batch.period}</td><td className="py-3 pr-4 font-medium">{batch.record_type}</td><td className="py-3 pr-4">{batch.status}</td><td className="py-3 pr-4">{number(batch.source_cursor).toLocaleString('es-CL')}</td><td className="py-3 pr-4">{number(batch.rows_valid).toLocaleString('es-CL')}</td><td className="py-3 pr-4">{number(batch.rows_duplicates).toLocaleString('es-CL')}</td><td className="py-3">{batch.updated_at ? new Date(batch.updated_at).toLocaleString('es-CL') : '—'}</td></tr>)}
                {activePrt.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay batches PRT pendientes.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2"><Clock3 className="h-5 w-5 text-orange-400" /><h2 className="text-lg font-semibold">Últimas ejecuciones</h2></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase text-muted-foreground"><tr className="border-b border-slate-800"><th className="py-2 pr-4">Job</th><th className="py-2 pr-4">Estado</th><th className="py-2 pr-4">Procesados</th><th className="py-2 pr-4">OK</th><th className="py-2 pr-4">Fallos</th><th className="py-2 pr-4">Duración</th><th className="py-2">Inicio</th></tr></thead><tbody>{(recent ?? []).map((run) => <tr key={run.id} className="border-b border-slate-800/70 last:border-0"><td className="py-3 pr-4 font-medium">{run.job_name}</td><td className="py-3 pr-4">{run.status}</td><td className="py-3 pr-4">{number(run.processed_count)}</td><td className="py-3 pr-4">{number(run.succeeded_count)}</td><td className="py-3 pr-4">{number(run.failed_count)}</td><td className="py-3 pr-4">{formatDuration(run.duration_ms)}</td><td className="py-3">{run.started_at ? new Date(run.started_at).toLocaleString('es-CL') : '—'}</td></tr>)}</tbody></table></div>
        </CardContent>
      </Card>
    </div>
  )
}
