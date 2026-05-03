'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('ocarrasco@labbe.cl')
  const [password, setPassword] = useState('TempPassword123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      console.log('[v0] Login successful:', data)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('Connection error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Iniciar Sesión
          </h1>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Conectando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="border-t border-slate-600 pt-6">
            <p className="text-gray-400 text-sm mb-3">
              Usuarios Transportes Labbe:
            </p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>ocarrasco@labbe.cl - Olga Carrasco</p>
              <p>csepulveda@labbe.cl - Carolina Sepúlveda</p>
              <p>dsilva@labbe.cl - Daniela Silva</p>
              <p>cfarias@labbe.cl - Cecilia Farías</p>
              <p>dgonzalez@labbe.cl - Diego González</p>
              <p>kcanales@labbe.cl - Katherinne Canales</p>
              <p className="text-yellow-400 mt-2">Contraseña: TempPassword123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
