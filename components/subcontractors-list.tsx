'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Phone, Mail, CheckCircle, AlertCircle, X, Filter, Users, Edit, UserPlus, ShieldCheck, ShieldAlert, ShieldX, Clock3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SubcontractorDetailTabs } from './subcontractor-detail-tabs'
import { EditSubcontractorModal } from './edit-subcontractor-modal'
import { AssignExecutiveModal } from './assign-executive-modal'

interface Document {
  id: string
  nombre: string
  tipo: string
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido'
  fecha_subida: string
  fecha_vencimiento?: string
  subcontratista_id: string
}

interface DocumentRequirement {
  id: string
  code: string
  nombre: string
  descripcion?: string
  is_active: boolean
  applicable_to_transportista?: boolean
}

interface Subcontractor {
  id: string
  nombre?: string
  nombre_fantasia?: string
  razon_social?: string
  rut: string
  comuna: string
  direccion?: string
  representante_legal?: string
  telefono: string
  email?: string
  correo?: string
  ejecutivo_nombre?: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
  conductores_count?: number
  region?: string
  documentos?: Document[]
  documentos_requeridos?: DocumentRequirement[]
  certificaciones_count?: {
    ariztia: number
    lts: number
    rendic: number
    interpolar: number
  }
}

interface Driver {
  id: string
  rut: string
  nombre: string
  rut_proveedor: string
  proveedor: string
  is_active: boolean
}

interface SiiStatus {
  status: string
  errorCode: string | null
  errorMessage: string | null
  checkedAt: string | null
  razonSocial: string | null
  warningReasons: string[]
}

interface SubcontractorsListProps {
  subcontractors?: Subcontractor[]
  drivers?: Driver[]
}

function getCompletion(sub: Subcontractor) {
  const checks = [
    Boolean(sub.id),
    Boolean(sub.rut),
    Boolean(sub.nombre || sub.razon_social),
    Boolean(sub.representante_legal),
    Boolean(sub.telefono || sub.email || sub.correo),
    Boolean(sub.direccion || sub.comuna || sub.region),
    Boolean(sub.ejecutivo_nombre),
    Boolean(sub.ariztia || sub.lts || sub.rendic || sub.interpolar),
  ]
  const completed = checks.filter(Boolean).length
  const total = checks.length
  const percent = Math.round((completed / total) * 100)
  return {
    completed,
    total,
    percent,
    label: percent >= 90 ? 'Completo' : percent >= 60 ? 'Parcial' : 'Pendiente',
  }
}

function formatCheckedAt(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function SiiBadge({ value }: { value?: SiiStatus }) {
  if (!value) {
    return (
      <Badge variant="outline" className="gap-1 border-slate-600 bg-slate-800/60 text-slate-300" title="Aún no existe una consulta SII registrada">
        <Clock3 className="h-3.5 w-3.5" /> Pendiente SII
      </Badge>
    )
  }

  const checkedAt = formatCheckedAt(value.checkedAt)
  const title = [
    value.razonSocial ? `Razón social SII: ${value.razonSocial}` : null,
    checkedAt ? `Última consulta: ${checkedAt}` : null,
    value.errorMessage,
  ].filter(Boolean).join('\n')

  if (value.status === 'success') {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-400/40 bg-emerald-500/10 text-emerald-200" title={title}>
        <ShieldCheck className="h-3.5 w-3.5" /> SII validado
      </Badge>
    )
  }

  if (value.status === 'warning') {
    return (
      <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-500/10 text-amber-200" title={title}>
        <ShieldAlert className="h-3.5 w-3.5" /> SII con alertas
      </Badge>
    )
  }

  if (value.status === 'not_found') {
    return (
      <Badge variant="outline" className="gap-1 border-rose-400/40 bg-rose-500/10 text-rose-200" title={title}>
        <ShieldX className="h-3.5 w-3.5" /> No encontrado SII
      </Badge>
    )
  }

  const invalidRut = value.errorCode === 'SII_INVALID_RUT'
  return (
    <Badge variant="outline" className="gap-1 border-rose-400/40 bg-rose-500/10 text-rose-200" title={title}>
      <ShieldX className="h-3.5 w-3.5" /> {invalidRut ? 'RUT inválido' : 'Error SII'}
    </Badge>
  )
}

