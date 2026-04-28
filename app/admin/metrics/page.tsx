'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, FileCheck, TrendingUp, Users, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExecutiveMetrics {
  ejecutiva: string
  documentos_procesados: number
  documentos_validados: number
  tasa_validacion: string
  tiempo_promedio: string
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
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')
  const CORRECT_PASSWORD = 'mono2026'
  const supabase = createClient()
  const unsubscribeRef = useRef<(() => void) | null>(null)

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
      const response = await fetch(`/api/company/metrics?range=${timeRange}`)
      const data: MetricsResponse = await response.json()
      
      // Process summary
      setSummary(data.summary || {
        total_documentos: 0,
        total_validados: 0,
        total_conductores: 0,
        total_subcontratistas: 0,
      })

      // Process executives - use correct field names from API
      const executivesMetrics: ExecutiveMetrics[] = (data.executives || [])
        .filter((exec: any) => exec.documentos_procesados > 0) // Only show executives with documents
        .map((exec: any) => ({
          ejecutiva: exec.ejecutiva || 'Sin nombre',
          documentos_procesados: exec.documentos_procesados || 0,
          documentos_validados: exec.documentos_validados || 0,
          tasa_validacion: exec.tasa_validacion || '0%',
          tiempo_promedio: exec.tiempo_promedio || '—',
        }))
      
      setMetrics(executivesMetrics)
    } catch (error) {
      console.error('[v0] Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics()

      // Real-time subscription
      const channel = supabase
        .channel('metrics_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'uploaded_documents' },
          () => fetchMetrics()
        )
        .subscribe()

      unsubscribeRef.current = () => channel.unsubscribe()
      return () => unsubscribeRef.current?.()
    }
  }, [timeRange, isAuthenticated, supabase])

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

        {/* Time Range Selector */}
        <div className="flex gap-3">
          {(['day', 'week', 'month'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
              }`}
            >
              {range === 'day' && 'Hoy'}
              {range === 'week' && 'Esta Semana'}
              {range === 'month' && 'Este Mes'}
            </Button>
          ))}
        </div>

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
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-4 text-slate-300 font-semibold text-sm">Ejecutiva</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-sm">Documentos</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-sm">Validados</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-sm">Tasa</th>
                      <th className="text-right py-4 px-4 text-slate-300 font-semibold text-sm">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="py-4 px-4 text-white font-medium">{m.ejecutiva}</td>
                        <td className="py-4 px-4 text-right text-slate-300 text-sm">{m.documentos_procesados}</td>
                        <td className="py-4 px-4 text-right text-green-400 text-sm font-semibold">{m.documentos_validados}</td>
                        <td className="py-4 px-4 text-right text-orange-400 text-sm font-bold">{m.tasa_validacion}</td>
                        <td className="py-4 px-4 text-right text-slate-400 text-sm">{m.tiempo_promedio}</td>
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
