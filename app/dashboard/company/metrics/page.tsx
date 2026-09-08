'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Activity, Bot, CheckCircle2, Clock3, UploadCloud } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ImpactSummary {
  total_observed: number
  subcontractor_documents: number
  delegated_uploads: number
  ai_analyzed: number
  human_reviewed: number
  decisions_recorded: number
  legacy_processed: number
  processed_observed: number
  median_upload_to_ai_seconds: number | null
  ai_timing_samples: number
  period_month: string
  period_year: string
}

interface ImpactResponse {
  summary?: ImpactSummary
  methodology?: {
    time_saved_hours: number | null
    time_saved_status: string
    note: string
  }
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

  const { data, isLoading } = useSWR<ImpactResponse>(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    (url: string) => fetch(url).then(async (response) => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'No fue posible cargar las métricas')
      return payload
    })
  )

  const summary = data?.summary
  const periodLabel = getMonthLabel(period.month, period.year)
  const aiCoverage = summary?.subcontractor_documents
    ? Math.round((summary.ai_analyzed / summary.subcontractor_documents) * 100)
    : 0
  const reviewCoverage = summary?.subcontractor_documents
    ? Math.round((summary.human_reviewed / summary.subcontractor_documents) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
            Evidencia operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
            Impacto Operacional
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Volumen real del flujo digital: el subcontratista carga, ChileFlota preanaliza y Labbé revisa la evidencia.
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
          No se muestran ahorros de horas estimados: ChileFlota todavía no dispone de una línea base observada de tiempo activo del proceso manual anterior.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <UploadCloud className="h-4 w-4 text-[var(--cf-text-muted)]" />
              Documentos recibidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">
              {isLoading ? '—' : `${formatNumber(summary?.subcontractor_documents)}+`}
            </div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">
              cargas del flujo de subcontratistas
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <Bot className="h-4 w-4 text-[var(--cf-text-muted)]" />
              Preanálisis IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">
              {isLoading ? '—' : formatNumber(summary?.ai_analyzed)}
            </div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{aiCoverage}% del flujo observado</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-[#67C18D]" />
              Revisados por Labbé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">
              {isLoading ? '—' : formatNumber(summary?.human_reviewed)}
            </div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{reviewCoverage}% con revisión humana registrada</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <Clock3 className="h-4 w-4 text-[#D9B65C]" />
              Tiempo a preanálisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">
              {isLoading ? '—' : formatDuration(summary?.median_upload_to_ai_seconds)}
            </div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">
              mediana real · {formatNumber(summary?.ai_timing_samples)} muestras
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--cf-border)]">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--cf-text)]">
            <Activity className="h-5 w-5 text-[var(--cf-text-muted)]" />
            Flujo operacional observado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Carga delegada</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--cf-text)]">{formatNumber(summary?.delegated_uploads)}</p>
            <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">documentos cargados sin ejecutiva registrada como uploader</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Decisiones registradas</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--cf-text)]">{formatNumber(summary?.decisions_recorded)}</p>
            <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">aprobaciones o rechazos en el flujo de subcontratistas</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Ahorro de tiempo</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--cf-text)]">Por medir</p>
            <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">requiere duración activa del proceso manual para calcular horas evitadas sin inventar supuestos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
