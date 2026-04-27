'use client'

import { useEffect, useState } from 'react'
import { SubcontractorsList } from '@/components/subcontractors-list'
import { HelpBox } from '@/components/ui/help-box'
import { Card } from '@/components/ui/card'

interface Subcontractor {
  id?: string
  nombre?: string
  nombre_fantasia?: string
  razon_social?: string
  rut: string
  comuna: string
  direccion?: string
  representante_legal?: string
  telefono: string
  email?: string
  ejecutivo_nombre?: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
  conductores_count?: number
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
        const response = await fetch('/api/dashboard/data', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        if (data.dashboard?.transportistas) {
          // Map transportistas fields to component interface
          const mappedSubcontractors = data.dashboard.transportistas.map((s: any) => ({
            id: s.id,
            nombre: s.razon_social || s.nombre_fantasia || '',
            nombre_fantasia: s.nombre_fantasia || '',
            razon_social: s.razon_social || '',
            rut: s.rut || '',
            comuna: s.comuna || 'N/A',
            direccion: s.direccion || 'N/A',
            representante_legal: s.representante_legal || '',
            telefono: s.telefono || '',
            email: s.email || '',
            ejecutivo_nombre: s.ejecutivo_nombre || 'Sin asignar',
            ariztia: s.ariztia || false,
            lts: s.lts || false,
            rendic: s.rendic || false,
            interpolar: s.interpolar || false,
            is_active: s.is_active !== false,
            conductores_count: s.conductores_count || 0,
          }))
          setSubcontractors(mappedSubcontractors)
          
          // Create a RUT -> company name map for driver lookup
          const rutToCompanyMap = new Map(
            mappedSubcontractors.map((s: Subcontractor) => [s.rut, s.nombre])
          )
          
          if (data.dashboard?.conductores) {
            // Map conductores fields with company name lookup
            const mappedDrivers = data.dashboard.conductores.map((c: any) => ({
              id: c.id,
              rut: c.rut || '',
              nombre: `${c.nombres || ''} ${c.apellido_paterno || ''} ${c.apellido_materno || ''}`.trim(),
              rut_proveedor: c.rut_proveedor || '',
              proveedor: rutToCompanyMap.get(c.rut_proveedor) || c.rut_proveedor || 'N/A',
              is_active: c.is_active !== false,
            }))
            setDrivers(mappedDrivers)
          }
        } else if (data.dashboard?.conductores) {
          // Fallback if transportistas not available
          const mappedDrivers = data.dashboard.conductores.map((c: any) => ({
            id: c.id,
            rut: c.rut || '',
            nombre: `${c.nombres || ''} ${c.apellido_paterno || ''} ${c.apellido_materno || ''}`.trim(),
            rut_proveedor: c.rut_proveedor || '',
            proveedor: c.proveedor || c.rut_proveedor || 'N/A',
            is_active: c.is_active !== false,
          }))
          setDrivers(mappedDrivers)
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
