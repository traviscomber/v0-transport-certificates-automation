'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Camera, Mail, Phone, Save, User, X } from 'lucide-react'
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  })

  useEffect(() => {
    void fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Error al cargar perfil')

      const data = await response.json()
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      const reader = new FileReader()

      reader.onload = async (readerEvent) => {
        const base64 = readerEvent.target?.result as string
        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        })

        if (!response.ok) throw new Error('Error al subir imagen')

        const data = await response.json()
        setFormData((current) => ({ ...current, avatar_url: data.avatar_url }))
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
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al guardar cambios')

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
      <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--cf-accent)] border-t-transparent" />
        <p className="mt-3 text-sm text-[var(--cf-text-muted)]">Cargando perfil…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-6 py-8">
        <p className="text-sm font-medium text-[#E17B8C]">Error al cargar el perfil.</p>
        <p className="mt-2 text-xs text-[var(--cf-text-muted)]">La información no se reemplaza por valores simulados.</p>
      </div>
    )
  }

  const roleLabel = profile.role === 'dispatcher'
    ? 'Ejecutiva'
    : profile.role === 'transportista'
      ? 'Subcontratista'
      : profile.role

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex gap-3 rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-4 py-3">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-[#E17B8C]" />
          <p className="text-sm text-[var(--cf-text-secondary)]">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-[6px] border border-[#315440] bg-[var(--cf-surface)] px-4 py-3">
          <Save className="mt-0.5 h-4 w-4 shrink-0 text-[#67C18D]" />
          <p className="text-sm text-[var(--cf-text-secondary)]">{success}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)]" aria-labelledby="profile-summary-title">
        <div className="flex flex-col gap-5 border-b border-[var(--cf-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              {formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Foto de perfil"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full border border-[var(--cf-border)] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--cf-border)] bg-[var(--cf-surface-raised)]">
                  <User className="h-7 w-7 text-[var(--cf-text-muted)]" />
                </div>
              )}

              {isEditing && (
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--cf-border)] bg-[var(--cf-accent)] text-white transition-colors hover:bg-[var(--cf-accent-hover)]">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Identidad</p>
              <h2 id="profile-summary-title" className="mt-1 truncate text-lg font-semibold text-[var(--cf-text)]">
                {profile.full_name || 'Usuario'}
              </h2>
              <p className="mt-1 truncate text-sm text-[var(--cf-text-secondary)]">{profile.email}</p>
              <Badge variant="outline" className="mt-2 rounded-[4px] border-[var(--cf-border)] bg-transparent text-[11px] text-[var(--cf-text-muted)]">
                {roleLabel || 'Usuario'}
              </Badge>
            </div>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="h-9 gap-2 rounded-[5px] bg-[var(--cf-accent)] px-4 text-sm text-white hover:bg-[var(--cf-accent-hover)]">
              <User className="h-4 w-4" />
              Editar perfil
            </Button>
          )}
        </div>

        <div className="p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Datos personales</p>
              <h3 className="mt-1 text-base font-semibold text-[var(--cf-text)]">Información de cuenta</h3>
            </div>
            <p className="max-w-xl text-xs leading-5 text-[var(--cf-text-muted)] sm:text-right">
              Email y RUT se muestran como referencia; nombre, teléfono y fotografía mantienen el flujo de edición existente.
            </p>
          </div>

          <div className="grid grid-cols-1 border-t border-[var(--cf-border)] md:grid-cols-2">
            <ProfileField icon={User} label="Nombre completo" divided={false}>
              {isEditing ? (
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre completo"
                  className="h-9 rounded-[5px] border-[var(--cf-border)] bg-[var(--cf-surface-raised)] text-sm text-[var(--cf-text)]"
                />
              ) : (
                <p className="text-sm text-[var(--cf-text-secondary)]">{profile.full_name || 'No especificado'}</p>
              )}
            </ProfileField>

            <ProfileField icon={Mail} label="Email" divided>
              <p className="text-sm text-[var(--cf-text-secondary)]">{profile.email}</p>
            </ProfileField>

            <ProfileField icon={Phone} label="Teléfono" divided={false} topBorder>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56912345678"
                  type="tel"
                  className="h-9 rounded-[5px] border-[var(--cf-border)] bg-[var(--cf-surface-raised)] text-sm text-[var(--cf-text)]"
                />
              ) : (
                <p className="text-sm text-[var(--cf-text-secondary)]">{profile.phone || 'No especificado'}</p>
              )}
            </ProfileField>

            <ProfileField label="RUT" divided topBorder>
              <p className="font-mono text-sm text-[var(--cf-text-secondary)]">{profile.rut || 'No especificado'}</p>
            </ProfileField>
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--cf-border)] bg-[var(--cf-canvas)] px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  full_name: profile.full_name || '',
                  phone: profile.phone || '',
                  avatar_url: profile.avatar_url || '',
                })
              }}
              disabled={isSaving}
              className="h-9 rounded-[5px] border-[var(--cf-border)] bg-transparent text-sm text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 gap-2 rounded-[5px] bg-[var(--cf-accent)] px-4 text-sm text-white hover:bg-[var(--cf-accent-hover)]"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileField({
  icon: Icon,
  label,
  children,
  divided,
  topBorder,
}: {
  icon?: typeof User
  label: string
  children: React.ReactNode
  divided?: boolean
  topBorder?: boolean
}) {
  return (
    <div className={`min-w-0 p-4 ${divided ? 'md:border-l md:border-[var(--cf-border)]' : ''} ${topBorder ? 'border-t border-[var(--cf-border)]' : ''}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--cf-text-muted)]">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}
