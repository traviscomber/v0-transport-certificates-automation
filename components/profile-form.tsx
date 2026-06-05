'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, User, Mail, Phone, Save, X, Camera } from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url: string
  role: string
  rut: string
}

export function ProfileForm() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Error al cargar perfil')
      }
      
      const data = await response.json()
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        
        // Upload to API
        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 })
        })

        if (!response.ok) {
          throw new Error('Error al subir imagen')
        }

        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          avatar_url: data.avatar_url
        }))
        setSuccess('Foto de perfil actualizada')
        setTimeout(() => setSuccess(null), 3000)
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Error al guardar cambios')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setSuccess('Perfil actualizado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">Error al cargar el perfil</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="flex gap-3 rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <Save className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Información personal y configuración de cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Foto de perfil"
                  width={120}
                  height={120}
                  className="h-30 w-30 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="h-30 w-30 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary/50" />
                </div>
              )}
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{profile.full_name || 'Usuario'}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary" className="mt-2">
                {profile.role === 'dispatcher' ? 'Ejecutiva' : profile.role === 'transportista' ? 'Subcontratista' : profile.role}
              </Badge>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </label>
                {isEditing ? (
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre completo"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {profile.full_name || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-sm text-muted-foreground py-2">
                  {profile.email}
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </label>
                {isEditing ? (
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+56912345678"
                    type="tel"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {profile.phone || 'No especificado'}
                  </p>
                )}
              </div>

              {/* RUT (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">RUT</label>
                <p className="text-sm text-muted-foreground py-2">
                  {profile.rut || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-6 justify-end">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                      avatar_url: profile.avatar_url || ''
                    })
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <User className="h-4 w-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
