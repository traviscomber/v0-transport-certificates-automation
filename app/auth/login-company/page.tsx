'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function CompanyLoginPage() {
  const [rut, setRut] = useState('78.376.780-5')
  const [password, setPassword] = useState('labbe2024')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rutError, setRutError] = useState('')
  const [passwordError, setPasswordError] = useState('')
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

  // Validar contraseña
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('La contraseña es requerida')
      return false
    }
    if (value.length < 6) {
      setPasswordError('Mínimo 6 caracteres')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('[v0] ========== FORM SUBMISSION START ==========')
    console.log('[v0] RUT value:', rut)
    console.log('[v0] Password length:', password.length)

    const rutValid = validateRUT(rut)
    const passwordValid = validatePassword(password)

    console.log('[v0] RUT validation:', rutValid)
    console.log('[v0] Password validation:', passwordValid)

    if (!rutValid || !passwordValid) {
      console.log('[v0] Validation failed - aborting submission')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[v0] Sending login request to /api/auth/login-simple')
      const response = await fetch('/api/auth/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      })

      console.log('[v0] Response status:', response.status)
      console.log('[v0] Response ok:', response.ok)

      let data
      try {
        data = await response.json()
        console.log('[v0] Response parsed successfully:', data?.success ? 'SUCCESS' : 'FAILURE')
      } catch (parseErr) {
        console.error('[v0] Failed to parse response JSON:', parseErr)
        throw new Error('Respuesta inválida del servidor - no es JSON válido')
      }

      console.log('[v0] Response data:', data)

      if (!response.ok) {
        const errorMsg = data?.error || `Error HTTP ${response.status}`
        console.error('[v0] Login failed:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('[v0] Login successful - company:', data.company?.name)
      console.log('[v0] Redirecting to dashboard...')
      
      // Redirigir al dashboard
      router.push('/dashboard/company')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión'
      console.error('[v0] ========== LOGIN ERROR ==========')
      console.error('[v0] Error:', errorMessage)
      console.error('[v0] Error type:', err instanceof Error ? 'Error instance' : typeof err)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Transportes Labbe</h1>
          <p className="text-muted-foreground">Portal de Empresas Transportistas</p>
        </div>

        {/* Login Card */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Inicia Sesión</CardTitle>
            <CardDescription>Usa tu RUT de ejecutivo para acceder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* RUT Field */}
              <div className="space-y-2">
                <Label htmlFor="rut" className="text-foreground">
                  RUT de Ejecutivo
                </Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => {
                    const formatted = formatRUT(e.target.value)
                    setRut(formatted)
                    if (formatted) validateRUT(formatted)
                  }}
                  onBlur={() => validateRUT(rut)}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                    rutError ? 'border-destructive' : ''
                  }`}
                />
                {rutError && (
                  <p className="mt-1 text-xs text-destructive font-medium">{rutError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                    passwordError ? 'border-destructive' : ''
                  }`}
                />
                {passwordError && (
                  <p className="mt-1 text-xs text-destructive font-medium">{passwordError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !rut || !password || !!rutError || !!passwordError}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="space-y-2 text-center text-sm pt-2">
              <p className="text-muted-foreground">
                ¿Eres usuario individual?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Login aquí
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Si olvidas tu contraseña,{' '}
                <span className="text-primary font-semibold">
                  contacta a soporte
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
