'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function ExecutiveLoginPage() {
  const [email, setEmail] = useState('')
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/executive/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rut, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error de autenticación')
        return
      }

      // Store session and redirect
      localStorage.setItem('executive_session', JSON.stringify(data.session))
      router.push('/executive/dashboard')
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Transportes Labbe</h1>
          <p className="text-slate-400">Portal de Ejecutivos</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Ingreso Ejecutivo</CardTitle>
            <CardDescription className="text-slate-400">
              Accede con tus credenciales de ejecutivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@transporteslabbe.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              {/* RUT Field */}
              <div className="space-y-2">
                <Label htmlFor="rut" className="text-slate-300">
                  RUT (ej: 10574005-0)
                </Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="XX.XXX.XXX-X"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  required
                  className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center">
                ¿No tienes credenciales?{' '}
                <Link
                  href="/contact"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Contacta al administrador
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Este portal es solo para ejecutivos de Transportes Labbe
          </p>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-300 mt-2 inline-block"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
