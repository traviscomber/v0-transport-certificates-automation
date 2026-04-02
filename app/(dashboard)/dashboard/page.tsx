'use client'

import { useAuth } from '@/lib/auth-context'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import TransportistaDashboard from '@/components/transportista/transportista-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'
import MandanteDashboard from '@/components/mandante/mandante-dashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando tu dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">No autenticado. Redirigiendo...</div>
      </div>
    )
  }

  // Renderiza dashboard según rol del usuario
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'dispatcher':
      return <DispatcherDashboard />
    case 'transportista':
      return <TransportistaDashboard />
    case 'driver':
      return <DriverDashboard />
    case 'mandante':
      return <MandanteDashboard />
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-yellow-500">Rol desconocido: {user.role}</div>
        </div>
      )
  }

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                  <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-cyan-400" />
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">Premium</Badge>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-2">Compliance Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stats.complianceScore}<span className="text-lg sm:text-xl">%</span></p>
              <p className="text-xs text-cyan-400 mt-2">Excelente estado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Alerts */}
        <div className="lg:col-span-2">
          <div className="rounded-lg sm:rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Alertas Críticas</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Requieren atención inmediata</p>
                  </div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 font-semibold text-xs sm:text-sm self-start sm:self-auto">{stats.alertsCount}</Badge>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group flex flex-col sm:flex-row sm:items-start gap-3 p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    alert.priority === 'critical' ? 'bg-red-500/20' :
                    alert.priority === 'high' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      alert.priority === 'critical' ? 'text-red-400' :
                      alert.priority === 'high' ? 'text-orange-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs sm:text-sm">{alert.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 self-start ${
                    alert.priority === 'critical' ? 'bg-red-500/30 text-red-300 border-red-500/50' :
                    alert.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' :
                    'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
                  }`}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
              <Link href="/alerts" className="block mt-3 sm:mt-4">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white text-sm sm:text-base">
                  Ver todas las alertas
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats - Mobile Stacked */}
        <div className="space-y-3 sm:space-y-4">
          {/* Drivers Card */}
          <Link href="/drivers-management">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-cyan-500/30 transition-all cursor-pointer group h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                    <Users className="h-5 sm:h-6 w-5 sm:w-6 text-cyan-400" />
                  </div>
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Conductores Activos</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalDrivers}</p>
                <p className="text-xs text-cyan-400 mt-2">Gestionar flotilla</p>
              </CardContent>
            </Card>
          </Link>

          {/* Vehicles Card */}
          <Link href="/vehicles-management">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-green-500/30 transition-all cursor-pointer group h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <Truck className="h-5 sm:h-6 w-5 sm:w-6 text-green-400" />
                  </div>
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-green-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Vehículos en Flota</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalVehicles}</p>
                <p className="text-xs text-green-400 mt-2">Ver detalles</p>
              </CardContent>
            </Card>
          </Link>

          {/* Reports Card */}
          <Link href="/reports">
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-purple-500/30 transition-all cursor-pointer group h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <BarChart3 className="h-5 sm:h-6 w-5 sm:w-6 text-purple-400" />
                  </div>
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Reportes & Analytics</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">+15 tipos</p>
                <p className="text-xs text-purple-400 mt-2">Generar informes</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* CTA Section - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">¿Necesitas ayuda?</h2>
          <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">Nuestro equipo está disponible 24/7 para resolver tus dudas sobre compliance y documentación.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 text-sm sm:text-base">
              Contactar Soporte
            </Button>
            <Button variant="outline" className="border-orange-500/30 text-slate-300 hover:bg-orange-500/10 text-sm sm:text-base">
              Ver Documentación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
