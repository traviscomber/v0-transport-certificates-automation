'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { allDriversData } from '@/lib/data/all-drivers'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

interface ReportFiltersProps {
  filters: {
    type: string
    status: string
    documentStatus: string
    searchTerm: string
    entityId?: string
  }
  onFiltersChange: (filters: any) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [selectedEntities, setSelectedEntities] = useState<any[]>([])

  // Update selected entities when type changes
  useEffect(() => {
    if (localFilters.type === 'conductores') {
      setSelectedEntities(allDriversData || [])
    } else if (localFilters.type === 'subcontratistas') {
      setSelectedEntities(allSubcontractorsData || [])
    } else {
      setSelectedEntities([])
    }
  }, [localFilters.type])

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    if (key === 'type') {
      newFilters.entityId = '' // Reset entity selection when changing type
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = (term: string) => {
    const newFilters = { ...localFilters, searchTerm: term }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      type: 'all',
      status: 'all',
      documentStatus: 'all',
      searchTerm: '',
      entityId: ''
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="text-sm font-medium mb-2 block">Buscar por RUT o Nombre</label>
        <Input
          placeholder="Ej: 12345678-9 o Juan García"
          value={localFilters.searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Tipo</label>
        <Select value={localFilters.type} onValueChange={(v) => handleChange('type', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="conductores">Conductores</SelectItem>
            <SelectItem value="subcontratistas">Subcontratistas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Selection - Conductor/Subcontratista Individual */}
      {(localFilters.type === 'conductores' || localFilters.type === 'subcontratistas') && selectedEntities.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Seleccionar {localFilters.type === 'conductores' ? 'Conductor' : 'Subcontratista'} (Opcional)
          </label>
          <Select value={localFilters.entityId || ''} onValueChange={(v) => handleChange('entityId', v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Ver todos los ${localFilters.type === 'conductores' ? 'conductores' : 'subcontratistas'}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ver Todos</SelectItem>
              {selectedEntities.slice(0, 50).map((entity) => (
                <SelectItem key={entity.id || entity.rut} value={entity.id || entity.rut}>
                  {localFilters.type === 'conductores' 
                    ? `${entity.nombres} (${entity.rut})`
                    : `${entity.razon_social || entity.nombre} (${entity.rut})`
                  }
                </SelectItem>
              ))}
              {selectedEntities.length > 50 && (
                <SelectItem value="" disabled>
                  ... y {selectedEntities.length - 50} más
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Mostrando 50 de {selectedEntities.length} disponibles
          </p>
        </div>
      )}

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Estado</label>
        <Select value={localFilters.status} onValueChange={(v) => handleChange('status', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Document Status Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Estado de Documentación</label>
        <Select value={localFilters.documentStatus} onValueChange={(v) => handleChange('documentStatus', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="con-documentos">Con Documentos</SelectItem>
            <SelectItem value="sin-documentos">Sin Documentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button variant="outline" className="w-full" onClick={handleReset}>
        Limpiar Filtros
      </Button>
    </div>
  )
}
