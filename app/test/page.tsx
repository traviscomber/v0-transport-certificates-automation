'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'

// Mock data for demo
const MOCK_PROFILE = {
  id: 'demo-user',
  name: 'Usuario Demo',
  email: 'demo@example.com',
  role: 'admin' as const,
  avatar: '/avatars/demo.jpg',
  createdAt: new Date().toISOString(),
}

const MOCK_USERS = [
  { id: '1', name: 'Carlos López', email: 'carlos@example.com', role: 'driver' },
  { id: '2', name: 'María García', email: 'maria@example.com', role: 'driver' },
  { id: '3', name: 'Juan Pérez', email: 'juan@example.com', role: 'driver' },
]

const MOCK_CERTIFICATES = [
  { id: '1', name: 'Licencia de Conducir', type: 'license', status: 'valid', expiresAt: '2025-12-31' },
  { id: '2', name: 'Permiso de Circulación', type: 'permit', status: 'valid', expiresAt: '2025-06-30' },
  { id: '3', name: 'Revisión Técnica', type: 'inspection', status: 'expired', expiresAt: '2024-03-15' },
]

const MOCK_AUDIT_LOG = [
  { id: '1', action: 'Documento cargado', user: 'System', timestamp: new Date().toISOString() },
  { id: '2', action: 'Documento validado', user: 'System', timestamp: new Date().toISOString() },
]

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Documento pendiente', message: 'Hay 3 documentos pendientes de validación', type: 'warning' },
  { id: '2', title: 'Acción completada', message: 'Validación de documentos completada', type: 'success' },
]

const MOCK_STATS = {
  totalUsers: 45,
  totalDocuments: 128,
  pendingDocuments: 12,
  complianceScore: 87,
}

export default function TestPage() {
  const [activeRole, setActiveRole] = useState<'admin' | 'dispatcher' | 'driver' | null>(null)

  if (activeRole === 'admin') {
    return (
      <div>
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div>
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Volver a Roles
        </button>
        <DispatcherDashboard />
      </div>
    )
  }

  if (activeRole === 'driver') {
    return (
      <div>
        <button
          onClick={() => setActiveRole(null)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 text-4xl">▶</div>
          <h1 className="text-4xl font-bold text-white mb-2">Prueba Rápida</h1>
          <p className="text-slate-400">
            Haz clic en cualquier botón para acceder al sistema con una cuenta de demo.
          </p>
        </div>

        {/* Demo Buttons */}
        <div className="space-y-4">
          {/* Conductor Button */}
          <button
            onClick={() => setActiveRole('driver')}
            className="w-full p-6 rounded-lg border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                👤
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-400">Conductor</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Acceso como conductor para subir certificados
            </p>
          </button>

          {/* Despachador Button */}
          <button
            onClick={() => setActiveRole('dispatcher')}
            className="w-full p-6 rounded-lg border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold">
                📊
              </div>
              <div>
                <h3 className="text-xl font-bold text-cyan-400">Despachador</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Acceso como despachador para gestionar conductores
            </p>
          </button>

          {/* Administrador Button */}
          <button
            onClick={() => setActiveRole('admin')}
            className="w-full p-6 rounded-lg border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 transition-all group text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
                🔐
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400">Administrador</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Acceso completo al sistema
            </p>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
          <p className="text-sm text-blue-300">
            ℹ️ Estos son dashboards de demostración con datos simulados. Para un acceso completo, por favor{' '}
            <a href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
              inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
