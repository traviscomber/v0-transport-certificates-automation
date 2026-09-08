'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock, FileCheck, Users } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ExecutiveMetrics {
  executive_id: string
  executive_name: string
  documents_processed: number
  avg_validation_time: number
  approval_rate: number
  avg_ai_confidence: number
  validation_date: string
  validated_count: number
  rejected_count: number
  pending_count: number
  performance_score?: number
}

interface MetricsSummary {
  total_documents: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
  total_rechazados: number
  total_pendientes: number
  period_month: string
  period_year: string
}

export default function MetricsPage() {
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const { data: metricsData, isLoading } = useSWR(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    (url) => fetch(url).then((r) => r.json())
  )

  const executives: ExecutiveMetrics[] = metricsData?.executives || []
  const summary: MetricsSummary = metricsData?.summary || {
    total_documents: 0,
    total_validados: 0,
    total_conductores: 0,
    total_subcontratistas: 0,
    total_rechazados: 0,
    total_pendientes: 0,
    period_month: period.month,
    period_year: period.year,
  }
  const periodLabel = getMonthLabel(period.month, period.year)
  const approvalRate = summary.total_documents > 0
    ? Math.round((summary.total_validados / summary.total_documents) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
            Desempeño operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
            Métricas de ejecutivas
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Volumen, revisión y tiempos observados sobre documentos reales del período seleccionado.
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
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Período activo</p>
          <p className="mt-1 text-base font-semibold text-[var(--cf-text)]">{periodLabel}</p>
        </div>
        <p className="max-w-2xl text-sm text-[var(--cf-text-secondary)]">
          La vista usa la base operacional disponible; no completa períodos sin evidencia ni simula rendimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <FileCheck className="h-4 w-4 text-[var(--cf-text-muted)]" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_documents}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">base observada en el período</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-[#67C18D]" />
              Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{approvalRate}%</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{summary.total_validados} validados</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <Clock className="h-4 w-4 text-[#D9B65C]" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_pendientes}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">requieren revisión humana</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <AlertTriangle className="h-4 w-4 text-[#E17B8C]" />
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_rechazados}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">requieren corrección o nueva evidencia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-[var(--cf-text-muted)]" />
            <span className="text-sm text-[var(--cf-text-secondary)]">Conductores</span>
          </div>
          <span className="text-xl font-semibold tabular-nums text-[var(--cf-text)]">{summary.total_conductores}</span>
        </div>
        <div className="flex items-center justify-between rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-[var(--cf-text-muted)]" />
            <span className="text-sm text-[var(--cf-text-secondary)]">Subcontratistas</span>
          </div>
          <span className="text-xl font-semibold tabular-nums text-[var(--cf-text)]">{summary.total_subcontratistas}</span>
        </div>
      </div>

      <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--cf-border)]">
          <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Desempeño por ejecutiva</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">Cargando métricas…</div>
          ) : executives.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">No hay datos disponibles para este período.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-[var(--cf-canvas)]">
                  <tr className="border-b border-[var(--cf-border)] text-[var(--cf-text-muted)]">
                    <th className="px-4 py-3 text-left font-medium">Ejecutiva</th>
                    <th className="px-4 py-3 text-right font-medium">Documentos</th>
                    <th className="px-4 py-3 text-right font-medium">Validados</th>
                    <th className="px-4 py-3 text-right font-medium">Rechazados</th>
                    <th className="px-4 py-3 text-right font-medium">Pendientes</th>
                    <th className="px-4 py-3 text-right font-medium">Aprobación</th>
                    <th className="px-4 py-3 text-right font-medium">Tiempo prom.</th>
                    <th className="px-4 py-3 text-right font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {executives.map((exec) => (
                    <tr key={exec.executive_id} className="border-b border-[var(--cf-border)] last:border-b-0 hover:bg-[var(--cf-surface-raised)]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--cf-text)]">{exec.executive_name}</div>
                        <div className="mt-1 text-xs text-[var(--cf-text-muted)]">{exec.executive_id}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--cf-text-secondary)]">{exec.documents_processed}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#67C18D]">{exec.validated_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#E17B8C]">{exec.rejected_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#D9B65C]">{exec.pending_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--cf-text)]">{exec.approval_rate}%</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--cf-text-secondary)]">{exec.avg_validation_time}s</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--cf-text-secondary)]">{exec.performance_score ?? 'N/D'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
