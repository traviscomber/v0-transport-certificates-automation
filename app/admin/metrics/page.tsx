'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, FileCheck, TrendingUp, Clock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExecutiveMetrics {
  ejecutiva: string
  documentos_procesados: number
  documentos_validados: number
  tasa_validacion: string
  tiempo_promedio: string
}

interface MetricsSummary {
  total_documentos: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
}

export default function MetricsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [metrics, setMetrics] = useState<ExecutiveMetrics[]>([])
  const [summary, setSummary] = useState<MetricsSummary>({
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
      const data = await response.json()
      setMetrics(data.executives || [])
      setSummary(data.summary || {})
    } catch (error) {
      console.error('[v0] Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics()

      // Real-time subscription to document changes
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Lock className="w-6 h-6 text-orange-500" />
            </div>
            <CardTitle className="text-white">Métricas Ejecutivas</CardTitle>
            <p className="text-slate-400 text-sm mt-1">Panel de desempeño</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Contraseña"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                onClick={handleAuth}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Métricas</h1>
            <p className="text-slate-400 text-sm">Panel de validación de documentos</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsAuthenticated(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Salir
          </Button>
        </div>

        {/* Time Range */}
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              className={timeRange === range ? 'bg-orange-500 hover:bg-orange-600' : 'border-slate-600 text-slate-300'}
            >
              {range === 'day' && 'Hoy'}
              {range === 'week' && 'Esta Semana'}
              {range === 'month' && 'Este Mes'}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Documentos</p>
                  <p className="text-3xl font-bold text-white mt-2">{summary.total_documentos}</p>
                </div>
                <FileCheck className="text-orange-500" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Validados</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{summary.total_validados}</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Conductores</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{summary.total_conductores}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Subcontratistas</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{summary.total_subcontratistas}</p>
                </div>
                <Clock className="text-purple-500" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ejecutivas Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Desempeño por Ejecutiva</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center py-8">Cargando...</p>
            ) : metrics.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ejecutiva</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Documentos</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Validados</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Tasa</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                        <td className="py-3 px-4 text-white">{m.ejecutiva}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{m.documentos_procesados}</td>
                        <td className="py-3 px-4 text-right text-green-400">{m.documentos_validados}</td>
                        <td className="py-3 px-4 text-right text-orange-400 font-semibold">{m.tasa_validacion}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{m.tiempo_promedio}</td>
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
