"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePeriodFilter } from "@/components/date-period-filter"
import { ALL_VALUE, getMonthLabel, type DateFilterValue } from "@/lib/date-filters"
import { FileText, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react"

interface ExecutiveMetric {
  executive_id: string
  executive_name: string
  documents_processed: number
  validated_count: number
  rejected_count: number
  pending_count: number
  conductores_activos: number
  approval_rate: number
  avg_validation_time: number
  performance_score: number
  tasa_validacion: string
}

interface MetricsSummary {
  total_documents: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
  total_rechazados: number
  total_pendientes: number
}

export function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetric[]>([])
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ month: period.month, year: period.year })
      const res = await fetch(`/api/company/metrics?${params.toString()}&_t=${Date.now()}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Error al cargar metricas")
      const data = await res.json()
      setMetrics(data.executives || [])
      setSummary(data.summary || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.month, period.year])

  const monthLabel = getMonthLabel(period.month, period.year)

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      if (filterStatus === "all") return true
      if (filterStatus === "ok") return metric.performance_score >= 75
      if (filterStatus === "warning") return metric.performance_score >= 50 && metric.performance_score < 75
      if (filterStatus === "critical") return metric.performance_score < 50
      return true
    })
  }, [filterStatus, metrics])

  const criticalCount = metrics.filter((metric) => metric.performance_score < 50).length
  const warningCount = metrics.filter((metric) => metric.performance_score >= 50 && metric.performance_score < 75).length
  const okCount = metrics.filter((metric) => metric.performance_score >= 75).length

  const complianceRate = summary && summary.total_documents > 0
    ? Math.round((summary.total_validados / summary.total_documents) * 100)
    : 0

  const riskRate = summary && summary.total_documents > 0
    ? Math.round(((summary.total_pendientes + summary.total_rechazados) / summary.total_documents) * 100)
    : 0

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return "border-green-500/30 bg-green-500/5"
    if (score >= 50) return "border-yellow-500/30 bg-yellow-500/5"
    return "border-red-500/30 bg-red-500/5"
  }

  const getStatusIcon = (score: number) => {
    if (score >= 75) return <CheckCircle className="w-4 h-4 text-green-400" />
    if (score >= 50) return <Clock className="w-4 h-4 text-yellow-400" />
    return <AlertTriangle className="w-4 h-4 text-red-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Panel de Cumplimiento Documental</h2>
          <p className="text-sm text-slate-400 mt-1">Lectura mensual basada en documentos reales y ejecutivas activas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <DatePeriodFilter
        value={period}
        onChange={setPeriod}
        onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-400 mb-1">Total Documentos</p>
            <p className="text-2xl font-bold text-white">{summary?.total_documents ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-green-500/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-green-400 mb-1">Validados</p>
            <p className="text-2xl font-bold text-green-400">{summary?.total_validados ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-400 mb-1">Conductores</p>
            <p className="text-2xl font-bold text-white">{summary?.total_conductores ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-400 mb-1">Subcontratistas</p>
            <p className="text-2xl font-bold text-white">{summary?.total_subcontratistas ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-400 font-medium">PERIODO ACTIVO</p>
            <p className="text-xl font-bold text-white mt-1">{monthLabel}</p>
            <p className="text-sm text-slate-300 mt-2">Resumen listo para revisión ejecutiva.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-emerald-500/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-emerald-300/80 font-medium">CUMPLIMIENTO</p>
            <p className="text-3xl font-bold text-emerald-300 mt-1">{complianceRate}%</p>
            <p className="text-sm text-slate-300 mt-2">
              {summary?.total_validados ?? 0} validados de {summary?.total_documents ?? 0} documentos.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-orange-500/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-orange-300/80 font-medium">RIESGO ACTIVO</p>
            <p className="text-3xl font-bold text-orange-300 mt-1">{riskRate}%</p>
            <p className="text-sm text-slate-300 mt-2">
              {(summary?.total_pendientes ?? 0) + (summary?.total_rechazados ?? 0)} puntos de atención.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-white">Rendimiento por Ejecutiva</CardTitle>
            <CardDescription>Tasa de validación y documentos gestionados en el período mensual</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {[
              { key: "all", label: "Todos" },
              { key: "ok", label: `OK (${okCount})`, color: "text-green-400" },
              { key: "warning", label: `Atención (${warningCount})`, color: "text-yellow-400" },
              { key: "critical", label: `Crítico (${criticalCount})`, color: "text-red-400" },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filterStatus === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(f.key)}
                className={`text-xs ${filterStatus === f.key ? "bg-orange-500 hover:bg-orange-600 border-orange-500" : ""}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="ml-3 text-slate-400">Cargando datos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchMetrics} className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : filteredMetrics.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No hay datos para el periodo seleccionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMetrics.map((exec) => (
                <div
                  key={exec.executive_id}
                  className={`rounded-lg border p-4 ${getScoreBg(exec.performance_score)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(exec.performance_score)}
                      <div>
                        <p className="font-semibold text-white">{exec.executive_name}</p>
                        <p className="text-xs text-slate-400">{exec.conductores_activos} conductores activos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(exec.performance_score)}`}>
                        {exec.performance_score}
                        <span className="text-sm font-normal text-slate-400">/100</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-400">Procesados</p>
                      <p className="text-lg font-semibold text-white">{exec.documents_processed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-400">Validados</p>
                      <p className="text-lg font-semibold text-green-400">{exec.validated_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-400">Pendientes</p>
                      <p className="text-lg font-semibold text-yellow-400">{exec.pending_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-400">Rechazados</p>
                      <p className="text-lg font-semibold text-red-400">{exec.rejected_count}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Tasa de validación</span>
                      <span>{exec.tasa_validacion}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          exec.performance_score >= 75
                            ? "bg-green-500"
                            : exec.performance_score >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: exec.tasa_validacion }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {criticalCount > 0 && !loading && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="py-4 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-300">
                {criticalCount} ejecutiva{criticalCount > 1 ? "s" : ""} con rendimiento crítico
              </p>
              <p className="text-sm text-slate-400">
                Tasa de validación por debajo del 50%. Revisar documentos rechazados y pendientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
