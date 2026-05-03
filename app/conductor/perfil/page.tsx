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
    name: '',
    rut: '',
    email: '',
    phone: '+56977764753',
    whatsapp_phone: '',
    whatsapp_enabled: false
  })

  useEffect(() => {
    // Load conductor data from cookies and preferences
    loadConductorData()
    loadPreferences()
  }, [])

  const loadConductorData = () => {
    try {
      // Get conductor data from localStorage (set by login form after successful login)
      const conductorData = localStorage.getItem('conductor_data')
      
      if (conductorData) {
        const parsed = JSON.parse(conductorData)
        console.log('[v0] Loaded conductor data from localStorage:', parsed)
        setFormData(prev => ({
          ...prev,
          name: parsed.nombre_completo || '',
          rut: parsed.rut || '',
          email: parsed.email || ''
        }))
      } else {
        console.log('[v0] No conductor data found in localStorage')
      }
    } catch (err) {
      console.error('[v0] Error loading conductor data:', err)
    }
  }

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
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h1 className="text-5xl font-bold text-white">Mi Perfil</h1>
        <p className="text-slate-300 mt-2">
          Gestiona tu información personal y preferencias de notificación
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-950/30 border-red-900/50">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-950/30 border-green-900/50">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="border-slate-700 bg-slate-800/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Información Personal</CardTitle>
          <CardDescription className="text-slate-400">
            Tus datos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre Completo
            </label>
            <Input
              value={formData.name}
              disabled
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              RUT
            </label>
            <Input
              value={formData.rut}
              disabled
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <Input
              value={formData.email}
              disabled
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Teléfono
            </label>
            <Input
              value={formData.phone}
              disabled
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 disabled:opacity-75"
            />
          </div>

          <p className="text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            Para cambiar estos datos, contacta con <span className="text-orange-400 font-semibold">soporte@labbe.cl</span>
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card className="border-slate-700 bg-gradient-to-r from-slate-800/40 to-slate-800/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-400" />
            Notificaciones por WhatsApp
          </CardTitle>
          <CardDescription className="text-slate-400">
            Recibe alertas sobre tus documentos y vencimientos en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de WhatsApp
            </label>
            <Input
              type="tel"
              name="whatsapp_phone"
              placeholder="+56912345678"
              value={formData.whatsapp_phone}
              onChange={handleInputChange}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 text-base"
            />
            <p className="text-xs text-slate-400 mt-2">
              Formato: +56 seguido de tu número (9 dígitos sin el 2)
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-950/30 border border-green-900/50 rounded-lg">
            <input
              type="checkbox"
              name="whatsapp_enabled"
              checked={formData.whatsapp_enabled}
              onChange={handleInputChange}
              className="rounded mt-1 bg-slate-700 border-slate-600"
            />
            <label className="text-sm font-medium text-green-300">
              Activar notificaciones por WhatsApp
            </label>
          </div>

          <div className="bg-gradient-to-r from-orange-950/30 to-orange-900/20 border border-orange-900/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-orange-300">
              Tipos de notificaciones:
            </p>
            <ul className="text-sm text-orange-200/80 mt-3 space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Documento aprobado o rechazado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Alerta de vencimiento (7 días antes)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Mensajes de soporte
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition-all"
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
