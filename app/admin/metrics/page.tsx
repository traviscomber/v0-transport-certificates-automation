'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, FileText, AlertCircle, Calendar, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserMetric {
  id: string
  email: string
  full_name: string
  rut: string
  role: string
  created_at: string
}

interface Metrics {
  [key: string]: {
    documentsCount: number
    alertsCount: number
    lastActivity: string
    accountAge: number
  }
}

export default function MetricsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<UserMetric[]>([])
  const [metrics, setMetrics] = useState<Metrics>({})
  const [loading, setLoading] = useState(false)

  const CORRECT_PASSWORD = 'mono2026'

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      fetchMetrics()
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/metrics')
      if (!response.ok) throw new Error('Error fetching metrics')
      
      const data = await response.json()
      setUsers(data.users)
      setMetrics(data.metrics)
    } catch (error) {
      console.error('[v0] Error loading metrics:', error)
      setError('Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Métricas de Labbe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Clave de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la clave"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Métricas de Usuarios - Labbe</h1>
            <p className="text-slate-400">Panel de métricas de actividad por usuario</p>
          </div>
          <Button
            onClick={() => {
              setIsAuthenticated(false)
              setPassword('')
              router.push('/dashboard')
            }}
            className="bg-slate-700 hover:bg-slate-600"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-orange-500">{users.length}</div>
              <p className="text-sm text-slate-400 mt-1">Usuarios Totales</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-blue-500">
                {Object.values(metrics).reduce((sum, m) => sum + m.documentsCount, 0)}
              </div>
              <p className="text-sm text-slate-400 mt-1">Documentos Totales</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-red-500">
                {Object.values(metrics).reduce((sum, m) => sum + m.alertsCount, 0)}
              </div>
              <p className="text-sm text-slate-400 mt-1">Alertas Totales</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-green-500">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-sm text-slate-400 mt-1">Administradores</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        {loading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="text-slate-400">Cargando métricas...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const userMetrics = metrics[user.id]
              if (!userMetrics) return null

              return (
                <Card
                  key={user.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* User Info */}
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-white text-lg">{user.full_name}</h3>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-1">RUT: {user.rut}</p>
                        <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300 font-medium">
                          {user.role}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                            <FileText className="w-5 h-5" />
                            {userMetrics.documentsCount}
                          </div>
                          <p className="text-xs text-slate-400">Documentos</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            {userMetrics.alertsCount}
                          </div>
                          <p className="text-xs text-slate-400">Alertas</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-400">
                            <Calendar className="w-5 h-5" />
                            {userMetrics.accountAge}
                          </div>
                          <p className="text-xs text-slate-400">Días</p>
                        </div>
                      </div>

                      {/* Activity */}
                      <div className="md:col-span-2 text-right">
                        <p className="text-sm text-slate-400">Última actividad</p>
                        <p className="text-sm text-white font-medium">
                          {new Date(userMetrics.lastActivity).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(userMetrics.lastActivity).toLocaleTimeString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
