'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bot, CheckCircle2, Clock3, FileText } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ImpactSummary {
  documents_registered: number
  ai_analyzed: number
  human_reviewed: number
  decisions_recorded: number
  median_upload_to_ai_seconds: number | null
  ai_timing_samples: number
  period_month: string
  period_year: string
}

interface ImpactResponse {
  summary?: ImpactSummary
  error?: string
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return 'N/D'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat('es-CL').format(value || 0)
}

export default function OperationalImpactPage() {
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const { data, error, isLoading } = useSWR<ImpactResponse>(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    (url: string) => fetch(url, { cache: 'no-store' }).then(async (response) => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'No fue posible cargar las métricas')
      return payload
    }),
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  )

  const summary = data?.summary
  const periodLabel = getMonthLabel(period.month, period.year)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
            Evidencia operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
            Impacto Operacional
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Sólo datos observados directamente en el flujo documental de subcontratistas.
          </p>
        </div>
        <div className="lg:min-w-[320px]">
          <DatePeriodFilter
            value={period}
            onChange={setPeriod}
            onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Período</p>
          <p className="mt-1 text-base font-semibold text-[var(--cf-text)]">{periodLabel}</p>
        </div>
        <p className="max-w-2xl text-sm text-[var(--cf-text-secondary)]">
          Los valores provienen de registros existentes; no se estiman ahorros, productividad ni ROI.
        </p>
      </div>

      {error ? (
        <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-6 py-8 text-sm text-[var(--cf-text-secondary)]">
          <p className="font-medium text-[#E17B8C]">No fue posible cargar Impacto Operacional.</p>
          <p className="mt-2 text-xs text-[var(--cf-text-muted)]">No se muestran ceros cuando la fuente no respondió.</p>
        </div>
      ) : (
        <section className="space-y-3" aria-labelledby="impact-summary-title">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Lectura rápida</p>
              <h2 id="impact-summary-title" className="mt-1 text-base font-semibold text-[var(--cf-text)]">Eventos observados</h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-[var(--cf-text-muted)] sm:text-right">
              Conteos y tiempo mediano respaldados por el endpoint de métricas del período seleccionado.
            </p>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)]">
            <div className="grid grid-cols-2 xl:grid-cols-5">
              <Metric icon={FileText} label="Registrados" value={isLoading ? '—' : formatNumber(summary?.documents_registered)} />
              <Metric icon={Bot} label="Analizados IA" value={isLoading ? '—' : formatNumber(summary?.ai_analyzed)} divided />
              <Metric icon={CheckCircle2} label="Revisión Labbé" value={isLoading ? '—' : formatNumber(summary?.human_reviewed)} divided />
              <Metric icon={CheckCircle2} label="Decisiones" value={isLoading ? '—' : formatNumber(summary?.decisions_recorded)} divided />
              <Metric
                icon={Clock3}
                label="Mediana carga → IA"
                value={isLoading ? '—' : formatDuration(summary?.median_upload_to_ai_seconds)}
                note={isLoading ? undefined : `${formatNumber(summary?.ai_timing_samples)} muestras válidas`}
                divided
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function Metric({ icon: Icon, label, value, note, divided }: { icon: typeof FileText; label: string; value: string; note?: string; divided?: boolean }) {
  return (
    <div className={`min-w-0 p-4 ${divided ? 'border-l border-[var(--cf-border)]' : ''}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--cf-text-muted)]">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-[var(--cf-text)]">{value}</p>
      {note && <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{note}</p>}
    </div>
  )
}
