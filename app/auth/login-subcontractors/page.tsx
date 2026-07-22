'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader, Eye, EyeOff } from 'lucide-react'

function normalizeRut(value: string) {
  return value.replace(/\./g, '').replace(/\s+/g, '').toUpperCase()
}

export default function SubcontratistasLoginPage() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch('/api/auth/subcontractors/login', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: normalizeRut(rut),
          password: password.trim(),
        }),
        signal: controller.signal,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Error al iniciar sesion')
      }

      // Force a full document navigation so the next request includes the
      // HTTP-only transportista_token cookie created by the API response.
      window.location.replace('/subcontractors/onboarding')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('El inicio de sesion demoro demasiado. Intenta nuevamente.')
      } else {
        setError(err instanceof Error ? err.message : 'Error de conexion. Intenta nuevamente.')
      }
      setLoading(false)
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
        <CardHeader className="space-y-2 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Portal Subcontratistas</CardTitle>
          <CardDescription>Accede para gestionar tus documentos</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rut" className="text-sm font-medium text-slate-200">
                RUT de la Empresa
              </Label>
              <Input
                id="rut"
                placeholder="12345678-9"
                value={rut}
                onChange={(e) => setRut(normalizeRut(e.target.value))}
                disabled={loading}
                autoComplete="username"
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
              <p className="text-xs text-slate-400">Ingresa el RUT sin puntos, solo con guion.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                Contrasena
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">La contrasena se genera segun la regla entregada por la plataforma.</p>
            </div>

            <Button
              type="submit"
              disabled={loading || !rut || !password}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesion...
                </>
              ) : (
                'Iniciar Sesion'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
