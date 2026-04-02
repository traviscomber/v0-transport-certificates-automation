'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const demoAccounts = [
    { role: 'driver', email: 'conductor@demo.cl', password: 'demo123', name: 'Conductor' },
    { role: 'dispatcher', email: 'despachador@demo.cl', password: 'demo123', name: 'Despachador' },
    { role: 'admin', email: 'admin@demo.cl', password: 'demo123', name: 'Administrador' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setDemoLoading(account.role)
    setError(null)

    try {
      await login(account.email, account.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Iniciar Sesión</h1>
          <p className="text-slate-400">Ingresa tu correo y contraseña para acceder a tu cuenta</p>
        </div>

        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Ingresa tus credenciales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full btn-orange">
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">O prueba con una cuenta demo</span>
              </div>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.role}
                  onClick={() => handleDemoLogin(account)}
                  disabled={demoLoading === account.role}
                  variant="outline"
                  className="w-full"
                >
                  {demoLoading === account.role ? 'Entrando...' : `Demo: ${account.name}`}
                </Button>
              ))}
            </div>

            <div className="text-center text-sm">
              <p className="text-slate-400">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register" className="text-orange-500 hover:text-orange-400 font-semibold">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
