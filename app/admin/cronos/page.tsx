export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw } from 'lucide-react'

function number(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function statusMeta(status: string | null) {
  if (status === 'completed') return { label: 'Healthy', className: 'text-emerald-400', Icon: CheckCircle2 }
  if (status === 'partial' || status === 'skipped' || status === 'running') return { label: status ?? 'Warning', className: 'text-amber-400', Icon: RefreshCw }
  return { label: status || 'Sin ejecución', className: 'text-red-400', Icon: AlertTriangle }
}

function formatDuration(ms: unknown) {
  const value = number(ms)
  if (!value) return '—'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

export default async function CronosOperationsPage() {
  const supabase = createAdminClient()
  const [{ data: latest }, { data: recent }] = await Promise.all([
    supabase.from('system_job_latest_runs').select('*').order('job_name'),
    supabase.from('system_job_runs').select('*').order('started_at', { ascending: false }).limit(40),
  ])

  const rows = latest ?? []
  const healthy = rows.filter((row) => row.status === 'completed').length
  const warning = rows.filter((row) => ['partial', 'skipped', 'running'].includes(String(row.status))).length
  const failed = rows.filter((row) => row.status === 'failed').length

  const metrics = [
    { label: 'Jobs observados', value: rows.length, icon: Activity },
    { label: 'Healthy', value: healthy, icon: CheckCircle2 },
    { label: 'Warning / Running', value: warning, icon: RefreshCw },
    { label: 'Failed', value: failed, icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cronos</h1>
        <p className="text-muted-foreground">
          Control operativo de crons, sincronizaciones y workers. La salud se basa en ejecuciones canónicas registradas, no solo en respuestas HTTP.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-slate-700/60 bg-slate-900/50">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold">{value.toLocaleString('es-CL')}</p>
              </div>
              <Icon className="h-5 w-5 text-orange-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Estado actual de jobs</h2>
              <p className="text-sm text-muted-foreground">Última ejecución persistida por cada worker instrumentado.</p>
            </div>
            <Database className="h-5 w-5 text-orange-400" />
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const meta = statusMeta(row.status)
              const Icon = meta.Icon
              return (
                <div key={row.job_name} className="grid gap-3 rounded-lg border border-slate-700/60 bg-slate-950/50 p-4 lg:grid-cols-[1.4fr_.8fr_.8fr_.8fr_1fr] lg:items-center">
                  <div>
                    <p className="font-medium">{row.job_name}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{row.deployment_sha ? String(row.deployment_sha).slice(0, 12) : 'sin SHA'}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${meta.className}`}>
                    <Icon className="h-4 w-4" /> {meta.label}
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-xs text-muted-foreground">Procesados</span>
                    <p>{number(row.processed_count).toLocaleString('es-CL')}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-xs text-muted-foreground">Duración</span>
                    <p>{formatDuration(row.duration_ms)}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-xs text-muted-foreground">Última ejecución</span>
                    <p>{row.started_at ? new Date(row.started_at).toLocaleString('es-CL') : '—'}</p>
                  </div>
                  {row.error_message && (
                    <div className="lg:col-span-5 rounded bg-red-950/30 px-3 py-2 text-xs text-red-300">{row.error_message}</div>
                  )}
                </div>
              )
            })}
            {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay ejecuciones instrumentadas.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold">Últimas ejecuciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-slate-800">
                  <th className="py-2 pr-4">Job</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Procesados</th>
                  <th className="py-2 pr-4">OK</th>
                  <th className="py-2 pr-4">Fallos</th>
                  <th className="py-2 pr-4">Duración</th>
                  <th className="py-2">Inicio</th>
                </tr>
              </thead>
              <tbody>
                {(recent ?? []).map((run) => (
                  <tr key={run.id} className="border-b border-slate-800/70 last:border-0">
                    <td className="py-3 pr-4 font-medium">{run.job_name}</td>
                    <td className={`py-3 pr-4 ${statusMeta(run.status).className}`}>{run.status}</td>
                    <td className="py-3 pr-4">{number(run.processed_count)}</td>
                    <td className="py-3 pr-4">{number(run.succeeded_count)}</td>
                    <td className="py-3 pr-4">{number(run.failed_count)}</td>
                    <td className="py-3 pr-4">{formatDuration(run.duration_ms)}</td>
                    <td className="py-3">{run.started_at ? new Date(run.started_at).toLocaleString('es-CL') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
