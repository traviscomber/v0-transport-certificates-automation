'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('ocarrasco@labbe.cl')
  const [password, setPassword] = useState('TempPassword123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        throw new Error('Error de conexión a base de datos')
      }
      
      console.log('[v0] Simple login attempt for:', email)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[v0] Login error:', signInError.message)
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        console.log('[v0] Login successful!')
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
      setError('Error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
        <p className="text-gray-400 mb-6">Ingresa tus credenciales</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded transition"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-white font-medium mb-3">Usuarios Transportes Labbe:</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>ocarrasco@labbe.cl - Olga Carrasco</p>
            <p>csepulveda@labbe.cl - Carolina Sepúlveda</p>
            <p>dsilva@labbe.cl - Daniela Silva</p>
            <p>cfarias@labbe.cl - Cecilia Farías</p>
            <p>dgonzalez@labbe.cl - Diego González</p>
            <p>kcanales@labbe.cl - Katherinne Canales</p>
            <p className="mt-4 text-yellow-400">Contraseña: TempPassword123!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
