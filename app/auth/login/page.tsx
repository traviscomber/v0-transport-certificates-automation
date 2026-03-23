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

      // Get user profile to determine their role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .single()

      // Small delay to ensure session is established
      setTimeout(() => {
        // Route based on role
        const roleRoute: Record<string, string> = {
          'admin': '/admin',
          'dispatcher': '/dispatcher',
          'driver': '/driver',
        }
        const route = roleRoute[profileData?.role] || '/admin'
        router.push(route)
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
        // Route based on demo account role
        const roleRoute: Record<string, string> = {
          'admin': '/admin',
          'dispatcher': '/dispatcher',
          'driver': '/driver',
        }
        const route = roleRoute[demoAccount.role] || '/admin'
        router.push(route)
      }, 100)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error en login demo')
      setDemoLoading(null)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className='w-full max-w-md relative z-10'>
        <div className='flex flex-col items-center mb-8'>
          <div className='w-12 h-12 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange mb-4'>
            <Truck className='h-7 w-7 text-white' />
          </div>
          <h1 className='text-3xl font-black text-foreground'>DocuFleet</h1>
          <p className='text-muted-foreground text-center mt-2'>Compliance documental 100% automatizado</p>
        </div>

        {/* Ayuda Educativa */}
        <HelpBox
          variant="info"
          title="Como usar esta pagina"
          description="Elige una de las dos opciones para acceder:"
          steps={[
            {
              step: 1,
              title: "Opcion rapida: Cuentas de demostracion",
              description: "Haz clic en uno de los botones para probar el sistema como Conductor, Despachador o Administrador."
            },
            {
              step: 2,
              title: "Opcion normal: Iniciar sesion",
              description: "Si ya tienes una cuenta, escribe tu correo y contraseña en el formulario."
            }
          ]}
        />

        <Card className='mb-6 glass-dark border-slate-700/50'>
          <CardHeader>
            <CardTitle className='text-xl text-center flex items-center justify-center gap-2 text-foreground'>
              <Play className='h-5 w-5 text-orange-500' />
              Prueba Rapida
            </CardTitle>
            <CardDescription className='text-center text-muted-foreground'>
              Haz clic en cualquier boton para acceder al sistema con una cuenta de demo.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {demoAccounts.map((account) => {
              const Icon = account.icon
              const isLoading = demoLoading === account.role
              const colorMap: Record<string, string> = {
                driver: 'gradient-accent glow-orange',
                dispatcher: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
                admin: 'bg-green-500/20 border-green-500/30 text-green-300',
              }

              return (
                <Button
                  key={account.role}
                  className={`w-full h-auto p-4 justify-start text-white border ${
                    account.role === 'driver' ? 'btn-orange' : `border ${colorMap[account.role]}`
                  } hover:opacity-90 transition-all`}
                  onClick={() => handleDemoLogin(account)}
                  disabled={!!demoLoading || isLoading}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <Icon className='h-5 w-5 flex-shrink-0' />
                    <div className='text-left flex-1'>
                      <div className='font-semibold'>{account.name}</div>
                      <div className='text-xs opacity-80'>{account.description}</div>
                    </div>
                    {isLoading && <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent' />}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <div className='relative mb-6'>
          <Separator className='bg-slate-700/30' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='bg-gradient-dark px-2 text-sm text-muted-foreground font-semibold'>O</span>
          </div>
        </div>

        <Card className='glass-dark border-slate-700/50'>
          <CardHeader>
            <CardTitle className='text-2xl text-center text-foreground'>Iniciar Sesion</CardTitle>
            <CardDescription className='text-center text-muted-foreground'>
              Ingresa tu correo y contraseña para acceder a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-foreground font-semibold'>Correo Electronico</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='usuario@empresa.cl'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='bg-slate-800/50 border-slate-700 text-foreground placeholder:text-muted-foreground'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password' className='text-foreground font-semibold'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='bg-slate-800/50 border-slate-700 text-foreground'
                />
              </div>
              {error && (
                <div className='text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20'>
                  {error}
                </div>
              )}
              <Button 
                type='submit' 
                className='w-full btn-orange font-semibold h-11' 
                disabled={isLoading || !!demoLoading}
              >
                {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                No tienes cuenta?{' '}
                <Link href='/' className='text-orange-500 hover:text-orange-400 font-semibold transition-colors'>
                  Contacta con nosotros
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
