'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card' // Used in Recent Activity section
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendLineChart } from '@/components/charts/trend-line-chart'
import { DistributionPieChart } from '@/components/charts/distribution-pie-chart'
import { BarComparisonChart } from '@/components/charts/bar-comparison-chart'
import { KPICardSparkline } from '@/components/charts/kpi-card-sparkline'
import { AlertManagementPanel } from '@/components/dashboard/alert-management-panel'
import { AdvancedFilters, FilterState } from '@/components/dashboard/advanced-filters'


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
    { name: 'Aprobados', value: 3, percentage: '60', color: '#10b981' },
    { name: 'Pendientes', value: 1, percentage: '20', color: '#f59e0b' },
    { name: 'Rechazados', value: 1, percentage: '20', color: '#ef4444' },
  ]

  // Type breakdown
  const typeBreakdown = [
    { name: 'Licencias', value: 2, percentage: '40', color: '#3b82f6' },
    { name: 'Seguros', value: 2, percentage: '40', color: '#8b5cf6' },
    { name: 'Certificados', value: 1, percentage: '20', color: '#06b6d4' },
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
          unit="documentos"
          color="blue"
          sparklineData={[
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 7 },
            { value: 6 },
            { value: 5 },
            { value: 5 },
          ]}
          trendPercent={2}
        />
        <KPICardSparkline
          title="Tiempo Promedio"
          value={`${kpis.averageTime}`}
          unit="horas"
          color="green"
          sparklineData={[
            { value: 2.5 },
            { value: 2.4 },
            { value: 2.3 },
            { value: 2.2 },
            { value: 2.1 },
            { value: 2.1 },
            { value: 2.1 },
            { value: 2.1 },
          ]}
          trendPercent={-0.3}
        />
        <KPICardSparkline
          title="Tasa de Aprobación"
          value={`${kpis.approvalRate}`}
          unit="%"
          color="purple"
          sparklineData={[
            { value: 55 },
            { value: 57 },
            { value: 58 },
            { value: 59 },
            { value: 60 },
            { value: 60 },
            { value: 60 },
            { value: 60 },
          ]}
          trendPercent={5}
        />
        <KPICardSparkline
          title="Pendientes de Revisión"
          value={kpis.pendingReview}
          unit="documentos"
          color="yellow"
          sparklineData={[
            { value: 0 },
            { value: 1 },
            { value: 1 },
            { value: 2 },
            { value: 1 },
            { value: 1 },
            { value: 1 },
            { value: 1 },
          ]}
          trendPercent={1}
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
            <TrendLineChart
              title="Actividad de Procesamiento"
              description="Documentos procesados por día de la semana"
              data={dailyData.map(d => ({ name: d.day, ...d }))}
              lines={[
                { key: 'processed', name: 'Procesados', color: '#3b82f6' },
                { key: 'approved', name: 'Aprobados', color: '#10b981' },
              ]}
              height={250}
            />

            {/* Weekly Comparison */}
            <BarComparisonChart
              title="Rendimiento Semanal"
              description="Documentos completados vs pendientes"
              data={weeklyComparison.map(d => ({ name: d.week, ...d }))}
              bars={[
                { key: 'completed', name: 'Completados', color: '#10b981' },
                { key: 'pending', name: 'Pendientes', color: '#f59e0b' },
              ]}
              height={250}
            />
          </div>
        </TabsContent>

        {/* Daily Tab */}
        <TabsContent value="daily" className="space-y-6">
          <TrendLineChart
            title="Desglose Diario Detallado"
            description="Evolución de documentos procesados hoy"
            data={dailyData.map(d => ({ name: d.day, ...d }))}
            lines={[
              { key: 'processed', name: 'Total Procesados', color: '#3b82f6' },
              { key: 'approved', name: 'Aprobados', color: '#10b981' },
              { key: 'pending', name: 'Pendientes', color: '#f59e0b' },
              { key: 'rejected', name: 'Rechazados', color: '#ef4444' },
            ]}
            height={300}
          />
        </TabsContent>

        {/* Composition Tab */}
        <TabsContent value="composition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <DistributionPieChart
              title="Distribución por Estado"
              description="Estado actual de documentos en sistema"
              data={statusBreakdown}
              height={300}
            />

            {/* Type Distribution */}
            <DistributionPieChart
              title="Distribución por Tipo"
              description="Clasificación de documentos por categoría"
              data={typeBreakdown}
              height={300}
            />
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
