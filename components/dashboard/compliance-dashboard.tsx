"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, User, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from "lucide-react"

interface DocumentSummary {
  total: number
  approved: number
  pending: number
  rejected: number
}

interface ExecutiveMetric {
  ejecutiva: string
  documentos_procesados: number
  documentos_validados: number
  documentos_rechazados: number
  documentos_pendientes: number
  conductores_activos: number
  tasa_validacion: string
  performance_score: number
}

interface MetricsSummary {
  total_documentos: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
}

export function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetric[]>([])
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [range, setRange] = useState<"day" | "week" | "month">("week")

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/company/metrics?range=${range}&_t=${Date.now()}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Error al cargar métricas")
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
  }, [range])

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

  const filteredMetrics = metrics.filter(m => {
    if (filterStatus === "all") return true
    if (filterStatus === "ok") return m.performance_score >= 75
    if (filterStatus === "warning") return m.performance_score >= 50 && m.performance_score < 75
    if (filterStatus === "critical") return m.performance_score < 50
    return true
  })

  const criticalCount = metrics.filter(m => m.performance_score < 50).length
  const warningCount = metrics.filter(m => m.performance_score >= 50 && m.performance_score < 75).length
  const okCount = metrics.filter(m => m.performance_score >= 75).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Panel de Cumplimiento Documental</h2>
          <p className="text-sm text-slate-400 mt-1">Compliance en tiempo real por ejecutiva y conductor</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {(["day", "week", "month"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r === "day" ? "Hoy" : r === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-400 mb-1">Total Documentos</p>
            <p className="text-2xl font-bold text-white">{summary?.total_documentos ?? "—"}</p>
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

      {/* Compliance Matrix by Executive */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-white">Rendimiento por Ejecutiva</CardTitle>
            <CardDescription>Tasa de validacion y documentos gestionados en el periodo</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {[
              { key: "all", label: "Todos" },
              { key: "ok", label: `OK (${okCount})`, color: "text-green-400" },
              { key: "warning", label: `Atencion (${warningCount})`, color: "text-yellow-400" },
              { key: "critical", label: `Critico (${criticalCount})`, color: "text-red-400" },
            ].map(f => (
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
              {filteredMetrics.map((exec, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${getScoreBg(exec.performance_score)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(exec.performance_score)}
                      <div>
                        <p className="font-semibold text-white">{exec.ejecutiva}</p>
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
                      <p className="text-lg font-semibold text-white">{exec.documentos_procesados}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-400">Validados</p>
                      <p className="text-lg font-semibold text-green-400">{exec.documentos_validados}</p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-400">Pendientes</p>
                      <p className="text-lg font-semibold text-yellow-400">{exec.documentos_pendientes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-400">Rechazados</p>
                      <p className="text-lg font-semibold text-red-400">{exec.documentos_rechazados}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Tasa de validacion</span>
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

      {/* Critical alert banner */}
      {criticalCount > 0 && !loading && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="py-4 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-300">
                {criticalCount} ejecutiva{criticalCount > 1 ? "s" : ""} con rendimiento critico
              </p>
              <p className="text-sm text-slate-400">
                Tasa de validacion por debajo del 50%. Revisar documentos rechazados y pendientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
