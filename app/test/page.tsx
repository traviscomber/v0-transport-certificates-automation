'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import DriverDashboard from '@/components/driver/driver-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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

// Mock data
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
    profiles: { full_name: 'Carlos López', email: 'carlos@example.com', company_name: 'TransporteCo' },
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
    profiles: { full_name: 'Sistema', email: 'system@example.com' },
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
  const [activeTab, setActiveTab] = useState<'roles' | 'features' | 'learn'>('roles')

  // Show individual dashboard when role selected
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

  // Main page with tabs
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-orange-500/10 rounded-lg mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Centro Educativo DocuFleet</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Aprende cómo usar DocuFleet explorando los 3 roles principales, features avanzadas y documentación
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'roles' | 'features' | 'learn')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="roles">Los 3 Roles</TabsTrigger>
            <TabsTrigger value="features">Features Avanzadas</TabsTrigger>
            <TabsTrigger value="learn">Centro de Aprendizaje</TabsTrigger>
          </TabsList>

          {/* Tab 1: Roles */}
          <TabsContent value="roles" className="space-y-8">
            {/* What is DocuFleet */}
            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-orange-500">●</span> ¿Qué es DocuFleet?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm leading-relaxed">
                  DocuFleet es una plataforma de automatización y validación de documentos empresariales. Utiliza inteligencia artificial (OCR + Visión Computacional) para extraer, verificar y digitalizar certificados, permisos y documentos de transporte en tiempo real.
                </p>
              </CardContent>
            </Card>

            {/* Role Cards */}
            <div className="space-y-4">
              {/* Conductor */}
              <button
                onClick={() => setActiveRole('driver')}
                className="w-full text-left p-6 rounded-lg border-2 border-orange-500/50 bg-orange-500/10 hover:border-orange-500 hover:bg-orange-500/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <DriverIcon />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-orange-300">Conductor</h3>
                    <p className="text-sm text-slate-400 mb-3">Subir y gestionar certificados</p>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>✓ Subir certificados</p>
                      <p>✓ Validación automática con IA</p>
                      <p>✓ Alertas de vencimiento</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Despachador */}
              <button
                onClick={() => setActiveRole('dispatcher')}
                className="w-full text-left p-6 rounded-lg border-2 border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-500 hover:bg-cyan-500/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <DispatcherIcon />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-cyan-300">Despachador</h3>
                    <p className="text-sm text-slate-400 mb-3">Supervisar flota y conductores</p>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>✓ Gestionar flota completa</p>
                      <p>✓ Monitorear documentos</p>
                      <p>✓ Reportes operacionales</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Administrador */}
              <button
                onClick={() => setActiveRole('admin')}
                className="w-full text-left p-6 rounded-lg border-2 border-green-500/50 bg-green-500/10 hover:border-green-500 hover:bg-green-500/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                    <AdminIcon />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-green-300">Administrador</h3>
                    <p className="text-sm text-slate-400 mb-3">Control total del sistema</p>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>✓ Administrar usuarios</p>
                      <p>✓ Validar documentos</p>
                      <p>✓ Auditoría completa</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </TabsContent>

          {/* Tab 2: Features Avanzadas */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-slate-800/50 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-cyan-300 text-base">Compliance Dashboard</CardTitle>
                  <CardDescription>Monitoreo de cumplimiento normativo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">Visualiza el estado de compliance de todos los documentos en tiempo real.</p>
                  <Link href="/admin/reportes">
                    <Badge className="bg-cyan-500/20 text-cyan-300 cursor-pointer">Ver Dashboard</Badge>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-orange-300 text-base">Reportes Avanzados</CardTitle>
                  <CardDescription>Análisis detallado y exportación</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">Genera reportes personalizados y gráficos analíticos.</p>
                  <Link href="/admin/reportes">
                    <Badge className="bg-orange-500/20 text-orange-300 cursor-pointer">Ver Reportes</Badge>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-green-300 text-base">Analytics</CardTitle>
                  <CardDescription>Métricas e indicadores KPI</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">Análisis de tendencias y comportamiento de usuarios.</p>
                  <Link href="/analytics">
                    <Badge className="bg-green-500/20 text-green-300 cursor-pointer">Ver Analytics</Badge>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-purple-300 text-base">Extracción OCR</CardTitle>
                  <CardDescription>Análisis inteligente de documentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">La IA extrae automáticamente datos de documentos.</p>
                  <Link href="/app/upload">
                    <Badge className="bg-purple-500/20 text-purple-300 cursor-pointer">Subir Documento</Badge>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Centro de Aprendizaje */}
          <TabsContent value="learn" className="space-y-4">
            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Comenzar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>1. Crea una cuenta en /auth/register</p>
                <p>2. Selecciona tu rol (Conductor, Despachador, Admin)</p>
                <p>3. Configura tu perfil y organización</p>
                <p>4. Invita a otros usuarios a tu equipo</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Gestión de Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>• Los conductores suben certificados automáticamente</p>
                <p>• El sistema extrae datos usando IA</p>
                <p>• Los administradores validan y aprueban</p>
                <p>• Recibe alertas de vencimiento</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Cumplimiento y Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>• Todas las acciones quedan registradas</p>
                <p>• Genera reportes de compliance</p>
                <p>• Monitorea estado de documentos en tiempo real</p>
                <p>• Exporta datos para análisis</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white mb-1">¿Qué documentos puedo subir?</p>
                  <p>Licencia, Permiso, Revisión Técnica, Seguro, y más.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">¿Cuánto tarda la validación?</p>
                  <p>Segundos con IA automática en tiempo real.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">¿Es seguro?</p>
                  <p>Sí. Encriptación, servidores seguros y cumplimiento normativo.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Important Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mt-8">
          <p className="text-sm text-blue-200">
            Este es un entorno de demostración con datos simulados. Para acceso real, por favor{' '}
            <a href="/auth/login" className="text-blue-300 hover:text-blue-200 underline font-semibold">
              inicia sesión
            </a>{' '}
            o{' '}
            <a href="/auth/register" className="text-blue-300 hover:text-blue-200 underline font-semibold">
              regístrate aquí
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
