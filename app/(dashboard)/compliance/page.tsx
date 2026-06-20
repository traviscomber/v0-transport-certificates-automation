'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Download,
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

export default function CompliancePage() {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentEntry[]>([])
  const [expiredDocuments, setExpiredDocuments] = useState<DocumentEntry[]>([])
  const [renewalDocuments, setRenewalDocuments] = useState<DocumentEntry[]>([])
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const [allRes, expiredRes, renewalRes, alertsRes] = await Promise.all([
          fetch('/api/company/documents/all', { cache: 'no-store' }),
          fetch('/api/company/documents/vencidos', { cache: 'no-store' }),
          fetch('/api/company/documents/renovar', { cache: 'no-store' }),
          fetch('/api/compliance/alerts', { cache: 'no-store' }),
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
