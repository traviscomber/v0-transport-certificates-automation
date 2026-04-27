'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, Users, User, Search, X, FileText, BarChart3, Bell, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TorreControl } from '@/components/torre-control'
import { SubcontractorsList } from '@/components/subcontractors-list'
import { DriversList } from '@/components/drivers-list'
import { TeamSearch } from '@/components/team-search'
import { MonthlyDocumentsList } from '@/components/monthly-documents-list'
import { OnboardingModal } from '@/components/onboarding-modal'
import { type OperableEntity } from '@/lib/operations/status-engine'

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
    region: string
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
  const [activeTab, setActiveTab] = useState<'torre-control' | 'subcontractors' | 'drivers' | 'documents' | 'team' | 'alertas'>('torre-control')
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [isEditingDriver, setIsEditingDriver] = useState(false)
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)
  const [isDeletingDriver, setIsDeletingDriver] = useState(false)
  const [driverFormData, setDriverFormData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertsLoading, setAlertsLoading] = useState(false)
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

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true)
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const { data } = await response.json()
          setAlerts(data || [])
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setAlertsLoading(false)
      }
    }

    fetchAlerts()
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
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

  const { company, executives, drivers, subcontractors } = data

  // Helper functions
  const getUniqueExecutivas = () => {
    const execs = new Set(subcontractors?.map(s => s.ejecutiva) || [])
    return Array.from(execs).sort()
  }

  const getUniqueComunas = () => {
    const comunas = new Set(subcontractors?.map(s => s.comuna) || [])
    return Array.from(comunas).sort()
  }

  const getFilteredSubcontractors = () => {
    if (!subcontractors) return []
    
    let filtered = subcontractors.filter(sub => {
      const matchesSearch = 
        sub.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // CRUD operations for subcontractors
  const handleEditStart = () => {
    setFormData({ ...selectedSubcontractor })
    setIsEditMode(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/subcontractors?id=${selectedSubcontractor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al guardar')

      const updated = await response.json()
      console.log('[v0] Subcontractor updated:', updated.id)
      
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
    if (!confirm('Confirma que deseas eliminar este subcontrato')) return
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/subcontractors?id=${selectedSubcontractor.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      console.log('[v0] Subcontractor deleted')
      
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
    if (!drivers) return []
    
    let filtered = drivers.filter(driver => {
      const matchesSearch = 
        driver.nombre.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
        driver.rut.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
        driver.proveedor.toLowerCase().includes(driverSearchTerm.toLowerCase())
      
      const matchesProvider = !driverFilterProvider || driver.proveedor === driverFilterProvider
      
      return matchesSearch && matchesProvider
    })

    filtered.sort((a, b) => {
      if (driverSortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (driverSortBy === 'rut') return a.rut.localeCompare(b.rut)
      if (driverSortBy === 'proveedor') return a.proveedor.localeCompare(b.proveedor)
      return 0
    })

    return filtered
  }

  const getUniqueProviders = () => {
    if (!drivers) return []
    return [...new Set(drivers.map(d => d.proveedor))].sort()
  }

  const filteredSubcontractors = getFilteredSubcontractors()
  const filteredDrivers = getFilteredDrivers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modal de Onboarding para nuevos usuarios */}
      <OnboardingModal />
      
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

      <main className="container mx-auto px-4 py-8">
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
              <CardTitle className="text-sm font-medium text-slate-300">Subcontratos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-purple-500">{subcontractors.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto pb-0 -mb-px">
          <button
            onClick={() => setActiveTab('torre-control')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2 text-sm ${
              activeTab === 'torre-control'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Torre de Control
          </button>
          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap text-sm ${
              activeTab === 'subcontractors'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Gestión de Subcontratistas ({subcontractors.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap text-sm ${
              activeTab === 'drivers'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Gestión de Conductores ({drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap text-sm flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Gestión de Documentos
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2 text-sm ${
              activeTab === 'team'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Gestión de Equipo
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2 text-sm relative ${
              activeTab === 'alertas'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            Centro de Alertas
            {alerts.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {alerts.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'torre-control' && (
          <div>
            <TorreControl 
              drivers={drivers}
              subcontractors={subcontractors}
              vehicles={[]}
            />
          </div>
        )}

        {activeTab === 'subcontractors' && (
          <div>
            <SubcontractorsList subcontractors={subcontractors as any} />
          </div>
        )}

        {activeTab === 'drivers' && (
          <div>
            <DriversList drivers={drivers as any} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <MonthlyDocumentsList />
          </div>
        )}

        {activeTab === 'team' && (
          <div>
            <TeamSearch />
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="space-y-6">
            {/* Header Educativo */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Centro de Alertas</h2>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Centro de notificaciones del sistema. Aquí recibes alertas sobre documentos vencidos, conductores bloqueados, subcontratistas en riesgo y eventos críticos de tu operación.
              </p>
            </div>

            {/* Estadísticas de Alertas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-400">{alerts.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Total de Alertas</p>
                </CardContent>
              </Card>
              <Card className="bg-red-900/20 border-red-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-400">{alerts.filter(a => a.priority === 'critical').length}</div>
                  <p className="text-xs text-red-300 mt-1">Críticas</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-900/20 border-orange-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-400">{alerts.filter(a => a.priority === 'high').length}</div>
                  <p className="text-xs text-orange-300 mt-1">Altas</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{alerts.filter(a => !a.read).length}</div>
                  <p className="text-xs text-slate-400 mt-1">No Leídas</p>
                </CardContent>
              </Card>
            </div>

            {/* Alertas List */}
            {alertsLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">Cargando alertas...</div>
                </CardContent>
              </Card>
            ) : alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <div className="text-foreground font-semibold">Sin alertas</div>
                  <div className="text-slate-400">¡Todo está en orden!</div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="border-slate-700 hover:border-slate-600 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {alert.type === 'info' && <Bell className="h-5 w-5 text-blue-500" />}
                        {alert.type === 'success' && <Bell className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{alert.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.priority === 'critical' ? 'bg-red-500/30 text-red-200' :
                            alert.priority === 'high' ? 'bg-orange-500/30 text-orange-200' :
                            alert.priority === 'normal' ? 'bg-blue-500/30 text-blue-200' :
                            'bg-slate-500/30 text-slate-200'
                          }`}>
                            {alert.priority?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{alert.message}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(alert.created_at).toLocaleDateString('es-ES')}</span>
                          <span className="capitalize">{alert.category}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
