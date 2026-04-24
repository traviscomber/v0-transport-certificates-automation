'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginRawPage() {
  const [email, setEmail] = useState('ocarrasco@labbe.cl')
  const [password, setPassword] = useState('TempPassword123!')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Call server endpoint that uses Supabase with service role key
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store session in localStorage
      localStorage.setItem('supabase.auth.token', data.session.access_token)
      localStorage.setItem('supabase.auth.user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[v0] Login error:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Iniciar Sesión (Raw API)</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '10px', 
          background: '#fee', 
          color: '#c00',
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Conectando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p><strong>Usuarios de Transportes Labbe:</strong></p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>ocarrasco@labbe.cl - Olga Carrasco</li>
          <li>csepulveda@labbe.cl - Carolina Sepúlveda</li>
          <li>dsilva@labbe.cl - Daniela Silva</li>
          <li>cfarias@labbe.cl - Cecilia Farías</li>
          <li>dgonzalez@labbe.cl - Diego González</li>
          <li>kcanales@labbe.cl - Katherinne Canales</li>
        </ul>
        <p><strong>Contraseña:</strong> TempPassword123!</p>
      </div>
    </div>
  )
}
