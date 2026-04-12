'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, AlertTriangle, Clock, FileCheck, Users, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompanyData {
  company: {
    nombre_fantasia: string
    razon_social: string
    rut: string
  }
  stats: {
    totalSubcontractors: number
    totalDrivers: number
    operational: {
      blocked: number
      risk: number
      ok: number
      complianceScore: number
    }
  }
  drivers: any[]
  organizations: any[]
}

type TabType = 'overview' | 'drivers' | 'organizations' | 'documents' | 'alerts'

export default function CompanyDashboard() {
  const router = useRouter()
  const [data, setData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/data', { 
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching company data:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    router.push('/auth/login-company')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Cargando datos de Transportes Labbe...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-red-950/20 border-red-500/50 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error de Carga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{error || 'No se encontraron datos'}</p>
            <Button
              onClick={handleLogout}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, stats, drivers = [], organizations = [] } = data

  const tabs = [
    { id: 'overview' as TabType, label: 'Dashboard', icon: Building2 },
    { id: 'drivers' as TabType, label: 'Conductores', icon: Users, count: drivers.length },
    { id: 'organizations' as TabType, label: 'Subcontratos', icon: Building2, count: organizations.length },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'alerts' as TabType, label: 'Alertas', icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{company.nombre_fantasia}</h1>
              <p className="text-xs text-slate-400">{company.rut}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-orange-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-slate-700/50 overflow-x-auto">
          <div className="container mx-auto px-4 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-slate-700 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Critical Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bloqueados Hoy */}
              <Card className="bg-red-950/30 border-red-500/50 hover:border-red-500 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Bloqueados Hoy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-red-400">{stats.operational.blocked}</p>
                    <p className="text-xs text-red-300">
                      de {stats.totalSubcontractors}
                    </p>
                  </div>
                  <p className="text-xs text-red-300/70 mt-2">
                    Conductores sin operar
                  </p>
                </CardContent>
              </Card>

              {/* En Riesgo */}
              <Card className="bg-yellow-950/30 border-yellow-500/50 hover:border-yellow-500 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-yellow-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    En Riesgo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-yellow-400">{stats.operational.risk}</p>
                    <p className="text-xs text-yellow-300">
                      próximos 7 días
                    </p>
                  </div>
                  <p className="text-xs text-yellow-300/70 mt-2">
                    Vencimientos próximos
                  </p>
                </CardContent>
              </Card>

              {/* Compliance */}
              <Card className="bg-green-950/30 border-green-500/50 hover:border-green-500 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-green-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Cumplimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-green-400">
                      {Math.round((stats.operational.ok / stats.totalSubcontractors) * 100)}%
                    </p>
                    <p className="text-xs text-green-300">
                      operativo
                    </p>
                  </div>
                  <p className="text-xs text-green-300/70 mt-2">
                    {stats.operational.ok} de {stats.totalSubcontractors}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm">Conductores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalDrivers}</p>
                  <p className="text-xs text-slate-400 mt-1">Registrados en el sistema</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm">Subcontratos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalSubcontractors}</p>
                  <p className="text-xs text-slate-400 mt-1">Proveedores activos</p>
                </CardContent>
              </Card>
            </div>

            {/* Company Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Razón Social</p>
                    <p className="text-base font-semibold text-white mt-1">{company.razon_social}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">RUT</p>
                    <p className="text-base font-semibold text-white mt-1">{company.rut}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Conductores ({drivers.length})</h2>
            {drivers.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8">
                  <p className="text-slate-400">No hay conductores registrados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/50">
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">Nombre</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">RUT</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">Email</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr key={driver.id} className="border-b border-slate-700 hover:bg-slate-800/40 transition">
                          <td className="px-6 py-3 text-slate-100">{driver.first_name} {driver.last_name}</td>
                          <td className="px-6 py-3 text-slate-400 font-mono">{driver.rut}</td>
                          <td className="px-6 py-3 text-slate-400">{driver.email}</td>
                          <td className="px-6 py-3 text-slate-400">{driver.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Subcontratos ({organizations.length})</h2>
            {organizations.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-8">
                  <p className="text-slate-400">No hay subcontratos registrados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/50">
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">Empresa</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-300">RUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((org) => (
                        <tr key={org.id} className="border-b border-slate-700 hover:bg-slate-800/40 transition">
                          <td className="px-6 py-3 text-slate-100">{org.name}</td>
                          <td className="px-6 py-3 text-slate-400 font-mono">{org.rut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Documentos</h2>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Sección de documentos en construcción</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Alertas</h2>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No hay alertas activas</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
