'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Users, FileCheck, TrendingUp, Clock, BarChart3 } from 'lucide-react'

interface ExecutiveMetrics {
  executive_id: string
  executive_name: string
  documents_processed: number
  avg_validation_time: number
  approval_rate: number
  avg_ai_confidence: number
  validation_date: string
}

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState('week') // day, week, month
  const [selectedExecutive, setSelectedExecutive] = useState<string | null>(null)

  const { data: metricsData, isLoading } = useSWR(
    `/api/company/metrics?range=${timeRange}`,
    (url) => fetch(url).then(r => r.json())
  )

  const executives = metricsData?.executives || []
  const summary = metricsData?.summary || {}

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/dashboard/company" className="hover:text-slate-200">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-300">Métricas</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Métricas de Ejecutivas</h1>
            <p className="text-slate-400 mt-1">Desempeño en validación de documentos</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['day', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {range === 'day' ? 'Hoy' : range === 'week' ? 'Esta Semana' : 'Este Mes'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Total Documents */}
          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-500" />
                Documentos Validados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_documents || 0}</div>
              <p className="text-xs text-slate-500 mt-1">+{summary.documents_increase || 0} vs período anterior</p>
            </CardContent>
          </Card>

          {/* Approval Rate */}
          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Tasa de Aprobación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avg_approval_rate || 0}%</div>
              <p className="text-xs text-slate-500 mt-1">Promedio de ejecutivas</p>
            </CardContent>
          </Card>

          {/* Avg Validation Time */}
          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Tiempo Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avg_validation_time || 0}s</div>
              <p className="text-xs text-slate-500 mt-1">Por documento</p>
            </CardContent>
          </Card>

          {/* Active Executives */}
          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Ejecutivas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executives.length}</div>
              <p className="text-xs text-slate-500 mt-1">En {timeRange === 'day' ? 'hoy' : timeRange === 'week' ? 'esta semana' : 'este mes'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Executive Performance Table */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>Desempeño por Ejecutiva</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Cargando métricas...</div>
            ) : executives.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No hay datos disponibles</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Ejecutiva</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Documentos</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Aprobación</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Tiempo Promedio</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Confianza IA</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executives.map((exec: ExecutiveMetrics) => (
                      <tr 
                        key={exec.executive_id} 
                        className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium">{exec.executive_name}</div>
                          <div className="text-xs text-slate-500">{exec.executive_id}</div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                            {exec.documents_processed}
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-green-400 font-medium">{exec.approval_rate}%</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-blue-400">{exec.avg_validation_time}s</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-purple-400">{exec.avg_ai_confidence}%</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <button
                            onClick={() => setSelectedExecutive(exec.executive_id)}
                            className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Executive Detail Modal (placeholder) */}
        {selectedExecutive && (
          <Card className="border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Análisis Detallado de Ejecutiva</CardTitle>
                <button
                  onClick={() => setSelectedExecutive(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Detalles de ejecutiva: {selectedExecutive}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