export function SubcontractorsList({ subcontractors: initialSubcontractors, drivers: initialDrivers }: SubcontractorsListProps) {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors || [])
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers || [])
  const [siiStatuses, setSiiStatuses] = useState<Record<string, SiiStatus>>({})
  const [isLoading, setIsLoading] = useState(!initialSubcontractors)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEjecutivas, setSelectedEjecutivas] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [expandedSubcontractor] = useState<string | null>(null)
  const [selectedDetailSubcontractor, setSelectedDetailSubcontractor] = useState<any>(null)
  const [detailTabToOpen, setDetailTabToOpen] = useState<'resumen' | 'documentos' | 'conductores' | 'certificaciones' | 'onboarding'>('resumen')
  const [documentsData, setDocumentsData] = useState<{ documents: any[], requirements: any[], summary: any } | null>(null)
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [assigningSubcontractor, setAssigningSubcontractor] = useState<Subcontractor | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  useEffect(() => {
    if (initialSubcontractors) return
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/data', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
        })
        if (!response.ok) throw new Error(`Dashboard API ${response.status}`)
        const data = await response.json()
        if (Array.isArray(data.dashboard?.transportistas)) {
          setSubcontractors(data.dashboard.transportistas)
          setDrivers(data.dashboard.conductores || [])
        }
      } catch (error) {
        console.error('[v0] Error fetching subcontractors:', error)
        setSubcontractors([])
        setDrivers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [initialSubcontractors])

  useEffect(() => {
    let cancelled = false
    const loadSiiStatuses = async () => {
      try {
        const response = await fetch('/api/external-verification/sii-statuses', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
        if (!response.ok) throw new Error(`SII statuses API ${response.status}`)
        const data = await response.json()
        if (!cancelled) setSiiStatuses(data.statuses || {})
      } catch (error) {
        console.error('[v0] Error fetching SII statuses:', error)
      }
    }

    loadSiiStatuses()
    const interval = window.setInterval(loadSiiStatuses, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedDetailSubcontractor?.id) return
      try {
        const response = await fetch(`/api/subcontractors/${selectedDetailSubcontractor.id}/documents`)
        if (response.ok) setDocumentsData(await response.json())
      } catch (error) {
        console.error('[v0] Error fetching documents for subcontractor:', error)
      }
    }
    fetchDocuments()
  }, [selectedDetailSubcontractor?.id])

  const refreshSubcontractor = async (subcontractorId: string) => {
    try {
      const response = await fetch(`/api/transportistas/${subcontractorId}`)
      if (!response.ok) return
      const data = await response.json()
      setSubcontractors(prev => prev.map(s => s.id === subcontractorId ? { ...s, ...data.transportista } : s))
    } catch (error) {
      console.error('[v0] Error refreshing subcontractor:', error)
      window.location.reload()
    }
  }

  const ejecutivas = useMemo(() => Array.from(new Set(subcontractors.map(s => s.ejecutivo_nombre || 'Sin asignar'))).filter(Boolean).sort(), [subcontractors])
  const certifications = { ariztia: 'Ariztia', lts: 'LTS', rendic: 'Rendic', interpolar: 'Interpolar' }

  const filtered = useMemo(() => {
    const results = subcontractors.filter(sub => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
          (sub.razon_social || sub.nombre || '').toLowerCase().includes(query) ||
          (sub.nombre_fantasia || '').toLowerCase().includes(query) ||
          (sub.rut || '').includes(query) ||
          (sub.representante_legal || '').toLowerCase().includes(query) ||
          (sub.ejecutivo_nombre || '').toLowerCase().includes(query) ||
          (sub.comuna || '').toLowerCase().includes(query) ||
          (sub.telefono || '').includes(query) ||
          (sub.email || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      const subEjecutiva = sub.ejecutivo_nombre || 'Sin asignar'
      if (selectedEjecutivas.length > 0 && !selectedEjecutivas.includes(subEjecutiva)) return false
      if (selectedCertifications.length > 0) {
        const hasCertification = selectedCertifications.some(cert => {
          if (cert === 'ariztia') return sub.ariztia
          if (cert === 'lts') return sub.lts
          if (cert === 'rendic') return sub.rendic
          if (cert === 'interpolar') return sub.interpolar
          return false
        })
        if (!hasCertification) return false
      }
      if (showActiveOnly && !sub.is_active) return false
      return true
    })
    return results.sort((a, b) => (a.nombre || a.razon_social || '').localeCompare(b.nombre || b.razon_social || '', 'es'))
  }, [searchTerm, selectedEjecutivas, selectedCertifications, showActiveOnly, subcontractors])

  const toggleEjecutiva = (ejecutiva: string) => setSelectedEjecutivas(prev => prev.includes(ejecutiva) ? prev.filter(e => e !== ejecutiva) : [...prev, ejecutiva])
  const toggleCertification = (cert: string) => setSelectedCertifications(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedEjecutivas([])
    setSelectedCertifications([])
    setShowActiveOnly(false)
    setShowAdvancedFilters(false)
  }
  const hasActiveFilters = searchTerm.length > 0 || selectedEjecutivas.length > 0 || selectedCertifications.length > 0 || showActiveOnly

  const conductoresData = useMemo(() => {
    if (!selectedDetailSubcontractor?.id) return []
    const normalizeRut = (rut: string) => rut?.replace(/[.\-]/g, '').toUpperCase() || ''
    const normalizedSubRut = normalizeRut(selectedDetailSubcontractor.rut)
    return drivers.filter(d => normalizeRut(d.rut_proveedor) === normalizedSubRut && d.is_active)
  }, [selectedDetailSubcontractor?.id, selectedDetailSubcontractor?.rut, drivers])

  if (isLoading) return <div className="py-8 text-center text-slate-400">Cargando subcontratistas...</div>

  return (
    <div className="space-y-4">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Subcontratistas</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Visualiza, busca y filtra proveedores de transporte, cumplimiento normativo y estado tributario SII.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Buscar por nombre, RUT, región, ejecutiva..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border-slate-700 bg-slate-900 pl-10 text-white placeholder-slate-500" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"><X className="h-4 w-4" /></button>}
        </div>
        <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`flex items-center gap-2 rounded border px-4 py-2 transition-colors ${showAdvancedFilters ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'}`}>
          <Filter className="h-4 w-4" /> Filtros
          {hasActiveFilters && <Badge className="ml-1 bg-red-500 text-white">{selectedCertifications.length + (showActiveOnly ? 1 : 0)}</Badge>}
        </button>
        {hasActiveFilters && <button onClick={clearAllFilters} className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-400 hover:text-slate-200" title="Limpiar filtros"><X className="h-4 w-4" /></button>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Ejecutivas</label>
        <div className="flex flex-wrap gap-2">
          {ejecutivas.map(ejecutiva => <button key={ejecutiva} onClick={() => toggleEjecutiva(ejecutiva)} className={`rounded px-3 py-1 text-sm transition-colors ${selectedEjecutivas.includes(ejecutiva) ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{ejecutiva}</button>)}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Certificaciones ({selectedCertifications.length})</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(certifications).map(([key, label]) => <button key={key} onClick={() => toggleCertification(key)} className={`rounded px-3 py-1 text-sm ${selectedCertifications.includes(key) ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{label}</button>)}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800" /><span className="text-sm text-slate-300">Solo activos</span></label>
        </div>
      )}

      <div className="text-sm text-slate-400">Mostrando {filtered.length} de {subcontractors.length} subcontratistas</div>

      <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-slate-400">No hay subcontratistas que coincidan con los filtros.</p></CardContent></Card>
          ) : filtered.map((sub, subIdx) => {
            const normalizeRut = (rut?: string) => rut?.trim().replace(/[.\-]/g, '').toUpperCase() || ''
            const normalizedSubRut = normalizeRut(sub.rut)
            let driverCount = sub.conductores_count ?? 0
            const subDrivers = drivers.filter(d => normalizeRut(d.rut_proveedor) === normalizedSubRut && d.is_active)
            if (driverCount === 0 && drivers.length > 0) driverCount = subDrivers.length
            const isExpanded = expandedSubcontractor === sub.id
            const completion = getCompletion(sub)
            const siiStatus = siiStatuses[sub.id]

            return (
              <Card key={sub.id} className="transition-colors hover:border-slate-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-baseline gap-3">
                          <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">{subIdx + 1}</span>
                          <h3 className="text-lg font-bold text-white">{sub.nombre || sub.razon_social}</h3>
                        </div>
                        {sub.nombre_fantasia && <p className="ml-9 text-sm italic text-slate-400">{sub.nombre_fantasia}</p>}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <SiiBadge value={siiStatus} />
                        {sub.is_active ? <><CheckCircle className="h-5 w-5 text-green-500" /><Badge className="bg-green-500/20 text-green-300">Activo</Badge></> : <><AlertCircle className="h-5 w-5 text-red-500" /><Badge className="bg-red-500/20 text-red-300">Inactivo</Badge></>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-300"><span className="font-semibold text-amber-400">{driverCount}</span> conductores</span></div>
                      <Badge variant="outline" className={completion.label === 'Completo' ? 'border-emerald-200/40 bg-emerald-500/10 text-emerald-200' : completion.label === 'Parcial' ? 'border-amber-200/40 bg-amber-500/10 text-amber-200' : 'border-rose-200/40 bg-rose-500/10 text-rose-200'}>Perfil {completion.percent}%</Badge>
                      <Badge variant="outline" className={completion.label === 'Completo' ? 'border-emerald-200/40 bg-emerald-500/10 text-emerald-200' : completion.label === 'Parcial' ? 'border-amber-200/40 bg-amber-500/10 text-amber-200' : 'border-rose-200/40 bg-rose-500/10 text-rose-200'}>{completion.label}</Badge>
                      <button onClick={() => { setEditingSubcontractor(sub); setIsEditModalOpen(true) }} className="ml-auto rounded p-2 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200" title="Editar subcontratista"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { setAssigningSubcontractor(sub); setIsAssignModalOpen(true) }} className="rounded p-2 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200" title="Asignar ejecutiva"><UserPlus className="h-4 w-4" /></button>
                      <button onClick={() => { setDetailTabToOpen('documentos'); setSelectedDetailSubcontractor(sub) }} className="rounded border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/30">Documentos</button>
                      <button onClick={() => { setDetailTabToOpen('conductores'); setSelectedDetailSubcontractor(sub) }} className="rounded border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-xs text-orange-400 hover:bg-orange-500/30">Ver Conductores</button>
                    </div>

                    {siiStatus?.checkedAt && (
                      <div className="rounded-lg border border-slate-700/70 bg-slate-900/50 px-3 py-2 text-xs text-slate-400">
                        Última consulta SII: <span className="text-slate-200">{formatCheckedAt(siiStatus.checkedAt)}</span>
                        {siiStatus.razonSocial && siiStatus.razonSocial !== (sub.razon_social || sub.nombre) && <span className="ml-3">Razón social SII: <span className="text-slate-200">{siiStatus.razonSocial}</span></span>}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs font-semibold text-slate-400">RUT</p><p className="font-mono text-sm text-amber-400">{sub.rut}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400">COMUNA</p><p className="text-sm text-white">{sub.comuna || 'N/A'}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400">DIRECCIÓN</p><p className="text-sm text-white">{sub.direccion || 'N/A'}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400">REPRESENTANTE</p><p className="text-sm text-white">{sub.representante_legal || 'N/A'}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400">EJECUTIVA ASIGNADA</p><p className="text-sm text-white">{sub.ejecutivo_nombre || 'Sin asignar'}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      {sub.telefono && <a href={`tel:${sub.telefono}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><Phone className="h-4 w-4" />{sub.telefono}</a>}
                      {(sub.correo || sub.email) && <a href={`mailto:${sub.correo || sub.email}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300"><Mail className="h-4 w-4" />{sub.correo || sub.email}</a>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sub.ariztia && <Badge className="bg-blue-500/20 text-blue-300">Ariztia</Badge>}
                      {sub.lts && <Badge className="bg-green-500/20 text-green-300">LTS</Badge>}
                      {sub.rendic && <Badge className="bg-purple-500/20 text-purple-300">Rendic</Badge>}
                      {sub.interpolar && <Badge className="bg-orange-500/20 text-orange-300">Interpolar</Badge>}
                    </div>

                    {isExpanded && driverCount > 0 && (
                      <div className="mt-6 space-y-2 border-t border-slate-700 pt-4">
                        <p className="text-sm font-semibold text-slate-300">Conductores asociados ({driverCount}):</p>
                        <div className="grid max-h-96 gap-2 overflow-y-auto">
                          {subDrivers.map(driver => <div key={driver.id} className="rounded border border-slate-700 bg-slate-900 p-3 text-sm"><div className="flex items-start justify-between gap-2"><div className="flex-1"><p className="font-semibold text-white">{driver.nombre}</p><p className="text-xs text-slate-400">RUT: <span className="font-mono text-amber-400">{driver.rut}</span></p></div>{driver.is_active && <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}</div></div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {selectedDetailSubcontractor && <SubcontractorDetailTabs subcontractor={selectedDetailSubcontractor} initialTab={detailTabToOpen} conductoresData={conductoresData} documentsData={documentsData || undefined} onClose={() => { setSelectedDetailSubcontractor(null); setDetailTabToOpen('resumen'); setDocumentsData(null) }} />}

      <EditSubcontractorModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { setIsEditModalOpen(false); if (editingSubcontractor?.id) refreshSubcontractor(editingSubcontractor.id); setEditingSubcontractor(null) }} subcontractor={editingSubcontractor || undefined} />

      <AssignExecutiveModal open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen} transportistaId={assigningSubcontractor?.id || ''} transportistaNombre={assigningSubcontractor?.nombre || assigningSubcontractor?.razon_social || ''} onAssignmentSuccess={async () => { if (assigningSubcontractor?.id) await refreshSubcontractor(assigningSubcontractor.id); setAssigningSubcontractor(null) }} />
    </div>
  )
}
