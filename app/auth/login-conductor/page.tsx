'use client'

import { useState } from 'react'

export default function ConductorLoginPage() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

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

      console.log('[v0] Conductor login successful:', data.rut)
      
      // Wait a moment for the browser to process Set-Cookie headers before redirecting
      // This ensures httpOnly cookies are available when middleware checks for conductor_id
      setTimeout(() => {
        window.location.href = '/conductor/onboarding'
      }, 300)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      console.error('[v0] Login error:', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>
            Transportes Labbe
          </h1>
          <p style={{ fontSize: '15px', color: '#cbd5e1', margin: '0' }}>
            Portal para Conductores
          </p>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '12px', padding: '32px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
              Inicia Sesión
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0' }}>
              Ingresa tu RUT y contraseña para acceder a tu portal
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(220, 38, 38, 0.5)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                RUT
              </label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#e2e8f0' }}>
              ¿Nuevo conductor?
            </p>
            <p style={{ margin: '0' }}>
              Contacta a tu ejecutiva de Transportes Labbe para crear tu cuenta.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Inicia sesión como empresa
          </a>
        </div>
      </div>
    </div>
  )
}
