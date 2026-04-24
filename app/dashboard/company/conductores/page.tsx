'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { DriversList } from '@/components/drivers-list'
import { HelpBox } from '@/components/ui/help-box'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ConductoresPage() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/company/data',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No deduplication
      focusThrottleInterval: 0, // Refetch on focus without throttling
      refreshInterval: 0 // No automatic polling
    }
  )

  const drivers = data?.drivers || []

  // Listen for document status changes and refetch
  useEffect(() => {
    const handleStatusChange = () => {
      console.log('[v0] Document status changed, refetching drivers list...')
      mutate() // Refetch drivers
    }

    // Listen for custom event when status changes
    window.addEventListener('documentStatusChanged', handleStatusChange)
    return () => window.removeEventListener('documentStatusChanged', handleStatusChange)
  }, [mutate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Conductores</h1>
        <p className="text-muted-foreground">
          Administra y visualiza los conductores de LABBE ({drivers.length} total)
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Conductores"
        description="Accede a la información de los conductores operacionales. Puedes buscar, editar y gestionar datos de conductores y sus vehículos."
        tips={[
          "Busca conductores por nombre, RUT o proveedor",
          "Filtra por proveedor para ver conductores asociados",
          "Cada conductor tiene información de vehículos (patentes)",
          "Mantén actualizada la información de contacto de los conductores",
        ]}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando conductores...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error cargando conductores</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay conductores disponibles</p>
        </div>
      ) : (
        <DriversList drivers={drivers} />
      )}
    </div>
  )
}
