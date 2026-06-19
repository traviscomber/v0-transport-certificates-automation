'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, FileCheck, TrendingUp, Users, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  }>
}

export default function MetricsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [metrics, setMetrics] = useState<ExecutiveMetrics[]>([])
  const [summary, setSummary] = useState({
    total_documentos: 0,
    total_validados: 0,
    total_conductores: 0,
    total_subcontratistas: 0,
  })
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const CORRECT_PASSWORD = 'mono2026'
  const supabase = createClient()

  const handleAuth = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      // Get document metrics which now includes all executives
      const metricsResponse = await fetch(`/api/company/metrics?month=${period.month}&year=${period.year}`)
      const metricsData = await metricsResponse.json()

      // Fetch from /api/dashboard/data for counts
      const dashboardResponse = await fetch('/api/dashboard/data', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      })
      const dashboardData = await dashboardResponse.json()
      const conductores = dashboardData.dashboard?.conductores || []
      const transportistas = dashboardData.dashboard?.transportistas || []

      // Use metrics data directly - API already has all executives with proper formatting
      const executivesMetrics: ExecutiveMetrics[] = metricsData.executives || []

      // Update summary with real counts
      setSummary({
        total_documentos: metricsData.summary?.total_documentos || 0,
        total_validados: metricsData.summary?.total_validados || 0,
        total_conductores: metricsData.summary?.total_conductores || conductores.length || 0,
        total_subcontratistas: metricsData.summary?.total_subcontratistas || transportistas.length || 0,
      })

      setMetrics(executivesMetrics)
    } catch (error) {
      // Error handling for metrics fetch
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics()
    }
  }, [period.month, period.year, isAuthenticated])

  const periodLabel = getMonthLabel(period.month, period.year)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-slate-700 w-full max-w-md backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-full">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl">Ejecutivo</CardTitle>
            <p className="text-slate-400 text-sm mt-1">Dashboard de métricas</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Contraseña"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:bg-slate-900 transition"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                onClick={handleAuth}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
              >
                Acceder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Métricas Ejecutivas</h1>
            <p className="text-slate-400">Panel de desempeño de validación</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false)
              setPassword('')
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Salir
          </Button>
        </div>

        <DatePeriodFilter
          value={period}
          onChange={setPeriod}
          onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
        />

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Período activo</p>
              <p className="text-lg font-semibold text-white">{periodLabel}</p>
            </div>
            <p className="text-sm text-slate-400">La lectura ejecutiva queda centrada en un período mensual para evitar ruido.</p>
          </CardContent>
        </Card>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Documentos Card */}
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

          {/* Validados Card */}
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

          {/* Conductores Card */}
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

          {/* Subcontratistas Card */}
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

        {/* Executives Performance Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Desempeño por Ejecutiva</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-slate-400 mt-4">Cargando datos...</p>
              </div>
            ) : metrics.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400">Sin datos disponibles</p>
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
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">% Validación</th>
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
                                <span className={`text-sm font-bold ${
                                  m.performance_score >= 75 ? 'text-green-400' :
                                  m.performance_score >= 50 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
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
