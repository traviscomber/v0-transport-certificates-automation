'use client'

import { useEffect, useState } from 'react'
import { DriversList } from '@/components/drivers-list'
import { HelpBox } from '@/components/ui/help-box'

export default function ConductoresPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch drivers from API
    fetch('/api/company/data')
      .then((res) => res.json())
      .then((data) => {
        console.log('[v0] Fetched drivers:', data.drivers?.length || 0)
        setDrivers(data.drivers || [])
      })
      .catch((err) => {
        console.error('[v0] Error fetching drivers:', err)
        setDrivers([])
      })
      .finally(() => setLoading(false))
  }, [])

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

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando conductores...</p>
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
