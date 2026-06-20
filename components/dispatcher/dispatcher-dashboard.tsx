'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Users, AlertTriangle, CheckCircle, TrendingUp, Navigation, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'

type DashboardData = {
  dashboard?: {
    conductores?: Array<{ id: string; nombre?: string; rut?: string; is_active?: boolean }>
    transportistas?: Array<{ id: string; nombre?: string; rut?: string; is_active?: boolean; conductores_count?: number }>
    stats?: {
      totalTransportistas?: number
      totalConductores?: number
    }
  }
}

type DocumentsSummary = {
  conductors?: {
    total?: number
    pending?: number
    approved?: number
    rejected?: number
  }
  subcontractors?: {
    total?: number
    pending?: number
    approved?: number
    rejected?: number
  }
}

export default function DispatcherDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [docsData, setDocsData] = useState<DocumentsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const [dashboardRes, docsRes] = await Promise.all([
          fetch('/api/dashboard/data', { cache: 'no-store' }),
          fetch('/api/admin/documents-status', { cache: 'no-store' }),
        ])

        if (dashboardRes.ok) setDashboardData(await dashboardRes.json())
        if (docsRes.ok) setDocsData(await docsRes.json())
      } catch (error) {
        console.error('Error loading dispatcher dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const summary = useMemo(() => {
    const conductores = dashboardData?.dashboard?.conductores || []
    const transportistas = dashboardData?.dashboard?.transportistas || []
    const totalConductores = dashboardData?.dashboard?.stats?.totalConductores || conductores.length
    const totalTransportistas = dashboardData?.dashboard?.stats?.totalTransportistas || transportistas.length
    const activeConductores = conductores.filter((c) => c.is_active !== false).length
    const activeTransportistas = transportistas.filter((t) => t.is_active !== false).length
    const pendingDocs = (docsData?.conductors?.pending || 0) + (docsData?.subcontractors?.pending || 0)
    const approvedDocs = (docsData?.conductors?.approved || 0) + (docsData?.subcontractors?.approved || 0)
    return {
      totalConductores,
      totalTransportistas,
      activeConductores,
      activeTransportistas,
      pendingDocs,
      approvedDocs,
    }
  }, [dashboardData, docsData])

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 font-medium">
                <Navigation className="h-3 w-3 mr-1" />
                Panel de despacho real
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Seguimiento operativo</h1>
              <p className="text-lg text-slate-300">Resumen en tiempo real de conductores, transportistas y documentos</p>
            </div>
            <Link href="/dashboard/company/conductores">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl">
                <Users className="h-5 w-5 mr-2" />
                Ver conductores
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm mb-1">Conductores</p>
            <p className="text-3xl font-bold text-white">{summary.totalConductores}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm mb-1">Transportistas</p>
            <p className="text-3xl font-bold text-white">{summary.totalTransportistas}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-green-300 text-sm mb-1">Conductores activos</p>
            <p className="text-3xl font-bold text-green-400">{summary.activeConductores}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-green-300 text-sm mb-1">Transportistas activos</p>
            <p className="text-3xl font-bold text-green-400">{summary.activeTransportistas}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-orange-300 text-sm mb-1">Docs pendientes</p>
            <p className="text-3xl font-bold text-orange-400">{summary.pendingDocs}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardContent className="p-6">
            <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Documentos aprobados</h3>
            <p className="text-sm text-slate-400 mt-1">{summary.approvedDocs}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardContent className="p-6">
            <Truck className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">Flota bajo control</h3>
            <p className="text-sm text-slate-400 mt-1">Datos reales desde el dashboard</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardContent className="p-6">
            <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
            <h3 className="font-semibold text-white">Alertas operativas</h3>
            <p className="text-sm text-slate-400 mt-1">Revisar documentos pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <CardHeader>
          <CardTitle className="text-white">Acciones rápidas</CardTitle>
          <CardDescription>Enlaces a flujos reales del sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/company/reportes">
            <Button className="w-full justify-start gap-2 border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800">
              <TrendingUp className="h-4 w-4" />
              Revisar reportes
            </Button>
          </Link>
          <Link href="/dashboard/company/documentos/vencidos">
            <Button className="w-full justify-start gap-2 border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800">
              <FileText className="h-4 w-4" />
              Ver vencidos
            </Button>
          </Link>
          <Link href="/dashboard/company/documentos/renovar">
            <Button className="w-full justify-start gap-2 border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800">
              <MapPin className="h-4 w-4" />
              Planificar renovaciones
            </Button>
          </Link>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-slate-400">Cargando datos reales...</div>
      ) : null}
    </div>
  )
}
