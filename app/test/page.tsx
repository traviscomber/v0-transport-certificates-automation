'use client'

import { useState } from 'react'
import { Zap, ChevronDown, Users, Shield, Truck, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function TestPage() {
  const [activeTab, setActiveTab] = useState('roles')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const demoProfiles = [
    {
      role: 'driver',
      title: 'Conductor',
      email: 'conductor@demo.cl',
      password: 'demo123',
      icon: <Truck className="w-8 h-8" />,
      description: 'Gestiona tus documentos, certificados y permisos',
      features: [
        'Subir certificados (licencia, revisión técnica, seguros)',
        'Seguimiento de validaciones en tiempo real',
        'Alertas de vencimiento',
        'Estado de cumplimiento personal'
      ]
    },
    {
      role: 'dispatcher',
      title: 'Despachador',
      email: 'despachador@demo.cl',
      password: 'demo123',
      icon: <Users className="w-8 h-8" />,
      description: 'Administra conductores y monitorea compliance del equipo',
      features: [
        'Dashboard de conductores de la empresa',
        'Seguimiento de documentos por conductor',
        'Generar reportes de cumplimiento',
        'Gestionar alertas del equipo'
      ]
    },
    {
      role: 'admin',
      title: 'Administrador',
      email: 'admin@demo.cl',
      password: 'demo123',
      icon: <Shield className="w-8 h-8" />,
      description: 'Control total del sistema y organizaciones',
      features: [
        'Gestionar múltiples organizaciones',
        'Dashboard global de compliance',
        'Reportes analytics avanzados',
        'Configuración de políticas y validaciones'
      ]
    }
  ]

  const handleQuickLogin = async (profile: typeof demoProfiles[0]) => {
    setLoadingRole(profile.role)
    try {
      await login(profile.email, profile.password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setLoadingRole(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Centro Educativo DocuFleet</h1>
            <p className="text-slate-400">
              Aprende cómo usar DocuFleet explorando los 3 roles principales, features avanzadas y documentación
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b border-slate-700 -mb-px">
            {[
              { id: 'roles', label: 'Los 3 Roles' },
              { id: 'features', label: 'Features Avanzadas' },
              { id: 'learning', label: 'Centro de Aprendizaje' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-orange-500 border-orange-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Los 3 Roles Tab - Clickable Profiles */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoProfiles.map((profile) => (
              <Card
                key={profile.role}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:text-orange-400 transition-colors">
                      {profile.icon}
                    </div>
                    <div>
                      <CardTitle className="text-orange-500 text-lg">{profile.title}</CardTitle>
                      <CardDescription className="text-slate-400">{profile.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm">{profile.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-200">Funcionalidades:</h4>
                    <ul className="space-y-1">
                      {profile.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-orange-500">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleQuickLogin(profile)}
                    disabled={loadingRole === profile.role}
                    className="w-full btn-orange mt-4"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {loadingRole === profile.role ? 'Entrando...' : 'Entrar como ' + profile.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Features Avanzadas Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all">
              <CardHeader>
                <CardTitle className="text-orange-500 text-lg">Compliance Dashboard</CardTitle>
                <CardDescription>Monitoreo de cumplimiento normativo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Visualiza el estado de compliance de todos los documentos en tiempo real.
                </p>
                <Button className="btn-orange">Ver Dashboard</Button>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all">
              <CardHeader>
                <CardTitle className="text-orange-500 text-lg">Reportes Avanzados</CardTitle>
                <CardDescription>Análisis detallado y exportación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Genera reportes personalizados y gráficos analíticos.
                </p>
                <Button className="btn-orange">Ver Reportes</Button>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all">
              <CardHeader>
                <CardTitle className="text-orange-500 text-lg">Analytics</CardTitle>
                <CardDescription>Métricas e indicadores KPI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Análisis de tendencias y comportamiento de usuarios.
                </p>
                <Button className="btn-orange">Ver Analytics</Button>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all">
              <CardHeader>
                <CardTitle className="text-orange-500 text-lg">Extracción OCR</CardTitle>
                <CardDescription>Análisis inteligente de documentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  La IA extrae automáticamente datos de documentos.
                </p>
                <Button className="btn-orange">Subir Documento</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Centro de Aprendizaje Tab */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            {/* Comenzar */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Comenzar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>1. Crea una cuenta en /auth/register</p>
                <p>2. Selecciona tu rol (Conductor, Despachador, Admin)</p>
                <p>3. Configura tu perfil y organización</p>
                <p>4. Invita a otros usuarios a tu equipo</p>
              </CardContent>
            </Card>

            {/* Gestión de Documentos */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Gestión de Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>• Los conductores suben certificados automáticamente</p>
                <p>• El sistema extrae datos usando IA</p>
                <p>• Los administradores validan y aprueban</p>
                <p>• Recibe alertas de vencimiento</p>
              </CardContent>
            </Card>

            {/* Cumplimiento y Auditoría */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Cumplimiento y Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>• Todas las acciones quedan registradas</p>
                <p>• Genera reportes de compliance</p>
                <p>• Monitorea estado de documentos en tiempo real</p>
                <p>• Exporta datos para análisis</p>
              </CardContent>
            </Card>

            {/* Preguntas Frecuentes */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'q1', q: '¿Qué documentos puedo subir?', a: 'Licencia, Permiso, Revisión Técnica, Seguro, y más.' },
                  { id: 'q2', q: '¿Cuánto tarda la validación?', a: 'Segundos con IA automática en tiempo real.' },
                  { id: 'q3', q: '¿Es seguro?', a: 'Sí. Encriptación, servidores seguros y cumplimiento normativo.' },
                ].map((faq) => (
                  <div key={faq.id} className="border border-slate-700 rounded-lg">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="font-semibold text-slate-200">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="p-4 bg-slate-700/30 text-slate-300 border-t border-slate-700">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          Este es un entorno de demostración con datos simulados. Para acceso real, por favor{' '}
          <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-semibold">
            inicia sesión
          </Link>
          {' '}o{' '}
          <Link href="/auth/register" className="text-orange-500 hover:text-orange-400 font-semibold">
            registrate aquí
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
