'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[v0] Login attempt:', email)
      
      const response = await fetch('/api/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
        credentials: 'include',
      })

      console.log('[v0] Response status:', response.status)

      const data = await response.json()
      console.log('[v0] Response data:', data)

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      // Manually set cookies via document.cookie - ensures they're available immediately
      const expiryDate = new Date()
      expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

      document.cookie = `user_email=${encodeURIComponent(email.toLowerCase())}; path=/; expires=${expiryDate.toUTCString()}`
      document.cookie = `user_name=${encodeURIComponent(data.user.full_name)}; path=/; expires=${expiryDate.toUTCString()}`
      document.cookie = `user_role=${encodeURIComponent(data.user.role)}; path=/; expires=${expiryDate.toUTCString()}`
      document.cookie = `user_organization_id=${encodeURIComponent(data.user.organization_id || '')}; path=/; expires=${expiryDate.toUTCString()}`

      console.log('[v0] Cookies set via document.cookie:', {
        user_email: document.cookie.includes('user_email'),
        user_name: document.cookie.includes('user_name'),
        user_role: document.cookie.includes('user_role'),
        user_organization_id: document.cookie.includes('user_organization_id'),
        organization_id_value: data.user.organization_id,
      })

      // Redirect to dashboard
      setTimeout(() => {
        console.log('[v0] Redirecting to dashboard...')
        window.location.href = '/dashboard/company'
      }, 300)
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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-slate-400 text-xs font-medium text-center">Ejecutivas disponibles:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p><span className="text-slate-300">ocarrasco@labbe.cl</span> - Olga Carrasco</p>
              <p><span className="text-slate-300">csepulveda@labbe.cl</span> - Carolina Sepúlveda</p>
              <p><span className="text-slate-300">dsilva@labbe.cl</span> - Daniela Silva</p>
              <p><span className="text-slate-300">cfarias@labbe.cl</span> - Cecilia Farias</p>
              <p><span className="text-slate-300">dgonzalez@labbe.cl</span> - Diego Gonzalez</p>
              <p><span className="text-slate-300">kcanales@labbe.cl</span> - Katherinne Canales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
