'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/trend-line-chart'
import { DistributionPieChart } from '@/components/charts/distribution-pie-chart'
import { BarComparisonChart } from '@/components/charts/bar-comparison-chart'
import { KPICardSparkline } from '@/components/charts/kpi-card-sparkline'
import { AlertManagementPanel } from '@/components/dashboard/alert-management-panel'
import { AdvancedFilters, FilterState } from '@/components/dashboard/advanced-filters'


export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({})

  // Mock data for demo purposes - in production, fetch from API
  const mockDocuments = useMemo(
    () => [
      {
        id: '1',
        name: 'Licencia Conductor',
        status: 'approved',
        expiry_date: new Date(2025, 6, 15),
        created_at: new Date(2024, 5, 1),
      },
      {
        id: '2',
        name: 'Seguro',
        status: 'pending',
        expiry_date: new Date(2025, 8, 20),
        created_at: new Date(2024, 5, 10),
      },
      {
        id: '3',
        name: 'Certificado',
        status: 'rejected',
        expiry_date: new Date(2024, 3, 10),
        created_at: new Date(2024, 5, 15),
      },
      {
        id: '4',
        name: 'Licencia Conductor',
        status: 'approved',
        expiry_date: new Date(2025, 10, 5),
        created_at: new Date(2024, 6, 1),
      },
    ],
    []
  )

  const mockConductors = useMemo(
    () => [
      { id: '1', name: 'Juan Pérez', license_expiry: new Date(2025, 8, 15), training_date: new Date(2024, 5, 1) },
      { id: '2', name: 'María García', license_expiry: null, training_date: new Date(2024, 6, 1) },
    ],
    []
  )

  // KPI Metrics
  const kpiMetrics = useMemo(
    () => ({
      totalDocuments: mockDocuments.length,
      approvedCount: mockDocuments.filter((d) => d.status === 'approved').length,
      pendingCount: mockDocuments.filter((d) => d.status === 'pending').length,
      rejectedCount: mockDocuments.filter((d) => d.status === 'rejected').length,
      complianceRate: ((mockDocuments.filter((d) => d.status === 'approved').length / mockDocuments.length) * 100).toFixed(1),
    }),
    [mockDocuments]
  )

  // Trend data (documents over time)
  const trendData = [
    { month: 'Ene', approved: 12, pending: 5, rejected: 2 },
    { month: 'Feb', approved: 15, pending: 7, rejected: 1 },
    { month: 'Mar', approved: 18, pending: 4, rejected: 3 },
    { month: 'Abr', approved: 22, pending: 6, rejected: 2 },
    { month: 'May', approved: 25, pending: 8, rejected: 1 },
    { month: 'Jun', approved: 28, pending: 5, rejected: 2 },
  ]

  // Distribution data
  const distributionData = [
    { name: 'Aprobados', value: kpiMetrics.approvedCount, percentage: ((kpiMetrics.approvedCount / kpiMetrics.totalDocuments) * 100).toFixed(1) },
    { name: 'Pendientes', value: kpiMetrics.pendingCount, percentage: ((kpiMetrics.pendingCount / kpiMetrics.totalDocuments) * 100).toFixed(1) },
    { name: 'Rechazados', value: kpiMetrics.rejectedCount, percentage: ((kpiMetrics.rejectedCount / kpiMetrics.totalDocuments) * 100).toFixed(1) },
  ]

  // Comparison data
  const comparisonData = [
    { category: 'Mayo', thisMonth: 25, lastMonth: 22 },
    { category: 'Junio', thisMonth: 28, lastMonth: 25 },
    { category: 'Julio (proyectado)', thisMonth: 31, lastMonth: 28 },
  ]

  // Sparkline data for KPIs
  const sparklineData = [
    { value: 12 },
    { value: 15 },
    { value: 18 },
    { value: 22 },
    { value: 25 },
    { value: 28 },
    { value: 26 },
    { value: 29 },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard Ejecutivo</h1>
        <p className="text-slate-400 mt-1">Análisis integral de documentos y cumplimiento regulatorio</p>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        onFilterChange={setFilters}
        showSearch={true}
        compact={false}
        statuses={[
          { value: 'approved', label: 'Aprobado' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'rejected', label: 'Rechazado' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardSparkline
          title="Total Documentos"
          value={kpiMetrics.totalDocuments}
          unit="docs"
          color="blue"
          sparklineData={sparklineData}
          trendPercent={12}
        />
        <KPICardSparkline
          title="Aprobados"
          value={kpiMetrics.approvedCount}
          unit="docs"
          color="green"
          sparklineData={sparklineData}
          trendPercent={8}
        />
        <KPICardSparkline
          title="Pendientes"
          value={kpiMetrics.pendingCount}
          unit="docs"
          color="yellow"
          sparklineData={sparklineData}
          trendPercent={-4}
        />
        <KPICardSparkline
          title="Tasa Cumplimiento"
          value={`${kpiMetrics.complianceRate}%`}
          unit=""
          color="purple"
          sparklineData={sparklineData}
          trendPercent={3}
        />
      </div>

      {/* Alerts Panel */}
      <AlertManagementPanel
        documents={mockDocuments}
        conductors={mockConductors}
        title="Centro de Alertas del Sistema"
        showRecommendations={true}
        maxAlertsVisible={3}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-slate-100">Evolución de Documentos</CardTitle>
            <CardDescription>Tendencia de aprobaciones, rechazos y pendientes por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLineChart
              data={trendData}
              lines={[
                { key: 'approved', name: 'Aprobados', color: '#10b981', strokeWidth: 2 },
                { key: 'pending', name: 'Pendientes', color: '#f59e0b', strokeWidth: 2 },
                { key: 'rejected', name: 'Rechazados', color: '#ef4444', strokeWidth: 2 },
              ]}
              xAxisKey="month"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-slate-100">Distribución de Estados</CardTitle>
            <CardDescription>Composición actual de documentos por estatus</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionPieChart
              data={distributionData}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="border-slate-700 bg-slate-800/30">
        <CardHeader>
          <CardTitle className="text-slate-100">Comparación Mes a Mes</CardTitle>
          <CardDescription>Análisis de documentos aprobados: mes actual vs mes anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <BarComparisonChart
            data={comparisonData}
            bars={[
              { key: 'thisMonth', name: 'Este Mes', color: '#3b82f6' },
              { key: 'lastMonth', name: 'Mes Anterior', color: '#8b5cf6' },
            ]}
            xAxisKey="category"
            height={300}
          />
        </CardContent>
      </Card>

      {/* Detailed metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Tasa de Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{kpiMetrics.complianceRate}%</div>
            <p className="text-xs text-slate-400 mt-2">
              <ArrowUpRight className="inline h-3 w-3 mr-1" />
              Incremento de 3% respecto a junio
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Tiempo Promedio de Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">2.3 días</div>
            <p className="text-xs text-slate-400 mt-2">
              <ArrowDownRight className="inline h-3 w-3 mr-1" />
              Reducción de 0.5 días vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Conductores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{mockConductors.length}</div>
            <p className="text-xs text-slate-400 mt-2">
              <ArrowUpRight className="inline h-3 w-3 mr-1" />
              Todos con documentación validada
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
