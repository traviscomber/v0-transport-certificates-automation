'use client'

import { useEffect, useState } from 'react'
import { SubcontractorsList } from '@/components/subcontractors-list'
import { HelpBox } from '@/components/ui/help-box'
import { Card } from '@/components/ui/card'

interface Subcontractor {
  id?: string
  nombre: string
  nombre_fantasia?: string
  rut: string
  region: string
  ejecutiva: string
  comuna: string
  representante: string
  telefono: string
  email: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
}

interface Driver {
  id: string
  rut: string
  nombre: string
  rut_proveedor: string
  proveedor: string
  is_active: boolean
}

export default function SubcontratistasPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/data')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        if (data.subcontractors) {
          setSubcontractors(data.subcontractors)
        }
        if (data.drivers) {
          setDrivers(data.drivers)
        }
      } catch (error) {
        console.error('[v0] Error fetching subcontractors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Subcontratistas</h1>
          <p className="text-muted-foreground">
            Administra y visualiza los subcontratistas asociados a LABBE
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cargando datos...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Subcontratistas</h1>
        <p className="text-muted-foreground">
          Administra y visualiza los subcontratistas asociados a LABBE
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Subcontratistas"
        description="Accede a la información detallada de los subcontratistas. Puedes buscar por nombre, RUT, ejecutiva asignada, región o comuna."
        tips={[
          "Filtra por ejecutiva para ver los subcontratistas asignados a cada una",
          "Busca por región para gestionar operaciones geográficas",
          "Usa la búsqueda por RUT para encontrar rápidamente un subcontratista",
          "Los subcontratistas cuentan con información de contacto y direcciones",
        ]}
      />

      <SubcontractorsList subcontractors={subcontractors as any} drivers={drivers as any} />
    </div>
  )
}
