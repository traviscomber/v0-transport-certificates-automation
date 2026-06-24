'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, FileCheck, TrendingUp, Users, XCircle } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface ExecutiveMetrics {
  executive_id: string
  executive_name: string
  documents_processed: number
  avg_validation_time: number
  approval_rate: number
  avg_ai_confidence: number
  validation_date: string
  validated_count: number
  rejected_count: number
  pending_count: number
  performance_score?: number
}

interface MetricsSummary {
  total_documents: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
  total_rechazados: number
  total_pendientes: number
  period_month: string
  period_year: string
}

export default function MetricsPage() {
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const [selectedExecutive, setSelectedExecutive] = useState<string | null>(null)

  const { data: metricsData, isLoading } = useSWR(
    `/api/company/metrics?month=${period.month}&year=${period.year}`,
    (url) => fetch(url).then((r) => r.json())
  )

  const executives: ExecutiveMetrics[] = metricsData?.executives || []
  const summary: MetricsSummary = metricsData?.summary || {
    total_documents: 0,
    total_validados: 0,
    total_conductores: 0,
    total_subcontratistas: 0,
    total_rechazados: 0,
    total_pendientes: 0,
    period_month: period.month,
    period_year: period.year,
  }
  const periodLabel = getMonthLabel(period.month, period.year)
  const approvalRate = summary.total_documents > 0
    ? Math.round((summary.total_validados / summary.total_documents) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/dashboard/company" className="hover:text-slate-200">Inicio</Link>
          <span>/</span>
          <span className="text-slate-300">Metricas</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Metricas de Ejecutivas</h1>
            <p className="text-slate-400 mt-1">Desempeno mensual basado en documentos reales</p>
          </div>
        </div>

        <DatePeriodFilter
          value={period}
          onChange={setPeriod}
          onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
        />

        <Card className="border-slate-700 bg-slate-900">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Periodo activo</p>
              <p className="text-lg font-semibold text-white">{periodLabel}</p>
            </div>
            <p className="text-sm text-slate-400">
              La vista resume la base real de documentos, sin depender de periodos predefinidos.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-500" />
                Documentos totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_documents}</div>
              <p className="text-xs text-slate-500 mt-1">Base real de documentos del periodo</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Tasa de aprobacion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {summary.total_validados} validados sobre {summary.total_documents}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_pendientes}</div>
              <p className="text-xs text-slate-500 mt-1">Documentos pendientes de revision</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Rechazados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_rechazados}</div>
              <p className="text-xs text-slate-500 mt-1">Casos observados en el periodo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-700 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm text-slate-300">Conductores</p>
                <p className="text-xl font-semibold text-white">{summary.total_conductores}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-900">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm text-slate-300">Subcontratistas</p>
                <p className="text-xl font-semibold text-white">{summary.total_subcontratistas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>Desempeno por Ejecutiva</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Cargando metricas...</div>
            ) : executives.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No hay datos disponibles</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Ejecutiva</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Documentos</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Validados</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Rechazados</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Pendientes</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Aprobacion</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Tiempo Prom.</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executives.map((exec) => (
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
                          <span className="text-green-400 font-medium">{exec.validated_count}</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-red-400 font-medium">{exec.rejected_count}</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-yellow-400 font-medium">{exec.pending_count}</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-green-400 font-medium">{exec.approval_rate}%</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-blue-400">{exec.avg_validation_time}s</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="text-purple-400">{exec.performance_score ?? 'N/D'}</span>
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

        {selectedExecutive && (
          <Card className="border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analisis detallado de ejecutiva</CardTitle>
                <button
                  onClick={() => setSelectedExecutive(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  x
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
