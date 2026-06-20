'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, CheckCircle2, TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

type EntityRecord = {
  id: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  type: 'driver' | 'subcontractor'
}

type DocumentRecord = {
  id: string
  created_at?: string
  expiration_date?: string
  validation_status?: string
  original_filename?: string
  document_type?: string
  file_url?: string
}

export function ReportsDashboard() {
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const [entities, setEntities] = useState<EntityRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardRes, documentsRes] = await Promise.all([
          fetch('/api/dashboard/data', { cache: 'no-store' }),
          fetch('/api/company/documents/all', { cache: 'no-store' }),
        ])

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json()
          const drivers = (dashboardData.dashboard?.conductores || []).map((driver: any) => ({
            ...driver,
            type: 'driver' as const,
          }))
          const subcontractors = (dashboardData.dashboard?.transportistas || []).map((sub: any) => ({
            ...sub,
            type: 'subcontractor' as const,
          }))
          setEntities([...drivers, ...subcontractors])
        }

        if (documentsRes.ok) {
          const documentsData = await documentsRes.json()
          setDocuments(Array.isArray(documentsData.documents) ? documentsData.documents : [])
        }
      } catch (error) {
        console.error('[v0] Error loading admin report data:', error)
      }
    }

    loadData()
  }, [])

  const filteredEntities = useMemo(() => {
    return filterByMonthYear(
      entities,
      (item) => item.updated_at || item.created_at,
      period.month,
      period.year
    )
  }, [entities, period.month, period.year])

  const filteredDocuments = useMemo(() => {
    return filterByMonthYear(
      documents,
      (doc) => doc.created_at,
      period.month,
      period.year
    )
  }, [documents, period.month, period.year])

  const monthLabel = getMonthLabel(period.month, period.year)

  const stats = useMemo(() => {
    const activeEntities = filteredEntities.filter((item) => item.is_active !== false).length
    const inactiveEntities = filteredEntities.length - activeEntities
    const approved = filteredDocuments.filter((doc) => doc.validation_status === 'approved' || doc.validation_status === 'validated').length
    const pending = filteredDocuments.filter((doc) => doc.validation_status === 'pending').length
    const rejected = filteredDocuments.filter((doc) => doc.validation_status === 'rejected').length
    const total = filteredDocuments.length
    const expiring = filteredDocuments.filter((doc) => {
      if (!doc.expiration_date) return false
      const exp = new Date(doc.expiration_date)
      const diff = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }).length
    const oldestPending = filteredDocuments
      .filter((doc) => doc.validation_status === 'pending')
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())[0]

    return {
      total,
      approved,
      pending,
      rejected,
      activeEntities,
      inactiveEntities,
      expiring,
      oldestPending,
    }
  }, [filteredDocuments, filteredEntities])

  const complianceRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
  const riskRate = stats.total > 0 ? Math.round(((stats.pending + stats.rejected + stats.expiring) / stats.total) * 100) : 0

  const chartData = [
    { name: 'Aprobados', value: stats.approved, fill: '#22c55e' },
    { name: 'Pendientes', value: stats.pending, fill: '#f59e0b' },
    { name: 'Rechazados', value: stats.rejected, fill: '#ef4444' },
  ]

  return (
    <div className="space-y-8">


      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl shadow-slate-200/40">
        <CardContent className="p-6 md:p-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Reportes admin mensuales
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#18181B] leading-tight">
                Reportes y Auditoría
              </h1>
              <p className="text-[#71717A] max-w-2xl">
                Análisis por mes y año para revisar cumplimiento, riesgo y documentos con una lectura clara para operación.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="min-h-[98px] rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Periodo activo</p>
                <p className="mt-2 text-2xl font-bold text-[#18181B]">{monthLabel}</p>
                <p className="mt-1 text-xs text-slate-500">Filtro mensual / anual</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Cumplimiento</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{complianceRate}%</p>
                <p className="mt-1 text-xs text-emerald-700/80">{stats.approved} validados</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-700">Riesgo activo</p>
                <p className="mt-2 text-3xl font-bold text-orange-700">{riskRate}%</p>
                <p className="mt-1 text-xs text-orange-700/80">{stats.pending + stats.rejected + stats.expiring} puntos de atención</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xl xl:max-w-none xl:w-auto">
            <div className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Documentos</p>
              <p className="text-3xl font-bold text-[#18181B] mt-1">{stats.total}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Pendientes</p>
              <p className="text-3xl font-bold text-[#18181B] mt-1">{stats.pending}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Rechazados</p>
              <p className="text-3xl font-bold text-[#18181B] mt-1">{stats.rejected}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-200 bg-slate-900 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Acción</p>
              <p className="text-lg font-semibold text-white mt-1">Auditoría y seguimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Filtro</p>
          <p className="text-sm font-semibold text-[#18181B] mt-1">Mes / año</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Enfoque</p>
          <p className="text-sm font-semibold text-[#18181B] mt-1">Datos reales</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Uso</p>
          <p className="text-sm font-semibold text-[#18181B] mt-1">Seguimiento</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Salida</p>
          <p className="text-sm font-semibold text-[#18181B] mt-1">Auditoría</p>
        </div>
      </div>

      <DatePeriodFilter
        value={period}
        onChange={setPeriod}
        onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      <Card className="overflow-hidden border-[#E4E4E7] bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <CardContent className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Reportes admin mensuales
            </div>
            <p className="text-[#71717A] max-w-xl">
              Análisis por mes y año para revisar cumplimiento, riesgo y documentos con una lectura clara para operación.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Filtro</p>
              <p className="text-sm font-semibold text-[#18181B] mt-1">Mes / año</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Enfoque</p>
              <p className="text-sm font-semibold text-[#18181B] mt-1">Datos reales</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Uso</p>
              <p className="text-sm font-semibold text-[#18181B] mt-1">Seguimiento</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Salida</p>
              <p className="text-sm font-semibold text-[#18181B] mt-1">Auditoría</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#71717A]">
        <span className="font-semibold text-[#18181B]">Consejo rápido:</span> cambia el mes o el año para revisar tendencias y abrir los vencimientos o renovaciones asociados.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-[#E4E4E7] bg-white/90">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-[#71717A]">PERÍODO ACTIVO</p>
            <p className="text-xl font-bold text-[#18181B] mt-1">{monthLabel}</p>
            <p className="text-sm text-[#71717A] mt-2">Resumen listo para auditoría y seguimiento.</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-emerald-700">CUMPLIMIENTO</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{complianceRate}%</p>
            <p className="text-sm text-emerald-700/80 mt-2">{stats.approved} validados de {stats.total} documentos.</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-orange-700">RIESGO ACTIVO</p>
            <p className="text-3xl font-bold text-orange-700 mt-1">{riskRate}%</p>
            <p className="text-sm text-orange-700/80 mt-2">{stats.pending + stats.rejected + stats.expiring} puntos de atención.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E4E4E7] bg-white/90">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <CardTitle>Próxima acción recomendada</CardTitle>
            </div>
            <CardDescription>
              {stats.expiring > 0
                ? `Hay ${stats.expiring} documentos por vencer y ${stats.pending} pendientes para este período.`
                : `No hay vencimientos inmediatos; revisa pendientes y auditoría del período.`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/company/documentos/vencidos">
              <Button variant="outline" size="sm" className="gap-2 border-red-200 text-red-700 hover:bg-red-50">
                Ver vencidos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/company/documentos/renovar">
              <Button variant="outline" size="sm" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                Planificar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        {stats.oldestPending && (
          <CardContent className="pt-0">
            <Badge variant="secondary" className="px-3 py-1">
              Más antiguo pendiente: {stats.oldestPending.original_filename || stats.oldestPending.document_type || 'Documento'}
            </Badge>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.total}</div>
            <p className="text-xs text-[#71717A] mt-1">Período filtrado</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Validados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-[#71717A] mt-1">Documentos aprobados</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-[#71717A] mt-1">En revisión</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-[#71717A] mt-1">Por revisar</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E4E4E7] bg-white/90">
        <CardHeader>
          <CardTitle>Resumen rápido</CardTitle>
          <CardDescription>Lectura corta para gerencia y control operativo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-[#71717A]">Pendientes</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-[#71717A]">Rechazados</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-[#71717A]">Por vencer</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.expiring}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E4E4E7]">
        <CardHeader>
          <CardTitle>Cumplimiento Documentario</CardTitle>
          <CardDescription>Evolución del período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Cantidad" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-[#E4E4E7]">
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
          <CardDescription>Últimos documentos del período filtrado</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E4E4E7]">
                <TableHead>Documento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.slice(0, 8).map((doc) => (
                <TableRow key={doc.id} className="border-[#E4E4E7]">
                  <TableCell className="font-medium">
                    {doc.original_filename || doc.document_type || 'Documento'}
                  </TableCell>
                  <TableCell>
                    <Badge className={doc.validation_status === 'approved' || doc.validation_status === 'validated' ? 'bg-green-100 text-green-800' : doc.validation_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {doc.validation_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#71717A]">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-CL') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-[#71717A]">
                    {doc.expiration_date ? new Date(doc.expiration_date).toLocaleDateString('es-CL') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.activeEntities}</div>
            <p className="text-xs text-[#71717A] mt-1">Entidades activas</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-600">{stats.inactiveEntities}</div>
            <p className="text-xs text-[#71717A] mt-1">Entidades inactivas</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.expiring}</div>
            <p className="text-xs text-[#71717A] mt-1">Vencimientos cercanos</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-[#71717A] mt-1">Aprobados sobre total</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="bg-[#0066FF] text-white hover:bg-[#0052CC]">
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </Button>
      </div>
    </div>
  )
}
