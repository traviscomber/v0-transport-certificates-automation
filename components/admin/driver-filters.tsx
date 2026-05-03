'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, ChevronDown } from 'lucide-react'

interface DriverFiltersProps {
  onFiltersChange?: (filters: DriverFilters) => void
  companies?: Array<{ id: string; razon_social: string; rut: string }>
  vehicleTypes?: string[]
}

export interface DriverFilters {
  searchQuery: string
  companyId?: string
  providerRut?: string
  vehicleType?: string
  licenseStatus?: 'active' | 'expiring' | 'expired' | 'all'
}

export function DriverFilters({
  onFiltersChange,
  companies = [],
  vehicleTypes = ['TRACTO', 'TAXI', 'BUS', 'VAN', 'CAMION'],
}: DriverFiltersProps) {
  const [filters, setFilters] = useState<DriverFilters>({
    searchQuery: '',
    licenseStatus: 'all',
  })
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof DriverFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: DriverFilters = {
      searchQuery: '',
      licenseStatus: 'all',
    }
    setFilters(emptyFilters)
    onFiltersChange?.(emptyFilters)
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && value !== ''
  ).length

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por RUT o nombre del conductor..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Toggle */}
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
              Filtros avanzados {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {isOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Company Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Empresa / Transportista
                </label>
                <select
                  value={filters.companyId || ''}
                  onChange={(e) => handleFilterChange('companyId', e.target.value || undefined)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.razon_social}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider RUT Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  RUT Proveedor
                </label>
                <Input
                  type="text"
                  placeholder="Ej: 12345678-9"
                  value={filters.providerRut || ''}
                  onChange={(e) => handleFilterChange('providerRut', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>

              {/* Vehicle Type Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Tipo de Vehículo
                </label>
                <select
                  value={filters.vehicleType || ''}
                  onChange={(e) => handleFilterChange('vehicleType', e.target.value || undefined)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos los tipos</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* License Status Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Estado de Licencia
                </label>
                <select
                  value={filters.licenseStatus}
                  onChange={(e) =>
                    handleFilterChange('licenseStatus', e.target.value as any)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activa</option>
                  <option value="expiring">Por vencer</option>
                  <option value="expired">Vencida</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end pt-2 border-t">
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
