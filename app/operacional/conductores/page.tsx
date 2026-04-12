'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { DriversList } from '@/components/drivers-list'
import { useState, useEffect } from 'react'

interface Driver {
  id: string
  rut: string
  nombre: string
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string
  rut_proveedor?: string
  proveedor?: string
  patente_tracto?: string
  clase_licencia?: string
  is_active?: boolean
}

export default function ConductoresPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/data')
        const data = await response.json()
        setDrivers(data.drivers || [])
      } catch (error) {
        console.error('[v0] Error fetching drivers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
          <p className="text-gray-600 mt-1">Gestión de todos los conductores ({drivers.length})</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando datos...</p>
        ) : (
          <DriversList drivers={drivers as any} />
        )}
      </div>
    </DocuFleetLayout>
  )
}
