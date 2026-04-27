'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Ejecutiva {
  rut: string
  nombre: string
  email: string
  role: string
  dias_en_plataforma: number
  created_at: string | null
  alertas_total: number
  alertas_criticas: number
  alertas_no_leidas: number
}

interface Subcontratista {
  id: string
  rut: string
  razon_social: string
  nombre_fantasia: string
  is_active: boolean
  created_at: string
  conductores: number
  conductores_activos: number
  documentos: number
  documentos_aprobados: number
  documentos_pendientes: number
  documentos_vencidos: number
}

interface MetricsData {
  resumen: {
    total_usuarios: number
    total_conductores: number
    total_subcontratistas: number
    total_documentos: number
    total_alertas: number
  }
  ejecutivas: Ejecutiva[]
  subcontratistas: Subcontratista[]
}

export default function MetricsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ejecutivas' | 'subcontratistas'>('ejecutivas')

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
      const res = await fetch('/api/admin/metrics')
      if (!res.ok) throw new Error('Error fetching metrics')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError('Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500/20 p-4 rounded-full">
                <Lock className="w-7 h-7 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Panel de Admin</CardTitle>
            <p className="text-slate-400 text-sm">Métricas internas de Transportes Labbe</p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Clave de acceso</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la clave"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando métricas reales...</p>
        </div>
      </div>
    )
  }

  const { resumen, ejecutivas, subcontratistas } = data

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Admin — Métricas Labbe</h1>
            <p className="text-slate-400 text-sm mt-1">Data en tiempo real desde Supabase</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={() => { setIsAuthenticated(false); router.push('/dashboard/company') }}
          >
            Salir
          </Button>
        </div>



        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('ejecutivas')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'ejecutivas' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Ejecutivas Labbe ({ejecutivas.length})
          </button>
          <button
            onClick={() => setActiveTab('subcontratistas')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'subcontratistas' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Subcontratistas ({subcontratistas.length})
          </button>
        </div>

        {/* EJECUTIVAS TAB */}
        {activeTab === 'ejecutivas' && (
          <div className="space-y-3">
            {ejecutivas.map((ej) => (
              <Card key={ej.rut} className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                        {ej.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{ej.nombre}</p>
                        <p className="text-xs text-slate-400">{ej.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 font-medium">
                      Activa
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* SUBCONTRATISTAS TAB */}
        {activeTab === 'subcontratistas' && (
          <div className="space-y-2">
            {subcontratistas.map((sub) => (
              <Card key={sub.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${sub.is_active ? 'bg-green-400' : 'bg-slate-500'}`} />
                      <div>
                        <p className="font-medium text-white">{sub.razon_social}</p>
                        <p className="text-xs text-slate-400">{sub.nombre_fantasia}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.is_active ? 'bg-green-500/20 text-green-300' : 'bg-slate-600/50 text-slate-400'}`}>
                      {sub.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
