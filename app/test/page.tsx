'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'
import { Button } from '@/components/ui/button'

// Mock data
const MOCK_PROFILE = {
  id: '1',
  email: 'admin@example.com',
  role: 'admin' as const,
  full_name: 'Admin User',
  company_name: 'DocuFleet Demo',
}

const MOCK_USERS = [
  { id: '1', email: 'driver1@example.com', role: 'driver', full_name: 'Driver 1' },
  { id: '2', email: 'dispatcher@example.com', role: 'dispatcher', full_name: 'Dispatcher 1' },
]

const MOCK_CERTIFICATES = [
  { id: '1', user_id: '1', type: 'license', status: 'approved', expiry_date: '2025-12-31' },
  { id: '2', user_id: '2', type: 'technical_review', status: 'pending', expiry_date: '2024-06-30' },
]

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'certificate_expiring', message: 'Certificate expiring soon' },
]

const MOCK_AUDIT_LOG = [
  { id: '1', action: 'login', user: 'admin@example.com', timestamp: new Date() },
]

const MOCK_STATS = {
  total_users: 45,
  certificates_approved: 120,
  certificates_pending: 8,
  compliance_rate: 95,
}

export default function TestPage() {
  const [activeRole, setActiveRole] = useState<'admin' | 'dispatcher' | 'driver' | null>(null)

  if (activeRole === 'admin') {
    return (
      <div className="min-h-screen">
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          ← Volver a Roles
        </button>
        <AdminDashboard
          profile={MOCK_PROFILE}
          users={MOCK_USERS}
          certificates={MOCK_CERTIFICATES}
          auditLog={MOCK_AUDIT_LOG}
          notifications={MOCK_NOTIFICATIONS}
          stats={MOCK_STATS}
        />
      </div>
    )
  }

  if (activeRole === 'dispatcher') {
    return (
      <div className="min-h-screen">
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          ← Volver a Roles
        </button>
        <DispatcherDashboard />
      </div>
    )
  }

  if (activeRole === 'driver') {
    return (
      <div className="min-h-screen">
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          ← Volver a Roles
        </button>
        <DriverDashboard
          profile={MOCK_PROFILE}
          certificates={MOCK_CERTIFICATES}
          notifications={MOCK_NOTIFICATIONS}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Centro Educativo DocuFleet</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Aprende cómo usar DocuFleet explorando los 3 roles principales
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Conductor */}
          <button
            onClick={() => setActiveRole('driver')}
            className="text-left p-6 rounded-lg border-2 border-orange-500/50 bg-orange-500/10 hover:border-orange-500 hover:bg-orange-500/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                🚗
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-300 mb-2">Conductor</h3>
                <p className="text-sm text-slate-300 mb-3">Gestiona tus documentos y certificados de conducción</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>✓ Subir documentos</p>
                  <p>✓ Seguimiento de estado</p>
                  <p>✓ Alertas de vencimiento</p>
                </div>
              </div>
            </div>
          </button>

          {/* Despachador */}
          <button
            onClick={() => setActiveRole('dispatcher')}
            className="text-left p-6 rounded-lg border-2 border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-500 hover:bg-cyan-500/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                📋
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Despachador</h3>
                <p className="text-sm text-slate-300 mb-3">Supervisión de flota y documentos de conductores</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>✓ Gestionar flota</p>
                  <p>✓ Monitorear documentos</p>
                  <p>✓ Reportes operacionales</p>
                </div>
              </div>
            </div>
          </button>

          {/* Administrador */}
          <button
            onClick={() => setActiveRole('admin')}
            className="text-left p-6 rounded-lg border-2 border-green-500/50 bg-green-500/10 hover:border-green-500 hover:bg-green-500/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                ⚙️
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-300 mb-2">Administrador</h3>
                <p className="text-sm text-slate-300 mb-3">Control total del sistema y gestión de usuarios</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>✓ Gestión de usuarios</p>
                  <p>✓ Validar documentos</p>
                  <p>✓ Auditoría completa</p>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-200">
            Haz clic en cualquier rol para explorar el dashboard de demostración con datos simulados. Esto te ayudará a entender todas las funcionalidades de DocuFleet antes de registrarte.
          </p>
        </div>
      </div>
    </div>
  )
}
