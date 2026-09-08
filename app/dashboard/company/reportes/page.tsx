'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { AIAnalysisPanel } from '@/components/reports/ai-analysis-panel'
import { ArrowRight, RefreshCw, ShieldAlert } from 'lucide-react'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

type EntityRecord = {
  id: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  type: 'driver' | 'subcontractor'
  status?: string
}

type DocumentRecord = {
  id: string
  created_at?: string
  expiration_date?: string
  validation_status?: string
  original_filename?: string
  document_type?: string
  type?: 'driver_document' | 'subcontractor_document'
}

export default function ReportesPage() {
  const [period, setPeriod] = useState<DateFilterValue>({ month: ALL_VALUE, year: ALL_VALUE })
  const [analysis, setAnalysis] = useState<Record<string, string>>({})
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [entities, setEntities] = useState<EntityRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loadError, setLoadError] = useState('')

  const loadData = async () => {
    setRefreshing(true)
    setLoadError('')
    try {
      const [dashboardRes, documentsRes] = await Promise.all([
        fetch('/api/dashboard/data', { cache: 'no-store' }),
        fetch('/api/company/documents/all', { cache: 'no-store' }),
      ])

      if (!dashboardRes.ok || !documentsRes.ok) throw new Error('No fue posible cargar la base de reportes')

      const dashboardData = await dashboardRes.json()
      const documentsData = await documentsRes.json()

      const drivers = (dashboardData.dashboard?.conductores || []).map((driver: any) => ({
        ...driver,
        type: 'driver' as const,
      }))
      const subcontractors = (dashboardData.dashboard?.transportistas || []).map((subcontractor: any) => ({
        ...subcontractor,
        type: 'subcontractor' as const,
      }))

      setEntities([...drivers, ...subcontractors])
      setDocuments(Array.isArray(documentsData.documents) ? documentsData.documents : [])
    } catch (error) {
      console.error('[v0] Error loading report data:', error)
      setLoadError(error instanceof Error ? error.message : 'Error al cargar reportes')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredEntities = useMemo(() => {
    return filterByMonthYear(
      entities,
      (item) => item.updated_at || item.created_at,
      period.month,
      period.year,
    )
  }, [entities, period.month, period.year])

  const filteredDocuments = useMemo(() => {
    return filterByMonthYear(documents, (document) => document.created_at, period.month, period.year)
  }, [documents, period.month, period.year])

  const periodLabel = getMonthLabel(period.month, period.year)

  const stats = useMemo(() => {
    const approved = filteredDocuments.filter((document) => document.validation_status === 'approved' || document.validation_status === 'validated').length
    const pending = filteredDocuments.filter((document) => document.validation_status === 'pending').length
    const rejected = filteredDocuments.filter((document) => document.validation_status === 'rejected').length
    const expired = filteredDocuments.filter((document) => {
      if (!document.expiration_date) return false
      return new Date(document.expiration_date).getTime() < Date.now()
    }).length
    const expiring = filteredDocuments.filter((document) => {
      if (!document.expiration_date) return false
      const expiration = new Date(document.expiration_date)
      const days = Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days >= 0 && days <= 30
    }).length
    const oldestPending = filteredDocuments
      .filter((document) => document.validation_status === 'pending')
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())[0]

    return {
      total: filteredDocuments.length,
      approved,
      pending,
      rejected,
      expired,
      expiring,
      entities: filteredEntities.length,
      oldestPending,
    }
  }, [filteredDocuments, filteredEntities])

  const completionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0

  const handleAnalysisRequest = async (type: string) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            ...filteredEntities,
            ...filteredDocuments.map((document) => ({ ...document, type: 'document' })),
          ],
          stats: { ...stats, period },
          periodLabel,
          reportType: type,
        }),
      })

      if (!response.ok) throw new Error('No fue posible generar el análisis')
      const result = await response.json()
      setAnalysis((previous) => ({ ...previous, [type]: result.analysis }))
    } catch (error) {
      console.error('[v0] Error generating analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Lectura ejecutiva</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">Reportes</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Resume evidencia del período, prioriza excepciones y genera análisis asistido por IA sobre la base operacional disponible.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadData()}
          disabled={refreshing}
          className="h-10 gap-2 border-[var(--cf-border)] bg-transparent text-sm text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DatePeriodFilter value={period} onChange={setPeriod} onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })} />
        <div className="text-sm text-[var(--cf-text-muted)] lg:text-right">
          Período: <span className="font-medium text-[var(--cf-text-secondary)]">{periodLabel}</span>
        </div>
      </div>

      {loadError && (
        <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-5 py-4 text-sm text-[#E17B8C]">{loadError}</div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Documentos" value={stats.total} note="base del período" />
        <Metric label="Aprobados" value={stats.approved} note={`${completionRate}% de la base`} tone="success" />
        <Metric label="Pendientes" value={stats.pending} note="requieren revisión" tone="warning" />
        <Metric label="Vencidos / por vencer" value={stats.expired + stats.expiring} note={`${stats.expired} vencidos · ${stats.expiring} próximos`} tone="danger" />
      </div>

      <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text)]">
                <ShieldAlert className="h-4 w-4 text-[#E6A35A]" />
                Siguiente mejor acción
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
                {stats.expired > 0
                  ? `${stats.expired} documentos vencidos requieren resolución prioritaria.`
                  : stats.expiring > 0
                    ? `${stats.expiring} documentos vencen dentro de 30 días.`
                    : stats.pending > 0
                      ? `${stats.pending} documentos esperan revisión humana.`
                      : 'No se observan excepciones documentales prioritarias en el período.'}
              </p>
              {stats.oldestPending && (
                <p className="mt-1 text-xs text-[var(--cf-text-muted)]">
                  Pendiente más antiguo: {stats.oldestPending.original_filename || stats.oldestPending.document_type || 'Documento'}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionLink href="/dashboard/company/documentos/vencidos" label="Ver vencidos" />
              <ActionLink href="/dashboard/company/documentos/renovar" label="Renovaciones" />
              <ActionLink href="/dashboard/company/documentos/pendientes" label="Pendientes" primary />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Contexto del reporte</p>
              <p className="mt-2 text-lg font-semibold text-[var(--cf-text)]">{periodLabel}</p>
            </div>
            <div className="divide-y divide-[var(--cf-border)]">
              <SummaryRow label="Entidades observadas" value={stats.entities} />
              <SummaryRow label="Rechazados" value={stats.rejected} tone="danger" />
              <SummaryRow label="Por vencer" value={stats.expiring} tone="warning" />
              <SummaryRow label="Vencidos" value={stats.expired} tone="danger" />
            </div>
            <p className="text-xs leading-5 text-[var(--cf-text-muted)]">
              Los análisis IA se generan con los datos filtrados en esta pantalla y deben interpretarse como apoyo a la revisión humana.
            </p>
          </CardContent>
        </Card>

        <AIAnalysisPanel
          analysis={analysis}
          onAnalysisRequest={handleAnalysisRequest}
          loading={analysisLoading}
          hasData={stats.total > 0 || stats.entities > 0}
        />
      </div>
    </div>
  )
}

function Metric({ label, value, note, tone }: { label: string; value: number; note: string; tone?: 'success' | 'warning' | 'danger' }) {
  const dot = tone === 'success' ? 'bg-[#67C18D]' : tone === 'warning' ? 'bg-[#E6A35A]' : tone === 'danger' ? 'bg-[#E17B8C]' : 'bg-[var(--cf-text-muted)]'
  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-xs font-medium text-[var(--cf-text-muted)]">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{note}</p>
    </div>
  )
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'danger' }) {
  const text = tone === 'warning' ? 'text-[#E6A35A]' : tone === 'danger' ? 'text-[#E17B8C]' : 'text-[var(--cf-text)]'
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--cf-text-secondary)]">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${text}`}>{value}</span>
    </div>
  )
}

function ActionLink({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href}>
      <Button
        variant={primary ? 'default' : 'outline'}
        size="sm"
        className={primary
          ? 'h-9 gap-2 bg-[var(--cf-accent)] text-xs text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]'
          : 'h-9 gap-2 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]'}
      >
        {label}
        <ArrowRight className="h-3 w-3" />
      </Button>
    </Link>
  )
}
