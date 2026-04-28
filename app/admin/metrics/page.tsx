'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, TrendingUp, FileCheck, Clock, Zap, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ExecutiveMetrics {
  executive_id: string
  executive_name: string
  documents_processed: number
  approval_rate: number
  avg_validation_time: number
  avg_ai_confidence: number
  ai_insights?: string
}

interface MetricsSummary {
  total_documents: number
  documents_increase: number
  avg_approval_rate: number
  avg_validation_time: number
}

interface MetricsData {
  executives: ExecutiveMetrics[]
  summary: MetricsSummary
}

export default function MetricsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState<Set<string>>(new Set())
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')
  const [debugRutInput, setDebugRutInput] = useState('')
  const [debugData, setDebugData] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  const CORRECT_PASSWORD = 'mono2026'
  const supabase = createClient()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      fetchMetrics()
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      console.log('[v0] Fetching metrics with timeRange:', timeRange)
      const res = await fetch(`/api/company/metrics?range=${timeRange}`)
      console.log('[v0] Metrics API response status:', res.status)
      
      if (!res.ok) {
        console.error('[v0] Metrics API error status:', res.status)
        throw new Error('Error fetching metrics')
      }
      
      const json = await res.json()
      console.log('[v0] Metrics API response:', json)
      setData(json)
    } catch (err) {
      console.error('[v0] Error fetching metrics:', err)
      setError('Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics()
      
      // Set up real-time subscription to uploaded_documents changes
      console.log('[v0] Setting up real-time subscription for metrics')
      const channel = supabase
        .channel('uploaded_documents_changes_metrics')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events: INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'uploaded_documents',
          },
          (payload) => {
            console.log('[v0] Document change detected on metrics page:', payload.eventType)
            // Refetch metrics when any document change occurs
            fetchMetrics()
          }
        )
        .subscribe((status) => {
          console.log('[v0] Subscription status on metrics page:', status)
        })

      // Store unsubscribe function
      unsubscribeRef.current = () => channel.unsubscribe()

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    }
  }, [timeRange, isAuthenticated, supabase])

  const fetchDebugData = async () => {
    try {
      console.log('[v0] Fetching debug data...')
      const res = await fetch('/api/company/documents/debug')
      const json = await res.json()
      console.log('[v0] Debug data:', json)
      setDebugData(json)
      setShowDebug(true)
    } catch (err) {
      console.error('[v0] Error fetching debug data:', err)
    }
  }

  const fetchDebugByRut = async (rut: string) => {
    try {
      console.log('[v0] Fetching debug data for RUT:', rut)
      const res = await fetch(`/api/company/documents/debug?rut=${encodeURIComponent(rut)}`)
      const json = await res.json()
      console.log('[v0] Debug data for RUT:', json)
      setDebugData(json)
      setShowDebug(true)
    } catch (err) {
      console.error('[v0] Error fetching debug data:', err)
    }
  }

  const generateAIInsights = async (executive: ExecutiveMetrics) => {
    try {
      console.log('[v0] Generating AI insights for:', executive.executive_name)
      setGeneratingInsights(prev => new Set(prev).add(executive.executive_id))
      
      const prompt = `Analiza el desempeño de la ejecutiva "${executive.executive_name}" basado en estos datos:
- Documentos procesados: ${executive.documents_processed}
- Tasa de aprobación: ${executive.approval_rate}%
- Tiempo promedio de validación: ${executive.avg_validation_time}s
- Confianza IA promedio: ${executive.avg_ai_confidence}%

Proporciona 2-3 insights accionables y específicos para mejorar su desempeño.`

      console.log('[v0] OpenAI API Key available:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      console.log('[v0] OpenAI response status:', response.status)

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('[v0] OpenAI response:', result)
      const insights = result.choices[0].message.content

      // Update the data with insights
      setData(prev => {
        if (!prev) return null
        return {
          ...prev,
          executives: prev.executives.map(exec => 
            exec.executive_id === executive.executive_id
              ? { ...exec, ai_insights: insights }
              : exec
          )
        }
      })
    } catch (err) {
      console.error('[v0] Error generating insights:', err)
    } finally {
      setGeneratingInsights(prev => {
        const newSet = new Set(prev)
        newSet.delete(executive.executive_id)
        return newSet
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500/20 p-4 rounded-full">
                <Lock className="w-7 h-7 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Panel de Admin</CardTitle>
            <p className="text-slate-400 text-sm">Métricas internas de Transportes Labbe</p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Clave de acceso</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la clave"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando métricas reales...</p>
        </div>
      </div>
    )
  }

  const { executives, summary } = data

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Admin — Métricas Labbe</h1>
            <p className="text-slate-400 text-sm mt-1">Data en tiempo real desde Supabase + OpenAI Insights</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={() => { setIsAuthenticated(false); router.push('/dashboard/company') }}
          >
            Salir
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-orange-500 hover:bg-orange-600' : 'border-slate-600'}
            >
              {range === 'day' ? 'Hoy' : range === 'week' ? 'Esta Semana' : 'Este Mes'}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDebugData}
            className="border-slate-600 ml-auto"
          >
            🐛 Debug Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Documentos</p>
                  <p className="text-3xl font-bold text-white mt-2">{summary.total_documents}</p>
                </div>
                <FileCheck className="w-10 h-10 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tasa Aprobación</p>
                  <p className="text-3xl font-bold text-white mt-2">{summary.avg_approval_rate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tiempo Promedio</p>
                  <p className="text-3xl font-bold text-white mt-2">{summary.avg_validation_time}s</p>
                </div>
                <Clock className="w-10 h-10 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ejecutivas Activas</p>
                  <p className="text-3xl font-bold text-white mt-2">{executives.length}</p>
                </div>
                <Activity className="w-10 h-10 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        {showDebug && debugData && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Debug Data - Documentos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingresa RUT del conductor (ej: 18012757-7)"
                  value={debugRutInput}
                  onChange={(e) => setDebugRutInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                <Button
                  size="sm"
                  onClick={() => fetchDebugByRut(debugRutInput)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Buscar
                </Button>
              </div>
              <pre className="bg-slate-900 p-4 rounded text-xs text-slate-300 overflow-auto max-h-96">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Ejecutivas List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Ejecutivas Labbe ({executives.length})</h2>
          {executives.map((executive, idx) => (
            <Card key={executive.executive_id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{executive.executive_name}</p>
                        <p className="text-xs text-slate-400">ID: {executive.executive_id}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                      onClick={() => generateAIInsights(executive)}
                      disabled={generatingInsights.has(executive.executive_id)}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {generatingInsights.has(executive.executive_id) ? 'Analizando...' : 'IA Insights'}
                    </Button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs">Documentos</p>
                      <p className="text-2xl font-bold text-white mt-1">{executive.documents_processed}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs">Tasa Aprobación</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{executive.approval_rate}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs">Tiempo Promedio</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">{executive.avg_validation_time}s</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs">Confianza IA</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">{executive.avg_ai_confidence}%</p>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {executive.ai_insights && (
                    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg p-4">
                      <div className="flex gap-2 items-start">
                        <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-orange-400 mb-1">Insights IA</p>
                          <p className="text-sm text-slate-300">{executive.ai_insights}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
