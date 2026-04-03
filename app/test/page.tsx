'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Users, Shield, ChevronDown, LogIn, Settings, ArrowRight, AlertCircle } from 'lucide-react'
import { performDemoLogin } from '@/lib/demo-login'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'features' | 'learning'>('roles')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const [loginStep, setLoginStep] = useState<string | null>(null)
  const { login } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const tabs = [
    { id: 'roles' as const, label: 'Los 3 Roles', icon: Truck },
    { id: 'features' as const, label: 'Features Avanzadas', icon: Shield },
    { id: 'learning' as const, label: 'Centro Educativo', icon: ChevronDown },
  ]

  const demoProfiles = [
    {
      role: 'conductor',
      title: 'Conductor',
      email: 'conductor@demo.cl',
      password: 'demo123',
      icon: <Truck className="w-8 h-8" />,
      description: 'Sube tus documentos y monitorea tu cumplimiento',
      features: [
        'Subir documentos (licencia, certificados médicos, etc)',
        'Ver estado en tiempo real',
        'Recibir alertas de vencimiento',
        'Generar reportes personales'
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

  const features = [
    { id: 'dashboard', title: 'Compliance Dashboard', description: 'Monitoreo en tiempo real', icon: Shield },
    { id: 'reports', title: 'Reportes Avanzados', description: 'Analytics y exportación', icon: Users },
    { id: 'analytics', title: 'Analytics', description: 'Métricas detalladas', icon: Truck },
    { id: 'ocr', title: 'Cargador OCR', description: 'Sube documentos', icon: LogIn },
  ]

  const faqs = [
    {
      id: '1',
      question: '¿Cuáles son los 3 roles principales?',
      answer: 'Conductor (acceso a documentos personales), Despachador (gestión de equipo), Administrador (control total del sistema).'
    },
    {
      id: '2',
      question: '¿Cuántos documentos debo subir?',
      answer: '35 documentos requeridos por Walmart Chile, distribuidos en 6 categorías: Empresa, Conductor, Vehículo, Seguridad, Operacional y Subcontratación.'
    },
    {
      id: '3',
      question: '¿Cómo funciona la verificación?',
      answer: 'Usamos OCR + validación humana para verificar cada documento. Los resultados se procesan en tiempo real.'
    },
  ]

  const handleQuickLogin = async (profile: typeof demoProfiles[0]) => {
    setLoadingRole(profile.role)
    setLoginStep('Autenticando...')

    try {
      await performDemoLogin(profile.email, profile.password, login)
      setLoginStep('Redirigiendo...')
      addToast(`Bienvenido, ${profile.title}!`, 'success', 2000)
      setTimeout(() => router.push('/dashboard'), 500)
    } catch (error) {
      setLoadingRole(null)
      setLoginStep(null)
      addToast('Cuentas demo no configuradas. Ve a /setup-demo', 'warning', 3000)
      setTimeout(() => router.push('/setup-demo'), 1200)
    }
  }

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'dashboard':
        addToast('Accediendo al Compliance Dashboard...', 'info', 1500)
        setTimeout(() => router.push('/dashboard/compliance'), 800)
        break
      case 'reports':
        addToast('Cargando Reportes...', 'info', 1500)
        setTimeout(() => router.push('/dashboard/reports'), 800)
        break
      case 'analytics':
        addToast('Cargando Analytics...', 'info', 1500)
        setTimeout(() => router.push('/dashboard/analytics'), 800)
        break
      case 'ocr':
        addToast('Abriendo portal OCR...', 'info', 1500)
        setTimeout(() => router.push('/ocr'), 800)
        break
      default:
        addToast('Función disponible en breve', 'warning', 2000)
    }
  }

  const toggleFaq = (id: string): void => {
    setExpandedFaq(prev => prev === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Prueba Interactiva</h1>
              <p className="text-slate-400 mt-1">Explora DocuFleet con acceso rápido a los 3 roles</p>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" className="border-slate-600">
              Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Los 3 Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            {/* Setup Notice */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Primera vez aqui?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Los botones requieren demo accounts. Si no estan configuradas, te redirigiremos automaticamente.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push('/setup-demo')}>
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" className="btn-orange text-xs" onClick={() => router.push('/auth/register')}>
                  Crear Cuenta
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demoProfiles.map((profile) => (
                <Card key={profile.role} className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-orange-400">{profile.icon}</div>
                      <span className="text-xs font-mono text-slate-500">{profile.email}</span>
                    </div>
                    <CardTitle className="text-white mt-3">{profile.title}</CardTitle>
                    <CardDescription>{profile.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {profile.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleQuickLogin(profile)}
                      disabled={loadingRole === profile.role}
                      className="w-full btn-orange"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loadingRole === profile.role ? loginStep : `Entrar como ${profile.title}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleFeatureClick(feature.id)} className="w-full btn-orange">
                    Explorar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Learning Center Tab */}
        {activeTab === 'learning' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card
                key={faq.id}
                className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
                onClick={() => toggleFaq(faq.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">{faq.question}</CardTitle>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedFaq === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                {expandedFaq === faq.id && (
                  <CardContent>
                    <p className="text-slate-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
