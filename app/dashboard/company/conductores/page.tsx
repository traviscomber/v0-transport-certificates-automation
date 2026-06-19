'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DriversList } from '@/components/drivers-list'
import { HelpBox } from '@/components/ui/help-box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddConductorModal } from '@/components/add-conductor-modal'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, type DateFilterValue } from '@/lib/date-filters'

const fetcher = (url: string) => 
  fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  })
    .then(async (r) => {
      if (!r.ok) {
        const errorText = await r.text()
        throw new Error(`API error ${r.status}: ${errorText}`)
      }
      const text = await r.text()
      if (!text) {
        throw new Error('Empty response from API')
      }
      try {
        return JSON.parse(text)
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }
    })
    .catch((err) => {
      console.error('[v0] Fetch error:', err)
      throw err
    })

export default function ConductoresPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const rutParam = searchParams.get('rut')
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string | null>(null)
  const [highlightedRut, setHighlightedRut] = useState<string | null>(rutParam)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [dateFilters, setDateFilters] = useState<DateFilterValue>({
    month: searchParams.get('month') || ALL_VALUE,
    year: searchParams.get('year') || ALL_VALUE,
  })
  
  const { data, error, isLoading, mutate } = useSWR(
    '/api/dashboard/data',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      focusThrottleInterval: 0,
      refreshInterval: 0
    }
  )

  const drivers = data?.dashboard?.conductores || []
  const transportistas = data?.subcontractors || []

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
  
  // Get unique ejecutivas from drivers
  const ejecutivas = Array.from(
    new Set(drivers.map((d: any) => d.ejecutivo_nombre).filter(Boolean))
  ).sort() as string[]

  const driversByDate = useMemo(() => {
    return filterByMonthYear(
      drivers,
      (d: any) => d.updated_at || d.created_at,
      dateFilters.month,
      dateFilters.year
    )
  }, [drivers, dateFilters.month, dateFilters.year])

  // Filter drivers by selected ejecutiva
  const filteredDrivers = selectedEjecutiva
    ? driversByDate.filter((d: any) => d.ejecutivo_nombre === selectedEjecutiva)
    : driversByDate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Conductores</h1>
          <p className="text-muted-foreground">
            Administra y visualiza los conductores de LABBE ({drivers.length} total)
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Conductor
        </Button>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Conductores"
        description="Accede a la información de los conductores operacionales. Puedes buscar, editar y gestionar datos de conductores y sus vehículos."
        tips={[
          "Busca conductores por nombre, RUT o proveedor",
          "Filtra por ejecutiva para ver conductores asignados",
          "Cada conductor tiene información de vehículos (patentes)",
          "Mantén actualizada la información de contacto de los conductores",
        ]}
      />

      <DatePeriodFilter
        value={dateFilters}
        onChange={updateDateFilters}
        onClear={() => updateDateFilters({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      {/* Ejecutiva Filter Tags */}
      {ejecutivas.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">Filtrar por Ejecutiva</div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedEjecutiva === null ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80 transition"
              onClick={() => setSelectedEjecutiva(null)}
            >
              Todos ({driversByDate.length})
            </Badge>
            {ejecutivas.map((ejecutiva) => {
              const count = driversByDate.filter((d: any) => d.ejecutivo_nombre === ejecutiva).length
              return (
                <Badge
                  key={ejecutiva}
                  variant={selectedEjecutiva === ejecutiva ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition"
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
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando conductores...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error cargando conductores</p>
          <p className="text-red-400 text-sm mt-2">{error?.message || 'Error desconocido'}</p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {selectedEjecutiva 
              ? `No hay conductores para ${selectedEjecutiva}`
              : 'No hay conductores disponibles'}
          </p>
        </div>
      ) : (
        <DriversList drivers={filteredDrivers} highlightedRut={highlightedRut} />
      )}

      <AddConductorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          mutate() // Refresh the data
        }}
        currentEjecutiva={selectedEjecutiva || undefined}
      />
    </div>
  )
}
