'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, XCircle } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ExecutiveMetrics {
  executive_id: string
  executive_name: string
  documents_processed: number
  approval_rate: number
  avg_validation_time: number
  validated_count: number
  rejected_count: number
  pending_count: number
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

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const { data, isLoading } = useSWR(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    (url) => fetch(url).then((response) => {
      if (!response.ok) throw new Error('No fue posible cargar analytics')
      return response.json()
    })
  )

  const summary: MetricsSummary = data?.summary || {
    total_documents: 0,
    total_validados: 0,
    total_conductores: 0,
    total_subcontratistas: 0,
    total_rechazados: 0,
    total_pendientes: 0,
    period_month: period.month,
    period_year: period.year,
  }
  const executives: ExecutiveMetrics[] = data?.executives || []
  const periodLabel = getMonthLabel(period.month, period.year)

  const approvalRate = summary.total_documents > 0
    ? Math.round((summary.total_validados / summary.total_documents) * 100)
    : 0
  const pendingRate = summary.total_documents > 0
    ? Math.round((summary.total_pendientes / summary.total_documents) * 100)
    : 0
  const rejectedRate = summary.total_documents > 0
    ? Math.round((summary.total_rechazados / summary.total_documents) * 100)
    : 0

  const topExecutives = useMemo(
    () => [...executives].sort((a, b) => b.documents_processed - a.documents_processed).slice(0, 5),
    [executives]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
            Analytics operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
            Lectura del flujo documental
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Resumen analítico construido sobre la misma fuente operacional de Métricas. No usa datos simulados ni completa períodos sin evidencia.
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
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Período analizado</p>
          <p className="mt-1 text-base font-semibold text-[var(--cf-text)]">{periodLabel}</p>
        </div>
        <Link href="/dashboard/company/metrics" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cf-accent-hover)] hover:underline">
          Ver métricas por ejecutiva <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <FileCheck2 className="h-4 w-4 text-[var(--cf-text-muted)]" />
              Documentos observados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_documents}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">base operacional del período</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-[#67C18D]" />
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_validados}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{approvalRate}% de la base observada</p>
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
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{pendingRate}% requiere revisión</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <XCircle className="h-4 w-4 text-[#E17B8C]" />
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{summary.total_rechazados}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{rejectedRate}% requiere corrección</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--cf-border)]">
            <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Composición del estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <StatusRow label="Aprobados" value={summary.total_validados} percentage={approvalRate} tone="success" />
            <StatusRow label="Pendientes" value={summary.total_pendientes} percentage={pendingRate} tone="warning" />
            <StatusRow label="Rechazados" value={summary.total_rechazados} percentage={rejectedRate} tone="danger" />
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--cf-border)]">
            <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Cobertura operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center justify-between border-b border-[var(--cf-border)] pb-3">
              <span className="text-sm text-[var(--cf-text-secondary)]">Conductores</span>
              <span className="text-xl font-semibold tabular-nums text-[var(--cf-text)]">{summary.total_conductores}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--cf-border)] pb-3">
              <span className="text-sm text-[var(--cf-text-secondary)]">Subcontratistas</span>
              <span className="text-xl font-semibold tabular-nums text-[var(--cf-text)]">{summary.total_subcontratistas}</span>
            </div>
            <p className="text-xs leading-5 text-[var(--cf-text-muted)]">
              Estos conteos describen entidades observadas por la fuente de métricas. No equivalen por sí solos a clearance operacional.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--cf-border)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Mayor volumen por ejecutiva</CardTitle>
            <span className="text-xs text-[var(--cf-text-muted)]">Top 5 del período</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">Cargando analytics…</div>
          ) : topExecutives.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">No hay actividad registrada para este período.</div>
          ) : (
            <div className="divide-y divide-[var(--cf-border)]">
              {topExecutives.map((executive) => (
                <div key={executive.executive_id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-[var(--cf-text)]">{executive.executive_name}</p>
                    <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{executive.documents_processed} documentos procesados</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold tabular-nums text-[var(--cf-text)]">{executive.approval_rate}%</p>
                    <p className="text-xs text-[var(--cf-text-muted)]">aprobación</p>
                  </div>
                  <div className="text-left sm:min-w-[100px] sm:text-right">
                    <p className="text-sm font-semibold tabular-nums text-[var(--cf-text)]">{executive.avg_validation_time}s</p>
                    <p className="text-xs text-[var(--cf-text-muted)]">tiempo prom.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusRow({
  label,
  value,
  percentage,
  tone,
}: {
  label: string
  value: number
  percentage: number
  tone: 'success' | 'warning' | 'danger'
}) {
  const toneClass = tone === 'success' ? 'bg-[#67C18D]' : tone === 'warning' ? 'bg-[#D9B65C]' : 'bg-[#E17B8C]'

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-[var(--cf-text-secondary)]">{label}</span>
        <span className="text-sm font-medium tabular-nums text-[var(--cf-text)]">{value} · {percentage}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--cf-canvas)]">
        <div className={`h-full ${toneClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  )
}
