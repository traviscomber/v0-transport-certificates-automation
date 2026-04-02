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
  const [activeTab, setActiveTab] = useState<'roles' | 'features' | 'learn'>('roles')

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Container with Tabs */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-orange-500/10 rounded-lg mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Centro Educativo DocuFleet</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Aprende cómo usar DocuFleet explorando los 3 roles principales, features avanzadas y documentación completa
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'roles' | 'features' | 'learn')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger value="roles" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
              Los 3 Roles
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              Features Avanzadas
            </TabsTrigger>
            <TabsTrigger value="learn" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
              Centro de Aprendizaje
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Roles */}
          <TabsContent value="roles" className="space-y-8">
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
          </div>
        </div>
          </TabsContent>

          {/* Tab 2: Features Avanzadas */}
          <TabsContent value="features" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">Features Avanzadas</h2>
                <p className="text-slate-400">Explora las herramientas de nivel empresarial para gestión completa</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Compliance Dashboard */}
                <Card className="bg-slate-800/50 border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-cyan-300 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Compliance Dashboard
                    </CardTitle>
                    <CardDescription>Monitoreo de cumplimiento normativo en tiempo real</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">Visualiza el estado de compliance de todos los documentos, certificados vencidos, alertas críticas y métricas de cumplimiento por transportista.</p>
                    <Link href="/admin/reportes">
                      <Badge className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer">Ver Dashboard</Badge>
                    </Link>
                  </CardContent>
                </Card>

                {/* Reports Dashboard */}
                <Card className="bg-slate-800/50 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-300 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2V17zm4 0h-2V7h2V17zm4 0h-2v-4h2V17z" />
                      </svg>
                      Reportes Avanzados
                    </CardTitle>
                    <CardDescription>Análisis detallado y exportación de datos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">Genera reportes personalizados, gráficos analíticos, auditoría de acciones y exporta datos en múltiples formatos.</p>
                    <Link href="/admin/reportes">
                      <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 cursor-pointer">Ver Reportes</Badge>
                    </Link>
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="bg-slate-800/50 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-300 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
                      </svg>
                      Analytics
                    </CardTitle>
                    <CardDescription>Métricas e indicadores de desempeño</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">Análisis de tendencias, KPIs de cumplimiento, tasas de validación y comportamiento de usuarios.</p>
                    <Link href="/analytics">
                      <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30 cursor-pointer">Ver Analytics</Badge>
                    </Link>
                  </CardContent>
                </Card>

                {/* OCR Processing */}
                <Card className="bg-slate-800/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      Extracción OCR
                    </CardTitle>
                    <CardDescription>Análisis inteligente de documentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">Sube documentos y la IA extrae automáticamente datos, valida formatos y detecta anomalías.</p>
                    <Link href="/app/upload">
                      <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer">Subir Documento</Badge>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mt-8">
                <p className="text-sm text-blue-200">
                  Estos dashboards muestran datos simulados. Para acceso a features reales con tus datos, por favor{' '}
                  <a href="/auth/login" className="text-blue-300 hover:text-blue-200 underline font-semibold">
                    inicia sesión
                  </a>.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Centro de Aprendizaje */}
          <TabsContent value="learn" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">Centro de Aprendizaje</h2>
                <p className="text-slate-400">Todo lo que necesitas saber para usar DocuFleet</p>
              </div>

              <div className="space-y-6">
                {/* Getting Started */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Comenzar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-300">
                    <p>• Crea una cuenta en /auth/register</p>
                    <p>• Selecciona tu rol (Conductor, Despachador, Admin, etc.)</p>
                    <p>• Configura tu organización y perfil</p>
                    <p>• Invita a otros usuarios a tu equipo</p>
                  </CardContent>
                </Card>

                {/* Documentos */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Gestión de Documentos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-300">
                    <p>• Los conductores suben certificados (Licencia, Permiso, Revisión Técnica, etc.)</p>
                    <p>• El sistema usa IA para extraer datos automáticamente</p>
                    <p>• Los administradores validan y aprueban documentos</p>
                    <p>• Recibe alertas cuando los documentos estén próximos a vencer</p>
                  </CardContent>
                </Card>

                {/* Cumplimiento */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Cumplimiento y Auditoría</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-300">
                    <p>• Todas las acciones quedan registradas en auditoría</p>
                    <p>• Genera reportes de compliance para reguladores</p>
                    <p>• Monitorea en tiempo real el estado de documentos</p>
                    <p>• Exporta datos para análisis externo</p>
                  </CardContent>
                </Card>

                {/* Roles y Permisos */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Roles y Permisos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <div>
                      <p className="font-semibold text-orange-300">Conductor</p>
                      <p>Subir y gestionar sus propios documentos</p>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-300">Despachador</p>
                      <p>Supervisar flota, asignar tareas, ver alertas</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-300">Administrador</p>
                      <p>Control total del sistema, usuario management, auditoría</p>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Preguntas Frecuentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <div>
                      <p className="font-semibold text-white">¿Qué documentos puedo subir?</p>
                      <p>Licencia de Conducir, Permiso de Circulación, Revisión Técnica, Seguro de Responsabilidad, y más.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">¿Cuánto tiempo tarda la validación?</p>
                      <p>Segundos con IA automática. Los documentos se validan en tiempo real.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">¿Es seguro mi información?</p>
                      <p>Sí. Usamos encriptación, servidores seguros en Supabase y cumplimos regulaciones.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Final Important Notice - Outside Tabs */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mt-8">
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
}
