'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, MapPin, Phone, Mail, CheckCircle, AlertCircle, X, Filter, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Subcontractor {
  id: string
  nombre?: string
  nombre_fantasia?: string
  razon_social?: string
  rut: string
  comuna: string
  direccion?: string
  representante_legal?: string
  telefono: string
  email?: string
  correo?: string
  ejecutivo_nombre?: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
  conductores_count?: number
  region?: string
}

interface Driver {
  id: string
  rut: string
  nombre: string
  rut_proveedor: string
  proveedor: string
  is_active: boolean
}

interface SubcontractorsListProps {
  subcontractors?: Subcontractor[]
  drivers?: Driver[]
}

export function SubcontractorsList({ subcontractors: initialSubcontractors, drivers: initialDrivers }: SubcontractorsListProps) {
  // Load subcontractors and drivers
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors || [])
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers || [])
  const [isLoading, setIsLoading] = useState(!initialSubcontractors)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEjecutivas, setSelectedEjecutivas] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [expandedSubcontractor, setExpandedSubcontractor] = useState<string | null>(null)

  // Fetch data from API if not provided as prop
  useEffect(() => {
    if (initialSubcontractors) {
      return // Use provided data
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/data', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.dashboard?.transportistas && Array.isArray(data.dashboard.transportistas)) {
            // Load ALL transportistas regardless of active status
            setSubcontractors(data.dashboard.transportistas)
            setDrivers(data.dashboard.conductores || [])
          }
        } else {
          console.error('[v0] API error:', response.status)
          setSubcontractors([])
          setDrivers([])
        }
      } catch (error) {
        console.error('[v0] Error fetching subcontractors:', error)
        setSubcontractors([])
        setDrivers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initialSubcontractors])

  // Get unique values for filters
  const ejecutivas = useMemo(() => Array.from(new Set(subcontractors.map(s => s.ejecutivo_nombre || 'Sin asignar'))).filter(Boolean).sort(), [subcontractors])
  const certifications = { ariztia: 'Ariztia', lts: 'LTS', rendic: 'Rendic', interpolar: 'Interpolar' }

  // Smart search and filtering
  const filtered = useMemo(() => {
    const results = subcontractors.filter(sub => {
      // Search term filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
          (sub.razon_social || sub.nombre || '').toLowerCase().includes(query) ||
          sub.nombre_fantasia?.toLowerCase().includes(query) ||
          sub.rut.includes(query) ||
          sub.representante_legal?.toLowerCase().includes(query) ||
          sub.ejecutivo_nombre?.toLowerCase().includes(query) ||
          sub.comuna?.toLowerCase().includes(query) ||
          sub.telefono.includes(query) ||
          sub.email?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Ejecutiva filter
      const subEjecutiva = sub.ejecutivo_nombre || 'Sin asignar'
      if (selectedEjecutivas.length > 0 && subEjecutiva && !selectedEjecutivas.includes(subEjecutiva)) {
        return false
      }

      // Certifications filter
      if (selectedCertifications.length > 0) {
        const hasCertification = selectedCertifications.some(cert => {
          if (cert === 'ariztia') return sub.ariztia
          if (cert === 'lts') return sub.lts
          if (cert === 'rendic') return sub.rendic
          if (cert === 'interpolar') return sub.interpolar
          return false
        })
        if (!hasCertification) return false
      }

      // Active status filter
      if (showActiveOnly && !sub.is_active) {
        return false
      }

      return true
    })

    // Sort alphabetically by nombre
    return results.sort((a, b) => {
      const nameA = (a.nombre || a.razon_social || '').toLowerCase()
      const nameB = (b.nombre || b.razon_social || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [searchTerm, selectedEjecutivas, selectedCertifications, showActiveOnly, subcontractors])

  // Toggle filter functions
  const toggleEjecutiva = (ejecutiva: string) => {
    setSelectedEjecutivas(prev =>
      prev.includes(ejecutiva) ? prev.filter(e => e !== ejecutiva) : [...prev, ejecutiva]
    )
  }

  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedEjecutivas([])
    setSelectedCertifications([])
    setShowActiveOnly(false)
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = searchTerm.length > 0 || selectedEjecutivas.length > 0 || selectedCertifications.length > 0 || showActiveOnly

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">Cargando subcontratistas...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header Educativo */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Subcontratistas</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Visualiza, busca y filtra todos tus proveedores de transporte. Monitorea su cumplimiento normativo y certificaciones. Mantén contacto directo con representantes y ejecutivas.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, RUT, región, ejecutiva..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded border transition-colors flex items-center gap-2 ${
            showAdvancedFilters
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-1 bg-red-500 text-white">
              {selectedCertifications.length + (showActiveOnly ? 1 : 0)}
            </Badge>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Limpiar todos los filtros"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Ejecutivas Filter - Always visible */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300 block">Ejecutivas</label>
        <div className="flex flex-wrap gap-2">
          {ejecutivas.map(ejecutiva => (
            <button
              key={ejecutiva}
              onClick={() => toggleEjecutiva(ejecutiva)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedEjecutivas.includes(ejecutiva)
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ejecutiva}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          {/* Certifications Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">Certificaciones ({selectedCertifications.length})</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(certifications).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleCertification(key)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCertifications.includes(key)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800"
            />
            <span className="text-sm text-slate-300">Solo activos</span>
          </label>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Mostrando {filtered.length} de {subcontractors.length} subcontratistas
      </div>

      {/* Results Grid */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No hay subcontratistas que coincidan con los filtros.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((sub, subIdx) => {
            // Normalize RUT format for matching (remove dots, hyphens, spaces)
            const normalizeRut = (rut: string | undefined) => {
              if (!rut) return ''
              return rut.trim().replace(/[.-]/g, '').toUpperCase()
            }
            
            const normalizedSubRut = normalizeRut(sub.rut)
            
            // Get or calculate driver count and filter drivers for this subcontractor
            let driverCount = sub.conductores_count ?? 0
            let subDrivers = drivers.filter((d) => {
              const normalizedDriverRut = normalizeRut(d.rut_proveedor)
              return normalizedDriverRut === normalizedSubRut && d.is_active
            })
            
            // If conductores_count is not available from API, use the filtered count
            if (driverCount === 0 && drivers.length > 0) {
              driverCount = subDrivers.length
            }
            
            const isExpanded = expandedSubcontractor === sub.id

            return (
            <Card key={sub.id} className="hover:border-slate-500 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                          {subIdx + 1}
                        </span>
                        <h3 className="font-bold text-lg text-white">{sub.nombre}</h3>
                      </div>
                      {sub.nombre_fantasia && (
                        <p className="text-sm text-slate-400 italic ml-9">{sub.nombre_fantasia}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.is_active ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <Badge className="bg-green-500/20 text-green-300">Activo</Badge>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <Badge className="bg-red-500/20 text-red-300">Inactivo</Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Driver count badge */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      <span className="font-semibold text-amber-400">{driverCount}</span> conductores asociados
                    </span>
                    {driverCount > 0 && (
                      <button
                        onClick={() => setExpandedSubcontractor(isExpanded ? null : sub.id)}
                        className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {isExpanded ? 'Ocultar' : 'Ver'}
                      </button>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">RUT</p>
                      <p className="font-mono text-sm text-amber-400">{sub.rut}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">COMUNA</p>
                      <p className="text-sm text-white">{sub.comuna || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">DIRECCIÓN</p>
                      <p className="text-sm text-white">{sub.direccion || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">REPRESENTANTE</p>
                      <p className="text-sm text-white">{sub.representante_legal || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">EJECUTIVA ASIGNADA</p>
                      <p className="text-sm text-white">{sub.ejecutivo_nombre || 'Sin asignar'}</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {sub.telefono && (
                      <a href={`tel:${sub.telefono}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <Phone className="w-4 h-4" />
                        {sub.telefono}
                      </a>
                    )}
                    {(sub.correo || sub.email) && (
                      <a href={`mailto:${sub.correo || sub.email}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <Mail className="w-4 h-4" />
                        {sub.correo || sub.email}
                      </a>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-2">
                    {sub.ariztia && <Badge className="bg-blue-500/20 text-blue-300">Ariztia</Badge>}
                    {sub.lts && <Badge className="bg-green-500/20 text-green-300">LTS</Badge>}
                    {sub.rendic && <Badge className="bg-purple-500/20 text-purple-300">Rendic</Badge>}
                    {sub.interpolar && <Badge className="bg-orange-500/20 text-orange-300">Interpolar</Badge>}
                  </div>

                  {/* Expandable Drivers Section */}
                  {isExpanded && driverCount > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
                      <p className="text-sm font-semibold text-slate-300">Conductores asociados ({driverCount}):</p>
                      <div className="grid gap-2 max-h-96 overflow-y-auto">
                        {subDrivers.map(driver => (
                          <div key={driver.id} className="p-3 bg-slate-900 rounded border border-slate-700 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-white">{driver.nombre}</p>
                                <p className="text-xs text-slate-400">RUT: <span className="font-mono text-amber-400">{driver.rut}</span></p>
                              </div>
                              {driver.is_active && (
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
