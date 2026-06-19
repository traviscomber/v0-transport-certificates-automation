'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, FileText, Clock, AlertCircle, ArrowRight } from 'lucide-react'

export default function SubcontractorsOnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Bienvenido al Portal</h1>
          <p className="text-xl text-slate-300">Gestión integral de documentos y certificaciones</p>
        </div>

        {/* Welcome Message */}
        <Card className="border-slate-700 bg-slate-800/50 mb-8">
          <CardContent className="pt-6">
            <p className="text-slate-200 text-lg leading-relaxed">
              En este portal podrás subir, gestionar y monitorear todos los documentos requeridos por la empresa de transporte. 
              Asegúrate de mantener tu documentación actualizada para poder operar sin inconvenientes.
            </p>
          </CardContent>
        </Card>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Documents */}
          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-400" />
                    Subir Documentos
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300">Sube todos los documentos requeridos de forma fácil y segura:</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  Formatos: PDF, JPG, PNG
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  Tamaño máximo: 50 MB por archivo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">•</span>
                  Procesa automáticamente cada subida
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Monitor Status */}
          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Monitorear Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300">Visualiza el estado de cada documento en tiempo real:</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                  <span><strong className="text-green-400">Aprobado</strong> = Validado y activo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                  <span><strong className="text-blue-400">Bajo revisión</strong> = Recibido y validando</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
                  <span><strong className="text-red-400">Rechazado</strong> = Requiere acción</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Fechas de Vencimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300">Cada documento tiene un período de validez:</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Recibe recordatorios antes de vencer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Renueva a tiempo para evitar suspensiones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">•</span>
                  Mantén tu historial actualizado
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Soporte y Ayuda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-300">Si tienes dudas o problemas:</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  Contacta con tu ejecutiva asignada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  Revisa los motivos de rechazo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  Responde a las solicitudes de información
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/subcontractors/dashboard')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-lg flex items-center gap-2 transition-all hover:shadow-lg"
          >
            Ir al Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
