'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Clock, Users, Zap, DollarSign, Lock, Eye, EyeOff } from 'lucide-react'

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
  costSavingMonthly: number
  costSavingAnnual: number
  costSavingAsPercentageOfPayroll: number
  systemAccuracy: number
  aiSuccessRate: number
  rejectionRate: number
  approvalRate: number
  processingSpeedAI: number
  processingSpeedManual: number
  speedMultiplier: number
  docsPerExecutiveMonthly: number
  roi: {
    message: string
    equivalentExecutives: number
    monthlySavingsCLP: number
    yearlySavingsCLP: number
    documentsProcessedPerDay: number
    hoursPerMonthSaved: number
  }
}

const COLORS = ['#FF7A35', '#27AB9C', '#E74C3C', '#F39C12', '#3498DB']

export default function ROIMetricsPage() {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    if (password === 'mono2026') {
      setAuthenticated(true)
      setError('')
      fetchMetrics()
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/metrics/roi', {
        headers: {
          'Authorization': 'Bearer mono2026'
        }
      })
      
      if (!response.ok) {
        throw new Error('Error fetching metrics')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching ROI metrics:', error)
      setError('Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Acceso a ROI Metrics
            </CardTitle>
            <CardDescription className="text-white/80">
              Ingresa la contraseña para ver métricas de eficiencia
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  placeholder="Ingresa la clave"
                  className="pr-10"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
            
            <Button
              onClick={handleAuth}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Desbloquear
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin">
            <Zap className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Calculando métricas en tiempo real...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 font-medium">Error al cargar las métricas</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare chart data
  const documentDistribution = [
    { name: 'Con IA', value: metrics.documentsWithAI, fill: COLORS[0] },
    { name: 'Manual', value: metrics.documentsManual, fill: COLORS[1] }
  ]

  const statusDistribution = [
    { name: 'Aprobados', value: metrics.documentsApproved || 0, fill: COLORS[1] },
    { name: 'Rechazados', value: metrics.documentsRejected || 0, fill: COLORS[2] },
    { name: 'Pendientes', value: metrics.documentsPending || 0, fill: COLORS[3] }
  ]

  const speedComparison = [
    { name: 'IA', value: metrics.processingSpeedAI },
    { name: 'Manual', value: metrics.processingSpeedManual }
  ]

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            ROI & Eficiencia del Sistema
          </h1>
          <p className="text-gray-600 mt-1">Análisis completo de ahorro y productividad basado en datos reales de Labbe</p>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-xl">Conclusión Ejecutiva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-primary mb-2">{metrics.roi.message}</p>
          <p className="text-gray-600">
            El sistema automatizado ha permitido procesar {metrics.totalDocumentsProcessed.toLocaleString('es-CL')} documentos con una velocidad {Math.round(metrics.speedMultiplier)}x superior a la revisión manual.
          </p>
        </CardContent>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documentos Procesados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Documentos Procesados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metrics.totalDocumentsProcessed.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.documentsWithAI} con IA • {metrics.documentsManual} manual
            </p>
          </CardContent>
        </Card>

        {/* Horas Ahorradas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Horas Ahorradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {Math.round(metrics.roi.hoursPerMonthSaved).toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(metrics.totalTimeSavedDays)} días de trabajo
            </p>
          </CardContent>
        </Card>

        {/* Ejecutivas Equivalentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Ejecutivas Equivalentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metrics.roi.equivalentExecutives.toLocaleString('es-CL', { minimumFractionDigits: 1 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              de {metrics.totalExecutives} en planilla
            </p>
          </CardContent>
        </Card>

        {/* Ahorro Anual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Ahorro Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              CLP ${Math.round(metrics.roi.yearlySavingsCLP / 1000000)}M
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.costSavingAsPercentageOfPayroll}% del presupuesto de ejecutivas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DETAILED METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIME ANALYSIS */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Tiempo por Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revisión Manual (Sin IA)</span>
                <span className="text-lg font-bold text-foreground">
                  {metrics.averageTimePerDocumentMinutesManual} min
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">IA + Validación</span>
                <span className="text-lg font-bold text-foreground">
                  {metrics.averageTimePerDocumentMinutesWithAI} min
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-l-2 border-l-primary">
                <span className="text-sm font-bold text-foreground">Tiempo Ahorrado por Doc</span>
                <span className="text-lg font-bold text-primary">
                  {Math.round(metrics.timeSavedPerDocumentMinutes)} min
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p>Total ahorrado: <strong>{Math.round(metrics.totalTimeSavedHours).toLocaleString('es-CL')} horas</strong> en {metrics.totalDocumentsProcessed} documentos</p>
            </div>
          </CardContent>
        </Card>

        {/* PROCESSING SPEED */}
        <Card>
          <CardHeader>
            <CardTitle>Velocidad de Procesamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={speedComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Docs/Hora', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value} docs/hora`} />
                <Bar dataKey="value" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
              <p className="text-sm text-gray-700">
                El sistema IA es <strong className="text-primary text-lg">{Math.round(metrics.speedMultiplier)}x</strong> más rápido
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DOCUMENT DISTRIBUTION */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={documentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {documentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => (value || 0).toLocaleString('es-CL')} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SYSTEM ACCURACY */}
        <Card>
          <CardHeader>
            <CardTitle>Precisión del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Éxito IA</span>
                <span className="text-lg font-bold text-secondary">{metrics.aiSuccessRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Precisión del Sistema</span>
                <span className="text-lg font-bold text-primary">{metrics.systemAccuracy}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Aprobación</span>
                <span className="text-lg font-bold text-secondary">{metrics.approvalRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Rechazo</span>
                <span className="text-lg font-bold text-red-600">{metrics.rejectionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EXECUTIVE CAPACITY */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidad de Procesamiento por Ejecutiva</CardTitle>
          <CardDescription>
            Documentos que puede procesar cada ejecutiva manualmente vs. con el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Por Mes (Manual)</p>
              <p className="text-3xl font-bold text-foreground">
                {Math.round(metrics.docsPerExecutiveMonthly).toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-gray-500 mt-2">documentos por mes</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border-l-2 border-l-primary">
              <p className="text-sm text-gray-600 mb-1">Incremento con IA</p>
              <p className="text-3xl font-bold text-primary">
                ~{Math.round((metrics.totalDocumentsProcessed / metrics.totalExecutives) / (metrics.docsPerExecutiveMonthly / 12)).toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-gray-500 mt-2">documentos por mes</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Incremento de Capacidad</p>
              <p className="text-3xl font-bold text-secondary">
                +{Math.round(((metrics.totalDocumentsProcessed / metrics.totalExecutives) / (metrics.docsPerExecutiveMonthly / 12) - 1) * 100)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">más documentos procesados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FINANCIAL IMPACT */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>Impacto Financiero</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Ahorro Mensual</p>
            <p className="text-3xl font-bold text-foreground">
              CLP ${Math.round(metrics.roi.monthlySavingsCLP / 1000000)}M
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Ahorro Anual</p>
            <p className="text-3xl font-bold text-primary">
              CLP ${Math.round(metrics.roi.yearlySavingsCLP / 1000000)}M
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">% del Presupuesto de Ejecutivas</p>
            <p className="text-3xl font-bold text-secondary">
              {metrics.costSavingAsPercentageOfPayroll}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
