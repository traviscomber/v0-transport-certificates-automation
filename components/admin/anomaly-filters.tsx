'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface AnomalyFiltersProps {
  onFilterChange: (filters: AnomalyFilterState) => void
  loading?: boolean
}

export interface AnomalyFilterState {
  severity?: string
  actionTaken?: string
  page?: number
}

export function AnomalyFilters({ onFilterChange, loading }: AnomalyFiltersProps) {
  const [severity, setSeverity] = useState<string>('all')
  const [actionTaken, setActionTaken] = useState<string>('all')
  const [hasFilters, setHasFilters] = useState(false)

  const handleSeverityChange = (value: string) => {
    setSeverity(value)
    updateFilters({ severity: value !== 'all' ? value : undefined, actionTaken: actionTaken !== 'all' ? actionTaken : undefined })
  }

  const handleActionChange = (value: string) => {
    setActionTaken(value)
    updateFilters({ severity: severity !== 'all' ? severity : undefined, actionTaken: value !== 'all' ? value : undefined })
  }

  const updateFilters = (newFilters: AnomalyFilterState) => {
    const hasActive = newFilters.severity || newFilters.actionTaken
    setHasFilters(!!hasActive)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setSeverity('all')
    setActionTaken('all')
    setHasFilters(false)
    onFilterChange({})
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="font-semibold">Filtros</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Severidad</label>
          <Select value={severity} onValueChange={handleSeverityChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las severidades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select value={actionTaken} onValueChange={handleActionChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="investigated">Investigados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={loading}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
