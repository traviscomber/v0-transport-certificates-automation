/**
 * GESTIÓN DE CONDUCTORES
 * 
 * Panel para visualizar y gestionar todos los conductores de tu flota.
 * Aquí puedes:
 * - Buscar conductores por RUT, nombre, proveedor o patente
 * - Ver estado de cumplimiento (activo/inactivo)
 * - Monitorear clase de licencia vigente
 * - Acceder a información de contacto
 * - Identificar conductores en riesgo o bloqueados
 * 
 * ¿Qué es un Conductor? Es la persona responsable de operar vehículos.
 * Cada conductor tiene documentos (licencia, antecedentes) que monitorear.
 */

'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Search, X, AlertCircle, CheckCircle2, Info, Filter } from 'lucide-react'
import { EducationalTooltip } from './educational-tooltip'

interface Driver {
  id: string
  rut: string
  nombre: string
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string
  rut_proveedor?: string
  proveedor?: string
  patente_tracto?: string
  clase_licencia?: string
  is_active: boolean
}

interface DriversListProps {
  drivers: Driver[]
}

export function DriversList({ drivers }: DriversListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase()
      
      // Filtro de búsqueda
      const matchesSearch = 
        driver.rut?.toLowerCase().includes(searchLower) ||
        driver.nombre?.toLowerCase().includes(searchLower) ||
        driver.proveedor?.toLowerCase().includes(searchLower) ||
        driver.patente_tracto?.toLowerCase().includes(searchLower)
      
      // Filtro por proveedor/subcontratista
      const matchesProvider = 
        selectedProviders.length === 0 || 
        (driver.proveedor && selectedProviders.includes(driver.proveedor))
      
      // Filtro por estado
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && driver.is_active) ||
        (selectedStatus === 'inactive' && !driver.is_active)
      
      return matchesSearch && matchesProvider && matchesStatus
    })
  }, [drivers, searchTerm, selectedProviders, selectedStatus])

  // Obtener lista única de proveedores
  const providers = useMemo(() => {
    const uniqueProviders = new Set(drivers.map(d => d.proveedor).filter(Boolean))
    return Array.from(uniqueProviders).sort()
  }, [drivers])

  // Funciones para manejar filtros
  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    )
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedProviders([])
    setSelectedStatus('all')
    setShowAdvancedFilters(false)
  }

  return (
    <div className="w-full space-y-4">
      {/* Header Educativo */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">Gestión de Conductores</h2>
          <EducationalTooltip 
            title="¿Qué es un Conductor?"
            content="Persona responsable de operar vehículos en tu flota. Cada conductor tiene licencia de conducir, antecedentes penales y documentos que deben estar vigentes para que pueda trabajar."
          />
        </div>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Monitorea licencias vigentes, estado de cumplimiento y actualización de documentos. Identifica conductores listos para operar o que necesitan atención inmediata.
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-white">{drivers.length}</div>
            <p className="text-xs text-slate-400">Total de Conductores</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-400">{drivers.filter(d => d.is_active).length}</div>
            <p className="text-xs text-green-300">Activos</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-red-400">{drivers.filter(d => !d.is_active).length}</div>
            <p className="text-xs text-red-300">Inactivos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-white">{filteredDrivers.length}</div>
            <p className="text-xs text-slate-400">Resultados de búsqueda</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with search and filters button */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Buscar Conductores</h3>
              <EducationalTooltip 
                title="¿Cómo buscar?"
                content="Busca por RUT (ej: 18.012.757-7), nombre completo, proveedor (subcontratista) o patente del vehículo (ej: XW7026). La búsqueda es instantánea."
                size="sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Buscar por RUT, nombre, proveedor o patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant={showAdvancedFilters ? 'default' : 'outline'}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {(selectedProviders.length > 0 || selectedStatus !== 'all') && (
                <Badge className="ml-1 bg-orange-500 text-white">{selectedProviders.length + (selectedStatus !== 'all' ? 1 : 0)}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters con Tooltips */}
        {showAdvancedFilters && (
          <div className="space-y-3 p-4 bg-slate-900 rounded-lg border border-slate-800">
            {/* Status Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-semibold text-slate-300">Estado</label>
                <EducationalTooltip 
                  title="¿Qué significa cada estado?"
                  content="Activo: Conductor listo para operar, todos los documentos vigentes. Inactivo: Documentos vencidos o incumplimiento que impide operar."
                  size="sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Activos' },
                  { value: 'inactive', label: 'Inactivos' }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value as 'all' | 'active' | 'inactive')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Providers Filter */}
            {providers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-slate-300">Proveedor/Subcontratista ({selectedProviders.length})</label>
                  <EducationalTooltip 
                    title="¿Qué es el Proveedor?"
                    content="Empresa o persona (subcontratista) que proporciona el conductor. Filtra por proveedor para ver solo conductores de una empresa específica."
                    size="sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {providers.map(provider => (
                    <button
                      key={provider}
                      onClick={() => toggleProvider(provider)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedProviders.includes(provider)
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Filters Button */}
            {(selectedProviders.length > 0 || selectedStatus !== 'all' || searchTerm) && (
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Drivers Grid */}
      {filteredDrivers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="group cursor-pointer rounded-lg border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-4 transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
              onClick={() => setSelectedDriver(driver)}
            >
              {/* Header with RUT and status */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold uppercase text-slate-400">RUT</p>
                    <EducationalTooltip 
                      title="¿Qué es el RUT?"
                      content="Número de identificación único en Chile. Todos los conductores deben tener un RUT válido para operar."
                      size="xs"
                    />
                  </div>
                  <p className="font-mono text-lg font-bold text-amber-400">{driver.rut}</p>
                </div>
                {driver.is_active ? (
                  <Badge className="bg-green-500/20 text-green-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Inactivo
                  </Badge>
                )}
              </div>

              {/* Driver Name */}
              <div className="mb-4 border-t border-slate-700 pt-3">
                <p className="text-sm font-semibold text-white line-clamp-2">
                  {driver.nombre}
                </p>
              </div>

              {/* Proveedor */}
              {driver.proveedor && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Proveedor</p>
                  <p className="text-sm text-slate-300 line-clamp-1">{driver.proveedor}</p>
                </div>
              )}

              {/* Patente */}
              {driver.patente_tracto && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Patente Tracto</p>
                  <p className="font-mono text-lg font-bold text-blue-400">
                    {driver.patente_tracto}
                  </p>
                </div>
              )}

              {/* Clase Licencia */}
              {driver.clase_licencia && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Licencia</p>
                  <Badge variant="outline" className="font-mono">
                    {driver.clase_licencia}
                  </Badge>
                </div>
              )}

              {/* RUT Proveedor */}
              {driver.rut_proveedor && (
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">RUT Proveedor</p>
                  <p className="font-mono text-sm text-slate-400">{driver.rut_proveedor}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 py-12 text-center">
          <Search className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-lg font-semibold text-slate-300">No se encontraron conductores</p>
          <p className="text-sm text-slate-500">Intenta ajustar tu búsqueda</p>
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedDriver.nombre}</h3>
                <p className="font-mono text-sm text-amber-400">{selectedDriver.rut}</p>
              </div>

              <div className="space-y-3 border-t border-slate-700 pt-4">
                {selectedDriver.nombres && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Nombres</p>
                    <p className="text-white">{selectedDriver.nombres}</p>
                  </div>
                )}

                {selectedDriver.apellido_paterno && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Apellido Paterno</p>
                    <p className="text-white">{selectedDriver.apellido_paterno}</p>
                  </div>
                )}

                {selectedDriver.apellido_materno && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Apellido Materno</p>
                    <p className="text-white">{selectedDriver.apellido_materno}</p>
                  </div>
                )}

                {selectedDriver.proveedor && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Proveedor</p>
                    <p className="text-white">{selectedDriver.proveedor}</p>
                  </div>
                )}

                {selectedDriver.rut_proveedor && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">RUT Proveedor</p>
                    <p className="font-mono text-slate-300">{selectedDriver.rut_proveedor}</p>
                  </div>
                )}

                {selectedDriver.patente_tracto && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Patente Tracto</p>
                    <p className="font-mono text-lg font-bold text-blue-400">
                      {selectedDriver.patente_tracto}
                    </p>
                  </div>
                )}

                {selectedDriver.clase_licencia && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Clase Licencia</p>
                    <p className="text-white">{selectedDriver.clase_licencia}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 border-t border-slate-700 pt-4">
                  {selectedDriver.is_active ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300">Activo</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-300">Inactivo</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
