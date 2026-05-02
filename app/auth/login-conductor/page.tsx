'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function ConductorLoginPage() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rutError, setRutError] = useState('')
  const router = useRouter()

  // Formatear RUT
  const formatRUT = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '')
    if (cleaned.length <= 8) {
      return cleaned
    }
    return cleaned.slice(0, 8) + '-' + cleaned.slice(8, 9)
  }

  // Validar RUT
  const validateRUT = (value: string) => {
    if (!value) {
      setRutError('El RUT es requerido')
      return false
    }
    const rutRegex = /^\d{1,8}-[0-9kK]$/
    if (!rutRegex.test(value)) {
      setRutError('RUT inválido (formato: 12345678-9)')
      return false
    }
    setRutError('')
    return true
  }

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUT(e.target.value)
    setRut(formatted)
    if (formatted) {
      validateRUT(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateRUT(rut)) {
      return
    }

    if (!password) {
      setError('La contraseña es requerida')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login-conductor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`)
      }

      // El servidor ya estableció las cookies httpOnly
      // Solo redirigimos al onboarding
      console.log('[v0] Conductor login successful:', data.rut)
      
      // Esperar un bit para que las cookies se establezcan
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/conductor/onboarding')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión'
      console.error('[v0] Login error:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">Transportes Labbe</h1>
            <p className="text-slate-400">Portal para Conductores</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Inicia Sesión</CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa tu RUT y contraseña para acceder a tu portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* RUT Field */}
              <div className="space-y-2">
                <Label htmlFor="rut" className="text-slate-200">RUT</Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={handleRUTChange}
                  disabled={isLoading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                {rutError && (
                  <p className="text-red-400 text-sm">{rutError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Info Box */}
              <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <span className="font-semibold">¿Nuevo conductor?</span> Contacta a tu ejecutiva de Transportes Labbe para crear tu cuenta.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mt-6 text-center text-slate-400">
          <p className="text-sm">
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Inicia sesión como empresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
