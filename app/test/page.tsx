'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'

// SVG Icons aligned to brandbook
const DriverIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
)

const DispatcherIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2z" />
  </svg>
)

const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16h4v2h-4zm0-5h4v2h-4zm0-5h4v2h-4z" />
  </svg>
)

// Mock data for demo (rest remains the same...)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-orange-500/10 rounded-lg mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Prueba Rápida DocuFleet</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-2">
            Explora los 3 roles principales del sistema de gestión de documentos y certificados de transporte.
          </p>
          <p className="text-slate-400 text-sm">
            Selecciona un rol para ver el dashboard con datos simulados
          </p>
        </div>

        {/* What is DocuFleet Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-orange-500">●</span> ¿Qué es DocuFleet?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            DocuFleet es una plataforma de automatización y validación de documentos empresariales. Utiliza inteligencia artificial (OCR + Visión Computacional) para extraer, verificar y digitalizar certificados, permisos y documentos de transporte en tiempo real. Reduce errores manuales, acelera procesos de cumplimiento normativo y centraliza toda la información en un dashboard intuitivo.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid gap-6 mb-12">
          {/* Conductor Card */}
          <button
            onClick={() => setActiveRole('driver')}
            className="group text-left transition-all duration-300 hover:scale-105"
          >
            <div className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/30 transition-colors">
                  <DriverIcon />
                </div>
                <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full">CONDUCTOR</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Conductor</h3>
              <p className="text-slate-400 text-sm mb-4">
                Para conductores y transportistas individuales que necesitan cargar y mantener sus certificados actualizados.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="text-xs text-slate-300 font-semibold">Funcionalidades:</div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Subir certificados (Licencia, Permiso, Revisión Técnica)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Validar documentos automáticamente con IA
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Recibir alertas de vencimiento
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> Descargar reportes de cumplimiento
                  </li>
                </ul>
              </div>
              
              <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-semibold group-hover:gap-3 transition-all">
                Explorar dashboard <span>→</span>
              </div>
            </div>
          </button>

          {/* Despachador Card */}
          <button
            onClick={() => setActiveRole('dispatcher')}
            className="group text-left transition-all duration-300 hover:scale-105"
          >
            <div className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-6 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
                  <DispatcherIcon />
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full">DESPACHADOR</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Despachador</h3>
              <p className="text-slate-400 text-sm mb-4">
                Para empresas de transporte que supervisan conductores y coordinan la documentación de sus flotas.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="text-xs text-slate-300 font-semibold">Funcionalidades:</div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">✓</span> Gestionar flota completa de conductores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">✓</span> Monitorear estado de documentos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">✓</span> Asignar tareas de validación
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-500">✓</span> Generar reportes operacionales
                  </li>
                </ul>
              </div>
              
              <div className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold group-hover:gap-3 transition-all">
                Explorar dashboard <span>→</span>
              </div>
            </div>
          </button>

          {/* Administrador Card */}
          <button
            onClick={() => setActiveRole('admin')}
            className="group text-left transition-all duration-300 hover:scale-105"
          >
            <div className="border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/30 transition-colors">
                  <AdminIcon />
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">ADMINISTRADOR</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Administrador</h3>
              <p className="text-slate-400 text-sm mb-4">
                Control total del sistema. Gestión de usuarios, configuración empresarial, auditoría y reportes avanzados.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="text-xs text-slate-300 font-semibold">Funcionalidades:</div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Administrar usuarios y permisos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Validar todos los documentos manualmente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Auditar cambios en el sistema
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Configurar políticas de cumplimiento
                  </li>
                </ul>
              </div>
              
              <div className="inline-flex items-center gap-2 text-green-400 text-sm font-semibold group-hover:gap-3 transition-all">
                Explorar dashboard <span>→</span>
              </div>
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-500">●</span> ¿Cómo funciona?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Cargar Documento</h4>
                <p className="text-xs text-slate-400">Los conductores suben sus certificados en formato PDF o imagen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Validar Automáticamente</h4>
                <p className="text-xs text-slate-400">La IA extrae datos y verifica autenticidad en segundos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Monitorear</h4>
                <p className="text-xs text-slate-400">Los despachadores y admins reciben alertas de vencimiento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-300 mb-1">Información importante</h4>
              <p className="text-sm text-blue-200/80">
                Este es un entorno de demostración con datos simulados. Los dashboards muestran la interfaz y funcionalidades reales, pero no procesan documentos auténticos. Para acceso completo y producción, por favor{' '}
                <a href="/auth/login" className="text-blue-300 hover:text-blue-200 underline font-semibold">
                  inicia sesión
                </a>{' '}
                con tus credenciales o{' '}
                <a href="/auth/register" className="text-blue-300 hover:text-blue-200 underline font-semibold">
                  regístrate aquí
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
