/**
 * GESTIÓN DE SUBCONTRATISTAS
 * 
 * Panel para visualizar y gestionar todos los subcontratistas/proveedores de transporte.
 * Aquí puedes:
 * - Buscar subcontratistas por nombre, RUT, región o contacto
 * - Filtrar por regiones geográficas
 * - Ver certificaciones y cumplimiento
 * - Identificar subcontratistas activos/inactivos
 * - Acceder a información de contacto
 * 
 * ¿Qué es un Subcontratista? Es una empresa o persona que proporciona servicios
 * de transporte para tu operación. Cada uno tiene documentos, certificaciones y
 * estado de cumplimiento que monitorear.
 */

'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Phone, Mail, CheckCircle, AlertCircle, X, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Subcontractor {
  id?: string
  rut: string
  nombre: string
  nombre_fantasia?: string
  representante: string
  ejecutiva: string
  region: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  email: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
}

interface SubcontractorsListProps {
  subcontractors: Subcontractor[]
}

export function SubcontractorsList({ subcontractors }: SubcontractorsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedEjecutivas, setSelectedEjecutivas] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

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
  }

  const hasActiveFilters = searchTerm.length > 0 || selectedRegions.length > 0 || selectedEjecutivas.length > 0 || selectedCertifications.length > 0 || showActiveOnly;

  return (
    <div className="space-y-4">
      {/* Header Educativo */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Subcontratistas</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Visualiza, busca y filtra todos tus proveedores de transporte. Monitorea su cumplimiento normativo y certificaciones. Mantén contacto directo con representantes y ejecutivas.
        </p>
      </div>

      {/* Información Rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-foreground">{subcontractors.length}</div>
            <p className="text-xs text-muted-foreground">Total de Subcontratistas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-400">{subcontractors.filter(s => s.is_active).length}</div>
            <p className="text-xs text-green-300">Activos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-foreground">{Array.from(new Set(subcontractors.map(s => s.region))).length}</div>
            <p className="text-xs text-muted-foreground">Regiones</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">Resultados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, RUT, ejecutiva, comuna, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
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

      {/* Advanced Filters con Tooltips */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          {/* Ejecutivas Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300">Ejecutivas ({selectedEjecutivas.length})</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ejecutivas.map(ejecutiva => (
                <button
                  key={ejecutiva}
                  onClick={() => toggleEjecutiva(ejecutiva)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedEjecutivas.includes(ejecutiva)
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ejecutiva}
                </button>
              ))}
            </div>
          </div>

          {/* Regions Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300">Regiones ({selectedRegions.length})</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedRegions.includes(region)
                      ? 'bg-orange-500 text-white'
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
            <label className="text-sm font-semibold text-slate-300">Certificaciones ({selectedCertifications.length})</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(certifications).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleCertification(key)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCertifications.includes(key)
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status Filter */}
          <div>
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                showActiveOnly
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {showActiveOnly ? 'Solo Activos' : 'Mostrar Todos'}
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mostrando <span className="font-semibold text-orange-400">{filtered.length}</span> de <span className="font-semibold">{subcontractors.length}</span> subcontratistas
          {hasActiveFilters && <span className="ml-2 text-slate-500">(filtrado)</span>}
        </div>
      </div>

      {/* Subcontractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => (
          <Card key={sub.id || sub.rut} className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-white truncate">{sub.nombre_fantasia || sub.nombre}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">{sub.rut}</p>
                </div>
                {sub.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Representante */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Representante</p>
                <p className="text-sm text-slate-200">{sub.representante}</p>
              </div>

              {/* Ejecutiva */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ejecutiva Asignada</p>
                <p className="text-sm text-orange-400 font-medium">{sub.ejecutiva}</p>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">{sub.comuna}</p>
                  <p className="text-xs text-slate-400">{sub.region}</p>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-1.5">
                {sub.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <a href={`tel:${sub.telefono}`} className="text-slate-300 hover:text-orange-400 truncate">
                      {sub.telefono}
                    </a>
                  </div>
                )}
                {sub.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <a href={`mailto:${sub.email}`} className="text-slate-300 hover:text-orange-400 truncate">
                      {sub.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Certificaciones */}
              {(sub.ariztia || sub.lts || sub.rendic || sub.interpolar) && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                  {sub.ariztia && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.ariztia}</Badge>}
                  {sub.lts && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.lts}</Badge>}
                  {sub.rendic && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.rendic}</Badge>}
                  {sub.interpolar && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.interpolar}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No se encontraron subcontratistas que coincidan con tu búsqueda</p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
