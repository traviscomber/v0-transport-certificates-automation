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
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, type DateFilterValue } from '@/lib/date-filters'

interface DocumentFilterProps {
  onFilterChange: (filters: DocumentFilters) => void
  executives?: Array<{ id: string; nombre: string }>
  companies?: Array<{ id: string; nombre: string; rut: string }>
  documentTypes?: Array<{ value: string; label: string }>
}

export interface DocumentFilters {
  searchQuery: string
  executiveId?: string
  companyId?: string
  documentType?: string
  month: string
  year: string
}

export function DocumentFilter({
  onFilterChange,
  executives = [],
  companies = [],
  documentTypes = [],
}: DocumentFilterProps) {
  const [filters, setFilters] = useState<DocumentFilters>({
    searchQuery: '',
    month: ALL_VALUE,
    year: ALL_VALUE,
  })

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleReset = () => {
    const resetFilters: DocumentFilters = {
      searchQuery: '',
      month: ALL_VALUE,
      year: ALL_VALUE,
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const temporalFilters: DateFilterValue = {
    month: filters.month,
    year: filters.year,
  }

  const hasActiveFilters =
    filters.searchQuery ||
    filters.executiveId ||
    filters.companyId ||
    filters.documentType ||
    filters.month !== ALL_VALUE ||
    filters.year !== ALL_VALUE

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtrar Documentos</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre, RUT..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              className="pl-8 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {companies.length > 0 && (
            <Select
              value={filters.companyId || 'all'}
              onValueChange={(value) => handleFilterChange({ companyId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nombre} ({company.rut})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {executives.length > 0 && (
            <Select
              value={filters.executiveId || 'all'}
              onValueChange={(value) => handleFilterChange({ executiveId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue placeholder="Ejecutiva" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todas las ejecutivas</SelectItem>
                {executives.map((exec) => (
                  <SelectItem key={exec.id} value={exec.id}>
                    {exec.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.documentType || 'all'}
            onValueChange={(value) => handleFilterChange({ documentType: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">Todos los tipos</SelectItem>
              {documentTypes.length > 0 ? (
                documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="license">Licencia</SelectItem>
                  <SelectItem value="insurance">Seguro</SelectItem>
                  <SelectItem value="id">Identificacion</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <DatePeriodFilter
          value={temporalFilters}
          onChange={(value) => handleFilterChange(value)}
          onClear={() => handleFilterChange({ month: ALL_VALUE, year: ALL_VALUE })}
        />

        {hasActiveFilters && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 w-full"
          >
            <X className="w-4 h-4" />
            Limpiar todos los filtros
          </Button>
        )}
      </div>
    </div>
  )
}
