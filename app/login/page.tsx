'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('[v0] Login response:', response.status)

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      console.log('[v0] Login successful for:', email)
      router.push('/dashboard/company')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
            <p className="text-slate-400 text-sm">Transportes Labbe</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-md p-3">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@labbe.cl"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-slate-400 text-xs font-medium text-center">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p><span className="text-slate-300">ocarrasco@labbe.cl</span> - Olga Carrasco</p>
              <p><span className="text-slate-300">csepulveda@labbe.cl</span> - Carolina Sepúlveda</p>
              <p><span className="text-slate-300">dsilva@labbe.cl</span> - Daniela Silva</p>
              <p><span className="text-slate-300">cfarias@labbe.cl</span> - Cecilia Farias</p>
              <p><span className="text-slate-300">dgonzalez@labbe.cl</span> - Diego Gonzalez</p>
              <p><span className="text-slate-300">kcanales@labbe.cl</span> - Katherinne Canales</p>
              <p className="pt-2 text-slate-500">Contraseña: <span className="text-slate-400">TempPassword123!</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
