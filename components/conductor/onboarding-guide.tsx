'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, ChevronRight, FileText, Clock, CheckCheck, MessageCircle, HelpCircle, ArrowLeft } from 'lucide-react'

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Documentos Requeridos',
    description: 'Conoce qué documentos necesitas subir para trabajar con Labbe',
    icon: FileText,
    content: `Para trabajar como conductor con Labbe, necesitas estos 4 documentos:

• Licencia de Conducir: Vigente, categoría mínima B
• Certificado de Antecedentes: Emitido por Carabineros (no más de 6 meses)
• Póliza de Seguro: Seguro obligatorio del vehículo
• Verificación Técnica: VTV vigente del vehículo

Todos los documentos deben ser en PDF o imágenes (JPG, PNG). Máximo 10MB por archivo.`
  },
  {
    id: 2,
    title: 'Timeline de Validación',
    description: 'Cuánto tarda nuestro equipo en validar tus documentos',
    icon: Clock,
    content: `Aquí está el proceso de validación:

1. Carga: Subes tus documentos (5-10 minutos)
2. Validación Automática: Sistema revisa formato y legibilidad (2-5 minutos)
3. Revisión Manual: Nuestro equipo verifica datos (24-48 horas)
4. Aprobación: Recibes confirmación por email y WhatsApp

Una vez aprobados, puedes comenzar a trabajar inmediatamente.`
  },
  {
    id: 3,
    title: 'Cómo Funciona la Validación',
    description: 'Entiende cómo validamos tus documentos automáticamente',
    icon: CheckCheck,
    content: `Nuestro sistema utiliza inteligencia artificial para:

• Extraer información: Lee automáticamente tus documentos
• Verificar datos: Comprueba que la información esté completa
• Detectar vencimientos: Alerta si tus documentos vencen pronto
• Validar formato: Asegura que los archivos sean legítimos

Si algo no está bien, te lo comunicamos y puedes volver a subir.`
  },
  {
    id: 4,
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a las preguntas más comunes',
    icon: HelpCircle,
    content: `¿Qué pasa si me rechazan un documento?
No te preocupes, puedes subir una foto mejor. Te explicamos exactamente qué corregir.

¿Cuánto tiempo duran los documentos?
La licencia dura 5 años, antecedentes 6 meses, seguro 1 año, VTV 1 año.

¿Recibo alertas de vencimiento?
Sí, te notificamos por email y WhatsApp 7 días antes de que venza.

¿Puedo editar mis documentos?
Puedes subir nuevas versiones en cualquier momento.`
  },
  {
    id: 5,
    title: 'Activa Notificaciones WhatsApp',
    description: 'Recibe alertas en tiempo real sobre tus documentos',
    icon: MessageCircle,
    content: null
  }
]

interface OnboardingGuideProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function OnboardingGuide({ onComplete, onSkip }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [whatsappSaved, setWhatsappSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const step = ONBOARDING_STEPS[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleWhatsappSave = async () => {
    if (!whatsappPhone || whatsappPhone.length < 12) {
      alert('Ingresa un número de WhatsApp válido (+56XXXXXXXXX)')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/conductor/whatsapp-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_phone: whatsappPhone })
      })

      if (!response.ok) throw new Error('Error saving WhatsApp')

      setWhatsappSaved(true)
      setTimeout(() => {
        onComplete?.()
      }, 1500)
    } catch (error) {
      console.error('[v0] Error saving WhatsApp:', error)
      alert('Error al guardar el número. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      onComplete?.()
    } else {
      setCurrentStep(ONBOARDING_STEPS.length - 1)
    }
  }

  const handleCompleteOnboarding = () => {
    onComplete?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Bienvenido a Labbe
          </h1>
          <p className="text-lg text-slate-300">
            Te guiaremos en 5 pasos simples para comenzar a trabajar
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    i < currentStep
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i === currentStep
                      ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-300'
                      : 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  {i < currentStep ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                </div>
                <span className="text-xs text-slate-400 mt-2 text-center hidden sm:block font-medium">
                  {s.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-orange-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">{step.title}</h2>
              </div>
            </div>
            <p className="text-orange-100">
              Paso {currentStep + 1} de {ONBOARDING_STEPS.length} — {step.description}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Mantente conectado con WhatsApp
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Recibirás alertas sobre tus documentos, vencimientos y notificaciones importantes en tiempo real.
                  </p>
                </div>

                {whatsappSaved ? (
                  <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 border border-emerald-600 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-100 font-semibold text-lg">WhatsApp guardado correctamente</p>
                    <p className="text-emerald-300 mt-2 font-mono">{whatsappPhone}</p>
                  </div>
                ) : (
                  <div className="space-y-4 bg-slate-700/50 p-6 rounded-xl">
                    <div>
                      <label className="block text-white font-semibold mb-3">
                        Número de WhatsApp
                      </label>
                      <Input
                        type="tel"
                        placeholder="+56912345678"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white placeholder-slate-400 text-base py-3"
                      />
                      <p className="text-slate-400 text-sm mt-2">
                        Formato: +56 seguido de tu número (9 dígitos sin el 2)
                      </p>
                    </div>
                    <Button
                      onClick={handleWhatsappSave}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-3 text-base"
                    >
                      {isLoading ? 'Guardando...' : 'Guardar Número de WhatsApp'}
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleCompleteOnboarding}
                  className="w-full bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-semibold py-3 text-base"
                >
                  Completar Onboarding
                </Button>
              </div>
            ) : (
              /* Other Steps: Content */
              <div className="space-y-4">
                <div className="text-slate-200 leading-relaxed text-lg whitespace-pre-line">
                  {step.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-10 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>

          <Button
            onClick={handleSkip}
            className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold py-3"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Saltar' : 'Ir al Final'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentStep === ONBOARDING_STEPS.length - 1}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400">
          <p className="text-base">¿Preguntas? Contacta a <span className="text-cyan-400 font-semibold">soporte@labbe.cl</span></p>
        </div>
      </div>
    </div>
  )
}
