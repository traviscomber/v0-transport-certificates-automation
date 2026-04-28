'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Truck, CheckCircle, AlertCircle, Mail } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('Verificando tu correo...')
  const [isResending, setIsResending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!supabase) {
          throw new Error('Error de conexión a base de datos')
        }
        // Check for verification token in URL
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (token && type === 'email') {
          // User clicked email link
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          })

          if (error) throw error

          setStatus('success')
          setMessage('¡Correo verificado exitosamente! Redirigiendo...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
          return
        }

        // Check if user has active session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email_confirmed_at) {
          setStatus('success')
          setMessage('¡Tu correo ya está verificado!')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('pending')
          setMessage('Hemos enviado un enlace de verificación a tu correo. Revisa tu bandeja de entrada.')
        }
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Error al verificar el correo')
      }
    }

    verifyEmail()
  }, [supabase, router, searchParams])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        setStatus('error')
        setMessage('Por favor, inicia sesión primero')
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email)
      if (error) throw error

      setStatus('success')
      setMessage('¡Correo de verificación reenviado! Revisa tu bandeja de entrada.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error al reenviar el correo')
    } finally {
      setIsResending(false)
    }
  }

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
          <p className='text-muted-foreground text-center mt-2'>Verificación de Correo</p>
        </div>

        <Card className='glass-dark border-slate-700/50'>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-foreground'>
              {status === 'pending' && 'Verifica tu Correo'}
              {status === 'success' && 'Correo Verificado'}
              {status === 'error' && 'Error de Verificación'}
            </CardTitle>
            <CardDescription className='text-center text-muted-foreground'>
              {status === 'pending' && 'Confirma tu dirección de correo para acceder'}
              {status === 'success' && 'Tu correo ha sido verificado'}
              {status === 'error' && 'Ocurrió un problema durante la verificación'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex justify-center'>
              {status === 'pending' && <Mail className='h-16 w-16 text-blue-500 animate-pulse' />}
              {status === 'success' && <CheckCircle className='h-16 w-16 text-green-500' />}
              {status === 'error' && <AlertCircle className='h-16 w-16 text-red-500' />}
            </div>

            <p className='text-center text-sm text-muted-foreground'>
              {message}
            </p>

            {status === 'pending' && (
              <div className='space-y-3'>
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className='w-full btn-orange'
                >
                  {isResending ? 'Reenviando...' : 'Reenviar Correo'}
                </Button>
                <p className='text-xs text-muted-foreground text-center'>
                  ¿No recibiste el correo? Revisa spam o solicita uno nuevo.
                </p>
              </div>
            )}

            <div className='pt-4 text-center'>
              <p className='text-sm text-muted-foreground'>
                {status === 'pending' && (
                  <>
                    ¿Problemas?{' '}
                    <Link href='/auth/login' className='text-orange-500 hover:text-orange-400 font-semibold'>
                      Volver a iniciar sesión
                    </Link>
                  </>
                )}
                {status === 'success' && (
                  <>
                    ¡Listo!{' '}
                    <Link href='/dashboard' className='text-orange-500 hover:text-orange-400 font-semibold'>
                      Ir al Dashboard
                    </Link>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <Link href='/auth/login' className='text-orange-500 hover:text-orange-400 font-semibold'>
                      Volver a iniciar sesión
                    </Link>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
