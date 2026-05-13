'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DocumentFilterProps {
  onFilterChange: (filters: DocumentFilters) => void
  executives?: Array<{ id: string; nombre: string }>
  companies?: Array<{ id: string; nombre: string; rut: string }>
}

export interface DocumentFilters {
  searchQuery: string
  executiveId?: string
  companyId?: string
  documentType?: string
  dateFrom?: string
  dateTo?: string
}

export function DocumentFilter({ onFilterChange, executives = [], companies = [] }: DocumentFilterProps) {
  const [filters, setFilters] = useState<DocumentFilters>({
    searchQuery: '',
  })

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleReset = () => {
    const resetFilters: DocumentFilters = { searchQuery: '' }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Title and Reset */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtrar Documentos</h3>
          </div>
          {(filters.searchQuery || filters.executiveId || filters.companyId || filters.documentType) && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre, RUT..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              className="pl-8 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Company/Transportista */}
          {companies.length > 0 && (
            <Select value={filters.companyId || ''} onValueChange={(value) => handleFilterChange({ companyId: value || undefined })}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nombre} ({company.rut})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Executive */}
          {executives.length > 0 && (
            <Select value={filters.executiveId || ''} onValueChange={(value) => handleFilterChange({ executiveId: value || undefined })}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue placeholder="Ejecutiva" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="">Todas las ejecutivas</SelectItem>
                {executives.map((exec) => (
                  <SelectItem key={exec.id} value={exec.id}>
                    {exec.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Document Type */}
          <Select value={filters.documentType || ''} onValueChange={(value) => handleFilterChange({ documentType: value || undefined })}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="license">Licencia</SelectItem>
              <SelectItem value="insurance">Seguro</SelectItem>
              <SelectItem value="id">Identificación</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
