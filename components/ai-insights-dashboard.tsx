'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DocumentStats {
  totalDocuments: number
  analyzedDocuments: number
  averageConfidence: number
  accuracyRate: number
  documentsByType: Array<{ type: string; count: number; accuracy: number }>
  confidenceDistribution: Array<{ range: string; count: number }>
  expirationDateAccuracy: number
  trendByDate: Array<{ date: string; total: number; accurate: number }>
  recommendations?: string[]
}

export function AIInsightsDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/company/ai-training/document-analysis')
        if (!response.ok) throw new Error('Failed to fetch stats')
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('[v0] Stats fetch error:', err)
        setError(err instanceof Error ? err.message : 'Error loading stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="text-white text-center py-12">Cargando datos...</div>
  if (error) return <div className="text-red-400 text-center py-12 bg-red-900/20 rounded p-4">{error}</div>
  if (!stats) return <div className="text-slate-400 text-center py-12">Sin datos disponibles</div>

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalDocuments}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.analyzedDocuments} analizados</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Confianza Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{Math.round(stats.averageConfidence * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Confianza del modelo</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Precisión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{Math.round(stats.accuracyRate * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Por feedback</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Detección Vencimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{Math.round(stats.expirationDateAccuracy * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Precisión de fechas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="distribution">Distribución Confianza</TabsTrigger>
          <TabsTrigger value="types">Tipos de Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribución de Confianza</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="range" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tipos de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.documentsByType.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{type.type}</p>
                      <p className="text-sm text-slate-500">{type.count} documentos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{Math.round(type.accuracy * 100)}%</p>
                      <p className="text-xs text-slate-500">precisión</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {stats.recommendations && stats.recommendations.length > 0 && (
        <Card className="bg-amber-900/20 border-amber-700/50">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.recommendations.map((rec, i) => (
                <li key={i} className="text-amber-100 text-sm">• {rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
