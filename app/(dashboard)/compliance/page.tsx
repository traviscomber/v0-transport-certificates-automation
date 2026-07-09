'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ComplianceExcelMatrix } from '@/components/compliance/compliance-excel-matrix'
import {
  Shield,
  FileText,
  Calendar,
  ArrowRight,
  Bell,
} from 'lucide-react'

type DocumentEntry = {
  id: string
  original_filename?: string
  document_type?: string
  validation_status?: string
  expiration_date?: string | null
  created_at?: string
  days_overdue?: number
  days_until_expiration?: number
  conductores?: {
    nombres?: string
    apellido_paterno?: string
    rut?: string
  } | null
}

type AlertEntry = {
  id: string
  title?: string
  message?: string
  description?: string
  entity_name?: string
  document_type?: string
  severity?: string
  status?: string
  created_at?: string
}

type ExecutiveMetric = {
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
  performance_score: number
  conductores_activos: number
  tasa_validacion: string
}

type MetricsSummary = {
  total_documents: number
  total_validados: number
  total_conductores: number
  total_subcontratistas: number
  total_rechazados: number
  total_pendientes: number
}

type RequirementRow = {
  id: string
  code: string
  name: string
  category?: string
  periodicity?: string | null
  applicable_to_conductor?: boolean
  applicable_to_transportista?: boolean
  applicable_to_vehicle?: boolean
}

type DocumentTypeRow = {
  id: string
  code: string
  name: string
}

type MatrixEntity = {
  id: string
  rut?: string
  nombres?: string
  apellido_paterno?: string
  razon_social?: string
  ejecutivo_nombre?: string
  rut_proveedor?: string
  nombre_subcontratista?: string
}

type MatrixBucket = {
  conductorDocs: any[]
  subDocs: any[]
}

