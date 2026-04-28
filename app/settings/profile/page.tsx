'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Building2, Lock, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email,
        role: user.role,
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.fullName,
        })
        .eq('id', user?.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al actualizar perfil',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al actualizar contraseña',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className='min-h-screen bg-gradient-dark flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-dark'>
      <div className='container mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Mi Perfil</h1>
          <p className='text-muted-foreground'>Gestiona tu información personal y configuración de seguridad</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Información General */}
          <Card className='glass-dark border-slate-700/50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-orange-500' />
                Información Personal
              </CardTitle>
              <CardDescription>Tu información de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName' className='text-foreground'>
                    Nombre Completo
                  </Label>
                  <Input
                    id='fullName'
                    type='text'
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className='bg-slate-800/50 border-slate-700'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-foreground flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    Correo
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    disabled
                    className='bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed'
                  />
                  <p className='text-xs text-muted-foreground'>El correo no puede ser modificado directamente</p>
                </div>

                <Button type='submit' className='w-full btn-orange' disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Información de Rol */}
          <Card className='glass-dark border-slate-700/50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-cyan-500' />
                Rol y Organización
              </CardTitle>
              <CardDescription>Tu información de acceso</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label className='text-muted-foreground text-xs uppercase'>Rol</Label>
                <div className='mt-2 inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-semibold border border-orange-500/20'>
                  {formData.role === 'admin' && 'Administrador'}
                  {formData.role === 'dispatcher' && 'Despachador'}
                  {formData.role === 'driver' && 'Conductor'}
                  {formData.role === 'mandante' && 'Mandante'}
                  {formData.role === 'transportista' && 'Transportista'}
                </div>
              </div>

              <Separator className='bg-slate-700/50' />

              <p className='text-xs text-muted-foreground'>
                Contacta con tu administrador para cambiar tu rol.
              </p>
            </CardContent>
          </Card>

          {/* Cambiar Contraseña */}
          <Card className='glass-dark border-slate-700/50 md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='h-5 w-5 text-green-500' />
                Seguridad
              </CardTitle>
              <CardDescription>Gestiona tu contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='newPassword' className='text-foreground'>
                      Nueva Contraseña
                    </Label>
                    <Input
                      id='newPassword'
                      type='password'
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className='bg-slate-800/50 border-slate-700'
                      placeholder='Mínimo 6 caracteres'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword' className='text-foreground'>
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className='bg-slate-800/50 border-slate-700'
                      placeholder='Confirma tu contraseña'
                    />
                  </div>

                  <div className='flex items-end'>
                    <Button type='submit' className='w-full btn-orange' disabled={isLoading}>
                      {isLoading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sesión */}
          <Card className='glass-dark border-slate-700/50 md:col-span-2'>
            <CardHeader>
              <CardTitle>Sesión</CardTitle>
              <CardDescription>Gestiona tu sesión</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={logout}
                variant='destructive'
                className='w-full'
              >
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
