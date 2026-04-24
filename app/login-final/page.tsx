'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginFinal() {
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
      // Call server-side login endpoint
      const response = await fetch('/api/login', {
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

      // Store session info
      localStorage.setItem('user_id', data.user.id)
      localStorage.setItem('user_email', data.user.email)
      localStorage.setItem('access_token', data.session.access_token)
      localStorage.setItem('refresh_token', data.session.refresh_token)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('Connection error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
          <p className="text-gray-400 mb-6">Transportes Labbe</p>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                placeholder="usuario@labbe.cl"
                required
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 rounded text-sm text-gray-300">
            <p className="font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs">
              <p>ocarrasco@labbe.cl - Olga Carrasco</p>
              <p>csepulveda@labbe.cl - Carolina Sepúlveda</p>
              <p>dsilva@labbe.cl - Daniela Silva</p>
              <p className="text-gray-400 mt-2">Contraseña: TempPassword123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
