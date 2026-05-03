'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Navigation,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Phone,
  Activity,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  driverId: string
  driverName: string
  vehicleId: string
  vehiclePlate: string
  status: 'assigned' | 'in-transit' | 'completed' | 'delayed'
  pickup: string
  delivery: string
  eta: string
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    driverId: 'd1',
    driverName: 'Juan Pérez',
    vehicleId: 'v1',
    vehiclePlate: 'ABC-123',
    status: 'in-transit',
    pickup: 'Santiago Centro',
    delivery: 'Valparaíso',
    eta: '14:30',
  },
  {
    id: '2',
    driverId: 'd2',
    driverName: 'María González',
    vehicleId: 'v2',
    vehiclePlate: 'XYZ-456',
    status: 'assigned',
    pickup: 'Puente Alto',
    delivery: 'La Florida',
    eta: '16:00',
  },
  {
    id: '3',
    driverId: 'd3',
    driverName: 'Carlos Rodríguez',
    vehicleId: 'v3',
    vehiclePlate: 'DEF-789',
    status: 'completed',
    pickup: 'Maipú',
    delivery: 'Providencia',
    eta: '10:15',
  },
]

export default function DispatcherDashboard() {
  const stats = {
    activeAssignments: 12,
    inTransit: 8,
    completed: 35,
    delayed: 2,
    availableVehicles: 5,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'delayed':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'assigned':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 font-medium">
                <Navigation className="h-3 w-3 mr-1" />
                Panel de Despacho
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Gestión de Asignaciones</h1>
              <p className="text-lg text-slate-300">Control en tiempo real de tu flota y conductores</p>
            </div>
            <Link href="/drivers-management">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl">
                <Users className="h-5 w-5 mr-2" />
                Nueva Asignación
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Navigation className="h-5 w-5 text-blue-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Asignaciones Activas</p>
            <p className="text-3xl font-bold text-white">{stats.activeAssignments}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">En Tránsito</p>
            <p className="text-3xl font-bold text-white">{stats.inTransit}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-green-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Completadas Hoy</p>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-red-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Retrasadas</p>
            <p className="text-3xl font-bold text-white">{stats.delayed}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-green-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Truck className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Vehículos Disponibles</p>
            <p className="text-3xl font-bold text-white">{stats.availableVehicles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Assignments */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <CardHeader>
          <CardTitle className="text-white">Asignaciones Activas</CardTitle>
          <CardDescription>Seguimiento en tiempo real de entregas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-white">{assignment.driverName}</p>
                  <Badge variant="outline" className="text-xs border-slate-600">
                    {assignment.vehiclePlate}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span>{assignment.pickup} → {assignment.delivery}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">ETA</p>
                  <p className="text-sm font-medium text-white">{assignment.eta}</p>
                </div>
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status === 'in-transit' && 'En Tránsito'}
                  {assignment.status === 'completed' && 'Completado'}
                  {assignment.status === 'delayed' && 'Retrasado'}
                  {assignment.status === 'assigned' && 'Asignado'}
                </Badge>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/30 transition-all cursor-pointer">
          <CardContent className="p-6">
            <Navigation className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">Optimizar Rutas</h3>
            <p className="text-sm text-slate-400 mt-1">Calcular rutas más eficientes</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-green-500/30 transition-all cursor-pointer">
          <CardContent className="p-6">
            <Truck className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Flota en Mapa</h3>
            <p className="text-sm text-slate-400 mt-1">Ver ubicación en tiempo real</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
