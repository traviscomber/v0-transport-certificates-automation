'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Activity, BrainCircuit, CheckCircle2, Clock3, FileText } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

type OperationalSummary = {
  documents_registered: number
  ai_analyzed: number
  human_reviewed: number
  decisions_recorded: number
  median_upload_to_ai_seconds: number | null
  ai_timing_samples: number
  period_month: string
  period_year: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error('No fue posible cargar analytics')
  return response.json()
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return 'Sin muestra'
  if (seconds < 60) return `${seconds} s`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`
  const hours = seconds / 3600
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} h`
}

function ratio(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<DateFilterValue>({ month: ALL_VALUE, year: ALL_VALUE })
  const { data, error, isLoading } = useSWR(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  )

  const summary: OperationalSummary | null = data?.summary || null
  const total = summary?.documents_registered || 0
  const periodLabel = getMonthLabel(period.month, period.year)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Analytics operacional</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">Flujo documental observado</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Lectura construida sólo con eventos registrados en el flujo de documentos de subcontratistas. No imputa períodos ni métricas faltantes.
          </p>
        </div>
        <div className="lg:min-w-[320px]">
          <DatePeriodFilter value={period} onChange={setPeriod} onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })} />
        </div>
      </div>

      <div className="border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Período analizado</p>
        <p className="mt-1 text-base font-semibold text-[var(--cf-text)]">{periodLabel}</p>
      </div>

      {error ? (
        <StatePanel>No fue posible cargar la evidencia operacional.</StatePanel>
      ) : isLoading || !summary ? (
        <StatePanel>Cargando analytics…</StatePanel>
      ) : (
        <>
          <section className="space-y-3" aria-labelledby="analytics-summary-title">
            <SectionHeading
              eyebrow="Cobertura"
              title="Estado del flujo"
              description="Cada porcentaje se calcula contra los documentos registrados del período; no se infieren etapas faltantes."
              id="analytics-summary-title"
            />
            <div className="overflow-hidden rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)]">
              <div className="grid grid-cols-2 xl:grid-cols-4">
                <Metric icon={FileText} label="Registrados" value={summary.documents_registered} note="base factual" />
                <Metric icon={BrainCircuit} label="Preanálisis IA" value={summary.ai_analyzed} note={`${ratio(summary.ai_analyzed, total)}% de cobertura`} divided />
                <Metric icon={Activity} label="Revisión humana" value={summary.human_reviewed} note={`${ratio(summary.human_reviewed, total)}% de cobertura`} divided />
                <Metric icon={CheckCircle2} label="Decisiones" value={summary.decisions_recorded} note={`${ratio(summary.decisions_recorded, total)}% de cobertura`} divided />
              </div>
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="analytics-evidence-title">
            <SectionHeading
              eyebrow="Evidencia temporal"
              title="Carga → preanálisis IA"
              description="La mediana usa exclusivamente registros con timestamps válidos y no equivale a productividad ni tiempo ahorrado."
              id="analytics-evidence-title"
            />
            <div className="divide-y divide-[var(--cf-border)] rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] lg:grid lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
                  <Clock3 className="h-4 w-4 text-[var(--cf-text-muted)]" /> Mediana observada
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{formatDuration(summary.median_upload_to_ai_seconds)}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--cf-text-muted)]">Calculada sobre eventos con `uploaded_at` y `ai_analyzed_at` válidos.</p>
              </div>
              <div className="p-5">
                <p className="text-sm font-medium text-[var(--cf-text-secondary)]">Muestras utilizables</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.ai_timing_samples.toLocaleString('es-CL')}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--cf-text-muted)]">Base efectiva del cálculo temporal; se mantiene separada del total documental.</p>
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--cf-border)] pt-4 text-xs leading-5 text-[var(--cf-text-muted)]">
            Fuente operacional: eventos del flujo documental de subcontratistas. Esta vista describe lo observado y no crea KPIs sin respaldo.
          </div>
        </>
      )}
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-base font-semibold text-[var(--cf-text)]">{title}</h2>
      </div>
      <p className="max-w-xl text-xs leading-5 text-[var(--cf-text-muted)] sm:text-right">{description}</p>
    </div>
  )
}

function Metric({ icon: Icon, label, value, note, divided }: { icon: typeof FileText; label: string; value: number; note: string; divided?: boolean }) {
  return (
    <div className={`min-w-0 p-4 ${divided ? 'border-l border-[var(--cf-border)]' : ''}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--cf-text-muted)]">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-[var(--cf-text)]">{value.toLocaleString('es-CL')}</p>
      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{note}</p>
    </div>
  )
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-12 text-center text-sm text-[var(--cf-text-muted)]">{children}</div>
}
