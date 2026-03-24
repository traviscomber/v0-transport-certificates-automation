'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Upload,
  Bell,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

// Demo stats
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

const recentActivity = [
  { id: 1, action: 'Documento aprobado', entity: 'Licencia Conducir - Maria Lopez', time: 'Hace 2 horas' },
  { id: 2, action: 'Documento subido', entity: 'Revision Tecnica - Camion ABC123', time: 'Hace 4 horas' },
  { id: 3, action: 'Alerta generada', entity: 'Vencimiento proximo - SOAP', time: 'Hace 6 horas' },
  { id: 4, action: 'Usuario registrado', entity: 'Carlos Rodriguez - Conductor', time: 'Ayer' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de compliance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/upload">
            <Button className="btn-orange">
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalCertificates}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-500/30 text-green-300 border-green-500/50">{stats.approved} aprobados</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">Requieren revision</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-2">Accion inmediata</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.complianceScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">Cumplimiento general</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Drivers & Vehicles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conductores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalDrivers}</div>
            <Link href="/drivers-management" className="text-xs text-orange-400 hover:underline mt-2 inline-flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Vehiculos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalVehicles}</div>
            <Link href="/vehicles-management" className="text-xs text-orange-400 hover:underline mt-2 inline-flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.alertsCount}</div>
            <Link href="/alerts" className="text-xs text-orange-400 hover:underline mt-2 inline-flex items-center gap-1">
              Ver alertas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Alertas Recientes</CardTitle>
                <CardDescription>Notificaciones de compliance</CardDescription>
              </div>
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="border-slate-600">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className={`mt-0.5 ${
                  alert.priority === 'critical' ? 'text-red-400' :
                  alert.priority === 'high' ? 'text-orange-400' : 'text-yellow-400'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <Badge className={`text-xs ${
                  alert.priority === 'critical' ? 'bg-red-500/30 text-red-300 border-red-500/50' :
                  alert.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' :
                  'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
                }`}>
                  {alert.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Actividad Reciente</CardTitle>
                <CardDescription>Ultimas acciones en el sistema</CardDescription>
              </div>
              <Link href="/reports">
                <Button variant="outline" size="sm" className="border-slate-600">
                  Ver reportes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="text-green-400 mt-0.5">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.entity}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/upload">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-orange-500/50 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Upload className="h-8 w-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground">Subir Documento</h3>
              <p className="text-xs text-muted-foreground mt-1">Cargar nuevo certificado</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/drivers-management">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-cyan-500/50 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground">Conductores</h3>
              <p className="text-xs text-muted-foreground mt-1">Gestionar conductores</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vehicles-management">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-green-500/50 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground">Vehiculos</h3>
              <p className="text-xs text-muted-foreground mt-1">Gestionar flota</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-purple-500/50 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground">Reportes</h3>
              <p className="text-xs text-muted-foreground mt-1">Generar informes</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
