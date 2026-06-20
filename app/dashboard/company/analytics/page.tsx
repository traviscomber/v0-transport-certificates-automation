'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendLineChart } from '@/components/charts/trend-line-chart'
import { DistributionPieChart } from '@/components/charts/distribution-pie-chart'
import { BarComparisonChart } from '@/components/charts/bar-comparison-chart'
import { KPICardSparkline } from '@/components/charts/kpi-card-sparkline'
import { AlertManagementPanel } from '@/components/dashboard/alert-management-panel'
import { AdvancedFilters, FilterState } from '@/components/dashboard/advanced-filters'
import { Clock, AlertCircle, CheckCircle, Users, FileText } from 'lucide-react'

export default function OperationalDashboard() {
  const [filters, setFilters] = useState<FilterState>({})
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const mockDocuments = useMemo(
    () => [
      { id: '1', type: 'Licencia', status: 'approved', expiry_date: new Date(2025, 6, 15), conductor: 'Juan' },
      { id: '2', type: 'Seguro', status: 'pending', expiry_date: new Date(2025, 8, 20), conductor: 'María' },
      { id: '3', type: 'Certificado', status: 'approved', expiry_date: new Date(2025, 10, 5), conductor: 'Pedro' },
      { id: '4', type: 'Licencia', status: 'rejected', expiry_date: new Date(2024, 3, 10), conductor: 'Ana' },
      { id: '5', type: 'Seguro', status: 'approved', expiry_date: new Date(2025, 5, 12), conductor: 'Carlos' },
    ],
    []
  )

  // Status breakdown
  const statusBreakdown = [
    { name: 'Aprobados', value: 3, percentage: '60' },
    { name: 'Pendientes', value: 1, percentage: '20' },
    { name: 'Rechazados', value: 1, percentage: '20' },
  ]

  // Type breakdown
  const typeBreakdown = [
    { name: 'Licencias', value: 2, percentage: '40' },
    { name: 'Seguros', value: 2, percentage: '40' },
    { name: 'Certificados', value: 1, percentage: '20' },
  ]

  // Daily metrics
  const dailyData = [
    { day: 'Lunes', processed: 5, approved: 4, pending: 1, rejected: 0 },
    { day: 'Martes', processed: 3, approved: 3, pending: 0, rejected: 0 },
    { day: 'Miércoles', processed: 7, approved: 5, pending: 2, rejected: 0 },
    { day: 'Jueves', processed: 4, approved: 3, pending: 1, rejected: 0 },
    { day: 'Viernes', processed: 6, approved: 5, pending: 1, rejected: 0 },
    { day: 'Sábado', processed: 2, approved: 2, pending: 0, rejected: 0 },
  ]

  // Weekly comparison
  const weeklyComparison = [
    { week: 'Semana 1', completed: 15, pending: 3, delayed: 1 },
    { week: 'Semana 2', completed: 18, pending: 2, delayed: 0 },
    { week: 'Semana 3', completed: 22, pending: 4, delayed: 1 },
  ]

  // KPIs
  const kpis = {
    totalProcessed: mockDocuments.length,
    averageTime: 2.1,
    approvalRate: 60,
    pendingReview: mockDocuments.filter((d) => d.status === 'pending').length,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard Operacional</h1>
        <p className="text-slate-400 mt-1">Gestión diaria de documentos y conductores</p>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        onFilterChange={setFilters}
        showSearch={true}
        compact={true}
        statuses={[
          { value: 'approved', label: 'Aprobado' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'rejected', label: 'Rechazado' },
        ]}
        documentTypes={[
          { value: 'license', label: 'Licencia' },
          { value: 'insurance', label: 'Seguro' },
          { value: 'certificate', label: 'Certificado' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardSparkline
          title="Documentos Procesados Hoy"
          value={kpis.totalProcessed}
          change="+2"
          icon={<FileText className="h-5 w-5 text-blue-400" />}
          sparklineData={[2, 3, 4, 5, 7, 6, 5, 5]}
          trend="up"
        />
        <KPICardSparkline
          title="Tiempo Promedio"
          value={`${kpis.averageTime}h`}
          change="-0.3h"
          icon={<Clock className="h-5 w-5 text-green-400" />}
          sparklineData={[2.5, 2.4, 2.3, 2.2, 2.1, 2.1, 2.1, 2.1]}
          trend="down"
        />
        <KPICardSparkline
          title="Tasa de Aprobación"
          value={`${kpis.approvalRate}%`}
          change="+5%"
          icon={<CheckCircle className="h-5 w-5 text-purple-400" />}
          sparklineData={[55, 57, 58, 59, 60, 60, 60, 60]}
          trend="up"
        />
        <KPICardSparkline
          title="Pendientes de Revisión"
          value={kpis.pendingReview}
          change="+1"
          icon={<AlertCircle className="h-5 w-5 text-yellow-400" />}
          sparklineData={[0, 1, 1, 2, 1, 1, 1, 1]}
          trend="up"
        />
      </div>

      {/* Alerts */}
      <AlertManagementPanel
        documents={mockDocuments}
        title="Alertas Operacionales"
        showRecommendations={true}
        maxAlertsVisible={2}
      />

      {/* Tabbed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="daily">Diario</TabsTrigger>
          <TabsTrigger value="composition">Composición</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trend */}
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-slate-100">Actividad de Procesamiento</CardTitle>
                <CardDescription>Documentos procesados por día de la semana</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendLineChart
                  data={dailyData}
                  lines={[
                    { key: 'processed', name: 'Procesados', color: '#3b82f6', strokeWidth: 2 },
                    { key: 'approved', name: 'Aprobados', color: '#10b981', strokeWidth: 2 },
                  ]}
                  xAxisKey="day"
                  height={250}
                />
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-slate-100">Rendimiento Semanal</CardTitle>
                <CardDescription>Documentos completados vs pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                <BarComparisonChart
                  data={weeklyComparison}
                  bars={[
                    { key: 'completed', name: 'Completados', color: '#10b981' },
                    { key: 'pending', name: 'Pendientes', color: '#f59e0b' },
                  ]}
                  xAxisKey="week"
                  height={250}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Tab */}
        <TabsContent value="daily" className="space-y-6">
          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-slate-100">Desglose Diario Detallado</CardTitle>
              <CardDescription>Evolución de documentos procesados hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendLineChart
                data={dailyData}
                lines={[
                  { key: 'processed', name: 'Total Procesados', color: '#3b82f6', strokeWidth: 2 },
                  { key: 'approved', name: 'Aprobados', color: '#10b981', strokeWidth: 2 },
                  { key: 'pending', name: 'Pendientes', color: '#f59e0b', strokeWidth: 2 },
                  { key: 'rejected', name: 'Rechazados', color: '#ef4444', strokeWidth: 2 },
                ]}
                xAxisKey="day"
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Composition Tab */}
        <TabsContent value="composition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-slate-100">Distribución por Estado</CardTitle>
                <CardDescription>Estado actual de documentos en sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionPieChart
                  data={statusBreakdown}
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <Card className="border-slate-700 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-slate-100">Distribución por Tipo</CardTitle>
                <CardDescription>Clasificación de documentos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionPieChart
                  data={typeBreakdown}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card className="border-slate-700 bg-slate-800/30">
        <CardHeader>
          <CardTitle className="text-slate-100">Actividad Reciente</CardTitle>
          <CardDescription>Últimas operaciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-100">{doc.type} - {doc.conductor}</p>
                  <p className="text-xs text-slate-400">ID: {doc.id}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {doc.status === 'approved' ? 'Aprobado' : doc.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
