'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login-only-api', {
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

      // Success - save session token and redirect
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setSuccess(true)
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err) {
      setError('Connection error. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-slate-400 mb-6">Transportes Labbe</p>

          {success && (
            <div className="bg-green-500/20 border border-green-500 rounded p-3 mb-4 text-green-200">
              ✓ Login successful! Redirecting...
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4 text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ocarrasco@labbe.cl"
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded transition"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-300 text-sm font-semibold mb-3">Usuarios Transportes Labbe:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• ocarrasco@labbe.cl - Olga Carrasco</p>
              <p>• csepulveda@labbe.cl - Carolina Sepúlveda</p>
              <p>• dsilva@labbe.cl - Daniela Silva</p>
              <p>• dgonzalez@labbe.cl - Diego González</p>
              <p>• kcanales@labbe.cl - Katherinne Canales</p>
              <p className="mt-2 text-yellow-400">Contraseña: TempPassword123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
