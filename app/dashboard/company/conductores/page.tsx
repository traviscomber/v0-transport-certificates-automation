'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DriversList } from '@/components/drivers-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddConductorModal } from '@/components/add-conductor-modal'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

const fetcher = (url: string) =>
  fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error ${response.status}: ${errorText}`)
      }
      const text = await response.text()
      if (!text) throw new Error('Empty response from API')
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }
    })
    .catch((error) => {
      console.error('[v0] Fetch error:', error)
      throw error
    })

export default function ConductoresPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const rutParam = searchParams.get('rut')
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string | null>(null)
  const [highlightedRut] = useState<string | null>(rutParam)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [dateFilters, setDateFilters] = useState<DateFilterValue>({
    month: searchParams.get('month') || ALL_VALUE,
    year: searchParams.get('year') || ALL_VALUE,
  })

  const { data, error, isLoading, mutate } = useSWR('/api/dashboard/data', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    refreshInterval: 0,
  })

  const drivers = data?.dashboard?.conductores || []

  useEffect(() => {
    setDateFilters({
      month: searchParams.get('month') || ALL_VALUE,
      year: searchParams.get('year') || ALL_VALUE,
    })
  }, [searchParams])

  const updateDateFilters = (next: DateFilterValue) => {
    setDateFilters(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next.month === ALL_VALUE) params.delete('month')
    else params.set('month', next.month)
    if (next.year === ALL_VALUE) params.delete('year')
    else params.set('year', next.year)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const ejecutivas = Array.from(new Set(drivers.map((driver: any) => driver.ejecutivo_nombre).filter(Boolean))).sort() as string[]

  const driversByDate = useMemo(() => {
    return filterByMonthYear(
      drivers,
      (driver: any) => driver.updated_at || driver.created_at,
      dateFilters.month,
      dateFilters.year,
    )
  }, [drivers, dateFilters.month, dateFilters.year])

  const filteredDrivers = selectedEjecutiva
    ? driversByDate.filter((driver: any) => driver.ejecutivo_nombre === selectedEjecutiva)
    : driversByDate

  const periodLabel = getMonthLabel(dateFilters.month, dateFilters.year)
  const activeDrivers = filteredDrivers.filter((driver: any) => driver.is_active !== false).length
  const inactiveDrivers = filteredDrivers.length - activeDrivers

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
            Gestión operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
            Conductores
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Revisa conductores activos, asignaciones y documentación dentro del mismo flujo operacional de Transportes Labbé.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 gap-2 bg-[var(--cf-accent)] px-4 text-sm text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]"
        >
          <Plus className="h-4 w-4" />
          Agregar conductor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Período" value={periodLabel} description="Filtro activo" />
        <Metric label="Conductores" value={filteredDrivers.length.toLocaleString('es-CL')} description="En la vista actual" />
        <Metric label="Activos" value={activeDrivers.toLocaleString('es-CL')} description="Disponibles en el filtro" tone="success" />
        <Metric label="Inactivos" value={inactiveDrivers.toLocaleString('es-CL')} description="Requieren revisión de estado" tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DatePeriodFilter
          value={dateFilters}
          onChange={updateDateFilters}
          onClear={() => updateDateFilters({ month: ALL_VALUE, year: ALL_VALUE })}
        />

        <div className="text-sm text-[var(--cf-text-muted)] lg:text-right">
          Ejecutiva: <span className="font-medium text-[var(--cf-text-secondary)]">{selectedEjecutiva || 'Todas'}</span>
        </div>
      </div>

      {ejecutivas.length > 0 && (
        <div className="space-y-3 border-y border-[var(--cf-border)] py-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Filtrar por ejecutiva</p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={`cursor-pointer rounded-[4px] border-[var(--cf-border)] px-3 py-1.5 text-xs transition-colors ${
                selectedEjecutiva === null
                  ? 'bg-[var(--cf-accent)] text-[var(--cf-text)]'
                  : 'bg-transparent text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)]'
              }`}
              onClick={() => setSelectedEjecutiva(null)}
            >
              Todos ({driversByDate.length})
            </Badge>
            {ejecutivas.map((ejecutiva) => {
              const count = driversByDate.filter((driver: any) => driver.ejecutivo_nombre === ejecutiva).length
              const selected = selectedEjecutiva === ejecutiva
              return (
                <Badge
                  key={ejecutiva}
                  variant="outline"
                  className={`cursor-pointer rounded-[4px] border-[var(--cf-border)] px-3 py-1.5 text-xs transition-colors ${
                    selected
                      ? 'bg-[var(--cf-accent)] text-[var(--cf-text)]'
                      : 'bg-transparent text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)]'
                  }`}
                  onClick={() => setSelectedEjecutiva(ejecutiva)}
                >
                  {ejecutiva} ({count})
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <StatePanel>Cargando conductores…</StatePanel>
      ) : error ? (
        <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-5 py-6 text-sm text-[var(--cf-text-secondary)]">
          <p className="font-medium text-[#E17B8C]">No fue posible cargar los conductores.</p>
          <p className="mt-2 text-xs text-[var(--cf-text-muted)]">{error?.message || 'Error desconocido'}</p>
          <Button
            variant="outline"
            onClick={() => mutate()}
            className="mt-4 h-9 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)]"
          >
            Reintentar
          </Button>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <StatePanel>
          {selectedEjecutiva ? `No hay conductores para ${selectedEjecutiva}.` : 'No hay conductores disponibles para este filtro.'}
        </StatePanel>
      ) : (
        <DriversList drivers={filteredDrivers} highlightedRut={highlightedRut} />
      )}

      <AddConductorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => mutate()}
        currentEjecutiva={selectedEjecutiva || undefined}
      />
    </div>
  )
}

function Metric({
  label,
  value,
  description,
  tone,
}: {
  label: string
  value: string
  description: string
  tone?: 'success' | 'warning'
}) {
  const indicator = tone === 'success' ? 'bg-[#67C18D]' : tone === 'warning' ? 'bg-[#E6A35A]' : 'bg-[var(--cf-text-muted)]'

  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${indicator}`} />
        <p className="text-xs font-medium text-[var(--cf-text-muted)]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{description}</p>
    </div>
  )
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">
      {children}
    </div>
  )
}
