'use client'
// Pure client component — never SSRed, so no hydration mismatch possible

import { useState } from 'react'

export default function ConductorLoginForm() {
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
        credentials: 'include', // ✅ CRITICAL: Send cookies with request
        body: JSON.stringify({ rut: rut.trim(), password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Store conductor data in localStorage for client-side access
      const conductorData = {
        conductor_id: data.conductor_id,
        rut: data.rut,
        nombre_completo: data.nombre_completo,
        email: data.email,
        transportista_id: data.transportista_id
      }
      
      localStorage.setItem('conductor_data', JSON.stringify(conductorData))

      // Redirect to onboarding - cookies are now set by the API response
      window.location.href = '/conductor/onboarding'
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>
            Transportes Labbe
          </h1>
          <p style={{ fontSize: '15px', color: '#cbd5e1', margin: '0' }}>
            Portal para Conductores
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
        }}>
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
              <div style={{
                background: 'rgba(127, 29, 29, 0.2)',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                RUT
              </label>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="12345678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
                autoComplete="username"
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
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', margin: '6px 0 0 0' }}>
                Ejemplo: 12345678-9 (sin puntos, solo guion)
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                Contraseña
              </label>
              <input
                suppressHydrationWarning
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                <strong style={{ color: '#cbd5e1' }}>labbe</strong> + últimos 4 dígitos de tu RUT
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Ejemplo: RUT 12345678-9 → Contraseña: <strong>labbe5678</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#1d4ed8' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '6px',
            border: '1px solid #334155',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.6',
          }}>
            <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>📋 Instrucciones de Login:</strong>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              <li>
                <strong style={{ color: '#cbd5e1' }}>RUT:</strong> Sin puntos, solo con guion (ej: 12345678-9)
              </li>
              <li style={{ marginTop: '6px' }}>
                <strong style={{ color: '#cbd5e1' }}>Contraseña:</strong> labbe + últimos 4 dígitos del RUT (antes del guion)
              </li>
              <li style={{ marginTop: '6px' }}>
                Ejemplo RUT <strong>12345678-9</strong> → Contraseña: <strong>labbe5678</strong>
              </li>
            </ul>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '6px',
            border: '1px solid #334155',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.6',
          }}>
            <strong style={{ color: '#e2e8f0' }}>¿Nuevo conductor?</strong> Contacta a tu ejecutiva de Transportes Labbe para crear tu cuenta.
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
