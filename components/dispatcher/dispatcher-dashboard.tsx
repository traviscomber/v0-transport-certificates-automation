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



  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCertificateTypeLabel = (type: string) => {
    const labels = {
      f30: "Certificado F-30",
      license: "Licencia de Conducir",
      medical: "Certificado Médico",
      vehicle_registration: "Registro Vehicular",
      insurance: "Seguro",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
      expired: "Vencido",
    }
    return labels[status as keyof typeof labels] || status
  }

  // Filter certificates
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCertificateTypeLabel(cert.certificate_type).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter
    const matchesType = typeFilter === "all" || cert.certificate_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const approvedCerts = certificates.filter((c) => c.status === "approved")
  const pendingCerts = certificates.filter((c) => c.status === "pending")
  const rejectedCerts = certificates.filter((c) => c.status === "rejected")
  const expiredCerts = certificates.filter((c) => c.status === "expired")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel del Despachador</h1>
              <p className="text-muted-foreground">
                {profile.company_name} - {drivers.length} conductores
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conductores</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCerts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCerts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringCertificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCerts.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="certificates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="certificates">
              Certificados
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="drivers">Conductores</TabsTrigger>
            <TabsTrigger value="expiring">
              Por Vencer
              {expiringCertificates.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {expiringCertificates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestión de Certificados</CardTitle>
                <CardDescription>Revisa y valida los certificados de tus conductores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por conductor, número o tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="approved">Aprobados</SelectItem>
                      <SelectItem value="rejected">Rechazados</SelectItem>
                      <SelectItem value="expired">Vencidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="f30">Certificado F-30</SelectItem>
                      <SelectItem value="license">Licencia</SelectItem>
                      <SelectItem value="medical">Médico</SelectItem>
                      <SelectItem value="vehicle_registration">Registro Vehicular</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Conductor</th>
                        <th className="p-4 font-medium">Tipo</th>
                        <th className="p-4 font-medium">Número</th>
                        <th className="p-4 font-medium">Vencimiento</th>
                        <th className="p-4 font-medium">Estado</th>
                        <th className="p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCertificates.map((certificate) => (
                        <tr key={certificate.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{certificate.profiles.full_name}</div>
                              <div className="text-sm text-muted-foreground">{certificate.profiles.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {getCertificateTypeLabel(certificate.certificate_type)}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm">{certificate.certificate_number || "N/A"}</span>
                          </td>
                          <td className="p-4">
                            {certificate.expiry_date ? (
                              <span className="text-sm">
                                {new Date(certificate.expiry_date).toLocaleDateString("es-CL")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(certificate.status)}>
                              {getStatusIcon(certificate.status)}
                              <span className="ml-1">{getStatusLabel(certificate.status)}</span>
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedCertificate(certificate)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              {certificate.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(certificate.file_url, "_blank")}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredCertificates.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron certificados</h3>
                    <p className="text-muted-foreground">Ajusta los filtros para ver más resultados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conductores de la Empresa</CardTitle>
                <CardDescription>Gestiona los conductores de {profile.company_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => {
                    const driverCerts = certificates.filter((c) => c.driver_id === driver.id)
                    const activeCerts = driverCerts.filter((c) => c.status === "approved")
                    const pendingCerts = driverCerts.filter((c) => c.status === "pending")

                    return (
                      <Card key={driver.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{driver.full_name}</CardTitle>
                            <Badge variant={driver.is_active ? "default" : "secondary"}>
                              {driver.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <CardDescription>{driver.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Certificados activos:</span>
                              <span className="font-medium">{activeCerts.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pendientes:</span>
                              <span className="font-medium text-yellow-600">{pendingCerts.length}</span>
                            </div>
                            {driver.phone && <div className="text-sm text-muted-foreground">Tel: {driver.phone}</div>}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 bg-transparent"
                            onClick={() => setSelectedDriver(driver)}
                          >
                            Ver Detalles
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Certificados por Vencer
                </CardTitle>
                <CardDescription>Certificados que vencen en los próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringCertificates.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">¡Excelente!</h3>
                    <p className="text-muted-foreground">No hay certificados próximos a vencer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expiringCertificates.map((certificate) => {
                      const daysUntilExpiry = Math.ceil(
                        (new Date(certificate.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24),
                      )

                      return (
                        <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{certificate.profiles.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {getCertificateTypeLabel(certificate.certificate_type)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-orange-600">{daysUntilExpiry} días restantes</div>
                            <div className="text-sm text-muted-foreground">
                              Vence: {new Date(certificate.expiry_date).toLocaleDateString("es-CL")}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedCertificate && (
        <CertificateValidationModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onSuccess={() => {
            setSelectedCertificate(null)
            router.refresh()
          }}
        />
      )}

      {selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          certificates={certificates.filter((c) => c.driver_id === selectedDriver.id)}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  )
}
