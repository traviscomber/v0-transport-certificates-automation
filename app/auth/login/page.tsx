'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ACCESS_ACCOUNTS } from '@/lib/access-accounts'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { login } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Validación de email en tiempo real
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('El correo es requerido')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError('Correo inválido')
      return false
    }
    setEmailError('')
    return true
  }

  // Validación de contraseña en tiempo real
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
    
    const emailValid = validateEmail(email)
    const passwordValid = validatePassword(password)
    
    if (!emailValid || !passwordValid) return

    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      addToast('Sesión iniciada correctamente', 'success', 2000)
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
      addToast(errorMessage, 'error', 5000)
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (account: typeof ACCESS_ACCOUNTS[0]) => {
    // Fill fields and submit immediately
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
    setEmailError('')
    setPasswordError('')
    
    // Submit form after state update
    setTimeout(() => {
      formRef.current?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      )
    }, 0)
  }

  const isFormValid = email && password && !emailError && !passwordError

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Iniciar Sesión</h1>
          <p className="text-muted-foreground">Ingresa tu correo y contraseña para acceder</p>
        </div>

        {/* Main Card */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Acceso a la Plataforma</CardTitle>
            <CardDescription>Ingresa tus credenciales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="olga.carrasco@labbe.cl"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      validateEmail(e.target.value)
                    }}
                    onBlur={() => validateEmail(email)}
                    className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                      emailError ? 'border-destructive' : ''
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-destructive font-medium">{emailError}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="labbe4005"
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
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

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground">O accede con una cuenta habilitada</span>
              </div>
            </div>

            {/* Access Buttons */}
            <div className="space-y-2">
              {ACCESS_ACCOUNTS.map((account) => (
                <Button
                  key={account.role}
                  onClick={() => handleQuickLogin(account)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-border hover:bg-primary/10 text-foreground font-medium"
                >
                  <span className="text-primary mr-2">●</span>
                  {`Acceso: ${account.name}`}
                </Button>
              ))}
            </div>

            {/* Footer Link */}
            <div className="text-center text-sm pt-2">
              <p className="text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
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

