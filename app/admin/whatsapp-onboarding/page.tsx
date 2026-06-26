'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Copy, ExternalLink } from 'lucide-react'

interface Preventionist {
  email: string
  phone: string
  name: string
}

const PREVENTIONISTS: Preventionist[] = [
  {
    email: 'aramirez@labbe.cl',
    phone: '+56912345678', // Replace with actual phone
    name: 'Aracely Ramírez',
  },
  {
    email: 'bmiranda@labbe.cl',
    phone: '+56987654321', // Replace with actual phone
    name: 'Bernardo Miranda',
  },
]

const MESSAGE_TEMPLATE = `Hola! Te damos acceso a la plataforma de certificados de transporte de LABBE.

Tu acceso de prevencionista:
🔗 URL: https://cleaner2.vercel.app/login
📧 Email: {email}
(Solo ingresa tu email - no requiere contraseña)

Con tu acceso podrás:
✓ Ver todos los documentos aprobados
✓ Descargar documentos
✓ Filtrar por subcontratista y mes
✓ Vista de solo lectura (sin permisos de edición)

¿Preguntas? Contacta al equipo.`

export default function WhatsAppOnboarding() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopyMessage = (email: string) => {
    const messageContent = MESSAGE_TEMPLATE.replace('{email}', email)
    navigator.clipboard.writeText(messageContent)
    setCopied(email)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleOpenWhatsApp = (phone: string, email: string) => {
    const messageContent = encodeURIComponent(
      MESSAGE_TEMPLATE.replace('{email}', email)
    )
    // WhatsApp Web URL format
    window.open(`https://web.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}&text=${messageContent}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Notificaciones WhatsApp - Prevencionistas</h1>
          <p className="text-slate-400 mt-1">Envía mensajes de bienvenida a los prevencionistas vía WhatsApp Web</p>
        </div>

        {/* Preventionists Cards */}
        <div className="grid gap-4">
          {PREVENTIONISTS.map(prev => (
            <Card key={prev.email} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{prev.name}</CardTitle>
                    <CardDescription>{prev.email}</CardDescription>
                  </div>
                  <div className="text-xs text-slate-400">{prev.phone}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Message Preview */}
                <div className="bg-slate-800/50 p-3 rounded text-sm text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                  {MESSAGE_TEMPLATE.replace('{email}', prev.email)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyMessage(prev.email)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    {copied === prev.email ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Mensaje
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleOpenWhatsApp(prev.phone, prev.email)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Cómo enviar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-slate-100 mb-2">Opción 1: Copiar y pegar</p>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Haz clic en "Copiar Mensaje"</li>
                <li>Abre WhatsApp Web o tu aplicación</li>
                <li>Busca al contacto y pega el mensaje</li>
                <li>Envía</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-slate-100 mb-2">Opción 2: WhatsApp directo</p>
              <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                <li>Haz clic en "Enviar por WhatsApp"</li>
                <li>Se abrirá WhatsApp Web con el mensaje preformateado</li>
                <li>Solo haz clic en Enviar</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
