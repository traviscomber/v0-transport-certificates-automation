'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, Users, Zap, DollarSign, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react'

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
const AUTHORIZED_KEY = 'labbe2026'

export default function ROIMetricsPage() {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keyError, setKeyError] = useState('')

  useEffect(() => {
    // Check if user is authorized from session storage
    const authorized = sessionStorage.getItem('roi-metrics-authorized') === 'true'
    setIsAuthorized(authorized)
  }, [])

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyError('')

    if (keyInput === AUTHORIZED_KEY) {
      setIsAuthorized(true)
      sessionStorage.setItem('roi-metrics-authorized', 'true')
      setKeyInput('')
      setShowKey(false)
    } else {
      setKeyError('Clave incorrecta. Por favor intenta de nuevo.')
      setKeyInput('')
    }
  }

  const fetchMetrics = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({ month: period.month, year: period.year })
      const response = await fetch(`/api/metrics/roi?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.text()
        console.log('[v0] ROI API Error:', response.status, errorData)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] ROI Metrics loaded:', data)
      setMetrics(data)
    } catch (err: any) {
      console.error('[v0] Error fetching ROI metrics:', err.message)
      setMetrics(null)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year])

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg border-b-2 border-primary">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-6 w-6" />
              Acceso Restringido
            </CardTitle>
            <CardDescription className="text-white/80">
              Ingresa la clave para ver el reporte de ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="key-input" className="block text-sm font-medium text-gray-700">
                  Clave de Acceso
                </label>
                <div className="relative">
                  <Input
                    id="key-input"
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Ingresa la clave"
                    className="pr-10 border-gray-300 focus:border-primary"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {keyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                  {keyError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
              >
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin">
            <Zap className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Calculando metricas en tiempo real...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ROI & Eficiencia del Sistema
            </CardTitle>
            <CardDescription className="text-white/80">
              El panel se actualiza por mes y año segun la sesion activa.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}
            <Button onClick={fetchMetrics} className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Actualizando...' : 'Reintentar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const periodLabel = getMonthLabel(period.month, period.year)
  const documentDistribution = [
    { name: 'Con IA', value: metrics.documentsWithAI, fill: COLORS[0] },
    { name: 'Manual', value: metrics.documentsManual, fill: COLORS[1] },
  ]
  const statusDistribution = [
    { name: 'Aprobados', value: metrics.documentsApproved || 0, fill: COLORS[1] },
    { name: 'Rechazados', value: metrics.documentsRejected || 0, fill: COLORS[2] },
    { name: 'Pendientes', value: metrics.documentsPending || 0, fill: COLORS[3] },
  ]
  const speedComparison = [
    { name: 'IA', value: metrics.processingSpeedAI },
    { name: 'Manual', value: metrics.processingSpeedManual },
  ]

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            ROI & Eficiencia del Sistema
          </h1>
          <p className="text-gray-600 mt-1">Analisis completo de ahorro y productividad basado en datos reales de Labbe</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMetrics}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <DatePeriodFilter
        value={period}
        onChange={setPeriod}
        onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      <Card className="border-slate-200">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase text-gray-500 font-medium">Periodo activo</p>
            <p className="text-lg font-semibold text-foreground">{periodLabel}</p>
          </div>
          <p className="text-sm text-gray-600">
            El calculo financiero sigue el mismo mes/anio que documentos y reportes.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-xl">Conclusion Ejecutiva</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-primary mb-2">{metrics.roi.message}</p>
          <p className="text-gray-600">
            El sistema automatizado ha permitido procesar {metrics.totalDocumentsProcessed.toLocaleString('es-CL')} documentos con una velocidad {Math.round(metrics.speedMultiplier)}x superior a la revision manual.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Documentos Procesados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.totalDocumentsProcessed.toLocaleString('es-CL')}</div>
            <p className="text-xs text-gray-500 mt-1">{metrics.documentsWithAI} con IA • {metrics.documentsManual} manual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Horas Ahorradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{Math.round(metrics.roi.hoursPerMonthSaved).toLocaleString('es-CL')}</div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(metrics.totalTimeSavedDays)} dias de trabajo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Ejecutivas Equivalentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.roi.equivalentExecutives.toLocaleString('es-CL', { minimumFractionDigits: 1 })}</div>
            <p className="text-xs text-gray-500 mt-1">de {metrics.totalExecutives} en planilla</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Ahorro Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">CLP ${Math.round(metrics.roi.yearlySavingsCLP / 1000000)}M</div>
            <p className="text-xs text-gray-500 mt-1">{metrics.costSavingAsPercentageOfPayroll}% del presupuesto de ejecutivas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analisis de Tiempo por Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revision Manual (Sin IA)</span>
                <span className="text-lg font-bold text-foreground">{metrics.averageTimePerDocumentMinutesManual} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">IA + Validacion</span>
                <span className="text-lg font-bold text-foreground">{metrics.averageTimePerDocumentMinutesWithAI} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-l-2 border-l-primary">
                <span className="text-sm font-bold text-foreground">Tiempo Ahorrado por Doc</span>
                <span className="text-lg font-bold text-primary">{Math.round(metrics.timeSavedPerDocumentMinutes)} min</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p>Total ahorrado: <strong>{Math.round(metrics.totalTimeSavedHours).toLocaleString('es-CL')} horas</strong> en {metrics.totalDocumentsProcessed} documentos</p>
            </div>
          </CardContent>
        </Card>

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
              <p className="text-sm text-gray-700">El sistema IA es <strong className="text-primary text-lg">{Math.round(metrics.speedMultiplier)}x</strong> mas rapido</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion de Documentos</CardTitle>
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
                    <Cell key={`doc-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => (value || 0).toLocaleString('es-CL')} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precision del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Exito IA</span>
                <span className="text-lg font-bold text-secondary">{metrics.aiSuccessRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Precision del Sistema</span>
                <span className="text-lg font-bold text-primary">{metrics.systemAccuracy}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Aprobacion</span>
                <span className="text-lg font-bold text-secondary">{metrics.approvalRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tasa de Rechazo</span>
                <span className="text-lg font-bold text-red-600">{metrics.rejectionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => (value || 0).toLocaleString('es-CL')} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capacidad de Procesamiento por Ejecutiva</CardTitle>
          <CardDescription>Documentos que puede procesar cada ejecutiva manualmente vs. con el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Por Mes (Manual)</p>
              <p className="text-3xl font-bold text-foreground">{Math.round(metrics.docsPerExecutiveMonthly).toLocaleString('es-CL')}</p>
              <p className="text-xs text-gray-500 mt-2">documentos por mes</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border-l-2 border-l-primary">
              <p className="text-sm text-gray-600 mb-1">Incremento con IA</p>
              <p className="text-3xl font-bold text-primary">~{Math.round((metrics.totalDocumentsProcessed / metrics.totalExecutives) / (metrics.docsPerExecutiveMonthly / 12)).toLocaleString('es-CL')}</p>
              <p className="text-xs text-gray-500 mt-2">documentos por mes</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Incremento de Capacidad</p>
              <p className="text-3xl font-bold text-secondary">+{Math.round(((metrics.totalDocumentsProcessed / metrics.totalExecutives) / (metrics.docsPerExecutiveMonthly / 12) - 1) * 100)}%</p>
              <p className="text-xs text-gray-500 mt-2">mas documentos procesados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>Impacto Financiero</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Ahorro Mensual</p>
            <p className="text-3xl font-bold text-foreground">CLP ${Math.round(metrics.roi.monthlySavingsCLP / 1000000)}M</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Ahorro Anual</p>
            <p className="text-3xl font-bold text-primary">CLP ${Math.round(metrics.roi.yearlySavingsCLP / 1000000)}M</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">% del Presupuesto de Ejecutivas</p>
            <p className="text-3xl font-bold text-secondary">{metrics.costSavingAsPercentageOfPayroll}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
