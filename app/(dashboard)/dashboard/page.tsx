'use client'

export const dynamic = 'force-dynamic'

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
}
