'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, Users, User, Search, X } from 'lucide-react'
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
    id?: string
    rut: string
    nombre: string
    rut_proveedor: string
    proveedor: string
    patente_tracto: string
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
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExecutiva, setFilterExecutiva] = useState('')
  const [filterComuna, setFilterComuna] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'rut' | 'ejecutiva'>('nombre')
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'subcontractors' | 'drivers'>('subcontractors')
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [isEditingDriver, setIsEditingDriver] = useState(false)
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)
  const [isDeletingDriver, setIsDeletingDriver] = useState(false)
  const [driverFormData, setDriverFormData] = useState<any>(null)
  const [driverSearchTerm, setDriverSearchTerm] = useState('')
  const [driverFilterProvider, setDriverFilterProvider] = useState('')
  const [driverSortBy, setDriverSortBy] = useState<'nombre' | 'rut' | 'proveedor'>('nombre')

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

  const { company, executives, drivers } = data

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

  // Driver filter, search and sort logic

  // CRUD Functions
  const handleEditStart = () => {
    setFormData({ ...selectedSubcontractor })
    setIsEditMode(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/subcontractors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al guardar')

      const updated = await response.json()
      console.log('[v0] Subcontractor updated:', updated.id)
      
      // Update local data
      if (data) {
        const newSubs = data.subcontractors.map(s => s.rut === updated.rut ? updated : s)
        setData({ ...data, subcontractors: newSubs })
      }
      
      setSelectedSubcontractor(updated)
      setIsEditMode(false)
      setFormData(null)
    } catch (error) {
      console.error('[v0] Error saving:', error)
      alert('Error al guardar los cambios')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este subcontrato?')) return
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/subcontractors?id=${selectedSubcontractor.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      console.log('[v0] Subcontractor deleted')
      
      // Update local data
      if (data) {
        const newSubs = data.subcontractors.filter(s => s.rut !== selectedSubcontractor.rut)
        setData({ ...data, subcontractors: newSubs })
      }
      
      setSelectedSubcontractor(null)
      setIsEditMode(false)
    } catch (error) {
      console.error('[v0] Error deleting:', error)
      alert('Error al eliminar el subcontrato')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateNew = async () => {
    try {
      if (!formData.nombre || !formData.rut || !formData.ejecutiva) {
        alert('Por favor completa los campos requeridos: Nombre, RUT y Ejecutiva')
        return
      }

      const response = await fetch('/api/subcontractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al crear')

      const created = await response.json()
      console.log('[v0] Subcontractor created:', created.id)
      
      // Update local data
      if (data) {
        setData({ ...data, subcontractors: [...data.subcontractors, created] })
      }
      
      setShowAddModal(false)
      setFormData(null)
      alert('Subcontrato creado exitosamente')
    } catch (error) {
      console.error('[v0] Error creating:', error)
      alert('Error al crear el subcontrato')
    }
  }

  // Filter and search logic for drivers
  const getFilteredDrivers = () => {
    if (!data?.drivers) return []
    
    let filtered = data.drivers.filter(driver => {
      const matchesSearch = 
        driver.nombre.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
        driver.rut.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
        driver.proveedor.toLowerCase().includes(driverSearchTerm.toLowerCase())
      
      const matchesProvider = !driverFilterProvider || driver.proveedor === driverFilterProvider
      
      return matchesSearch && matchesProvider
    })

    // Sort
    filtered.sort((a, b) => {
      if (driverSortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (driverSortBy === 'rut') return a.rut.localeCompare(b.rut)
      if (driverSortBy === 'proveedor') return a.proveedor.localeCompare(b.proveedor)
      return 0
    })

    return filtered
  }

  // Get unique providers for driver filters
  const getUniqueProviders = () => {
    if (!data?.drivers) return []
    return [...new Set(data.drivers.map(d => d.proveedor))].sort()
  }

  const filteredDrivers = getFilteredDrivers()

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
        {/* Moved to tab section */}

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`pb-3 px-1 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'subcontractors'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Building2 className="inline w-5 h-5 mr-2" />
            Clientes/Subcontratos ({data.subcontractors.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`pb-3 px-1 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'drivers'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            Conductores ({data.drivers.length})
          </button>
        </div>

        {/* Subcontractors Tab Content */}
        {activeTab === 'subcontractors' && (
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Clientes/Subcontratos ({filteredSubcontractors.length} de {data?.subcontractors?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setFormData({
                          rut: '',
                          nombre: '',
                          representante: '',
                          ejecutiva: '',
                          direccion: '',
                          comuna: '',
                          telefono: '',
                          email: '',
                        })
                        setShowAddModal(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      + Agregar Cliente
                    </Button>
                  </div>

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
                      <p className="text-slate-400">No se encontraron clientes que coincidan con tus criterios</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drivers Tab Content */}
        {activeTab === 'drivers' && (
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Conductores ({filteredDrivers.length} de {data?.drivers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setDriverFormData({
                          rut: '',
                          nombre: '',
                          rut_proveedor: '',
                          proveedor: '',
                          patente_tracto: '',
                        })
                        setShowAddDriverModal(true)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      + Agregar Conductor
                    </Button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, RUT o proveedor..."
                      value={driverSearchTerm}
                      onChange={(e) => setDriverSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {driverSearchTerm && (
                      <button
                        onClick={() => setDriverSearchTerm('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Proveedor</label>
                      <select
                        value={driverFilterProvider}
                        onChange={(e) => setDriverFilterProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Todos los proveedores</option>
                        {getUniqueProviders().slice(0, 50).map((provider) => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Ordenar por</label>
                      <select
                        value={driverSortBy}
                        onChange={(e) => setDriverSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="nombre">Nombre A-Z</option>
                        <option value="rut">RUT</option>
                        <option value="proveedor">Proveedor</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(driverSearchTerm || driverFilterProvider) && (
                    <button
                      onClick={() => {
                        setDriverSearchTerm('')
                        setDriverFilterProvider('')
                      }}
                      className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Limpiar filtros
                    </button>
                  )}

                  {/* Table */}
                  {filteredDrivers.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-700/50">
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-3 text-slate-300 font-semibold">RUT Conductor</th>
                            <th className="text-left py-3 px-3 text-slate-300 font-semibold">Nombre</th>
                            <th className="text-left py-3 px-3 text-slate-300 font-semibold">RUT Proveedor</th>
                            <th className="text-left py-3 px-3 text-slate-300 font-semibold">Proveedor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDrivers.map((driver, idx) => (
                            <tr 
                              key={idx} 
                              className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                              onClick={() => setSelectedDriver(driver)}
                            >
                              <td className="py-3 px-3 text-slate-300 font-mono text-xs">{driver.rut}</td>
                              <td className="py-3 px-3 text-white font-medium">{driver.nombre}</td>
                              <td className="py-3 px-3 text-slate-400 font-mono text-xs">{driver.rut_proveedor}</td>
                              <td className="py-3 px-3 text-slate-400 text-sm truncate">{driver.proveedor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No se encontraron conductores que coincidan con tus criterios</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-lg w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex items-center justify-between flex-row pb-3 border-b border-slate-700">
              <CardTitle className="text-white">{selectedDriver.nombre}</CardTitle>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">RUT Conductor</p>
                  {!isEditingDriver ? (
                    <p className="text-white font-mono">{selectedDriver.rut}</p>
                  ) : (
                    <input
                      type="text"
                      value={driverFormData?.rut || ''}
                      onChange={(e) => setDriverFormData({ ...driverFormData, rut: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Patente Tracto</p>
                  {!isEditingDriver ? (
                    <p className="text-orange-400">{selectedDriver.patente_tracto}</p>
                  ) : (
                    <input
                      type="text"
                      value={driverFormData?.patente_tracto || ''}
                      onChange={(e) => setDriverFormData({ ...driverFormData, patente_tracto: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Nombre</p>
                {!isEditingDriver ? (
                  <p className="text-white text-sm">{selectedDriver.nombre}</p>
                ) : (
                  <input
                    type="text"
                    value={driverFormData?.nombre || ''}
                    onChange={(e) => setDriverFormData({ ...driverFormData, nombre: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">RUT Proveedor</p>
                {!isEditingDriver ? (
                  <p className="text-white text-sm">{selectedDriver.rut_proveedor}</p>
                ) : (
                  <input
                    type="text"
                    value={driverFormData?.rut_proveedor || ''}
                    onChange={(e) => setDriverFormData({ ...driverFormData, rut_proveedor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Proveedor</p>
                {!isEditingDriver ? (
                  <p className="text-blue-400 text-sm">{selectedDriver.proveedor}</p>
                ) : (
                  <input
                    type="text"
                    value={driverFormData?.proveedor || ''}
                    onChange={(e) => setDriverFormData({ ...driverFormData, proveedor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {!isEditingDriver ? (
                  <>
                    <Button
                      onClick={() => {
                        setDriverFormData({ ...selectedDriver })
                        setIsEditingDriver(true)
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      ✎ Editar
                    </Button>
                    <Button
                      onClick={() => setSelectedDriver(null)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700"
                    >
                      Cerrar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedDriver(driverFormData)
                        setIsEditingDriver(false)
                        setDriverFormData(null)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✓ Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingDriver(false)
                        setDriverFormData(null)
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-lg w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex items-center justify-between flex-row pb-3 border-b border-slate-700">
              <CardTitle className="text-white">Nuevo Conductor</CardTitle>
              <button
                onClick={() => {
                  setShowAddDriverModal(false)
                  setDriverFormData(null)
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase">RUT Conductor *</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={driverFormData?.rut || ''}
                    onChange={(e) => setDriverFormData({ ...driverFormData, rut: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase">Patente *</label>
                  <input
                    type="text"
                    placeholder="XW7026"
                    value={driverFormData?.patente_tracto || ''}
                    onChange={(e) => setDriverFormData({ ...driverFormData, patente_tracto: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Nombre *</label>
                <input
                  type="text"
                  placeholder="Nombre del conductor"
                  value={driverFormData?.nombre || ''}
                  onChange={(e) => setDriverFormData({ ...driverFormData, nombre: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">RUT Proveedor *</label>
                <input
                  type="text"
                  placeholder="77653071-9"
                  value={driverFormData?.rut_proveedor || ''}
                  onChange={(e) => setDriverFormData({ ...driverFormData, rut_proveedor: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Proveedor *</label>
                <input
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={driverFormData?.proveedor || ''}
                  onChange={(e) => setDriverFormData({ ...driverFormData, proveedor: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => {
                    if (!driverFormData?.rut || !driverFormData?.nombre || !driverFormData?.proveedor) {
                      alert('Por favor completa los campos requeridos')
                      return
                    }
                    console.log('[v0] Driver created:', driverFormData)
                    if (data) {
                      setData({ ...data, drivers: [...data.drivers, driverFormData] })
                    }
                    setShowAddDriverModal(false)
                    setDriverFormData(null)
                    alert('Conductor agregado exitosamente')
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✓ Agregar
                </Button>
                <Button
                  onClick={() => {
                    setShowAddDriverModal(false)
                    setDriverFormData(null)
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  {!isEditMode ? (
                    <p className="text-white font-mono">{selectedSubcontractor.rut}</p>
                  ) : (
                    <input
                      type="text"
                      value={formData?.rut || ''}
                      onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Ejecutiva</p>
                  {!isEditMode ? (
                    <p className="text-orange-400">{selectedSubcontractor.ejecutiva}</p>
                  ) : (
                    <select
                      value={formData?.ejecutiva || ''}
                      onChange={(e) => setFormData({ ...formData, ejecutiva: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    >
                      <option value="">Selecciona ejecutiva</option>
                      {getUniqueExecutivas().map((exec) => (
                        <option key={exec} value={exec}>{exec}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Representante</p>
                  {!isEditMode ? (
                    <p className="text-white">{selectedSubcontractor.representante}</p>
                  ) : (
                    <input
                      type="text"
                      value={formData?.representante || ''}
                      onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Comuna</p>
                  {!isEditMode ? (
                    <p className="text-white">{selectedSubcontractor.comuna}</p>
                  ) : (
                    <input
                      type="text"
                      value={formData?.comuna || ''}
                      onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Nombre</p>
                {!isEditMode ? (
                  <p className="text-white text-sm">{selectedSubcontractor.nombre}</p>
                ) : (
                  <input
                    type="text"
                    value={formData?.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Dirección</p>
                {!isEditMode ? (
                  <p className="text-white text-sm">{selectedSubcontractor.direccion}</p>
                ) : (
                  <input
                    type="text"
                    value={formData?.direccion || ''}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Email</p>
                {!isEditMode ? (
                  <p className="text-blue-400 text-sm">{selectedSubcontractor.email || '-'}</p>
                ) : (
                  <input
                    type="email"
                    value={formData?.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Teléfono</p>
                {!isEditMode ? (
                  <p className="text-white text-sm">{selectedSubcontractor.telefono || '-'}</p>
                ) : (
                  <input
                    type="text"
                    value={formData?.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {!isEditMode ? (
                  <>
                    <Button
                      onClick={() => handleEditStart()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      ✎ Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete()}
                      disabled={isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? 'Eliminando...' : '🗑 Eliminar'}
                    </Button>
                    <Button
                      onClick={() => setSelectedSubcontractor(null)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700"
                    >
                      Cerrar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleSave()}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✓ Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditMode(false)
                        setFormData(null)
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Subcontractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-lg w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex items-center justify-between flex-row pb-3 border-b border-slate-700">
              <CardTitle className="text-white">Nuevo Subcontrato</CardTitle>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setFormData(null)
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase">RUT *</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData?.rut || ''}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase">Ejecutiva *</label>
                  <select
                    value={formData?.ejecutiva || ''}
                    onChange={(e) => setFormData({ ...formData, ejecutiva: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="">Selecciona ejecutiva</option>
                    {getUniqueExecutivas().map((exec) => (
                      <option key={exec} value={exec}>{exec}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Nombre *</label>
                <input
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={formData?.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Representante</label>
                <input
                  type="text"
                  placeholder="Nombre del representante"
                  value={formData?.representante || ''}
                  onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Dirección</label>
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData?.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Comuna</label>
                <input
                  type="text"
                  placeholder="Comuna"
                  value={formData?.comuna || ''}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Email</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData?.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Teléfono</label>
                <input
                  type="text"
                  placeholder="+56 9 XXXX XXXX"
                  value={formData?.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={() => handleCreateNew()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✓ Crear
                </Button>
                <Button
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData(null)
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