export default function CompliancePage() {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentEntry[]>([])
  const [expiredDocuments, setExpiredDocuments] = useState<DocumentEntry[]>([])
  const [renewalDocuments, setRenewalDocuments] = useState<DocumentEntry[]>([])
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [executiveMetrics, setExecutiveMetrics] = useState<ExecutiveMetric[]>([])
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(null)
  const [requirements, setRequirements] = useState<RequirementRow[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeRow[]>([])
  const [conductors, setConductors] = useState<MatrixEntity[]>([])
  const [transportistas, setTransportistas] = useState<MatrixEntity[]>([])
  const [pendingMatrix, setPendingMatrix] = useState<MatrixBucket>({ conductorDocs: [], subDocs: [] })
  const [approvedMatrix, setApprovedMatrix] = useState<MatrixBucket>({ conductorDocs: [], subDocs: [] })
  const [rejectedMatrix, setRejectedMatrix] = useState<MatrixBucket>({ conductorDocs: [], subDocs: [] })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const [allRes, expiredRes, renewalRes, alertsRes, metricsRes] = await Promise.all([
          fetch('/api/company/documents/all', { cache: 'no-store' }),
          fetch('/api/company/documents/vencidos', { cache: 'no-store' }),
          fetch('/api/company/documents/renovar', { cache: 'no-store' }),
          fetch('/api/compliance/alerts', { cache: 'no-store' }),
          fetch('/api/company/metrics?month=all&year=all', { cache: 'no-store' }),
        ])

        const [companyRes, dashboardRes, requirementsRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/company/data', { cache: 'no-store' }),
          fetch('/api/dashboard/data', { cache: 'no-store' }),
          fetch('/api/compliance/requirements', { cache: 'no-store' }),
          fetch('/api/dashboard/pending-documents', { cache: 'no-store' }),
          fetch('/api/company/documents/aprobados', { cache: 'no-store' }),
          fetch('/api/company/documents/rechazados', { cache: 'no-store' }),
        ])

        if (allRes.ok) {
          const allData = await allRes.json()
          setDocuments(Array.isArray(allData.documents) ? allData.documents : [])
        }

        if (expiredRes.ok) {
          const expiredData = await expiredRes.json()
          setExpiredDocuments(Array.isArray(expiredData.documents) ? expiredData.documents : [])
        }

        if (renewalRes.ok) {
          const renewalData = await renewalRes.json()
          setRenewalDocuments(Array.isArray(renewalData.documents) ? renewalData.documents : [])
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          setAlerts(Array.isArray(alertsData.alerts) ? alertsData.alerts : [])
        }

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          setExecutiveMetrics(Array.isArray(metricsData.executives) ? metricsData.executives : [])
          setMetricsSummary(metricsData.summary || null)
        }

        if (companyRes.ok) {
          const companyData = await companyRes.json()
          setDocumentTypes(Array.isArray(companyData.documentTypes) ? companyData.documentTypes : [])
        }

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json()
          const mappedTransportistas = Array.isArray(dashboardData.dashboard?.transportistas)
            ? dashboardData.dashboard.transportistas.map((item: any) => ({
                id: item.id,
                rut: item.rut || '',
                razon_social: item.razon_social || item.nombre_fantasia || '',
                ejecutivo_nombre: item.ejecutivo_nombre || 'Sin asignar',
                nombre_subcontratista: item.nombre_fantasia || item.razon_social || '',
              }))
            : []
          const mappedConductores = Array.isArray(dashboardData.dashboard?.conductores)
            ? dashboardData.dashboard.conductores.map((item: any) => ({
                id: item.id,
                rut: item.rut || '',
                nombres: item.nombres || '',
                apellido_paterno: item.apellido_paterno || '',
                rut_proveedor: item.rut_proveedor || '',
                ejecutivo_nombre: item.ejecutivo_nombre || 'Sin asignar',
                nombre_subcontratista: item.nombre_subcontratista || '',
              }))
            : []

          setTransportistas(mappedTransportistas)
          setConductors(mappedConductores)
        }

        if (requirementsRes.ok) {
          const requirementsData = await requirementsRes.json()
          setRequirements(Array.isArray(requirementsData.requirements) ? requirementsData.requirements : [])
        }

        if (pendingRes.ok) {
          const pendingData = await pendingRes.json()
          setPendingMatrix({
            conductorDocs: Array.isArray(pendingData.conductorDocs) ? pendingData.conductorDocs : [],
            subDocs: Array.isArray(pendingData.subDocs) ? pendingData.subDocs : [],
          })
        }

        if (approvedRes.ok) {
          const approvedData = await approvedRes.json()
          setApprovedMatrix({
            conductorDocs: Array.isArray(approvedData.conductorDocs) ? approvedData.conductorDocs : [],
            subDocs: Array.isArray(approvedData.subDocs) ? approvedData.subDocs : [],
          })
        }

        if (rejectedRes.ok) {
          const rejectedData = await rejectedRes.json()
          setRejectedMatrix({
            conductorDocs: Array.isArray(rejectedData.conductorDocs) ? rejectedData.conductorDocs : [],
            subDocs: Array.isArray(rejectedData.subDocs) ? rejectedData.subDocs : [],
          })
        }
      } catch (loadError) {
        console.error('Error loading compliance data:', loadError)
        setError('No fue posible cargar datos reales de compliance')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const stats = useMemo(() => {
    const approved = documents.filter((doc) => doc.validation_status === 'approved' || doc.validation_status === 'validated').length
    const pending = documents.filter((doc) => !doc.validation_status || doc.validation_status === 'pending').length
    const rejected = documents.filter((doc) => doc.validation_status === 'rejected').length
    const expired = expiredDocuments.length
    const renewal = renewalDocuments.length
    const activeAlerts = alerts.filter((alert) => alert.status === 'active' || !alert.status).length
    const total = documents.length
    const complianceRate = total > 0 ? Math.round((approved / total) * 100) : 0
    const riskRate = total > 0 ? Math.round(((pending + rejected + expired) / total) * 100) : 0

    return {
      approved,
      pending,
      rejected,
      expired,
      renewal,
      activeAlerts,
      total,
      complianceRate,
      riskRate,
    }
  }, [alerts, documents, expiredDocuments.length, renewalDocuments.length])

  const getSeverityBadge = (severity?: string) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Crítica</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">Advertencia</Badge>
      case 'info':
        return <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/50">Info</Badge>
      default:
        return <Badge variant="outline" className="border-slate-600 text-slate-300">Activa</Badge>
    }
  }

  const getDocLabel = (doc: DocumentEntry) => {
    if (doc.document_type) return doc.document_type
    if (doc.original_filename) return doc.original_filename
    return 'Documento'
  }

  const matrixRows = useMemo(() => {
    return [...executiveMetrics]
      .sort((a, b) => b.performance_score - a.performance_score)
      .map((metric) => ({
        ...metric,
        riskLevel: metric.performance_score >= 75 ? 'VERDE' : metric.performance_score >= 50 ? 'AMARILLO' : 'ROJO',
      }))
  }, [executiveMetrics])

  const getMatrixBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'VERDE':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/40">OK</Badge>
      case 'AMARILLO':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">Atencion</Badge>
      default:
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/40">Riesgo</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-2xl shadow-slate-950/20">
        <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
              Compliance con datos reales
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Panel de Compliance
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-slate-300">
                Esta vista resume documentos vigentes, vencidos, por renovar y alertas activas, todo calculado desde los registros reales del sistema.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="min-h-[98px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Documentos</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
                <p className="mt-1 text-xs text-slate-400">Base real cargada</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Cumplimiento</p>
                <p className="mt-2 text-3xl font-bold text-emerald-200">{stats.complianceRate}%</p>
                <p className="mt-1 text-xs text-emerald-200/70">{stats.approved} aprobados o validados</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-300/80">Riesgo</p>
                <p className="mt-2 text-3xl font-bold text-orange-200">{stats.riskRate}%</p>
                <p className="mt-1 text-xs text-orange-200/70">{stats.expired + stats.renewal + stats.pending + stats.rejected} elementos a revisar</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xl lg:max-w-none lg:w-auto auto-rows-fr">
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Vencidos</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.expired}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Por renovar</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.renewal}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Alertas activas</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeAlerts}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-red-300/80">Pendientes</p>
              <p className="text-3xl font-bold text-red-200 mt-1">{stats.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/company/documentos/vencidos">
          <Button variant="outline" size="sm" className="gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10">
            Ver vencidos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard/company/documentos/renovar">
          <Button variant="outline" size="sm" className="gap-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
            Planificar renovaciones
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard/company/alertas">
          <Button variant="outline" size="sm" className="gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
            Revisar alertas
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ComplianceExcelMatrix
        loading={loading}
        requirements={requirements}
        documentTypes={documentTypes}
        conductors={conductors}
        transportistas={transportistas}
        pending={pendingMatrix}
        approved={approvedMatrix}
        rejected={rejectedMatrix}
      />

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Resumen por ejecutiva
              </CardTitle>
              <CardDescription>
                Lectura ejecutiva real por ejecutiva, con score, validados, pendientes y rechazados.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/company/subcontratistas">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700/40">
                  Ver subcontratistas
                </Button>
              </Link>
              <Link href="/dashboard/company/reportes">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700/40">
                  Ver reportes
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {matrixRows.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 text-sm text-slate-400">
              No hay datos de matriz para mostrar.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-950/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ejecutiva</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Procesados</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Validados</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pendientes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Rechazados</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 bg-slate-900/40">
                  {matrixRows.map((row) => (
                    <tr key={row.executive_id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-100">{row.executive_name}</p>
                          <p className="text-xs text-slate-400">{row.conductores_activos} conductores activos</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{row.documents_processed}</td>
                      <td className="px-4 py-3 text-emerald-300">{row.validated_count}</td>
                      <td className="px-4 py-3 text-amber-300">{row.pending_count}</td>
                      <td className="px-4 py-3 text-red-300">{row.rejected_count}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-100">{row.performance_score}/100</span>
                      </td>
                      <td className="px-4 py-3">{getMatrixBadge(row.riskLevel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {metricsSummary ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total real</p>
                <p className="mt-2 text-2xl font-bold text-slate-100">{metricsSummary.total_documents}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Validados</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{metricsSummary.total_validados}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{metricsSummary.total_pendientes}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rechazados</p>
                <p className="mt-2 text-2xl font-bold text-red-300">{metricsSummary.total_rechazados}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-6 text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              Vencimientos reales
            </CardTitle>
            <CardDescription>Documentos que ya vencieron o están en ventana de renovación</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {expiredDocuments.length === 0 && renewalDocuments.length === 0 ? (
              <div className="md:col-span-2 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-slate-400">
                No hay vencidos ni documentos en ventana de renovación para el período consultado.
              </div>
            ) : (
              <>
                {expiredDocuments.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{getDocLabel(doc)}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.conductores ? `${doc.conductores.nombres || ''} ${doc.conductores.apellido_paterno || ''}`.trim() : 'Sin conductor asociado'}
                        </p>
                      </div>
                      <Badge className="bg-red-500/30 text-red-300 border-red-500/50">
                        {doc.days_overdue ?? 0} días
                      </Badge>
                    </div>
                  </div>
                ))}
                {renewalDocuments.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{getDocLabel(doc)}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.conductores ? `${doc.conductores.nombres || ''} ${doc.conductores.apellido_paterno || ''}`.trim() : 'Sin conductor asociado'}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">
                        {doc.days_until_expiration ?? 0} días
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Alertas activas
            </CardTitle>
            <CardDescription>Alertas reales generadas por el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-sm text-slate-400">Cargando datos reales...</div>
            ) : alerts.length === 0 ? (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-slate-400">
                No hay alertas activas.
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{alert.title || alert.entity_name || 'Alerta'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.message || alert.description || alert.document_type || 'Sin detalle adicional'}
                      </p>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            Resumen operativo
          </CardTitle>
          <CardDescription>Lectura directa de los estados reales del sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aprobados</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rechazados</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Riesgo</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">{stats.riskRate}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
