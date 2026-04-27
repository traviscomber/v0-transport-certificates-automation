'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { DriversList } from '@/components/drivers-list'
import { HelpBox } from '@/components/ui/help-box'

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
          <p className="text-red-400 text-sm mt-2">{error?.message || 'Error desconocido'}</p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
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
