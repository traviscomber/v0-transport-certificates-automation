'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { SubcontractorsList } from '@/components/subcontractors-list'
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
          Pragma: 'no-cache',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      if (data.dashboard?.transportistas) {
        const mappedSubcontractors = data.dashboard.transportistas.map((subcontractor: any) => ({
          id: subcontractor.id,
          nombre: subcontractor.razon_social || subcontractor.nombre_fantasia || '',
          nombre_fantasia: subcontractor.nombre_fantasia || '',
          razon_social: subcontractor.razon_social || '',
          rut: subcontractor.rut || '',
          comuna: subcontractor.comuna || 'N/A',
          direccion: subcontractor.direccion || 'N/A',
          representante_legal: subcontractor.representante_legal || '',
          telefono: subcontractor.telefono || '',
          email: subcontractor.email || '',
          correo: subcontractor.correo || '',
          ejecutivo_nombre: subcontractor.ejecutivo_nombre || 'Sin asignar',
          ariztia: subcontractor.ariztia || false,
          lts: subcontractor.lts || false,
          rendic: subcontractor.rendic || false,
          interpolar: subcontractor.interpolar || false,
          is_active: subcontractor.is_active !== false,
          conductores_count: subcontractor.conductores_count || 0,
          created_at: subcontractor.created_at,
          updated_at: subcontractor.updated_at,
        }))
        setSubcontractors(mappedSubcontractors)

        const rutToCompanyMap = new Map(mappedSubcontractors.map((subcontractor: Subcontractor) => [subcontractor.rut, subcontractor.nombre]))

        if (data.dashboard?.conductores) {
          const mappedDrivers = data.dashboard.conductores.map((driver: any) => ({
            id: driver.id,
            rut: driver.rut || '',
            nombre: `${driver.nombres || ''} ${driver.apellido_paterno || ''} ${driver.apellido_materno || ''}`.trim(),
            rut_proveedor: driver.rut_proveedor || '',
            proveedor: rutToCompanyMap.get(driver.rut_proveedor) || driver.rut_proveedor || 'N/A',
            is_active: driver.is_active !== false,
            created_at: driver.created_at,
            updated_at: driver.updated_at,
          }))
          setDrivers(mappedDrivers)
        }
      } else if (data.dashboard?.conductores) {
        const mappedDrivers = data.dashboard.conductores.map((driver: any) => ({
          id: driver.id,
          rut: driver.rut || '',
          nombre: `${driver.nombres || ''} ${driver.apellido_paterno || ''} ${driver.apellido_materno || ''}`.trim(),
          rut_proveedor: driver.rut_proveedor || '',
          proveedor: driver.proveedor || driver.rut_proveedor || 'N/A',
          is_active: driver.is_active !== false,
          created_at: driver.created_at,
          updated_at: driver.updated_at,
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
      (subcontractor: any) => subcontractor.updated_at || subcontractor.created_at,
      dateFilters.month,
      dateFilters.year,
    )
  }, [subcontractors, dateFilters.month, dateFilters.year])

  const filteredDrivers = useMemo(() => {
    return filterByMonthYear(
      drivers,
      (driver: any) => driver.updated_at || driver.created_at,
      dateFilters.month,
      dateFilters.year,
    )
  }, [drivers, dateFilters.month, dateFilters.year])

  const periodLabel = getMonthLabel(dateFilters.month, dateFilters.year)
  const activeSubcontractors = filteredSubcontractors.filter((subcontractor) => subcontractor.is_active !== false).length
  const inactiveSubcontractors = filteredSubcontractors.length - activeSubcontractors
  const activeDrivers = filteredDrivers.filter((driver) => driver.is_active !== false).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader onAdd={() => setIsAddModalOpen(true)} />
        <StatePanel>Cargando subcontratistas…</StatePanel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader onAdd={() => setIsAddModalOpen(true)} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Período" value={periodLabel} description="Filtro activo" />
        <Metric label="Subcontratistas" value={filteredSubcontractors.length.toLocaleString('es-CL')} description="En la vista actual" />
        <Metric label="Activos" value={activeSubcontractors.toLocaleString('es-CL')} description="Subcontratistas vigentes" tone="success" />
        <Metric label="Inactivos" value={inactiveSubcontractors.toLocaleString('es-CL')} description="Requieren revisión de estado" tone="warning" />
      </div>

      <div className="flex flex-col gap-3 border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Cobertura vinculada</p>
          <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">{activeDrivers} conductores activos asociados a la lectura del período.</p>
        </div>
        <p className="text-xs text-[var(--cf-text-muted)]">Base total: {subcontractors.length} subcontratistas</p>
      </div>

      <DatePeriodFilter
        value={dateFilters}
        onChange={updateDateFilters}
        onClear={() => updateDateFilters({ month: ALL_VALUE, year: ALL_VALUE })}
      />

      {filteredSubcontractors.length === 0 ? (
        <StatePanel>No hay subcontratistas disponibles para este filtro.</StatePanel>
      ) : (
        <SubcontractorsList subcontractors={filteredSubcontractors as any} drivers={filteredDrivers as any} />
      )}

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

function PageHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Gestión operacional</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">Subcontratistas</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
          Revisa empresas, asignaciones y conductores vinculados sin separar la lectura operacional del estado documental.
        </p>
      </div>
      <Button onClick={onAdd} className="h-10 gap-2 bg-[var(--cf-accent)] px-4 text-sm text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]">
        <Plus className="h-4 w-4" />
        Agregar subcontratista
      </Button>
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
