'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Upload,
  Bell,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

const stats = {
  totalCertificates: 156,
  approved: 128,
  pending: 18,
  expired: 10,
  totalDrivers: 24,
  totalVehicles: 18,
  complianceScore: 87,
  alertsCount: 5,
}

const recentAlerts = [
  { id: 1, type: 'expiry', title: 'Licencia por vencer', message: 'Juan Perez - Vence en 7 dias', priority: 'high' },
  { id: 2, type: 'missing', title: 'Documento faltante', message: 'Revision tecnica - ABC123', priority: 'critical' },
  { id: 3, type: 'expiry', title: 'SOAP por vencer', message: 'Vehiculo XY-4567 - Vence en 15 dias', priority: 'normal' },
]

export default function DashboardPage() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
        {/* Neon lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30 font-medium">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Compliance
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-balance">
                Fleet Compliance Platform
              </h1>
              <p className="text-lg text-slate-300 text-balance">
                Automatizamos la gestión de documentos con IA. Cero multas. 99.8% accuracy.
              </p>
            </div>
            <Link href="/upload">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl text-base group">
                <Upload className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Subir Documentos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid - Premium Style */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Métricas de Cumplimiento</h2>
          <p className="text-slate-400 text-sm mt-1">Estado actual de tu flota</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Certificates */}
          <div
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-orange-500/30"
            onMouseEnter={() => setHoveredStat(0)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <FileText className="h-5 w-5 text-orange-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm mb-2">Total Documentos</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{stats.totalCertificates}</p>
                <span className="text-sm text-green-400">+12% mes</span>
              </div>
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-green-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Activo</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-2">Aprobados</p>
              <p className="text-3xl font-bold text-white">{stats.approved}</p>
              <p className="text-xs text-slate-500 mt-2">{((stats.approved/stats.totalCertificates)*100).toFixed(0)}% cumplimiento</p>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-yellow-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Revisión</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-2">Pendientes</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-slate-500 mt-2">Requieren acción</p>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur transition-all duration-300 hover:border-cyan-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Premium</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-2">Compliance Score</p>
              <p className="text-3xl font-bold text-white">{stats.complianceScore}<span className="text-lg">%</span></p>
              <p className="text-xs text-cyan-400 mt-2">Excelente estado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Alerts */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Alertas Críticas</h3>
                    <p className="text-sm text-slate-400">Requieren atención inmediata</p>
                  </div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 font-semibold">{stats.alertsCount}</Badge>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    alert.priority === 'critical' ? 'bg-red-500/20' :
                    alert.priority === 'high' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.priority === 'critical' ? 'text-red-400' :
                      alert.priority === 'high' ? 'text-orange-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{alert.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${
                    alert.priority === 'critical' ? 'bg-red-500/30 text-red-300 border-red-500/50' :
                    alert.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' :
                    'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
                  }`}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
              <Link href="/alerts" className="block">
                <Button variant="outline" className="w-full mt-2 border-slate-600 text-slate-300 hover:text-white">
                  Ver todas las alertas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-4">
          {/* Drivers Card */}
          <Link href="/drivers-management">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-cyan-500/30 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                    <Users className="h-6 w-6 text-cyan-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Conductores Activos</p>
                <p className="text-3xl font-bold text-white">{stats.totalDrivers}</p>
                <p className="text-xs text-cyan-400 mt-2">Gestionar flotilla</p>
              </CardContent>
            </Card>
          </Link>

          {/* Vehicles Card */}
          <Link href="/vehicles-management">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-green-500/30 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <Truck className="h-6 w-6 text-green-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Vehículos en Flota</p>
                <p className="text-3xl font-bold text-white">{stats.totalVehicles}</p>
                <p className="text-xs text-green-400 mt-2">Ver detalles</p>
              </CardContent>
            </Card>
          </Link>

          {/* Reports Card */}
          <Link href="/reports">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-purple-500/30 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Reportes & Analytics</p>
                <p className="text-2xl font-bold text-white">+15 tipos</p>
                <p className="text-xs text-purple-400 mt-2">Generar informes</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 p-8 md:p-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">¿Necesitas ayuda?</h2>
          <p className="text-slate-300 mb-6">Nuestro equipo está disponible 24/7 para resolver tus dudas sobre compliance y documentación.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
              Contactar Soporte
            </Button>
            <Button variant="outline" className="border-orange-500/30 text-slate-300 hover:bg-orange-500/10">
              Ver Documentación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
