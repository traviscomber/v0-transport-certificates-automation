'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'

// Mock data for demo
const MOCK_PROFILE = {
  id: 'demo-user',
  email: 'admin@example.com',
  full_name: 'Usuario Demo Admin',
  role: 'admin',
  company_name: 'DocuFleet Demo',
  rut: '12.345.678-9',
  phone: '+56912345678',
  address: 'Calle Demo 123',
  city: 'Santiago',
  region: 'Metropolitana',
  is_active: true,
  created_at: new Date().toISOString(),
}

const MOCK_USERS = [
  {
    id: '1',
    email: 'carlos@example.com',
    full_name: 'Carlos López',
    role: 'driver',
    company_name: 'TransporteCo',
    rut: '11.222.333-4',
    phone: '+56912111111',
    address: 'Av. Principal 100',
    city: 'Santiago',
    region: 'Metropolitana',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'maria@example.com',
    full_name: 'María García',
    role: 'driver',
    company_name: 'TransporteCo',
    rut: '11.333.444-5',
    phone: '+56912222222',
    address: 'Av. Principal 101',
    city: 'Santiago',
    region: 'Metropolitana',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'juan@example.com',
    full_name: 'Juan Pérez',
    role: 'dispatcher',
    company_name: 'TransporteCo',
    rut: '11.444.555-6',
    phone: '+56912333333',
    address: 'Av. Principal 102',
    city: 'Santiago',
    region: 'Metropolitana',
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

const MOCK_CERTIFICATES = [
  {
    id: '1',
    driver_id: '1',
    certificate_type: 'license',
    certificate_number: 'LIC-001-2024',
    issue_date: '2023-12-31',
    expiry_date: '2025-12-31',
    issuing_authority: 'Municipalidad de Santiago',
    status: 'approved',
    file_url: '/certificates/license1.pdf',
    file_name: 'Licencia_De_Conducir.pdf',
    validation_notes: 'Documento válido',
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Carlos López',
      email: 'carlos@example.com',
      company_name: 'TransporteCo',
    },
  },
  {
    id: '2',
    driver_id: '2',
    certificate_type: 'permit',
    certificate_number: 'PERM-002-2024',
    issue_date: '2024-01-15',
    expiry_date: '2025-06-30',
    issuing_authority: 'SERNAC',
    status: 'pending',
    file_url: '/certificates/permit2.pdf',
    file_name: 'Permiso_Circulacion.pdf',
    validation_notes: 'En revisión',
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'María García',
      email: 'maria@example.com',
      company_name: 'TransporteCo',
    },
  },
  {
    id: '3',
    driver_id: '1',
    certificate_type: 'inspection',
    certificate_number: 'INSP-003-2024',
    issue_date: '2023-06-15',
    expiry_date: '2024-03-15',
    issuing_authority: 'EMOV',
    status: 'expired',
    file_url: '/certificates/inspection3.pdf',
    file_name: 'Revision_Tecnica.pdf',
    validation_notes: 'Vencido',
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Carlos López',
      email: 'carlos@example.com',
      company_name: 'TransporteCo',
    },
  },
]

const MOCK_AUDIT_LOG = [
  {
    id: '1',
    user_id: 'demo-user',
    action: 'Documento cargado',
    table_name: 'certificates',
    record_id: '1',
    old_values: null,
    new_values: { status: 'pending' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user',
    action: 'Documento validado',
    table_name: 'certificates',
    record_id: '1',
    old_values: { status: 'pending' },
    new_values: { status: 'approved' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome',
    created_at: new Date().toISOString(),
  },
]

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    user_id: 'demo-user',
    title: 'Documento pendiente',
    message: 'Hay 3 documentos pendientes de validación',
    type: 'warning',
    is_read: false,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Sistema',
      email: 'system@example.com',
    },
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Acción completada',
    message: 'Validación de documentos completada',
    type: 'success',
    is_read: true,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Sistema',
      email: 'system@example.com',
    },
  },
]

const MOCK_STATS = {
  totalUsers: 45,
  totalCertificates: 128,
  pendingCertificates: 12,
  expiredCertificates: 8,
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
