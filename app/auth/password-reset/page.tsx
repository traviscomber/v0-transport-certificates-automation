'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Truck, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function PasswordResetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'pending' | 'reset' | 'success' | 'error'>('pending')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/password-reset?type=recovery`,
      })

      if (error) throw error

      setStatus('success')
      setMessage(`¡Enlace de recuperación enviado a ${email}!`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error al enviar enlace')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setStatus('error')
      setMessage('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setStatus('error')
      setMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setStatus('success')
      setMessage('¡Contraseña actualizada exitosamente!')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error al actualizar contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has recovery token
  const hasRecoveryToken = searchParams.get('type') === 'recovery'

  return (
    <div className='min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-4'>
      <div className='absolute inset-0 bg-grid opacity-20' />
      <div className='absolute top-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl' />

      <div className='w-full max-w-md relative z-10'>
        <div className='flex flex-col items-center mb-8'>
          <div className='w-12 h-12 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange mb-4'>
            <Truck className='h-7 w-7 text-white' />
          </div>
          <h1 className='text-3xl font-black text-foreground'>DocuFleet</h1>
          <p className='text-muted-foreground text-center mt-2'>Recuperar Contraseña</p>
        </div>

        <Card className='glass-dark border-slate-700/50'>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-foreground'>
              {hasRecoveryToken ? 'Nueva Contraseña' : 'Recuperar Contraseña'}
            </CardTitle>
            <CardDescription className='text-center text-muted-foreground'>
              {hasRecoveryToken
                ? 'Ingresa tu nueva contraseña'
                : 'Ingresa tu correo para recibir un enlace de recuperación'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' || status === 'error' ? (
              <div className='space-y-4'>
                <div className='flex justify-center'>
                  {status === 'success' ? (
                    <CheckCircle className='h-16 w-16 text-green-500' />
                  ) : (
                    <AlertCircle className='h-16 w-16 text-red-500' />
                  )}
                </div>
                <p className='text-center text-sm text-muted-foreground'>{message}</p>
                <Link href='/auth/login' className='block'>
                  <Button className='w-full btn-orange'>Volver a Iniciar Sesión</Button>
                </Link>
              </div>
            ) : hasRecoveryToken ? (
              <form onSubmit={handleResetPassword} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='newPassword' className='text-foreground font-semibold'>
                    Nueva Contraseña
                  </Label>
                  <Input
                    id='newPassword'
                    type='password'
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='bg-slate-800/50 border-slate-700 text-foreground'
                    placeholder='Mínimo 6 caracteres'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword' className='text-foreground font-semibold'>
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='bg-slate-800/50 border-slate-700 text-foreground'
                    placeholder='Confirma tu contraseña'
                  />
                </div>

                {message && (
                  <div className='text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20'>
                    {message}
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full btn-orange font-semibold h-11'
                  disabled={isLoading}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-foreground font-semibold'>
                    Correo Electrónico
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='bg-slate-800/50 border-slate-700 text-foreground'
                    placeholder='tu@email.com'
                  />
                </div>

                {message && (
                  <div className='text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20'>
                    {message}
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full btn-orange font-semibold h-11'
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>
              </form>
            )}

            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                ¿Recordaste tu contraseña?{' '}
                <Link href='/auth/login' className='text-orange-500 hover:text-orange-400 font-semibold'>
                  Vuelve a iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
