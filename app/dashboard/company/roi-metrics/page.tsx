'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'
import { Clock, FileCheck2, RefreshCw, TrendingUp, Users } from 'lucide-react'

interface ROIMetrics {
  totalDocumentsProcessed: number
  documentsWithAI: number
  documentsManual: number
  documentsPending: number
  documentsApproved: number
  documentsRejected: number
  totalTimeSavedHours: number
  totalTimeSavedDays: number
  timeSavedPerDocumentMinutes: number
  averageTimePerDocumentMinutesManual: number
  averageTimePerDocumentMinutesWithAI: number
  executivesEquivalent: number
  totalExecutives: number
  costSavingMonthly: number | null
  costSavingAnnual: number | null
  costSavingAsPercentageOfPayroll: number | null
  financialEstimateAvailable: boolean
  aiSuccessRate: number | null
  rejectionRate: number
  approvalRate: number
  processingSpeedAI: number
  processingSpeedManual: number
  speedMultiplier: number
  totalConductores: number
  totalTransportistas: number
  scenarioAssumptions: {
    manualReviewMinutes: number
    aiAnalysisMinutes: number
    humanValidationMinutes: number
    source: string
    realizedSavingsClaim: boolean
  }
  roi: {
    message: string
    equivalentExecutives: number
    monthlySavingsCLP: number | null
    yearlySavingsCLP: number | null
    documentsProcessedPerDay: number
    hoursPerMonthSaved: number
  }
}

