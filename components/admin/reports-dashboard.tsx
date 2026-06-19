'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, CheckCircle2, TrendingUp } from 'lucide-react'
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

    return {
      total,
      approved,
      pending,
      rejected,
      activeEntities,
      inactiveEntities,
      expiring,
    }
  }, [filteredDocuments, filteredEntities])

  const chartData = [
    { name: 'Aprobados', value: stats.approved, fill: '#22c55e' },
    { name: 'Pendientes', value: stats.pending, fill: '#f59e0b' },
    { name: 'Rechazados', value: stats.rejected, fill: '#ef4444' },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#18181B]">Reportes y Auditoría</h1>
        <p className="text-[#71717A]">Análisis por mes y año del período seleccionado</p>
      </div>

      <DatePeriodFilter
        value={period}
        onChange={setPeriod}
        onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      <Card className="border-[#E4E4E7] bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Período activo</CardTitle>
            <CardDescription>{monthLabel}</CardDescription>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredDocuments.length} documentos
          </Badge>
        </CardHeader>
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
            <p className="text-xs text-[#71717A] mt-1">Próximos 30 días</p>
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
