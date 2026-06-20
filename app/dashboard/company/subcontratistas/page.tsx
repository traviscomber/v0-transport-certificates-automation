'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { SubcontractorsList } from '@/components/subcontractors-list'
import { HelpBox } from '@/components/ui/help-box'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddSubcontractorModal } from '@/components/add-subcontractor-modal'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

interface Document {
  id: string
  nombre: string
  tipo: string
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido'
  fecha_subida: string
  subcontratista_id: string
}

interface DocumentRequirement {
  id: string
  code: string
  nombre: string
  is_active: boolean
  applicable_to_transportista?: boolean
}

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
  documentos?: Document[]
  documentos_requeridos?: DocumentRequirement[]
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
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [dateFilters, setDateFilters] = useState<DateFilterValue>({
    month: searchParams.get('month') || ALL_VALUE,
    year: searchParams.get('year') || ALL_VALUE,
  })

  const refetchData = async () => {
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
          correo: s.correo || '',
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
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await refetchData()
      setIsLoading(false)
    }
    loadData()
  }, [])

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

  const filteredSubcontractors = useMemo(() => {
    return filterByMonthYear(
      subcontractors,
      (s: any) => s.updated_at || s.created_at,
      dateFilters.month,
      dateFilters.year
    )
  }, [subcontractors, dateFilters.month, dateFilters.year])

  const filteredDrivers = useMemo(() => {
    return filterByMonthYear(
      drivers,
      (d: any) => d.updated_at || d.created_at,
      dateFilters.month,
      dateFilters.year
    )
  }, [drivers, dateFilters.month, dateFilters.year])
  const periodLabel = getMonthLabel(dateFilters.month, dateFilters.year)
  const activeSubcontractors = filteredSubcontractors.filter((s) => s.is_active !== false).length
  const activeDrivers = filteredDrivers.filter((d) => d.is_active !== false).length
  const selectedPeriodLabel = periodLabel

  const datePeriodFilter = (
    <DatePeriodFilter
      value={dateFilters}
      onChange={updateDateFilters}
      onClear={() => updateDateFilters({ month: ALL_VALUE, year: ALL_VALUE })}
    />
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GestiÃ³n de Subcontratistas</h1>
          <p className="text-muted-foreground">
            Administra y visualiza los subcontratistas asociados a LABBE
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cargando datos...</p>
        </Card>
        {datePeriodFilter}
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-2xl shadow-slate-950/20">
        <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              Vista ejecutiva de subcontratistas
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Gestión de Subcontratistas
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-slate-300">
                Administra y visualiza los subcontratistas asociados a LABBE con filtro mensual, lectura operativa y seguimiento por ejecutiva.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="min-h-[98px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Periodo activo</p>
                <p className="mt-2 text-2xl font-bold text-white">{selectedPeriodLabel}</p>
                <p className="mt-1 text-xs text-slate-400">Lectura mensual / anual</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Activos</p>
                <p className="mt-2 text-3xl font-bold text-emerald-200">{activeSubcontractors}</p>
                <p className="mt-1 text-xs text-emerald-200/70">Subcontratistas vigentes</p>
              </div>
              <div className="min-h-[98px] rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300/80">Conductores</p>
                <p className="mt-2 text-3xl font-bold text-blue-200">{activeDrivers}</p>
                <p className="mt-1 text-xs text-blue-200/70">Vinculados al período</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl lg:max-w-none lg:w-auto auto-rows-fr">
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Subcontratistas</p>
              <p className="text-3xl font-bold text-white mt-1">{filteredSubcontractors.length}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Conductores</p>
              <p className="text-3xl font-bold text-white mt-1">{filteredDrivers.length}</p>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Total base</p>
              <p className="text-3xl font-bold text-white mt-1">{subcontractors.length}</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="sm:col-span-2 h-12 gap-2 border-blue-500/30 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20">
              <Plus className="w-4 h-4" />
              Agregar Subcontratista
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {datePeriodFilter}

      <SubcontractorsList subcontractors={filteredSubcontractors as any} drivers={filteredDrivers as any} />

      <AddSubcontractorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          refetchData()
        }}
      />
    </div>
  )
}
