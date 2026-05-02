'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader, MessageCircle } from 'lucide-react'

export default function ConductorPerfilPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: 'Olga Lydia Carrasco',
    rut: '12345678-9',
    email: 'ocarrasco@labbe.cl',
    phone: '+56977764753',
    whatsapp_phone: '',
    whatsapp_enabled: false
  })

  useEffect(() => {
    // Load current preferences
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conductor/whatsapp-preferences')
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          whatsapp_phone: data.whatsapp_phone || '',
          whatsapp_enabled: data.notifications_enabled || false
        }))
      }
    } catch (err) {
      console.error('[v0] Error loading preferences:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      // Save WhatsApp preferences
      if (formData.whatsapp_phone) {
        const response = await fetch('/api/conductor/whatsapp-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whatsapp_phone: formData.whatsapp_phone,
            whatsapp_enabled: formData.whatsapp_enabled
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error al guardar')
        }
      }

      setSuccess('Perfil actualizado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y preferencias de notificación
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Tus datos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <Input
              value={formData.name}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUT
            </label>
            <Input
              value={formData.rut}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <Input
              value={formData.phone}
              disabled
              className="bg-gray-50"
            />
          </div>

          <p className="text-sm text-gray-500">
            Para cambiar estos datos, contacta con soporte@labbe.cl
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Notificaciones por WhatsApp
          </CardTitle>
          <CardDescription>
            Recibe alertas sobre tus documentos y vencimientos en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <Input
              type="tel"
              name="whatsapp_phone"
              placeholder="+56912345678"
              value={formData.whatsapp_phone}
              onChange={handleInputChange}
              className="text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: +56 seguido de tu número (9 dígitos sin el 2)
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <input
              type="checkbox"
              name="whatsapp_enabled"
              checked={formData.whatsapp_enabled}
              onChange={handleInputChange}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Activar notificaciones por WhatsApp
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tipos de notificaciones:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
              <li>✓ Documento aprobado o rechazado</li>
              <li>✓ Alerta de vencimiento (7 días antes)</li>
              <li>✓ Mensajes de soporte</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </div>
  )
}
