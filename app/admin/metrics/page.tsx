'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileCheck, TrendingUp, Users, Building2, RefreshCw } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ExecutiveMetrics {
  ejecutiva: string
  documentos_procesados: number
  documentos_validados: number
  documentos_rechazados: number
  documentos_pendientes: number
  conductores_activos: number
  tasa_validacion: string
  tasa_rechazo: string
  tiempo_promedio: string
  performance_score: number
}

interface MetricsResponse {
  summary: {
    total_documentos: number
    total_validados: number
    total_conductores: number
    total_subcontratistas: number
  }
  executives: Array<{
    executive_name: string
    documents_processed: number
    validated_count: number
    rejected_count?: number
    pending_count?: number
    conductores_activos?: number
    tasa_validacion?: string
    tasa_rechazo?: string
    tiempo_promedio?: string
    performance_score?: number
  }>
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics[]>([])
  const [summary, setSummary] = useState({
    total_documentos: 0,
    total_validados: 0,
    total_conductores: 0,
    total_subcontratistas: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const fetchMetrics = async () => {
    setLoading(true)
    setError('')

    try {
      const metricsResponse = await fetch(`/api/company/metrics?month=${period.month}&year=${period.year}`)
      if (!metricsResponse.ok) {
        throw new Error(`No se pudieron cargar las métricas (${metricsResponse.status})`)
      }

      const metricsData = (await metricsResponse.json()) as MetricsResponse

      const dashboardResponse = await fetch('/api/dashboard/data', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      })

      const dashboardData = await dashboardResponse.json()
      const conductores = dashboardData.dashboard?.conductores || []
      const transportistas = dashboardData.dashboard?.transportistas || []

      setSummary({
        total_documentos: metricsData.summary?.total_documentos || 0,
        total_validados: metricsData.summary?.total_validados || 0,
        total_conductores: metricsData.summary?.total_conductores || conductores.length || 0,
        total_subcontratistas: metricsData.summary?.total_subcontratistas || transportistas.length || 0,
      })

      const executivesMetrics: ExecutiveMetrics[] = (metricsData.executives || []).map((executive) => ({
        ejecutiva: executive.executive_name,
        documentos_procesados: executive.documents_processed,
        documentos_validados: executive.validated_count,
        documentos_rechazados: executive.rejected_count || 0,
        documentos_pendientes: executive.pending_count || 0,
        conductores_activos: executive.conductores_activos || 0,
        tasa_validacion: executive.tasa_validacion || '0%',
        tasa_rechazo: executive.tasa_rechazo || '0%',
        tiempo_promedio: executive.tiempo_promedio || '0m',
        performance_score: executive.performance_score || 0,
      }))

      setMetrics(executivesMetrics)
    } catch (fetchError: any) {
      setMetrics([])
      setSummary({
        total_documentos: 0,
        total_validados: 0,
        total_conductores: 0,
        total_subcontratistas: 0,
      })
      setError(fetchError?.message || 'No se pudieron cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMetrics()
    // Refresh on initial load and whenever the selected month/year changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year])

  const periodLabel = getMonthLabel(period.month, period.year)

  if (loading && metrics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-slate-700 w-full max-w-md backdrop-blur">
          <CardContent className="py-10 text-center space-y-3">
            <div className="inline-flex items-center justify-center rounded-full bg-orange-500/20 p-3">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
            </div>
            <p className="text-white text-lg font-semibold">Cargando metricas ejecutivas</p>
            <p className="text-slate-400 text-sm">Estamos preparando la vista mensual con datos reales.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <CardContent className="p-5 md:p-6 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                  Panel ejecutivo administrativo
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Metricas Ejecutivas</h1>
                  <p className="text-slate-300">
                    Lectura mensual de desempeno para ver documentos procesados, validacion y tamano real de la operacion.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchMetrics()}
                  disabled={loading}
                  className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-800"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Periodo</p>
                <p className="text-sm font-semibold text-white mt-1">{periodLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Cobertura</p>
                <p className="text-sm font-semibold text-white mt-1">Documentos + ejecutivas</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Uso</p>
                <p className="text-sm font-semibold text-white mt-1">Seguimiento mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DatePeriodFilter
          value={period}
          onChange={setPeriod}
          onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
        />

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Periodo activo</p>
              <p className="text-lg font-semibold text-white">{periodLabel}</p>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              La lectura ejecutiva queda centrada en un periodo mensual para evitar ruido y facilitar comparaciones reales.
            </p>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border border-red-900/50 bg-red-950/30">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-red-300">{error}</p>
              <p className="text-xs text-red-200/80 mt-1">
                Si el mensaje persiste, revisa la sesion activa o vuelve a cargar la pagina.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Documentos Procesados</p>
                  <p className="text-4xl font-bold text-white mt-2">{summary.total_documentos}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <FileCheck className="text-blue-400" size={24} />
                </div>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Validados</p>
                  <p className="text-4xl font-bold text-green-400 mt-2">{summary.total_validados}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <TrendingUp className="text-green-400" size={24} />
                </div>
              </div>
              <div className="text-slate-400 text-xs">
                Tasa: {summary.total_documentos > 0 ? Math.round((summary.total_validados / summary.total_documentos) * 100) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Conductores</p>
                  <p className="text-4xl font-bold text-purple-400 mt-2">{summary.total_conductores}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Users className="text-purple-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 hover:border-slate-600 transition">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Subcontratistas</p>
                  <p className="text-4xl font-bold text-amber-400 mt-2">{summary.total_subcontratistas}</p>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-lg">
                  <Building2 className="text-amber-400" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Desempeno por Ejecutiva</CardTitle>
            <CardDescription className="text-slate-400">
              Ordenado por score para identificar primero a quien apoyar, escalar o reconocer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-slate-400 mt-4">Cargando datos...</p>
              </div>
            ) : metrics.length === 0 ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700/80 mb-4">
                  <FileCheck className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-slate-200 font-medium">Sin datos disponibles para este periodo</p>
                <p className="text-slate-400 text-sm mt-2">
                  Prueba cambiar mes o año para encontrar actividad registrada en otro tramo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/30">
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Ejecutiva</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Procesados</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Validados</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Rechazados</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Pendientes</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Conductores</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">% Validacion</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">% Rechazo</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Tiempo Prom.</th>
                      <th className="text-center py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics
                      .sort((a, b) => b.performance_score - a.performance_score)
                      .map((m, idx) => (
                        <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition">
                          <td className="py-4 px-4 text-white font-semibold">{m.ejecutiva}</td>
                          <td className="py-4 px-4 text-right text-slate-300 text-sm">{m.documentos_procesados}</td>
                          <td className="py-4 px-4 text-right text-green-400 font-semibold">{m.documentos_validados}</td>
                          <td className="py-4 px-4 text-right text-red-400 font-semibold">{m.documentos_rechazados}</td>
                          <td className="py-4 px-4 text-right text-yellow-400 font-semibold">{m.documentos_pendientes}</td>
                          <td className="py-4 px-4 text-right text-blue-400 font-semibold">{m.conductores_activos}</td>
                          <td className="py-4 px-4 text-right text-orange-400 font-bold text-sm">{m.tasa_validacion}</td>
                          <td className="py-4 px-4 text-right text-red-500 font-medium text-sm">{m.tasa_rechazo}</td>
                          <td className="py-4 px-4 text-right text-slate-400 text-sm">{m.tiempo_promedio}</td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <div className="relative w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                <span
                                  className={`text-sm font-bold ${
                                    m.performance_score >= 75
                                      ? 'text-green-400'
                                      : m.performance_score >= 50
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                  }`}
                                >
                                  {m.performance_score}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
