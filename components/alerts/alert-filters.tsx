'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface AlertFiltersProps {
  selectedType: string
  selectedStatus: string
  searchQuery: string
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function AlertFilters({
  selectedType,
  selectedStatus,
  searchQuery,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onReset,
}: AlertFiltersProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo de alerta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            <SelectItem value="warning">Advertencias</SelectItem>
            <SelectItem value="error">Errores</SelectItem>
            <SelectItem value="success">Éxitos</SelectItem>
            <SelectItem value="info">Información</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="unread">No leído</SelectItem>
            <SelectItem value="read">Leído</SelectItem>
          </SelectContent>
        </Select>

        {(selectedType || selectedStatus || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
