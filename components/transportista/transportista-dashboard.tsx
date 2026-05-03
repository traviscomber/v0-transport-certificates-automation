'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Truck,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function TransportistaDashboard() {
  const stats = {
    totalVehicles: 18,
    activeVehicles: 15,
    activeDrivers: 24,
    pendingDocuments: 5,
    complianceScore: 92,
    revenue: 45230,
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30 font-medium">
                <Truck className="h-3 w-3 mr-1" />
                Panel Transportista
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Mi Flota</h1>
              <p className="text-lg text-slate-300">Gestión integral de tu flota y documentación</p>
            </div>
            <Link href="/vehicles-management">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl">
                <Truck className="h-5 w-5 mr-2" />
                Ver Flota
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-4">
              <Truck className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Vehículos</p>
            <p className="text-3xl font-bold text-white">{stats.totalVehicles}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-blue-500/20 w-fit mb-4">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Activos Ahora</p>
            <p className="text-3xl font-bold text-white">{stats.activeVehicles}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-purple-500/20 w-fit mb-4">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Conductores Activos</p>
            <p className="text-3xl font-bold text-white">{stats.activeDrivers}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-yellow-500/20 w-fit mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Documentos Pendientes</p>
            <p className="text-3xl font-bold text-white">{stats.pendingDocuments}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Score Compliance</p>
            <p className="text-3xl font-bold text-white">{stats.complianceScore}%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-4">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Ingresos Mes</p>
            <p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardHeader>
            <CardTitle className="text-white">Documentación Vigente</CardTitle>
            <CardDescription>Estado de documentos de flota y conductores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-green-500/20">
              <span className="text-slate-300">Pólizas de Seguros</span>
              <Badge className="bg-green-500/20 text-green-300">18/18</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-yellow-500/20">
              <span className="text-slate-300">Permisos de Circulación</span>
              <Badge className="bg-yellow-500/20 text-yellow-300">17/18</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-red-500/20">
              <span className="text-slate-300">Revisiones Técnicas</span>
              <Badge className="bg-red-500/20 text-red-300">15/18</Badge>
            </div>
            <Link href="/vehicles-management">
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600">
                Actualizar Documentación
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardHeader>
            <CardTitle className="text-white">KPIs de Desempeño</CardTitle>
            <CardDescription>Métricas de rendimiento este mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Utilización Flota</span>
                <span className="text-white font-semibold">83%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Puntualidad</span>
                <span className="text-white font-semibold">91%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Satisfacción Cliente</span>
                <span className="text-white font-semibold">94%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
