'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HelpBox } from '@/components/ui/help-box'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { AIAnalysisPanel } from '@/components/reports/ai-analysis-panel'
import { Download, FileText, BarChart3, TrendingUp, AlertCircle, CheckCircle2, Users, ArrowRight, ShieldAlert, RefreshCw } from 'lucide-react'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

type EntityRecord = {
  id: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  type: 'driver' | 'subcontractor'
  status?: string
  documentos?: unknown[]
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
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const [analysis, setAnalysis] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [entities, setEntities] = useState<EntityRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])

  const loadData = async () => {
    setRefreshing(true)
    try {
      const [dashboardRes, documentsRes] = await Promise.all([
        fetch('/api/dashboard/data', { cache: 'no-store' }),
        fetch('/api/company/documents/all', { cache: 'no-store' }),
      ])

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        const drivers = (dashboardData.dashboard?.conductores || []).map((driver: any) => ({
          ...driver,
          type: 'driver' as const,
        }))
        const subcontractors = (dashboardData.dashboard?.transportistas || []).map((sub: any) => ({
          ...sub,
          type: 'subcontractor' as const,
        }))
        setEntities([...drivers, ...subcontractors])
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setDocuments(Array.isArray(documentsData.documents) ? documentsData.documents : [])
      }
    } catch (error) {
      console.error('[v0] Error loading report data:', error)
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
      period.year
    )
  }, [entities, period.month, period.year])

  const filteredDocuments = useMemo(() => {
    return filterByMonthYear(
      documents,
      (doc) => doc.created_at,
      period.month,
      period.year
    )
  }, [documents, period.month, period.year])

  const periodLabel = getMonthLabel(period.month, period.year)

  const stats = useMemo(() => {
    const totalEntities = filteredEntities.length
    const activeEntities = filteredEntities.filter((item) => item.is_active !== false).length
    const inactiveEntities = totalEntities - activeEntities
    const approvedDocuments = filteredDocuments.filter((doc) => doc.validation_status === 'approved' || doc.validation_status === 'validated').length
    const pendingDocuments = filteredDocuments.filter((doc) => doc.validation_status === 'pending').length
    const rejectedDocuments = filteredDocuments.filter((doc) => doc.validation_status === 'rejected').length
    const expiringSoon = filteredDocuments.filter((doc) => {
      if (!doc.expiration_date) return false
      const exp = new Date(doc.expiration_date)
      const now = new Date()
      const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return days >= 0 && days <= 30
    }).length
    const oldestPending = filteredDocuments
      .filter((doc) => doc.validation_status === 'pending')
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())[0]

    return {
      total: filteredDocuments.length,
      activos: activeEntities,
      inactivos: inactiveEntities,
      conDocumentos: approvedDocuments,
      sinDocumentos: Math.max(filteredDocuments.length - approvedDocuments, 0),
      approved: approvedDocuments,
      pending: pendingDocuments,
      rejected: rejectedDocuments,
      expiring: expiringSoon,
      oldestPending,
    }
  }, [filteredEntities, filteredDocuments])

  const completionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
  const riskRate = stats.total > 0 ? Math.round(((stats.sinDocumentos + stats.expiring) / stats.total) * 100) : 0
  const expiredCount = filteredDocuments.filter((doc) => {
    if (!doc.expiration_date) return false
    return new Date(doc.expiration_date).getTime() < Date.now()
  }).length

  const handleAnalysisRequest = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            ...filteredEntities,
            ...filteredDocuments.map((doc) => ({
              ...doc,
              type: 'document',
            })),
          ],
          stats: {
            ...stats,
            period: period,
          },
          periodLabel,
          reportType: type,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate analysis')
      const result = await response.json()
      setAnalysis((prev) => ({ ...prev, [type]: result.analysis }))
    } catch (error) {
      console.error('[v0] Error generating analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      id: 'summary',
      label: 'Resumen Ejecutivo',
      icon: FileText,
      description: 'Visión general del período seleccionado',
      color: 'from-blue-600/20 to-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      id: 'compliance',
      label: 'Cumplimiento',
      icon: CheckCircle2,
      description: 'Análisis detallado del cumplimiento del período',
      color: 'from-green-600/20 to-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      id: 'risk',
      label: 'Análisis de Riesgos',
      icon: AlertCircle,
      description: 'Riesgos visibles dentro del mes/año filtrado',
      color: 'from-orange-600/20 to-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      id: 'alerts',
      label: 'Alertas Críticas',
      icon: TrendingUp,
      description: 'Alertas operacionales del período',
      color: 'from-red-600/20 to-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              Reportes ejecutivos mensuales
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Filtra por mes y año para ver la foto real del negocio</h2>
              <p className="text-sm md:text-base text-slate-300 mt-2">
                Usa un período puntual para comparar cumplimiento, riesgos y actividad operativa sin ruido de rangos fijos.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="min-h-[98px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Total filtrado</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
                <p className="mt-1 text-xs text-slate-400">Registros dentro del período</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Cumplimiento</p>
                <p className="mt-2 text-3xl font-bold text-emerald-200">{completionRate}%</p>
                <p className="mt-1 text-xs text-emerald-200/70">{stats.approved} aprobados</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-300/80">Riesgo activo</p>
                <p className="mt-2 text-3xl font-bold text-orange-200">{riskRate}%</p>
                <p className="mt-1 text-xs text-orange-200/70">{stats.sinDocumentos + stats.expiring} requieren atención</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xl lg:max-w-none lg:w-auto">
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Datos</p>
              <p className="text-sm font-semibold text-white mt-1">Documentos y ejecutivas reales</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Enfoque</p>
              <p className="text-sm font-semibold text-white mt-1">Acciones priorizadas</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Lectura</p>
              <p className="text-sm font-semibold text-white mt-1">Cumplimiento y riesgo</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Filtro</p>
              <p className="text-sm font-semibold text-white mt-1">Mes / año</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <HelpBox
        title="Reportes y Análisis"
        description="Genera reportes profesionales impulsados por IA. Obtén insights sobre cumplimiento, riesgos y alertas críticas."
        variant="info"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Periodo activo</p>
          <p className="text-lg font-semibold text-white mt-1">{periodLabel}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">Cumplimiento</p>
          <p className="text-lg font-semibold text-emerald-200 mt-1">{completionRate}%</p>
        </div>
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300/80">Riesgo</p>
          <p className="text-lg font-semibold text-orange-200 mt-1">{riskRate}%</p>
        </div>
      </div>

      <Card className="border-slate-700/60 bg-slate-900/70 shadow-lg shadow-slate-950/10">
        <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado actual</p>
            <p className="text-lg font-semibold text-white">{periodLabel}</p>
            <p className="text-sm text-slate-400">
              {stats.total} documentos filtrados, {stats.expiring} por vencer y {stats.pending} pendientes.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-white mt-1">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300/80">Por vencer</p>
                <p className="text-2xl font-semibold text-orange-200 mt-1">{stats.expiring}</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">Pendientes</p>
                <p className="text-2xl font-semibold text-amber-200 mt-1">{stats.pending}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => void loadData()}
            disabled={refreshing || loading}
            className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar datos
          </Button>
        </CardContent>
      </Card>

      <DatePeriodFilter value={period} onChange={setPeriod} onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-800/40 border-slate-700/50">
          <p className="text-xs text-slate-400 font-medium">PERÍODO ACTIVO</p>
          <p className="text-xl font-bold text-white mt-1">{periodLabel}</p>
          <p className="text-sm text-slate-300 mt-2">Resumen preparado para revisión ejecutiva.</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-900/20 to-slate-800/40 border-emerald-500/30">
          <p className="text-xs text-emerald-300/80 font-medium">CUMPLIMIENTO</p>
          <p className="text-3xl font-bold text-emerald-300 mt-1">{completionRate}%</p>
          <p className="text-sm text-slate-300 mt-2">{stats.approved} aprobados de {stats.total} documentos filtrados.</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-900/20 to-slate-800/40 border-orange-500/30">
          <p className="text-xs text-orange-300/80 font-medium">RIESGO ACTIVO</p>
          <p className="text-3xl font-bold text-orange-300 mt-1">{riskRate}%</p>
          <p className="text-sm text-slate-300 mt-2">{stats.sinDocumentos + stats.expiring} elementos requieren atención hoy.</p>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
        <span className="font-semibold text-white">Consejo rápido:</span> cambia el mes o el año para refrescar la lectura sin perder contexto histórico.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">TOTAL REGISTROS</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-green-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">CUMPLIMIENTO</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {stats.total > 0 ? ((stats.conDocumentos / stats.total) * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">EN RIESGO</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{stats.sinDocumentos + stats.expiring}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">TASA ACTIVOS</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {stats.activos + stats.inactivos > 0 ? ((stats.activos / (stats.activos + stats.inactivos)) * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500/50" />
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-slate-900/80 border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-semibold text-white">Siguiente mejor acción</p>
            </div>
            <p className="text-sm text-slate-300">
              {stats.expiring > 0
                ? `Hay ${stats.expiring} documentos por vencer y ${stats.pending} pendientes de revisión.`
                : `No hay vencimientos inmediatos; revisa los pendientes y el historial del período.`}
            </p>
            {stats.oldestPending && (
              <Badge variant="outline" className="w-fit border-orange-500/30 text-orange-300 bg-orange-500/10">
                Más antiguo pendiente: {stats.oldestPending.original_filename || stats.oldestPending.document_type || 'Documento'}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/company/documentos/vencidos">
              <Button variant="outline" className="gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10">
                Ver vencidos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/company/documentos/renovar">
              <Button variant="outline" className="gap-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                Planificar renovaciones
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/company/documentos/pendientes">
              <Button variant="outline" className="gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                Revisar pendientes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => handleAnalysisRequest(type.id)}
              disabled={loading}
              className={`p-4 rounded-lg border transition-all text-left group ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'
              } ${type.borderColor} bg-gradient-to-br ${type.color}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${type.textColor}`} />
                <div>
                  <p className="font-semibold text-sm text-white">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAnalysisPanel
            analysis={analysis}
            onAnalysisRequest={handleAnalysisRequest}
            loading={loading}
            hasData={filteredDocuments.length > 0 || filteredEntities.length > 0}
          />
        </div>

        <Card className="p-6 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-800/30 border-slate-700/50">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            Tareas sugeridas
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Revisar vencidos</p>
              <p className="text-xl font-bold text-red-400 mt-1">{stats.expiring}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Pendientes críticos</p>
              <p className="text-xl font-bold text-blue-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Documentos aprobados</p>
              <p className="text-xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Ver historial</p>
              <p className="text-xl font-bold text-slate-300 mt-1">{periodLabel}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/10 text-slate-300 gap-2"
          >
            <Download className="w-3 h-3 mr-2" />
            Descargar PDF
          </Button>
        </Card>
      </div>
    </div>
  )
}
