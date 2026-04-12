'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, AlertTriangle, Search, Filter, MapPin, Phone, Mail, Badge } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompanyData {
  company: {
    nombre_fantasia: string
    razon_social: string
    rut: string
    email?: string
    phone?: string
    representative?: string
  }
  stats: {
    totalSubcontractors: number
    totalDrivers: number
    totalExecutives: number
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

type TabType = 'overview' | 'clients' | 'drivers' | 'documents' | 'equipment' | 'credentials' | 'alerts'

export default function CompanyDashboard() {
  const router = useRouter()
  const [data, setData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
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

  const handleLogout = () => {
    router.push('/auth/login-company')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Cargando datos...</p>
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
            <Button onClick={handleLogout} className="w-full bg-orange-500 hover:bg-orange-600">
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, stats, drivers = [], organizations = [] } = data

  const filteredDrivers = drivers.filter(driver =>
    driver.rut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.rut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.representante?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'overview' as TabType, label: 'Control Tower' },
    { id: 'clients' as TabType, label: `Clientes/Subcontratos (${organizations.length})` },
    { id: 'drivers' as TabType, label: `Conductores (${drivers.length})` },
    { id: 'documents' as TabType, label: 'Documentos Mensuales' },
    { id: 'equipment' as TabType, label: 'Equipo' },
    { id: 'credentials' as TabType, label: 'Credenciales' },
    { id: 'alerts' as TabType, label: 'Alertas' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{company.nombre_fantasia}</h1>
                <p className="text-xs text-slate-400">{company.razon_social}</p>
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

          {/* Tabs */}
          <div className="border-t border-slate-700/50 pt-4 overflow-x-auto">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400 text-sm uppercase tracking-wide">RUT</p>
                  <p className="text-2xl font-bold text-orange-500 mt-2">{company.rut}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400 text-sm uppercase tracking-wide">Ejecutivos</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">{stats.totalExecutives || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400 text-sm uppercase tracking-wide">Conductores</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">{stats.totalDrivers}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400 text-sm uppercase tracking-wide">Subcontratos</p>
                  <p className="text-2xl font-bold text-purple-400 mt-2">{stats.totalSubcontractors}</p>
                </CardContent>
              </Card>
            </div>

            {/* Company Info */}
            <Card className="bg-slate-800/40 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Razón Social</p>
                    <p className="text-base font-semibold text-white mt-2">{company.razon_social}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Representante Legal</p>
                    <p className="text-base font-semibold text-white mt-2">{company.representative || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>
                    <p className="text-base font-semibold text-white mt-2">{company.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Teléfono</p>
                    <p className="text-base font-semibold text-white mt-2">{company.phone || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control Tower Stats */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Control Tower</h2>
              <p className="text-slate-400 text-sm mb-6">Panel de control operacional</p>
              
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-slate-800/40 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300">Total de Entidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">{stats.totalDrivers}</p>
                    <p className="text-xs text-slate-400 mt-2">Conductores, subcontratistas y vehículos</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-950/30 border-green-500/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-300">Operacionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-400">{stats.operational.ok}</p>
                    <p className="text-xs text-green-300 mt-2">100% cumplimiento</p>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-950/30 border-yellow-500/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-300">En Riesgo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-400">{stats.operational.risk}</p>
                    <p className="text-xs text-yellow-300 mt-2">Vencimientos próximos</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-950/30 border-red-500/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-300">Bloqueados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-400">{stats.operational.blocked}</p>
                    <p className="text-xs text-red-300 mt-2">NO pueden operar</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Compliance Index */}
            <Card className="bg-slate-800/40 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Índice de Cumplimiento</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Promedio de cumplimiento operacional</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full transition-all" 
                        style={{ width: `${(stats.operational.ok / stats.totalDrivers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-orange-400">
                    {Math.round((stats.operational.ok / stats.totalDrivers) * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clients/Organizations Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Clientes/Subcontratos</h2>
              <p className="text-slate-400 text-sm">Mostrando {filteredOrganizations.length} de {organizations.length} subcontratistas</p>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, ejecutiva, comuna, teléfono o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <Button className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Organizations Grid */}
            {filteredOrganizations.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <p className="text-slate-400">No hay subcontratos que coincidan con la búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrganizations.map((org) => (
                  <Card key={org.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-orange-400 text-lg">{org.name}</CardTitle>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{org.rut}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                          <span className="text-green-400 text-sm">✓</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Representante</p>
                        <p className="text-slate-100 font-medium mt-1">{org.representante || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Ejecutiva Asignada</p>
                        <p className="text-orange-400 font-medium mt-1">{org.nombre_fantasia || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{org.region || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">{org.telefono || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs truncate">{org.email || '-'}</span>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{org.region || 'RM'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Conductores</h2>
              <p className="text-slate-400 text-sm">Total: {drivers.length} • Mostrando: {filteredDrivers.length}</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por RUT, nombre, proveedor o patente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Drivers Grid */}
            {filteredDrivers.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <p className="text-slate-400">No hay conductores que coincidan con la búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">RUT</p>
                          <CardTitle className="text-orange-400 text-lg mt-1">{driver.rut}</CardTitle>
                        </div>
                        <div className="px-2 py-1 bg-green-500/20 border border-green-500 rounded text-xs text-green-400 font-medium">Activo</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-100 font-semibold">{driver.first_name} {driver.last_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Proveedor</p>
                        <p className="text-slate-200 mt-1 truncate">{driver.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Patente Tracto</p>
                        <p className="text-blue-400 font-mono font-semibold mt-1">{driver.phone || 'XW7026'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Licencia</p>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 border border-slate-600 rounded text-xs text-slate-300">A-4</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">RUT Proveedor</p>
                        <p className="text-slate-300 font-mono mt-1">{driver.rut}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Tabs - Placeholder */}
        {['documents', 'equipment', 'credentials', 'alerts'].includes(activeTab) && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-12">
              <p className="text-slate-400">Esta sección está en construcción</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
