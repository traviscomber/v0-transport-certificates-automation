'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, Users, Zap, DollarSign } from 'lucide-react'

interface ROIMetrics {
  totalDocumentsProcessed: number
  documentsWithAI: number
  documentsManual: number
  totalTimeSavedHours: number
  averageTimePerDocumentMinutes: number
  executivesEquivalent: number
  totalExecutives: number
  documentsByExecutive: number
  systemAccuracy: number
  rejectionRate: number
  approvalRate: number
  processingSpeedDocsPerHour: number
  costSavingMonthly: number
}

export default function ROIMetricsPage() {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/roi')
      const data = await response.json()
      setMetrics(data)
      
      // Prepare chart data
      const monthlyData = data.monthlyTrend || []
      setChartData(monthlyData)
    } catch (error) {
      console.error('Error fetching ROI metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Calculando métricas...</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error al cargar las métricas</p>
      </div>
    )
  }

  const timeSavedPerDay = metrics.totalTimeSavedHours / 30 // Assuming monthly calculation
  const capacityIncrease = ((metrics.totalDocumentsProcessed / (metrics.totalExecutives * metrics.documentsByExecutive)) - 1) * 100

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ROI y Eficiencia del Sistema</h1>
          <p className="text-gray-600 mt-1">Métricas de ahorro y productividad basadas en datos reales</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Última actualización</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('es-CL')}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documents Processed */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Documentos Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.totalDocumentsProcessed.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-2">+{metrics.documentsWithAI} con IA</p>
          </CardContent>
        </Card>

        {/* Time Saved */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tiempo Ahorrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.totalTimeSavedHours.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">{timeSavedPerDay.toFixed(0)} horas/día aprox.</p>
          </CardContent>
        </Card>

        {/* Ejecutivas Equivalentes */}
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ejecutivas Equivalentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.executivesEquivalent.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-2">De {metrics.totalExecutives} actuales</p>
          </CardContent>
        </Card>

        {/* Cost Savings */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ahorro Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">CLP ${(metrics.costSavingMonthly / 1000).toFixed(0)}K</div>
            <p className="text-xs text-gray-500 mt-2">Equivalente a nómina ejecutiva</p>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Processing Speed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Velocidad de Procesamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.processingSpeedDocsPerHour}</div>
            <p className="text-xs text-gray-600 mt-2">documentos/hora</p>
            <p className="text-xs text-gray-500 mt-3">Manual: ~2-3 docs/hora</p>
          </CardContent>
        </Card>

        {/* System Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Precisión del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.systemAccuracy}%</div>
            <p className="text-xs text-gray-600 mt-2">documentos validados correctamente</p>
            <p className="text-xs text-gray-500 mt-3">Rechazo: {metrics.rejectionRate}%</p>
          </CardContent>
        </Card>

        {/* Capacity Increase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aumento de Capacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">+{capacityIncrease.toFixed(0)}%</div>
            <p className="text-xs text-gray-600 mt-2">vs. procesamiento manual</p>
            <p className="text-xs text-gray-500 mt-3">{metrics.documentsByExecutive} docs por ejecutiva (antes)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Documentos</CardTitle>
            <CardDescription>Por estado de validación</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Aprobados', value: metrics.approvalRate },
                    { name: 'Rechazados', value: metrics.rejectionRate },
                    { name: 'Pendientes', value: 100 - metrics.approvalRate - metrics.rejectionRate }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Procesamiento: Manual vs IA</CardTitle>
            <CardDescription>Documentos por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Manual', value: 2.5, fill: '#6366f1' },
                { name: 'Con IA', value: metrics.processingSpeedDocsPerHour, fill: '#22c55e' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Box */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cantidad de documentos procesados con éxito</p>
              <p className="text-2xl font-bold text-foreground">{metrics.documentsWithAI.toLocaleString()} documentos</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Equivalente a ejecutivas que podrían prescindir</p>
              <p className="text-2xl font-bold text-foreground">{metrics.executivesEquivalent.toFixed(1)} personas</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tiempo total ahorrado al equipo</p>
              <p className="text-2xl font-bold text-foreground">{metrics.totalTimeSavedHours.toLocaleString()} horas</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ahorro mensual en nómina</p>
              <p className="text-2xl font-bold text-foreground">CLP ${(metrics.costSavingMonthly / 1000).toFixed(0)}K</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 border-t border-gray-300 pt-4 mt-4">
            <strong>Conclusión:</strong> El sistema de análisis automatizado con IA permite procesar documentos {(metrics.processingSpeedDocsPerHour / 2.5).toFixed(1)}x más rápido que lo manual, 
            lo que equivale a tener {metrics.executivesEquivalent.toFixed(1)} ejecutivas adicionales sin costo de nómina.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
