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
    // NO default month filter - show all documents by default
    dateFrom: undefined,
    dateTo: undefined,
  })

  // Generate list of months for the last 12 months
  const getMonthOptions = () => {
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const monthName = date.toLocaleString('es-CL', { month: 'long', year: 'numeric' })
      months.push({
        value: `${year}-${month}`,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      })
    }
    return months
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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

          {/* Month Filter */}
          <Select value={filters.dateFrom ? `${filters.dateFrom.substring(0, 7)}` : ''} onValueChange={(value) => {
            if (value === '') {
              handleFilterChange({ dateFrom: undefined, dateTo: undefined })
            } else {
              // Parse YYYY-MM format and set dateFrom and dateTo for the entire month
              const [year, month] = value.split('-')
              const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1)
              const nextMonth = new Date(monthDate)
              nextMonth.setMonth(nextMonth.getMonth() + 1)
              
              const dateFrom = monthDate.toISOString().split('T')[0]
              const dateTo = new Date(nextMonth.getTime() - 1).toISOString().split('T')[0]
              
              handleFilterChange({ dateFrom, dateTo })
            }
          }}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="">Todos los meses</SelectItem>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Company/Transportista */}
          {companies.length > 0 && (
            <Select value={filters.companyId || ''} onValueChange={(value) => handleFilterChange({ companyId: value === '' ? undefined : value })}>
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
            <Select value={filters.executiveId || ''} onValueChange={(value) => handleFilterChange({ executiveId: value === '' ? undefined : value })}>
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
          <Select value={filters.documentType || ''} onValueChange={(value) => handleFilterChange({ documentType: value === '' ? undefined : value })}>
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
