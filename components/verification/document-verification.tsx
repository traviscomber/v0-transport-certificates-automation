'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Clock, FileText, Download, Calendar, Shield, Building } from 'lucide-react'

type VerificationSummary = {
  conductors?: {
    total?: number
    pending?: number
    approved?: number
    rejected?: number
    recent_uploads?: Array<{ original_filename?: string; created_at?: string; validation_status?: string }>
  }
  subcontractors?: {
    total?: number
    pending?: number
    approved?: number
    rejected?: number
    recent_uploads?: Array<{ file_name?: string; uploaded_at?: string; status?: string }>
  }
  status?: Record<string, string>
}

export function DocumentVerification() {
  const [data, setData] = useState<VerificationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/documents-status', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Error ${response.status}`)
        const json = await response.json()
        setData(json)
      } catch (loadError) {
        console.error('Error loading verification data:', loadError)
        setError('No se pudieron cargar datos reales de verificación')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const counts = useMemo(() => {
    const conductors = data?.conductors || {}
    const subcontractors = data?.subcontractors || {}
    return {
      total: (conductors.total || 0) + (subcontractors.total || 0),
      pending: (conductors.pending || 0) + (subcontractors.pending || 0),
      approved: (conductors.approved || 0) + (subcontractors.approved || 0),
      rejected: (conductors.rejected || 0) + (subcontractors.rejected || 0),
    }
  }, [data])

  const recentItems = useMemo(() => {
    const conductorUploads = (data?.conductors?.recent_uploads || []).map((item) => ({
      label: item.original_filename || 'Documento',
      date: item.created_at || '',
      status: item.validation_status || 'pending',
      kind: 'Conductor',
    }))
    const subcontractorUploads = (data?.subcontractors?.recent_uploads || []).map((item) => ({
      label: item.file_name || 'Documento',
      date: item.uploaded_at || '',
      status: item.status || 'pending',
      kind: 'Subcontratista',
    }))

    return [...conductorUploads, ...subcontractorUploads].slice(0, 10)
  }, [data])

  const getStatusBadge = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-500/30 text-green-300 border-green-500/50">Aprobado</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Rechazado</Badge>
      case 'pending':
      default:
        return <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">Pendiente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            Verificación documental real
          </CardTitle>
          <CardDescription>Resumen calculado desde la base de datos, sin documentos de ejemplo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
            <p className="text-3xl font-bold text-white mt-2">{counts.total}</p>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/80">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-200 mt-2">{counts.pending}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-green-300/80">Aprobados</p>
            <p className="text-3xl font-bold text-green-200 mt-2">{counts.approved}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300/80">Rechazados</p>
            <p className="text-3xl font-bold text-red-200 mt-2">{counts.rejected}</p>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Estado por origen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <p className="text-sm font-medium text-foreground">Conductores</p>
              <p className="text-sm text-slate-400">
                Total: {data?.conductors?.total || 0} | Pendientes: {data?.conductors?.pending || 0} | Aprobados: {data?.conductors?.approved || 0}
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <p className="text-sm font-medium text-foreground">Subcontratistas</p>
              <p className="text-sm text-slate-400">
                Total: {data?.subcontractors?.total || 0} | Pendientes: {data?.subcontractors?.pending || 0} | Aprobados: {data?.subcontractors?.approved || 0}
              </p>
            </div>
            <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800" disabled={loading}>
              {loading ? 'Cargando...' : 'Actualizar datos'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              Últimas cargas reales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-slate-400">Cargando...</div>
            ) : recentItems.length === 0 ? (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-slate-400">
                No hay cargas recientes registradas.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Origen</TableHead>
                    <TableHead className="text-slate-400">Documento</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentItems.map((item, index) => (
                    <TableRow key={`${item.kind}-${index}`} className="border-slate-700/50">
                      <TableCell className="text-slate-300">{item.kind}</TableCell>
                      <TableCell className="text-foreground">{item.label}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
