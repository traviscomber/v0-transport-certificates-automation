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
  if (!response.ok) throw new Error('No fue posible cargar reportes')
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

export default function ReportesPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Lectura ejecutiva</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">Reportes</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Resumen factual del flujo documental registrado. Esta vista ya no usa la base legacy de documentos ni supuestos de vencimiento o productividad.
          </p>
        </div>
        <div className="lg:min-w-[320px]">
          <DatePeriodFilter value={period} onChange={setPeriod} onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })} />
        </div>
      </div>

      <div className="border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Período del reporte</p>
        <p className="mt-1 text-base font-semibold text-[var(--cf-text)]">{periodLabel}</p>
      </div>

      {error ? (
        <StatePanel>No fue posible cargar la evidencia del reporte.</StatePanel>
      ) : isLoading || !summary ? (
        <StatePanel>Cargando reporte…</StatePanel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={FileText} label="Documentos registrados" value={summary.documents_registered} note="base factual del período" />
            <Metric icon={BrainCircuit} label="Preanálisis IA" value={summary.ai_analyzed} note={`${ratio(summary.ai_analyzed, total)}% de cobertura observada`} />
            <Metric icon={Activity} label="Revisados por Labbé" value={summary.human_reviewed} note={`${ratio(summary.human_reviewed, total)}% de cobertura observada`} />
            <Metric icon={CheckCircle2} label="Decisiones registradas" value={summary.decisions_recorded} note={`${ratio(summary.decisions_recorded, total)}% de la base`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Cobertura observada</p>
              <div className="mt-4 divide-y divide-[var(--cf-border)]">
                <CoverageRow label="Documentos con preanálisis IA" value={summary.ai_analyzed} percentage={ratio(summary.ai_analyzed, total)} />
                <CoverageRow label="Documentos con revisión humana" value={summary.human_reviewed} percentage={ratio(summary.human_reviewed, total)} />
                <CoverageRow label="Documentos con decisión registrada" value={summary.decisions_recorded} percentage={ratio(summary.decisions_recorded, total)} />
              </div>
            </section>

            <section className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
                <Clock3 className="h-4 w-4 text-[var(--cf-text-muted)]" /> Tiempo observado carga → IA
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{formatDuration(summary.median_upload_to_ai_seconds)}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--cf-text-muted)]">Mediana sobre {summary.ai_timing_samples.toLocaleString('es-CL')} registros con timestamps válidos. No representa tiempo ahorrado.</p>
            </section>
          </div>

          <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-5 py-4 text-xs leading-5 text-[var(--cf-text-muted)]">
            Fuente: eventos registrados en `subcontractor_documents`. No se muestran métricas sin respaldo en esa fuente operacional.
          </div>
        </>
      )}
    </div>
  )
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof FileText; label: string; value: number; note: string }) {
  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
        <Icon className="h-4 w-4 text-[var(--cf-text-muted)]" /> {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{value.toLocaleString('es-CL')}</p>
      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{note}</p>
    </div>
  )
}

function CoverageRow({ label, value, percentage }: { label: string; value: number; percentage: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--cf-text-secondary)]">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[var(--cf-text)]">{value.toLocaleString('es-CL')} · {percentage}%</span>
    </div>
  )
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-12 text-center text-sm text-[var(--cf-text-muted)]">{children}</div>
}
