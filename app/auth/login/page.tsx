'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Truck, User, Users, Shield, Play, HelpCircle } from 'lucide-react'
import { HelpBox } from '@/components/ui/help-box'

const demoAccounts = [
  {
    role: 'driver',
    email: 'conductor@demo.cl',
    password: 'demo123',
    name: 'Conductor',
    description: 'Acceso como conductor para subir certificados',
    icon: User,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    role: 'dispatcher',
    email: 'despachador@demo.cl',
    password: 'demo123',
    name: 'Despachador',
    description: 'Acceso como despachador para gestionar conductores',
    icon: Users,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    role: 'admin',
    email: 'admin@demo.cl',
    password: 'demo123',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    icon: Shield,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Small delay to ensure session is established
      setTimeout(() => {
        router.push('/admin')
      }, 100)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoAccount: (typeof demoAccounts)[0]) => {
    const supabase = createClient()
    setDemoLoading(demoAccount.role)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoAccount.email,
        password: demoAccount.password,
      })

      if (error) throw error

      // Small delay to ensure session is established
      setTimeout(() => {
        router.push('/admin')
      }, 100)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error en login demo')
      setDemoLoading(null)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Truck className='h-8 w-8 text-primary' />
            <span className='text-2xl font-bold'>DocuFleet</span>
          </div>
          <p className='text-muted-foreground text-center'>Sistema de Gestion de Documentos de Transporte</p>
        </div>

        {/* Ayuda Educativa */}
        <HelpBox
          variant="info"
          title="Como usar esta pagina"
          description="Esta es la pagina de inicio de sesion. Aqui puedes entrar al sistema de dos formas:"
          steps={[
            {
              step: 1,
              title: "Opcion rapida: Cuentas de demostracion",
              description: "Haz clic en uno de los botones de colores de abajo para probar el sistema como Conductor, Despachador o Administrador."
            },
            {
              step: 2,
              title: "Opcion normal: Iniciar sesion",
              description: "Si ya tienes una cuenta, escribe tu correo y contraseña en el formulario de abajo y presiona el boton azul 'Iniciar Sesion'."
            }
          ]}
        />

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-xl text-center flex items-center justify-center gap-2'>
              <Play className='h-5 w-5' />
              Cuentas de Demostración
            </CardTitle>
            <CardDescription className='text-center'>
              Haz clic en cualquier boton de color para entrar automaticamente al sistema. 
              Cada boton te permite ver el sistema desde un rol diferente.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {demoAccounts.map((account) => {
              const Icon = account.icon
              const isLoading = demoLoading === account.role

              return (
                <Button
                  key={account.role}
                  variant='outline'
                  className={`w-full h-auto p-4 justify-start ${account.color} text-white border-0 hover:text-white`}
                  onClick={() => handleDemoLogin(account)}
                  disabled={!!demoLoading || isLoading}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <Icon className='h-5 w-5 flex-shrink-0' />
                    <div className='text-left flex-1'>
                      <div className='font-semibold'>{account.name}</div>
                      <div className='text-sm opacity-90'>{account.description}</div>
                    </div>
                    {isLoading && <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <div className='relative mb-6'>
          <Separator />
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='bg-background px-2 text-sm text-muted-foreground'>o</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-2xl text-center'>Iniciar Sesión</CardTitle>
            <CardDescription className='text-center'>
              Escribe tu correo electronico y tu contraseña para entrar a tu cuenta.
              Si no recuerdas tu contraseña, contacta al administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Correo Electrónico</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='usuario@empresa.cl'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md'>{error}</div>}
              <Button type='submit' className='w-full' disabled={isLoading || !!demoLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