export default function ROIMetricsPage() {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<DateFilterValue>({ month: ALL_VALUE, year: ALL_VALUE })

  const fetchMetrics = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({ month: period.month, year: period.year })
      const response = await fetch(`/api/metrics/roi?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      setMetrics(await response.json())
    } catch (err: any) {
      console.error('[v0] Error fetching ROI metrics:', err.message)
      setMetrics(null)
      setError(err.message || 'No fue posible cargar la estimación')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year])

  const periodLabel = getMonthLabel(period.month, period.year)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Eficiencia operacional</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">ROI y capacidad estimada</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Combina volumen real con supuestos explícitos de tiempo. Los ahorros financieros sólo aparecen cuando existe un costo mensual configurado.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMetrics}
          disabled={loading}
          className="h-10 gap-2 border-[var(--cf-border)] bg-transparent text-sm text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DatePeriodFilter
          value={period}
          onChange={setPeriod}
          onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
        />
        <div className="text-sm text-[var(--cf-text-muted)] lg:text-right">
          Período: <span className="font-medium text-[var(--cf-text-secondary)]">{periodLabel}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-5 py-4 text-sm text-[#E17B8C]">
          {error}
        </div>
      )}

      {!metrics ? (
        <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">
          {loading ? 'Calculando estimación…' : 'No hay datos disponibles para este período.'}
        </div>
      ) : (
        <>
          <div className="border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-4">
            <p className="text-sm font-medium text-[var(--cf-text)]">{metrics.roi.message}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--cf-text-muted)]">
              Es una estimación de capacidad bajo los supuestos indicados abajo; no representa ahorro realizado ni reducción recomendada de dotación.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={FileCheck2} label="Documentos procesados" value={metrics.totalDocumentsProcessed.toLocaleString('es-CL')} note={`${metrics.documentsWithAI} con señal IA`} />
            <MetricCard icon={Clock} label="Horas estimadas liberadas" value={Math.round(metrics.totalTimeSavedHours).toLocaleString('es-CL')} note={`${metrics.timeSavedPerDocumentMinutes.toFixed(1)} min por documento IA`} />
            <MetricCard icon={Users} label="Capacidad equivalente" value={metrics.executivesEquivalent.toLocaleString('es-CL', { maximumFractionDigits: 2 })} note={`sobre ${metrics.totalExecutives} ejecutivas activas observadas`} />
            <MetricCard icon={TrendingUp} label="Velocidad escenario IA" value={`${metrics.speedMultiplier.toFixed(1)}x`} note={`${metrics.processingSpeedAI} vs ${metrics.processingSpeedManual} docs/h`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
              <CardHeader className="border-b border-[var(--cf-border)]">
                <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Estado documental observado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <StatusRow label="Aprobados" value={metrics.documentsApproved} percentage={metrics.approvalRate} tone="success" />
                <StatusRow label="Pendientes" value={metrics.documentsPending} percentage={Math.max(0, 100 - metrics.approvalRate - metrics.rejectionRate)} tone="warning" />
                <StatusRow label="Rechazados" value={metrics.documentsRejected} percentage={metrics.rejectionRate} tone="danger" />
              </CardContent>
            </Card>

            <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
              <CardHeader className="border-b border-[var(--cf-border)]">
                <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Supuestos del escenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-5 text-sm text-[var(--cf-text-secondary)]">
                <Assumption label="Revisión manual" value={`${metrics.scenarioAssumptions.manualReviewMinutes} min/doc`} />
                <Assumption label="Análisis IA" value={`${metrics.scenarioAssumptions.aiAnalysisMinutes} min/doc`} />
                <Assumption label="Validación humana" value={`${metrics.scenarioAssumptions.humanValidationMinutes} min/doc`} />
                <p className="border-t border-[var(--cf-border)] pt-3 text-xs leading-5 text-[var(--cf-text-muted)]">
                  Estos tiempos son parámetros de escenario configurados o defaults explícitos. No se presentan como telemetría observada si no existe medición operacional que los reemplace.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
              <CardHeader className="border-b border-[var(--cf-border)]">
                <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Cobertura del análisis</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
                <SimpleValue label="Con IA" value={metrics.documentsWithAI} />
                <SimpleValue label="Sin señal IA" value={metrics.documentsManual} />
                <SimpleValue label="Conductores" value={metrics.totalConductores} />
                <SimpleValue label="Subcontratistas" value={metrics.totalTransportistas} />
              </CardContent>
            </Card>

            <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
              <CardHeader className="border-b border-[var(--cf-border)]">
                <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Estimación financiera</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {metrics.financialEstimateAvailable ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SimpleValue label="Estimación mensual" value={formatCLP(metrics.costSavingMonthly)} />
                    <SimpleValue label="Estimación anual" value={formatCLP(metrics.costSavingAnnual)} />
                    <div className="sm:col-span-2 text-xs leading-5 text-[var(--cf-text-muted)]">
                      Estimación basada en capacidad equivalente y costo mensual configurado. No corresponde a ahorro contable realizado.
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-[var(--cf-text-secondary)]">
                    No hay un costo mensual canónico configurado para ejecutivas. ChileFlota omite cifras CLP en vez de inventarlas.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-4 py-3 text-xs leading-5 text-[var(--cf-text-muted)]">
            La tasa de aprobación ({metrics.approvalRate}%) describe decisiones documentales. No se interpreta como accuracy del modelo. {metrics.aiSuccessRate !== null ? `La señal “documentos IA no rechazados” es ${metrics.aiSuccessRate}% y tampoco equivale a exactitud certificada.` : ''}
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Clock
  label: string
  value: string
  note: string
}) {
  return (
    <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
          <Icon className="h-4 w-4 text-[var(--cf-text-muted)]" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{value}</div>
        <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{note}</p>
      </CardContent>
    </Card>
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
        <span className="text-sm font-medium tabular-nums text-[var(--cf-text)]">{value} · {Math.max(0, percentage)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--cf-canvas)]">
        <div className={`h-full ${toneClass}`} style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} />
      </div>
    </div>
  )
}

function Assumption({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--cf-border)] pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="font-medium tabular-nums text-[var(--cf-text)]">{value}</span>
    </div>
  )
}

function SimpleValue({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-4 py-3">
      <p className="text-xs text-[var(--cf-text-muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--cf-text)]">{value}</p>
    </div>
  )
}

function formatCLP(value: number | null) {
  if (value === null) return 'N/D'
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)
}
