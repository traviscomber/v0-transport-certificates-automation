'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ReportFiltersProps {
  filters: {
    type: string
    status: string
    documentStatus: string
    searchTerm: string
  }
  onFiltersChange: (filters: any) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
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
      searchTerm: ''
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
