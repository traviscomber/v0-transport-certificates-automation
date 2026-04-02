'use client'

import { useState } from 'react'
import { Zap, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestPage() {
  const [activeTab, setActiveTab] = useState('roles')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Centro Educativo DocuFleet</h1>
              <p className="text-slate-400">
                Aprende cómo usar DocuFleet explorando los 3 roles principales, features avanzadas y documentación
              </p>
            </div>
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
        {/* Los 3 Roles Tab */}
        {activeTab === 'roles' && (
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
                <Link href="/auth/login">
                  <Button className="btn-orange">Ver Dashboard</Button>
                </Link>
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

        {/* Features Avanzadas Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Reportes Avanzados</CardTitle>
                <CardDescription>Análisis detallado y exportación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Genera reportes personalizados y gráficos analíticos.
                </p>
                <Button className="btn-orange">Ver Reportes</Button>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Extracción OCR</CardTitle>
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
          <div className="space-y-6 max-w-4xl">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Comenzar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="space-y-2">
                  <p className="font-semibold">1. Crea una cuenta en /auth/register</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">2. Selecciona el rol (Conductor, Despachador, Admin)</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">3. Configura tu perfil y organización</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">4. Invita a otros usuarios a tu equipo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Gestión de Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Los conductores suben certificados automáticamente</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>El sistema extrae datos usando IA</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Los administradores validan y aprueban</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Recibe alertas de vencimiento</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Cumplimiento y Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Todas las acciones quedan registradas</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Genera reportes de compliance</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Monitorea estado de documentos en tiempo real</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-orange-500">•</span>
                  <span>Exporta datos para análisis</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    id: 'q1',
                    q: '¿Qué documentos puedo subir?',
                    a: 'Licencia, Permiso, Revisión Técnica, Seguro, y más.',
                  },
                  {
                    id: 'q2',
                    q: '¿Cuánto tarda la validación?',
                    a: 'Segundos con IA automática en tiempo real.',
                  },
                  {
                    id: 'q3',
                    q: '¿Es seguro?',
                    a: 'Sí. Encriptación, servidores seguros y cumplimiento normativo.',
                  },
                ].map((faq) => (
                  <div key={faq.id} className="border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-left font-semibold text-slate-300">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-orange-500 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700 text-slate-300">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Notice */}
        <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-slate-300">
            Este es un entorno de demostración con datos simulados. Para acceso real, por favor{' '}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-semibold">
              inicia sesión
            </Link>{' '}
            o{' '}
            <Link href="/auth/register" className="text-orange-500 hover:text-orange-400 font-semibold">
              regístrate aquí
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
