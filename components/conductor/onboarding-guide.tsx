'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, ChevronRight, FileText, Clock, CheckCheck, MessageCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Documentos Requeridos',
    description: 'Conoce qué documentos necesitas subir para trabajar con Labbe',
    icon: FileText,
    content: `
      Para trabajar como conductor con Labbe, necesitas estos 4 documentos:
      
      1. **Licencia de Conducir**: Vigente, categoría mínima B
      2. **Certificado de Antecedentes**: Emitido por Carabineros (no más de 6 meses)
      3. **Póliza de Seguro**: Seguro obligatorio del vehículo
      4. **Verificación Técnica**: VTV vigente del vehículo
      
      Todos los documentos deben ser en PDF o imágenes (JPG, PNG). Máximo 10MB por archivo.
    `
  },
  {
    id: 2,
    title: 'Timeline de Validación',
    description: 'Cuánto tarda nuestro equipo en validar tus documentos',
    icon: Clock,
    content: `
      Aquí está el proceso de validación:
      
      1. **Carga**: Subes tus documentos (5-10 minutos)
      2. **Validación Automática**: Sistema revisa formato y legibilidad (2-5 minutos)
      3. **Revisión Manual**: Nuestro equipo verifica datos (24-48 horas)
      4. **Aprobación**: Recibes confirmación por email y WhatsApp
      
      Una vez aprobados, puedes comenzar a trabajar inmediatamente.
    `
  },
  {
    id: 3,
    title: 'Cómo Funciona la Validación',
    description: 'Entende cómo validamos tus documentos automáticamente',
    icon: CheckCheck,
    content: `
      Nuestro sistema utiliza inteligencia artificial para:
      
      • **Extraer información**: Lee automáticamente tus documentos
      • **Verificar datos**: Comprueba que la información esté completa
      • **Detectar vencimientos**: Alerta si tus documentos vencen pronto
      • **Validar formato**: Asegura que los archivos sean legítimos
      
      Si algo no está bien, te lo comunicamos y puedes volver a subir.
    `
  },
  {
    id: 4,
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a las preguntas más comunes',
    icon: HelpCircle,
    content: `
      **¿Qué pasa si me rechazan un documento?**
      No te preocupes, puedes subir una foto mejor. Te explicamos exactamente qué corregir.
      
      **¿Cuánto tiempo duran los documentos?**
      La licencia dura 5 años, antecedentes 6 meses, seguro 1 año, VTV 1 año.
      
      **¿Recibo alertas de vencimiento?**
      Sí, te notificamos por email y WhatsApp 7 días antes de que venza.
      
      **¿Puedo editar mis documentos?**
      Puedes subir nuevas versiones en cualquier momento.
    `
  },
  {
    id: 5,
    title: 'Activa Notificaciones WhatsApp',
    description: 'Recibe alertas en tiempo real sobre tus documentos',
    icon: MessageCircle,
    content: null // Este paso tiene un formulario especial
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bienvenido a Labbe
          </h1>
          <p className="text-gray-600">
            Te guiaremos en 5 pasos simples para comenzar a trabajar
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {ONBOARDING_STEPS.map((s, i) => (
              <div
                key={s.id}
                className="flex flex-col items-center flex-1"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    i < currentStep
                      ? 'bg-green-500 text-white'
                      : i === currentStep
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i < currentStep ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center hidden md:block">
                  {s.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6" />
              <CardTitle className="text-white">{step.title}</CardTitle>
            </div>
            <CardDescription className="text-blue-100">
              Paso {currentStep + 1} de {ONBOARDING_STEPS.length}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Step 5: WhatsApp Form */}
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Mantente conectado con WhatsApp
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Recibirás alertas sobre tus documentos, vencimientos y notificaciones importantes
                  </p>
                </div>

                {whatsappSaved ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-semibold">WhatsApp guardado correctamente</p>
                    <p className="text-green-600 text-sm mt-1">{whatsappPhone}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de WhatsApp
                      </label>
                      <Input
                        type="tel"
                        placeholder="+56912345678"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: +56 seguido de tu número (9 dígitos sin el 2)
                      </p>
                    </div>
                    <Button
                      onClick={handleWhatsappSave}
                      disabled={isLoading}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2"
                    >
                      {isLoading ? 'Guardando...' : 'Guardar Número de WhatsApp'}
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleCompleteOnboarding}
                  className="w-full"
                >
                  Completar Onboarding
                </Button>
              </div>
            ) : (
              /* Other Steps: Content */
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-line">
                  {step.content}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            Atrás
          </Button>

          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Saltar' : 'Ir al Final'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentStep === ONBOARDING_STEPS.length - 1}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>¿Preguntas? Contacta a <strong>soporte@labbe.cl</strong></p>
        </div>
      </div>
    </div>
  )
}
