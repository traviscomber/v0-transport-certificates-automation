'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X, RotateCcw } from 'lucide-react'

export interface FilterState {
  month?: string
  year?: string
  status?: string
  documentType?: string
  executive?: string
  company?: string
  searchQuery?: string
  dateRange?: {
    start: Date
    end: Date
  }
  customFilters?: Record<string, string | string[]>
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void
  months?: { value: string; label: string }[]
  years?: { value: string; label: string }[]
  statuses?: { value: string; label: string }[]
  documentTypes?: { value: string; label: string }[]
  executives?: { value: string; label: string }[]
  companies?: { value: string; label: string }[]
  initialFilters?: FilterState
  showSearch?: boolean
  compact?: boolean
}

export function AdvancedFilters({
  onFilterChange,
  months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: new Date(2024, i).toLocaleString('es-ES', { month: 'long' }),
  })),
  years = [
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ],
  statuses = [
    { value: 'approved', label: 'Aprobado' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'rejected', label: 'Rechazado' },
  ],
  documentTypes = [
    { value: 'license', label: 'Licencia' },
    { value: 'certificate', label: 'Certificado' },
    { value: 'insurance', label: 'Seguros' },
  ],
  executives = [],
  companies = [],
  initialFilters = {},
  showSearch = true,
  compact = false,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(!compact)

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: any) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFilterChange(newFilters)
    },
    [filters, onFilterChange]
  )

  const handleReset = () => {
    setFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  if (!isExpanded && compact) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtros {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
      </Button>
    )
  }

  return (
    <Card className="border-slate-700 bg-slate-800/30">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold text-slate-100">Filtros Avanzados</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} activo{activeFilterCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {compact && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Mes */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Mes</label>
              <Select value={filters.month || ''} onValueChange={(v) => handleFilterChange('month', v)}>
                <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Todos los meses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">Todos los meses</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Año */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Año</label>
              <Select value={filters.year || ''} onValueChange={(v) => handleFilterChange('year', v)}>
                <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Todos los años" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">Todos los años</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Estado</label>
              <Select value={filters.status || ''} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">Todos los estados</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Tipo de Documento</label>
              <Select
                value={filters.documentType || ''}
                onValueChange={(v) => handleFilterChange('documentType', v)}
              >
                <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {documentTypes.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ejecutiva */}
            {executives.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Ejecutiva</label>
                <Select
                  value={filters.executive || ''}
                  onValueChange={(v) => handleFilterChange('executive', v)}
                >
                  <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Todas las ejecutivas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">Todas las ejecutivas</SelectItem>
                    {executives.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Empresa */}
            {companies.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Empresa</label>
                <Select
                  value={filters.company || ''}
                  onValueChange={(v) => handleFilterChange('company', v)}
                >
                  <SelectTrigger className="h-9 bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Todas las empresas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">Todas las empresas</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Search bar */}
          {showSearch && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Búsqueda</label>
              <input
                type="text"
                placeholder="Buscar por nombre, ID, descripción..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Active filters badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-slate-900/50 rounded border border-slate-700">
              {filters.month && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-slate-600"
                  onClick={() => handleFilterChange('month', undefined)}
                >
                  Mes: {months.find((m) => m.value === filters.month)?.label}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {filters.year && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-slate-600"
                  onClick={() => handleFilterChange('year', undefined)}
                >
                  Año: {filters.year}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {filters.status && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-slate-600"
                  onClick={() => handleFilterChange('status', undefined)}
                >
                  Estado: {statuses.find((s) => s.value === filters.status)?.label}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {filters.searchQuery && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-slate-600"
                  onClick={() => handleFilterChange('searchQuery', undefined)}
                >
                  Búsqueda: {filters.searchQuery}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full gap-2 h-9"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar todos los filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
