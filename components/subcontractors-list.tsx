'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, MapPin, Phone, Mail, CheckCircle, AlertCircle, X, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

interface Subcontractor {
  id: string
  nombre: string
  nombre_fantasia?: string
  rut: string
  region: string
  ejecutiva: string
  comuna: string
  representante: string
  telefono: string
  email: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
}

interface SubcontractorsListProps {
  subcontractors?: Subcontractor[]
}

export function SubcontractorsList({ subcontractors: initialSubcontractors }: SubcontractorsListProps) {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors || allSubcontractorsData)
  const [isLoading, setIsLoading] = useState(!initialSubcontractors)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedEjecutivas, setSelectedEjecutivas] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Fetch data from API if not provided as prop
  useEffect(() => {
    if (initialSubcontractors) {
      return // Use provided data
    }

    const fetchData = async () => {
      try {
        console.log('[v0] Fetching subcontractors from API...')
        const response = await fetch('/api/dashboard/data')
        const data = await response.json()
        
        if (response.ok && data.dashboard?.transportistas) {
          console.log('[v0] Fetched subcontractors:', data.dashboard.transportistas.length)
          setSubcontractors(data.dashboard.transportistas)
          
          // Get user name from cookie and pre-select their ejecutiva filter
          const userNameCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('user_name='))
            ?.split('=')[1]
          
          if (userNameCookie) {
            const decodedName = decodeURIComponent(userNameCookie)
            console.log('[v0] Pre-selecting ejecutiva filter for:', decodedName)
            setSelectedEjecutivas([decodedName])
          }
        } else {
          console.error('[v0] Failed to fetch:', data.error)
          // Fall back to local data
          setSubcontractors(allSubcontractorsData)
        }
      } catch (error) {
        console.error('[v0] Error fetching subcontractors:', error)
        // Fall back to local data
        setSubcontractors(allSubcontractorsData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initialSubcontractors])

  // Get unique values for filters
  const regions = useMemo(() => Array.from(new Set(subcontractors.map(s => s.region))).sort(), [subcontractors])
  const ejecutivas = useMemo(() => Array.from(new Set(subcontractors.map(s => s.ejecutiva))).sort(), [subcontractors])
  const certifications = { ariztia: 'Ariztia', lts: 'LTS', rendic: 'Rendic', interpolar: 'Interpolar' }

  // Smart search and filtering
  const filtered = useMemo(() => {
    return subcontractors.filter(sub => {
      // Search term filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
          sub.nombre.toLowerCase().includes(query) ||
          sub.nombre_fantasia?.toLowerCase().includes(query) ||
          sub.rut.includes(query) ||
          sub.representante.toLowerCase().includes(query) ||
          sub.ejecutiva.toLowerCase().includes(query) ||
          sub.comuna.toLowerCase().includes(query) ||
          sub.telefono.includes(query) ||
          sub.email.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(sub.region)) {
        return false
      }

      // Ejecutiva filter
      if (selectedEjecutivas.length > 0 && !selectedEjecutivas.includes(sub.ejecutiva)) {
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
  }, [searchTerm, selectedRegions, selectedEjecutivas, selectedCertifications, showActiveOnly, subcontractors])

  // Toggle filter functions
  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

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
    setSelectedRegions([])
    setSelectedEjecutivas([])
    setSelectedCertifications([])
    setShowActiveOnly(false)
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = searchTerm.length > 0 || selectedRegions.length > 0 || selectedEjecutivas.length > 0 || selectedCertifications.length > 0 || showActiveOnly

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
              {selectedRegions.length + selectedCertifications.length + (showActiveOnly ? 1 : 0)}
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
          {/* Regions Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">Regiones ({selectedRegions.length})</label>
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedRegions.includes(region)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

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
          filtered.map(sub => (
            <Card key={sub.id} className="hover:border-slate-500 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">{sub.nombre}</h3>
                      {sub.nombre_fantasia && (
                        <p className="text-sm text-slate-400 italic">{sub.nombre_fantasia}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">RUT</p>
                      <p className="font-mono text-sm text-amber-400">{sub.rut}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">REGIÓN</p>
                      <p className="text-sm text-white">{sub.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">REPRESENTANTE</p>
                      <p className="text-sm text-white">{sub.representante}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">EJECUTIVA</p>
                      <p className="text-sm text-white">{sub.ejecutiva}</p>
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
                    {sub.email && (
                      <a href={`mailto:${sub.email}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <Mail className="w-4 h-4" />
                        {sub.email}
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
