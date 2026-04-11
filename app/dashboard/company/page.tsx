'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, Users, Truck, User, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  company: {
    id: string
    rut: string
    razon_social: string
    nombre_fantasia: string
    email: string
    telefono: string
    region: string
    ciudad: string
    representante_legal: string
    is_active: boolean
  }
  executives: Array<{
    id: string
    full_name: string
    rut: string
    email: string
    phone: string
    cargo: string
  }>
  drivers: Array<{
    id: string
    full_name: string
    rut: string
    email: string
    phone: string
    license_number: string
    license_type: string
  }>
  vehicles: Array<{
    id: string
    plate: string
    brand: string
    model: string
    year: number
    type: string
  }>
  subcontractors: Array<{
    rut: string
    nombre: string
    representante: string
    ejecutiva: string
    direccion: string
    comuna: string
    telefono: string
    email: string
    ariztia: boolean
    lts: boolean
    rendic: boolean
    interpolar: boolean
  }>
}

export default function CompanyDashboard() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExecutiva, setFilterExecutiva] = useState('')
  const [filterComuna, setFilterComuna] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'rut' | 'ejecutiva'>('nombre')
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[v0] Fetching complete Labbe data from API')
        const response = await fetch('/api/company/data')
        
        if (!response.ok) {
          throw new Error('No se pudo obtener los datos')
        }

        const result = await response.json()
        console.log('[v0] Data loaded:', {
          company: result.company?.razon_social,
          executives: result.executives?.length || 0,
          drivers: result.drivers?.length || 0,
          vehicles: result.vehicles?.length || 0,
        })
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        console.error('[v0] Error fetching data:', errorMessage)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Cargando datos de Transportes Labbe...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-red-950/20 border-red-500/50 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error || 'No se encontraron datos'}</p>
            <Button
              onClick={() => router.push('/auth/login-company')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, executives, drivers, vehicles } = data

  // Filter and search logic for subcontractors
  const getFilteredSubcontractors = () => {
    if (!data?.subcontractors) return []
    
    let filtered = data.subcontractors.filter(sub => {
      const matchesSearch = 
        sub.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.representante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesExecutiva = !filterExecutiva || sub.ejecutiva === filterExecutiva
      const matchesComuna = !filterComuna || sub.comuna === filterComuna
      
      return matchesSearch && matchesExecutiva && matchesComuna
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'rut') return a.rut.localeCompare(b.rut)
      if (sortBy === 'ejecutiva') return a.ejecutiva.localeCompare(b.ejecutiva)
      return 0
    })

    return filtered
  }

  // Get unique values for filters
  const getUniqueExecutivas = () => {
    if (!data?.subcontractors) return []
    return [...new Set(data.subcontractors.map(s => s.ejecutiva))].sort()
  }

  const getUniqueComunas = () => {
    if (!data?.subcontractors) return []
    return [...new Set(data.subcontractors.map(s => s.comuna))].sort()
  }

  const filteredSubcontractors = getFilteredSubcontractors()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">{company.nombre_fantasia}</h1>
              <p className="text-sm text-slate-400">{company.razon_social}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/auth/login-company')}
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">RUT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-orange-500">{company.rut}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Ejecutivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-green-500">{executives.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Conductores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-blue-500">{drivers.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-purple-500">{vehicles.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">Razón Social</p>
                <p className="text-lg font-semibold text-white">{company.razon_social}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Representante Legal</p>
                <p className="text-lg font-semibold text-white">{company.representante_legal}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white">{company.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Teléfono</p>
                <p className="text-white">{company.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Región</p>
                <p className="text-white">{company.region}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ciudad</p>
                <p className="text-white">{company.ciudad}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executives */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Ejecutivos ({executives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executives.length > 0 ? (
              <div className="space-y-4">
                {executives.map((exec) => (
                  <div key={exec.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{exec.full_name}</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>RUT: {exec.rut}</div>
                      <div>Cargo: {exec.cargo}</div>
                      <div>Email: {exec.email}</div>
                      <div>Teléfono: {exec.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay ejecutivos registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Drivers */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Conductores ({drivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drivers.length > 0 ? (
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{driver.full_name}</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>RUT: {driver.rut}</div>
                      <div>Licencia: {driver.license_number}</div>
                      <div>Email: {driver.email}</div>
                      <div>Teléfono: {driver.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay conductores registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              Vehículos ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>Patente: {vehicle.plate}</div>
                      <div>Tipo: {vehicle.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay vehículos registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Subcontractors Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Subcontratos ({filteredSubcontractors.length} de {data?.subcontractors?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, representante o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Ejecutiva</label>
                  <select
                    value={filterExecutiva}
                    onChange={(e) => setFilterExecutiva(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas las ejecutivas</option>
                    {getUniqueExecutivas().map((exec) => (
                      <option key={exec} value={exec}>{exec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 block mb-2">Comuna</label>
                  <select
                    value={filterComuna}
                    onChange={(e) => setFilterComuna(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas las comunas</option>
                    {getUniqueComunas().slice(0, 50).map((comuna) => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 block mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="nombre">Nombre A-Z</option>
                    <option value="rut">RUT</option>
                    <option value="ejecutiva">Ejecutiva</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || filterExecutiva || filterComuna) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterExecutiva('')
                    setFilterComuna('')
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}

              {/* Table */}
              {filteredSubcontractors.length > 0 ? (
                <div className="overflow-x-auto border border-slate-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">RUT</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Nombre</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Representante</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Ejecutiva</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Comuna</th>
                        <th className="text-left py-3 px-3 text-slate-300 font-semibold">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubcontractors.map((sub, idx) => (
                        <tr 
                          key={idx} 
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedSubcontractor(sub)}
                        >
                          <td className="py-3 px-3 text-slate-300 font-mono text-xs">{sub.rut}</td>
                          <td className="py-3 px-3 text-white font-medium">{sub.nombre}</td>
                          <td className="py-3 px-3 text-slate-300 text-sm">{sub.representante}</td>
                          <td className="py-3 px-3 text-slate-400 text-sm">
                            <span className="bg-slate-700/50 px-2 py-1 rounded text-xs">{sub.ejecutiva}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-sm">{sub.comuna}</td>
                          <td className="py-3 px-3 text-slate-400 text-sm truncate">{sub.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No se encontraron subcontratos que coincidan con tus criterios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Subcontractor Detail Modal */}
      {selectedSubcontractor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-lg w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex items-center justify-between flex-row pb-3 border-b border-slate-700">
              <CardTitle className="text-white">{selectedSubcontractor.nombre}</CardTitle>
              <button
                onClick={() => setSelectedSubcontractor(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">RUT</p>
                  <p className="text-white font-mono">{selectedSubcontractor.rut}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Ejecutiva</p>
                  <p className="text-orange-400">{selectedSubcontractor.ejecutiva}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Representante</p>
                  <p className="text-white">{selectedSubcontractor.representante}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Comuna</p>
                  <p className="text-white">{selectedSubcontractor.comuna}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Dirección</p>
                <p className="text-white text-sm">{selectedSubcontractor.direccion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Email</p>
                <p className="text-blue-400 text-sm">{selectedSubcontractor.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Teléfono</p>
                <p className="text-white text-sm">{selectedSubcontractor.telefono || '-'}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => setSelectedSubcontractor(null)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
