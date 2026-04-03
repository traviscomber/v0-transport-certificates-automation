'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  LineChart,
  TrendingUp,
  Users,
  FileText,
  ArrowUp,
  Download,
} from 'lucide-react'

// Demo analytics data
const analyticsData = {
  overview: {
    totalDocuments: 128,
    complianceRate: 87,
    avgProcessingTime: '2.3 min',
    monthlyGrowth: '+12%',
  },
  monthlyTrend: [
    { month: 'Enero', documents: 85, compliance: 78 },
    { month: 'Febrero', documents: 95, compliance: 82 },
    { month: 'Marzo', documents: 128, compliance: 87 },
  ],
  topCategories: [
    { name: 'Documentos Conductor', count: 50, trend: '+15%' },
    { name: 'Documentos Vehiculo', count: 40, trend: '+8%' },
    { name: 'Documentos Empresa', count: 20, trend: '+5%' },
    { name: 'Documentos Seguridad', count: 18, trend: '+3%' },
  ],
  userActivity: [
    { name: 'Admin', actions: 245, lastActive: 'Hace 5 min' },
    { name: 'Despachador', actions: 182, lastActive: 'Hace 2 horas' },
    { name: 'Conductores', actions: 567, lastActive: 'Hace 1 hora' },
  ],
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Analytics
          </h1>
          <p className="text-muted-foreground">Análisis de tendencias y métricas KPI</p>
        </div>
        <Button className="btn-orange">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Documentos', value: analyticsData.overview.totalDocuments, icon: FileText },
          { label: 'Tasa Compliance', value: `${analyticsData.overview.complianceRate}%`, icon: TrendingUp },
          { label: 'Tiempo Promedio', value: analyticsData.overview.avgProcessingTime, icon: LineChart },
          { label: 'Crecimiento', value: analyticsData.overview.monthlyGrowth, icon: ArrowUp },
        ].map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <Card key={idx} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white mt-2">{kpi.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-orange-500/50" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trending Categories */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle>Categorías por Volumen</CardTitle>
          <CardDescription>Documentos por categoría (mes actual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(cat.count / 50) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-bold text-white">{cat.count}</p>
                  <p className="text-xs text-green-400">{cat.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Actividad por Rol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.userActivity.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.lastActive}</p>
                </div>
                <p className="text-lg font-bold text-orange-500">{user.actions}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
