'use client'

import { useEffect, useMemo, useRef, useState, type WheelEvent } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Search,
  Shield,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Requirement = {
  id: string
  code: string
  name: string
  category?: string
  periodicity?: string | null
  applicable_to_conductor?: boolean
  applicable_to_transportista?: boolean
  applicable_to_vehicle?: boolean
}

type DocumentType = {
  id: string
  code: string
  name: string
}

type Entity = {
  id: string
  rut?: string
  nombres?: string
  apellido_paterno?: string
  razon_social?: string
  ejecutivo_nombre?: string
  rut_proveedor?: string
  nombre_subcontratista?: string
}

type MatrixDocument = {
  id: string
  status?: string
  validation_status?: string
  document_type_id?: string
  docType?: { code?: string; nombre?: string } | null
  original_filename?: string
  file_name?: string
  created_at?: string
  updated_at?: string
  reviewed_at?: string
  approved_at?: string
  validated_at?: string
  submissionDate?: string
  expiryDate?: string | null
  rejection_reason?: string
  source?: 'conductor' | 'subcontractor'
  conductores?: { id?: string; nombres?: string; apellido_paterno?: string; rut?: string } | null
  transportistas?: { id?: string; razon_social?: string; rut?: string } | null
  conductor_id?: string
  subcontractor_id?: string
  subcontractor_rut?: string
}

type MatrixBucket = {
  conductorDocs: MatrixDocument[]
  subDocs: MatrixDocument[]
}

type Props = {
  loading?: boolean
  requirements: Requirement[]
  documentTypes: DocumentType[]
  conductors: Entity[]
  transportistas: Entity[]
  pending: MatrixBucket
  approved: MatrixBucket
  rejected: MatrixBucket
  onFocusChange?: (focus: { mode: 'company' | 'conductor'; value: string }) => void
}

type RowState = 'ok' | 'attention' | 'risk'
type FilterState = 'ALL' | RowState

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  approved: { label: 'OK', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' },
  pending: { label: 'Pend', className: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
  rejected: { label: 'Rech', className: 'bg-rose-500/15 text-rose-200 border-rose-500/30' },
  expired: { label: 'Venc', className: 'bg-orange-500/15 text-orange-200 border-orange-500/30' },
  missing: { label: 'Sin', className: 'bg-slate-500/15 text-slate-200 border-slate-500/30' },
}

type MatrixColumn = {
  key: string
  group: 'Mensual' | 'Empresa' | 'Conductor' | 'Vehiculo' | 'Subcontratacion' | 'Seguridad'
  label: string
  codes: string[]
  hints?: string[]
}

type MatrixRow = {
  id: string
  conductor: Entity
  company?: Entity
  cells: Map<string, MatrixDocument>
  latestDoc?: MatrixDocument | null
  totalRelevant: number
  approvedCount: number
  pendingCount: number
  rejectedCount: number
  expiredCount: number
  missingCount: number
  complianceScore: number
  state: RowState
  stateLabel: string
}

const MATRIX_COLUMNS: MatrixColumn[] = [
  {
    key: 'planillas_imposiciones',
    group: 'Mensual',
    label: 'Planillas imposiciones',
    codes: ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL', 'CERTIFICADO-AFP', 'CERT_AFP', 'CERTIFICADO-SALUD', 'CERT_AFIL_MUTUAL', 'CERT_TASAS_MUTUAL'],
    hints: ['planillas de imposiciones', 'imposiciones'],
  },
  { key: 'iva', group: 'Mensual', label: 'IVA', codes: ['IVA'], hints: ['iva'] },
  { key: 'f30', group: 'Mensual', label: 'F30', codes: ['F30'], hints: ['f30'] },
  { key: 'f30_1', group: 'Mensual', label: 'F30-1', codes: ['F30-1', 'F30_1', 'CUMPLIMIENTO-PREVISIONAL'], hints: ['f30-1'] },
  { key: 'liq_sueldo', group: 'Mensual', label: 'Liq. Sueldo', codes: ['LIQUIDACION_SUELDO', 'LIQ-SUELDO', 'LIQ_SUELDO'], hints: ['liquidacion de sueldo', 'liq sueldo'] },
  { key: 'cert_afil_mutual', group: 'Mensual', label: 'Cert. Afil Mutual', codes: ['CERT_AFIL_MUTUAL'], hints: ['afili mutual', 'afiliacion mutual'] },
  { key: 'cert_tasas_mutual', group: 'Mensual', label: 'Cert. Tasas Mutual', codes: ['CERT_TASAS_MUTUAL'], hints: ['tasas mutual'] },
  { key: 'hoja_vida', group: 'Mensual', label: 'Hoja de vida', codes: ['HOJA-VIDA-CONDUCTOR', 'HOJA_VIDA'], hints: ['hoja de vida'] },
  { key: 'cert_antecedentes', group: 'Mensual', label: 'Cert. Antecedentes', codes: ['CERT_ANTECEDENTES', 'CERTIFICADO-ANTECEDENTES'], hints: ['antecedentes'] },
  { key: 'cert_cotizaciones', group: 'Mensual', label: 'Cert. Cotizaciones', codes: ['CERT_COTIZACIONES'], hints: ['cotizacion', 'cotizaciones'] },
  { key: 'f30_1_lts', group: 'Mensual', label: 'F30-1 Lts', codes: ['F30-1_CLIENTE', 'F30-1_DOÑA_ISIDORA', 'F30-1_DOÑA_ISIDORA', 'F30-1 LTS', 'F30-1_LTS'], hints: ['f30-1 lts', 'lts'] },
  { key: 'comprobantes_pago_sueldo', group: 'Mensual', label: 'Comprob. pago sueldo', codes: ['COMPROBANTE_PAGO', 'COMPROBANTES_PAGO', 'COMPROBANTE-PAGO-SUELDO'], hints: ['comprobante pago sueldo', 'pago sueldo'] },
  { key: 'cedula_representante', group: 'Empresa', label: 'Cédula representante', codes: ['CEDULA-REPRESENTANTE', 'CEDULA_IDENTIDAD'], hints: ['cedula representante', 'cédula representante'] },
  { key: 'cert_vigencia', group: 'Empresa', label: 'Cert. Vigencia', codes: ['CERTIFICADO-VIGENCIA'], hints: ['vigencia'] },
  { key: 'escritura_constitucion', group: 'Empresa', label: 'Escritura', codes: ['ESCRITURA-CONSTITUCION'], hints: ['escritura'] },
  { key: 'poder_representante', group: 'Empresa', label: 'Poder representante', codes: ['PODER-REPRESENTANTE'], hints: ['poder representante'] },
  { key: 'rut_empresa', group: 'Empresa', label: 'RUT empresa', codes: ['RUT-EMPRESA'], hints: ['rut empresa'] },
  { key: 'licencia_conducir', group: 'Conductor', label: 'Licencia conducir', codes: ['LICENCIA-CONDUCIR', 'LICENCIA_CONDUCIR'], hints: ['licencia conducir'] },
  { key: 'revision_tecnica', group: 'Vehiculo', label: 'Revisión técnica', codes: ['REVISION-TECNICA', 'REVISION_TECNICA'], hints: ['revision tecnica'] },
  { key: 'soap', group: 'Vehiculo', label: 'SOAP', codes: ['SOAP', 'SEGURO-SOAP'], hints: ['soap'] },
  { key: 'permiso_circulacion', group: 'Vehiculo', label: 'Permiso circulación', codes: ['PERMISO-CIRCULACION', 'PERMISO_CIRCULACION'], hints: ['permiso circulacion'] },
  { key: 'padron_vehiculo', group: 'Vehiculo', label: 'Padrón vehículo', codes: ['PADRON-VEHICULO', 'PADRON'], hints: ['padron', 'padrón'] },
  { key: 'foto_patentes_tag', group: 'Vehiculo', label: 'Foto patentes / TAG', codes: ['FOTO-GPS-VEHICULO', 'FOTO_PATENTES'], hints: ['foto', 'tag', 'patentes'] },
  { key: 'cert_emisiones', group: 'Vehiculo', label: 'Cert. Emisiones', codes: ['CERTIFICADO-EMISIONES'], hints: ['emisiones'] },
  { key: 'seguro_rc', group: 'Vehiculo', label: 'Seguro RC', codes: ['SEGURO-RC', 'POLIZA_RC'], hints: ['seguro rc', 'poliza rc'] },
  { key: 'contrato_subcontratacion', group: 'Subcontratacion', label: 'Contrato subcontratación', codes: ['CONTRATO-SUBCONTRATACION'], hints: ['contrato subcontratacion'] },
  { key: 'cumplimiento_previsional', group: 'Subcontratacion', label: 'Cumplimiento previsional', codes: ['CUMPLIMIENTO-PREVISIONAL'], hints: ['cumplimiento previsional'] },
  { key: 'matriz_riesgos', group: 'Seguridad', label: 'Matriz riesgos', codes: ['MATRIZ-RIESGOS'], hints: ['matriz riesgos'] },
  { key: 'plan_emergencia', group: 'Seguridad', label: 'Plan emergencia', codes: ['PLAN_EMERGENCIA'], hints: ['plan emergencia'] },
  { key: 'procedimientos_seguridad', group: 'Seguridad', label: 'Proc. seguridad', codes: ['PROCEDIMIENTOS-SEGURIDAD'], hints: ['procedimientos seguridad'] },
  { key: 'reglamento_interno', group: 'Seguridad', label: 'Reglamento interno', codes: ['REGLAMENTO-INTERNO'], hints: ['reglamento interno'] },
  { key: 'capacitaciones', group: 'Seguridad', label: 'Capacitaciones', codes: ['CAPACITACIONES', 'CERT_CAPACITACION'], hints: ['capacitacion', 'capacitaciones'] },
]

const MATRIX_GROUP_ORDER: MatrixColumn['group'][] = ['Mensual', 'Empresa', 'Conductor', 'Vehiculo', 'Subcontratacion', 'Seguridad']
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const FILTER_LETTERS = [...ALPHABET, '#']

function normalizeText(value?: string | null) {
  return (value || '').trim().toLowerCase()
}

function normalizeAlphabetText(value?: string | null) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getEntityLabel(entity: Entity, fallback = 'Sin nombre') {
  if (entity.razon_social) return entity.razon_social
  const fullName = [entity.nombres, entity.apellido_paterno].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  return fallback
}

function getEntityIdentityKey(entity: Entity) {
  return (
    entity.id ||
    entity.rut ||
    [
      normalizeAlphabetText(entity.razon_social),
      normalizeAlphabetText(entity.nombres),
      normalizeAlphabetText(entity.apellido_paterno),
    ]
      .filter(Boolean)
      .join('|')
  )
}

function getRowCompanyLabel(entity: Entity, transportistasByRut: Map<string, Entity>) {
  if (entity.rut_proveedor) {
    const company = transportistasByRut.get(entity.rut_proveedor)
    if (company) return getEntityLabel(company, entity.rut_proveedor)
  }

  if (entity.nombre_subcontratista) return entity.nombre_subcontratista
  return 'Sin empresa'
}

function getRowAlphabetLabel(entity: Entity, transportistasByRut: Map<string, Entity>) {
  const surname = normalizeAlphabetText(entity.apellido_paterno)
  if (surname) return surname

  const company = normalizeAlphabetText(getRowCompanyLabel(entity, transportistasByRut))
  if (company) return company

  return normalizeAlphabetText(getEntityLabel(entity))
}

function getRowAlphabetLetter(entity: Entity, transportistasByRut: Map<string, Entity>) {
  const label = getRowAlphabetLabel(entity, transportistasByRut)
  const first = label.charAt(0).toUpperCase()
  return first >= 'A' && first <= 'Z' ? first : '#'
}

function getRowSearchText(row: { conductor: Entity; company?: Entity }) {
  return normalizeAlphabetText(
    [
      row.conductor.rut,
      row.conductor.nombres,
      row.conductor.apellido_paterno,
      row.conductor.ejecutivo_nombre,
      row.conductor.nombre_subcontratista,
      row.company?.rut,
      row.company?.razon_social,
      row.company?.nombre_subcontratista,
      row.company?.ejecutivo_nombre,
      getEntityLabel(row.conductor),
      row.company ? getEntityLabel(row.company) : null,
    ]
      .filter(Boolean)
      .join(' ')
  )
}

function getDocDate(doc: MatrixDocument) {
  return doc.reviewed_at || doc.validated_at || doc.approved_at || doc.updated_at || doc.created_at || doc.submissionDate || ''
}

function getDocStatus(doc: MatrixDocument) {
  const raw = normalizeText(doc.status || doc.validation_status)
  if (raw === 'approved' || raw === 'validated' || raw === 'aprobado' || raw === 'aprobada') {
    if (doc.expiryDate) {
      const expiry = new Date(doc.expiryDate)
      if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
        return 'expired'
      }
    }
    return 'approved'
  }
  if (raw === 'rejected' || raw === 'rechazado' || raw === 'rechazada') return 'rejected'
  if (raw === 'expired' || raw === 'vencido' || raw === 'vencida') return 'expired'
  return 'pending'
}

function normalizeCode(value?: string | null) {
  return normalizeText(value)
    .replace(/[._]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
}

function getDocSearchText(doc: MatrixDocument) {
  return normalizeText(
    [
      doc.docType?.code,
      doc.docType?.nombre,
      doc.original_filename,
      doc.file_name,
      doc.created_at,
      doc.updated_at,
      doc.submissionDate,
      doc.rejection_reason,
    ]
      .filter(Boolean)
      .join(' ')
  )
}

function matchesColumn(doc: MatrixDocument, column: MatrixColumn) {
  const searchText = getDocSearchText(doc)
  const exactCode = normalizeCode(doc.docType?.code)

  if (column.codes.some((code) => exactCode && exactCode === normalizeCode(code))) {
    return true
  }

  return column.hints?.some((hint) => {
    const normalizedHint = normalizeText(hint)
    return normalizedHint.length > 0 && searchText.includes(normalizedHint)
  }) || false
}

function formatPeriod(dateValue?: string) {
  if (!dateValue) return 'Sin fecha'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
}

function pickLatestDoc(docs: MatrixDocument[]) {
  const ranked = [...docs].sort((a, b) => {
    const dateB = new Date(getDocDate(b)).getTime()
    const dateA = new Date(getDocDate(a)).getTime()
    return dateB - dateA
  })

  return ranked[0] || null
}

function getRowState(row: Pick<MatrixRow, 'rejectedCount' | 'expiredCount' | 'pendingCount' | 'missingCount'>): RowState {
  if (row.rejectedCount > 0 || row.expiredCount > 0) return 'risk'
  if (row.pendingCount > 0 || row.missingCount > 0) return 'attention'
  return 'ok'
}

function getRowStateLabel(state: RowState) {
  if (state === 'ok') return 'Estable'
  if (state === 'attention') return 'Revisar'
  return 'Con problemas'
}

function getRowStateStyles(state: RowState) {
  if (state === 'ok') return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
  if (state === 'attention') return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
  return 'bg-rose-500/15 text-rose-200 border-rose-500/30'
}

function getRowSortScore(row: MatrixRow) {
  const stateScore = row.state === 'risk' ? 0 : row.state === 'attention' ? 1 : 2
  return [stateScore, row.complianceScore, row.pendingCount + row.rejectedCount + row.missingCount] as const
}

function getScoreTone(score: number) {
  if (score >= 85) return 'text-emerald-200'
  if (score >= 65) return 'text-amber-200'
  return 'text-rose-200'
}

function getProgressTone(score: number) {
  if (score >= 85) return 'from-emerald-400 to-cyan-400'
  if (score >= 65) return 'from-amber-400 to-yellow-300'
  return 'from-rose-500 to-orange-400'
}

export function ComplianceExcelMatrix({
  loading,
  requirements,
  documentTypes,
  conductors,
  transportistas,
  pending,
  approved,
  rejected,
  onFocusChange,
}: Props) {
  const transportistasByRut = useMemo(
    () => new Map(transportistas.filter((item) => item.rut).map((item) => [item.rut as string, item])),
    [transportistas]
  )

  const groupedColumns = useMemo(() => {
    return MATRIX_GROUP_ORDER
      .map((group) => ({
        group,
        label: group === 'Vehiculo' ? 'Vehículo' : group === 'Subcontratacion' ? 'Subcontratación' : group,
        columns: MATRIX_COLUMNS.filter((column) => column.group === group),
      }))
      .filter((group) => group.columns.length > 0)
  }, [])

  const [activeLetter, setActiveLetter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterState>('ALL')
  const [activeGroup, setActiveGroup] = useState<'ALL' | MatrixColumn['group']>('Mensual')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [onlyCritical, setOnlyCritical] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [focusMode, setFocusMode] = useState<'company' | 'conductor'>('company')
  const [selectedFocus, setSelectedFocus] = useState('ALL')
  const matrixScrollRef = useRef<HTMLDivElement | null>(null)

  const visibleGroupedColumns = useMemo(() => {
    if (activeGroup === 'ALL') return groupedColumns
    return groupedColumns.filter((group) => group.group === activeGroup)
  }, [activeGroup, groupedColumns])

  const rows = useMemo<MatrixRow[]>(() => {
    const allByConductor = new Map<string, MatrixDocument[]>()
    const allByCompany = new Map<string, MatrixDocument[]>()

    const collect = (doc: MatrixDocument) => {
      const status = getDocStatus(doc)
      const source = doc.source || (doc.conductor_id || doc.conductores?.id ? 'conductor' : 'subcontractor')
      const normalized: MatrixDocument = { ...doc, status, source }

      const conductorId = doc.conductores?.id || doc.conductor_id
      if (conductorId) {
        const current = allByConductor.get(conductorId) || []
        current.push(normalized)
        allByConductor.set(conductorId, current)
      }

      const companyId = doc.subcontractor_id || doc.transportistas?.id
      if (companyId) {
        const current = allByCompany.get(companyId) || []
        current.push(normalized)
        allByCompany.set(companyId, current)
      }
    }

    ;[...pending.conductorDocs, ...pending.subDocs, ...approved.conductorDocs, ...approved.subDocs, ...rejected.conductorDocs, ...rejected.subDocs].forEach(collect)

    const seenConductors = new Set<string>()
    const uniqueConductors = conductors.filter((conductor) => {
      const key = getEntityIdentityKey(conductor)
      if (!key || seenConductors.has(key)) return false
      seenConductors.add(key)
      return true
    })

    const sortedConductors = uniqueConductors.sort((a, b) => {
      const companyA = getRowCompanyLabel(a, transportistasByRut)
      const companyB = getRowCompanyLabel(b, transportistasByRut)
      if (companyA !== companyB) return companyA.localeCompare(companyB)
      return getEntityLabel(a).localeCompare(getEntityLabel(b))
    })

    const rows = sortedConductors.map((conductor) => {
      const companyId = conductor.rut_proveedor || ''
      const company = transportistasByRut.get(companyId)
      const rowDocs = [
        ...(conductor.id ? allByConductor.get(conductor.id) || [] : []),
        ...(company?.id ? allByCompany.get(company.id) || [] : []),
      ]

      const cells = new Map<string, MatrixDocument>()
      MATRIX_COLUMNS.forEach((column) => {
        const matches = rowDocs.filter((doc) => matchesColumn(doc, column))
        const latest = pickLatestDoc(matches)
        if (latest) cells.set(column.key, latest)
      })

      const totalRelevant = MATRIX_COLUMNS.length
      const approvedCount = Array.from(cells.values()).filter((doc) => getDocStatus(doc) === 'approved').length
      const pendingCount = Array.from(cells.values()).filter((doc) => getDocStatus(doc) === 'pending').length
      const rejectedCount = Array.from(cells.values()).filter((doc) => getDocStatus(doc) === 'rejected').length
      const expiredCount = Array.from(cells.values()).filter((doc) => getDocStatus(doc) === 'expired').length
      const missingCount = Math.max(totalRelevant - cells.size, 0)
      const complianceScore = totalRelevant > 0 ? Math.round((approvedCount / totalRelevant) * 100) : 0
      const state = getRowState({ rejectedCount, expiredCount, pendingCount, missingCount })
      const latestDoc = pickLatestDoc(Array.from(cells.values()))

      return {
        id: conductor.id,
        conductor,
        company,
        cells,
        totalRelevant,
        approvedCount,
        pendingCount,
        rejectedCount,
        expiredCount,
        missingCount,
        complianceScore,
        state,
        stateLabel: getRowStateLabel(state),
        latestDoc,
      }
    })

    return rows.sort((a, b) => {
      const [stateA, scoreA, issuesA] = getRowSortScore(a)
      const [stateB, scoreB, issuesB] = getRowSortScore(b)
      if (stateA !== stateB) return stateA - stateB
      if (scoreA !== scoreB) return scoreA - scoreB
      if (issuesA !== issuesB) return issuesB - issuesA
      const companyA = getRowCompanyLabel(a.conductor, transportistasByRut)
      const companyB = getRowCompanyLabel(b.conductor, transportistasByRut)
      if (companyA !== companyB) return companyA.localeCompare(companyB)
      return getEntityLabel(a.conductor).localeCompare(getEntityLabel(b.conductor))
    })
  }, [approved.conductorDocs, approved.subDocs, conductors, pending.conductorDocs, pending.subDocs, rejected.conductorDocs, rejected.subDocs, transportistasByRut])

  const normalizedSearch = normalizeAlphabetText(searchTerm)

  const filteredRows = useMemo(() => {
    const matchesSearch = (row: { conductor: Entity; company?: Entity }) => {
      if (!normalizedSearch) return true
      return getRowSearchText(row).includes(normalizedSearch)
    }

    return rows.filter((row) => {
      const matchesLetter = activeLetter === 'ALL' || getRowAlphabetLetter(row.conductor, transportistasByRut) === activeLetter
      const matchesState = statusFilter === 'ALL' || row.state === statusFilter
      const matchesCritical = !onlyCritical || row.state !== 'ok'
      const matchesFocus =
        selectedFocus === 'ALL'
          ? true
          : focusMode === 'company'
            ? row.company?.id === selectedFocus ||
              row.conductor.rut_proveedor === selectedFocus ||
              getRowCompanyLabel(row.conductor, transportistasByRut) === selectedFocus
            : row.conductor.id === selectedFocus || row.conductor.rut === selectedFocus

      return matchesLetter && matchesState && matchesCritical && matchesSearch(row) && matchesFocus
    })
  }, [activeLetter, focusMode, normalizedSearch, onlyCritical, rows, selectedFocus, statusFilter, transportistasByRut])

  const availableLetters = useMemo(() => {
    const letters = new Set<string>()
    rows.forEach((row) => {
      letters.add(getRowAlphabetLetter(row.conductor, transportistasByRut))
    })
    return FILTER_LETTERS.filter((letter) => letters.has(letter))
  }, [rows, transportistasByRut])

  const letterCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const letter = getRowAlphabetLetter(row.conductor, transportistasByRut)
      acc[letter] = (acc[letter] || 0) + 1
      return acc
    }, {})
  }, [rows, transportistasByRut])

  const companyOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string; count: number }>()

    rows.forEach((row) => {
      const value = row.company?.id || row.conductor.rut_proveedor || getRowCompanyLabel(row.conductor, transportistasByRut)
      if (!value) return

      const label = getRowCompanyLabel(row.conductor, transportistasByRut)
      const current = options.get(value) || { value, label, count: 0 }
      current.count += 1
      current.label = label || current.label
      options.set(value, current)
    })

    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [rows, transportistasByRut])

  const conductorOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string; secondary: string; count: number }>()

    rows.forEach((row) => {
      const value = row.conductor.id || row.conductor.rut || getEntityLabel(row.conductor)
      if (!value) return

      const label = getEntityLabel(row.conductor, 'Sin conductor')
      const current = options.get(value) || {
        value,
        label,
        secondary: getRowCompanyLabel(row.conductor, transportistasByRut),
        count: 0,
      }
      current.count += 1
      current.label = label || current.label
      current.secondary = getRowCompanyLabel(row.conductor, transportistasByRut)
      options.set(value, current)
    })

    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [rows, transportistasByRut])

  const selectedFocusLabel = useMemo(() => {
    if (selectedFocus === 'ALL') return null
    if (focusMode === 'company') {
      return companyOptions.find((option) => option.value === selectedFocus)?.label || null
    }
    return conductorOptions.find((option) => option.value === selectedFocus)?.label || null
  }, [companyOptions, conductorOptions, focusMode, selectedFocus])

  const statusCounts = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.state] += 1
        return acc
      },
      { ok: 0, attention: 0, risk: 0 }
    )
  }, [rows])

  const summary = useMemo(() => {
    const totalCells = filteredRows.reduce((acc, row) => acc + row.totalRelevant, 0)
    const approvedCells = filteredRows.reduce((acc, row) => acc + row.approvedCount, 0)
    const pendingCells = filteredRows.reduce((acc, row) => acc + row.pendingCount, 0)
    const rejectedCells = filteredRows.reduce((acc, row) => acc + row.rejectedCount, 0)
    const missingCells = filteredRows.reduce((acc, row) => acc + row.missingCount, 0)
    const coverage = totalCells > 0 ? Math.round((approvedCells / totalCells) * 100) : 0
    const averageScore = filteredRows.length > 0
      ? Math.round(filteredRows.reduce((acc, row) => acc + row.complianceScore, 0) / filteredRows.length)
      : 0
    const rowsNeedingAttention = filteredRows.filter((row) => row.state !== 'ok').length

    return { totalCells, approvedCells, pendingCells, rejectedCells, missingCells, coverage, averageScore, rowsNeedingAttention }
  }, [filteredRows])

  const focusedRows = useMemo(() => {
    if (selectedFocus === 'ALL') return []
    return filteredRows
  }, [filteredRows, selectedFocus])

  const topRisks = useMemo(() => {
    return [...(selectedFocus === 'ALL' ? rows : filteredRows)]
      .sort((a, b) => a.complianceScore - b.complianceScore || b.pendingCount + b.rejectedCount + b.missingCount - (a.pendingCount + a.rejectedCount + a.missingCount))
      .slice(0, 3)
  }, [filteredRows, rows, selectedFocus])

  const hasActiveFilters = Boolean(searchTerm || activeLetter !== 'ALL' || statusFilter !== 'ALL' || onlyCritical || selectedFocus !== 'ALL')

  const clearFilters = () => {
    setSearchTerm('')
    setActiveLetter('ALL')
    setStatusFilter('ALL')
    setActiveGroup('Mensual')
    setOnlyCritical(false)
    setShowAdvancedFilters(false)
    setFocusMode('company')
    setSelectedFocus('ALL')
  }

  useEffect(() => {
    const container = matrixScrollRef.current
    if (container) {
      container.scrollTo({ left: 0, behavior: 'auto' })
    }
  }, [activeGroup])

  useEffect(() => {
    setSelectedFocus('ALL')
  }, [focusMode])

  useEffect(() => {
    onFocusChange?.({ mode: focusMode, value: selectedFocus })
  }, [focusMode, onFocusChange, selectedFocus])

  const scrollMatrix = (direction: 'left' | 'right') => {
    const container = matrixScrollRef.current
    if (!container) return

    const amount = Math.max(480, Math.floor(container.clientWidth * 0.7))
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  const handleMatrixWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = matrixScrollRef.current
    if (!container) return

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }

    if (container.scrollWidth <= container.clientWidth) {
      return
    }

    event.preventDefault()
    container.scrollLeft += event.deltaY
  }

  const renderStatusCell = (doc?: MatrixDocument, requirementName?: string) => {
    if (!doc) {
      const style = STATUS_STYLES.missing
      return (
        <div className={`flex h-full min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center ${style.className}`}>
          <span className="text-sm font-bold leading-none">0</span>
          <span className="text-[10px] uppercase tracking-[0.18em] leading-none">{style.label}</span>
        </div>
      )
    }

    const status = getDocStatus(doc)
    const style = STATUS_STYLES[status] || STATUS_STYLES.missing
    const period = formatPeriod(getDocDate(doc))
    const label = doc.docType?.nombre || doc.original_filename || doc.file_name || requirementName || 'Documento'
    const value = status === 'approved' ? '1' : '0'
    const detail = status === 'approved' ? period : status === 'pending' ? 'Pend.' : status === 'rejected' ? 'Rech.' : status === 'expired' ? 'Venc.' : 'Sin'

    return (
      <div
        title={`${label} | ${period} | ${style.label}`}
        className={`flex h-full min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center ${style.className}`}
      >
        <span className="text-sm font-bold leading-none">{value}</span>
        <span className="max-w-full truncate text-[10px] uppercase tracking-[0.16em] leading-none">{detail}</span>
      </div>
    )
  }

  return (
    <Card className="relative overflow-hidden border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-slate-950/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400" />
      <CardHeader className="relative border-b border-slate-700/50 bg-slate-950/40">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Matriz simple
            </div>
            <div className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-2xl md:text-3xl">
                <Shield className="h-6 w-6 text-cyan-400" />
                Matriz de cumplimiento
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm md:text-base text-slate-300">
                Aqui ves, por empresa o conductor, si los documentos estan al dia, pendientes o con riesgo.
                Verde significa al dia, amarillo revisar y rojo requiere accion.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{rows.length} filas</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{requirements.length} requisitos</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{documentTypes.length} tipos de documento</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{summary.averageScore}% promedio</Badge>
            </div>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 xl:w-auto">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Al dia</p>
              <p className="mt-2 text-3xl font-bold text-slate-100">{summary.coverage}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full bg-gradient-to-r ${getProgressTone(summary.coverage)}`} style={{ width: `${summary.coverage}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Por revisar</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">{summary.rowsNeedingAttention}</p>
              <p className="mt-1 text-xs text-slate-400">filas con pendientes o faltantes</p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Con problemas</p>
              <p className="mt-2 text-3xl font-bold text-rose-300">{statusCounts.risk}</p>
              <p className="mt-1 text-xs text-slate-400">filas con rechazados o vencidos</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Filas visibles</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{filteredRows.length}</p>
            <p className="mt-1 text-xs text-slate-400">de {rows.length} totales</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Aprobados</p>
            <p className="mt-2 text-2xl font-bold text-emerald-200">{summary.approvedCells}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-amber-200">{summary.pendingCells}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-rose-300/80">Rechazados</p>
            <p className="mt-2 text-2xl font-bold text-rose-200">{summary.rejectedCells}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Faltantes</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{summary.missingCells}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-4 lg:z-30 rounded-2xl border border-slate-700/50 bg-slate-950/85 p-4 backdrop-blur-xl shadow-xl shadow-slate-950/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="compliance-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar empresa o conductor"
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/90 py-3 pl-9 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                showAdvancedFilters
                  ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-50 shadow-lg shadow-cyan-950/20'
                  : 'border-slate-700/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-900/70'
              }`}
            >
              {showAdvancedFilters ? 'Ocultar filtros' : 'Mas filtros'}
            </button>

            {showAdvancedFilters ? (
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'Todos', count: rows.length, tone: 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800' },
                { key: 'ok', label: 'Bien', count: statusCounts.ok, tone: 'border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10' },
                { key: 'attention', label: 'Revisar', count: statusCounts.attention, tone: 'border-amber-500/30 text-amber-200 hover:bg-amber-500/10' },
                { key: 'risk', label: 'Con problemas', count: statusCounts.risk, tone: 'border-rose-500/30 text-rose-200 hover:bg-rose-500/10' },
              ].map((item) => {
                const active = statusFilter === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key as FilterState)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active ? 'bg-slate-800 shadow-lg shadow-slate-950/30 ' + item.tone : item.tone
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold">{item.count}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setOnlyCritical((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  onlyCritical
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-100 shadow-lg shadow-rose-950/20'
                    : 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                Solo críticos
              </button>
              {onlyCritical ? (
                <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                  {filteredRows.length} filas visibles
                </Badge>
              ) : null}
            </div>
            ) : null}

              {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3 lg:grid-cols-[160px_1fr] lg:items-end">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Primero</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFocusMode('company')}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    focusMode === 'company'
                      ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                      : 'border-slate-700/70 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  Empresa
                </button>
                <button
                  type="button"
                  onClick={() => setFocusMode('conductor')}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    focusMode === 'conductor'
                      ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                      : 'border-slate-700/70 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  Conductor
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  {focusMode === 'company' ? 'Elige una empresa' : 'Elige un conductor'}
                </p>
                <Select value={selectedFocus} onValueChange={setSelectedFocus}>
                  <SelectTrigger className="h-11 w-full border-slate-700/70 bg-slate-900/90 text-slate-100">
                    <SelectValue placeholder={focusMode === 'company' ? 'Elige empresa' : 'Elige conductor'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[320px]">
                    <SelectItem value="ALL">Ver todos</SelectItem>
                    {focusMode === 'company'
                      ? companyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.count})
                          </SelectItem>
                        ))
                      : conductorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} · {option.secondary}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFocusMode('company')
                    setSelectedFocus('ALL')
                    setSearchTerm('')
                    setActiveLetter('ALL')
                  }}
                  className="border-slate-700/70 bg-slate-950/40 text-slate-200 hover:bg-slate-800"
                >
                  Reiniciar
                </Button>
              </div>
            </div>
          </div>

          {selectedFocus === 'ALL' ? (
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Vista resumida</p>
                  <p className="text-sm text-cyan-50/80">
                    Elegir una {focusMode === 'company' ? 'empresa' : 'persona'} reduce el peso visual y hace la matriz mucho más legible.
                    La recomendación es partir por empresa y luego bajar al conductor.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{rows.length} filas disponibles</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-100/80">
              Mostrando {focusedRows.length} filas para {selectedFocusLabel}. Puedes seguir refinando por letra, estado o búsqueda.
            </div>
          )}

          {showAdvancedFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Filtrar por inicial
            </span>
            <button
              type="button"
              onClick={() => setActiveLetter('ALL')}
              className={`h-9 shrink-0 rounded-full border px-3 text-sm font-medium transition ${
                activeLetter === 'ALL'
                  ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                  : 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              Todas
            </button>
            {FILTER_LETTERS.map((letter) => {
              const isAvailable = availableLetters.includes(letter)
              const isActive = activeLetter === letter
              const count = letterCounts[letter] || 0
              const label = letter === '#' ? 'Otros' : letter
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => isAvailable && setActiveLetter(letter)}
                  disabled={!isAvailable}
                  className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                      : isAvailable
                        ? 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                        : 'cursor-not-allowed border-slate-800/50 text-slate-600 opacity-40'
                  }`}
                >
                  <span>{label}</span>
                  <span className="rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-300">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {topRisks.length > 0 ? (
            topRisks.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{getEntityLabel(row.conductor, 'Sin conductor')}</p>
                  </div>
                  <Badge className={`border ${getRowStateStyles(row.state)}`}>{row.stateLabel}</Badge>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className={`text-3xl font-bold ${getScoreTone(row.complianceScore)}`}>{row.complianceScore}%</p>
                    <p className="mt-1 text-xs text-slate-400">cumplimiento calculado</p>
                  </div>
                  <div className="max-w-[180px] text-right text-xs text-slate-400">
                    <div>{row.pendingCount} pendientes</div>
                    <div>{row.rejectedCount} rechazados</div>
                    <div>{row.missingCount} faltantes</div>
                  </div>
                </div>
                {row.latestDoc ? (
                  <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-950/50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-200">
                        {row.latestDoc.docType?.nombre || row.latestDoc.original_filename || row.latestDoc.file_name || 'Documento'}
                      </p>
                      <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                        {STATUS_STYLES[getDocStatus(row.latestDoc)]?.label || 'Sin'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Ultimo movimiento: {formatPeriod(getDocDate(row.latestDoc))}
                    </p>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4 text-sm text-slate-400 lg:col-span-3">
              No hay filas para destacar con los filtros actuales.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200">1 = aprobado</Badge>
            <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-200">0 = pendiente, rechazado, vencido o sin cargar</Badge>
            <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{summary.averageScore}% promedio</Badge>
          </div>
          <span className="text-slate-500">Las celdas muestran el periodo bajo el valor cuando existe aprobación.</span>
        </div>

        {showAdvancedFilters ? (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-4 text-xs text-cyan-100/80">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-7 items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Vista simple
                </span>
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                  {activeGroup === 'ALL' ? 'Completa' : groupedColumns.find((group) => group.group === activeGroup)?.label || activeGroup}
                </Badge>
                <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">
                  {viewMode === 'cards' ? 'Resumen' : 'Detalle'}
                </Badge>
              </div>
              <p className="text-cyan-100/70">
                Resumen muestra lo principal. Detalle muestra todo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'cards'
                    ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-50 shadow-lg shadow-cyan-950/20'
                    : 'border-slate-700/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-900/70'
                }`}
              >
                Resumen
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'table'
                    ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-50 shadow-lg shadow-cyan-950/20'
                    : 'border-slate-700/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-900/70'
                }`}
              >
                Detalle
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {[{ key: 'ALL', label: 'Completa', count: groupedColumns.length } as const, ...groupedColumns.map((group) => ({ key: group.group, label: group.label, count: group.columns.length }))].map((item) => {
                const isActive = activeGroup === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveGroup(item.key)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-50 shadow-lg shadow-cyan-950/20'
                        : 'border-slate-700/70 text-slate-200 hover:border-cyan-400/30 hover:bg-slate-900/70'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {item.count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrollMatrix('left')}
                className="border-cyan-500/30 bg-slate-950/40 text-cyan-100 hover:bg-cyan-500/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Izquierda
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrollMatrix('right')}
                className="border-cyan-500/30 bg-slate-950/40 text-cyan-100 hover:bg-cyan-500/10"
              >
                Derecha
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
            Cargando matriz...
          </div>
        ) : selectedFocus === 'ALL' ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
            Elige una empresa o un conductor para mostrar la matriz documental.
          </div>
        ) : focusedRows.length === 0 || visibleGroupedColumns.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
            No hay datos suficientes para mostrar la matriz con ese filtro.
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-4">
            {focusedRows.map((row) => (
              <details key={row.id} open={row.state !== 'ok'} className="group rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/60 shadow-xl shadow-slate-950/20">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 md:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`border ${getRowStateStyles(row.state)}`}>{row.stateLabel}</Badge>
                      <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{row.complianceScore}% cobertura</Badge>
                      <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">{row.approvedCount} OK</Badge>
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-100">{row.pendingCount} Pend.</Badge>
                      <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-100">{row.rejectedCount + row.expiredCount} Críticos</Badge>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Empresa</p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-100">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                        <p className="mt-1 text-xs text-slate-400">{row.company?.rut || row.conductor.rut_proveedor || 'Sin RUT'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Conductor</p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-100">{getEntityLabel(row.conductor, 'Sin conductor')}</p>
                        <p className="mt-1 text-xs text-slate-400">{row.conductor.rut || 'Sin RUT'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Ejecutiva</p>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-100">{row.conductor.ejecutivo_nombre || row.company?.ejecutivo_nombre || 'Sin asignar'}</p>
                        <p className="mt-1 text-xs text-slate-400">Estado: {row.stateLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Al dia</p>
                        <p className={`mt-2 text-3xl font-bold ${getScoreTone(row.complianceScore)}`}>{row.complianceScore}%</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className={`h-full rounded-full bg-gradient-to-r ${getProgressTone(row.complianceScore)}`} style={{ width: `${row.complianceScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {row.latestDoc ? (
                      <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/70">Ultimo movimiento</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cyan-50">
                          <span className="font-semibold">{row.latestDoc.docType?.nombre || row.latestDoc.original_filename || row.latestDoc.file_name || 'Documento'}</span>
                          <span className="text-cyan-100/60">·</span>
                          <span>{formatPeriod(getDocDate(row.latestDoc))}</span>
                          <span className="text-cyan-100/60">·</span>
                          <span>{STATUS_STYLES[getDocStatus(row.latestDoc)]?.label || 'Sin'}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="hidden shrink-0 items-start gap-2 text-right sm:flex">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-950/55 px-4 py-3 text-left">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Faltantes</p>
                      <p className="mt-1 text-2xl font-bold text-slate-100">{row.missingCount}</p>
                      <p className="text-xs text-slate-400">documentos sin cargar</p>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-slate-700/50 px-4 pb-4 md:px-5 md:pb-5">
                  <div className="grid gap-3">
                    {visibleGroupedColumns.map((group) => (
                      <section key={`${row.id}-${group.group}`} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{group.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{group.columns.length} requisitos</p>
                          </div>
                          <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">
                            {group.columns.filter((column) => row.cells.has(column.key)).length}/{group.columns.length}
                          </Badge>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {group.columns.map((column) => {
                            const doc = row.cells.get(column.key)
                            const docStatus = doc ? getDocStatus(doc) : 'missing'
                            const docTone = doc ? (STATUS_STYLES[docStatus] || STATUS_STYLES.missing).className : STATUS_STYLES.missing.className
                            return (
                              <div key={`${row.id}-${column.key}`} className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-3">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-100">{column.label}</p>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{column.group}</p>
                                  </div>
                                  <Badge className={`shrink-0 border ${docTone}`}>
                                    {doc ? (docStatus === 'approved' ? 'OK' : docStatus === 'pending' ? 'Pend' : docStatus === 'rejected' ? 'Rech' : docStatus === 'expired' ? 'Venc' : 'Sin') : 'Sin'}
                                  </Badge>
                                </div>
                                {renderStatusCell(doc, column.label)}
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <details className="rounded-2xl border border-slate-700/50 bg-slate-950/40">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-100">
              Ver tabla detallada
              <span className="ml-2 text-xs font-normal text-slate-400">
                Úsala solo cuando necesites revisar cada columna en crudo
              </span>
            </summary>
            <div
              ref={matrixScrollRef}
              onWheel={handleMatrixWheel}
              tabIndex={0}
              role="region"
              aria-label="Matriz de cumplimiento desplazable"
              className="overflow-x-auto overflow-y-hidden rounded-b-2xl border-t border-slate-700/50 bg-slate-950/40 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
            <table className="w-max min-w-full divide-y divide-slate-700/50">
              <thead className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur">
                <tr>
                  <th rowSpan={2} className="sticky left-0 z-40 w-48 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    RUT empresa
                  </th>
                  <th rowSpan={2} className="sticky left-48 z-40 w-44 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Empresa
                  </th>
                  <th rowSpan={2} className="sticky left-[23rem] z-40 w-44 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Conductor
                  </th>
                  <th rowSpan={2} className="sticky left-[34rem] z-40 w-40 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Ejecutiva
                  </th>
                  <th rowSpan={2} className="sticky left-[44rem] z-40 w-52 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Al dia
                  </th>
                  <th rowSpan={2} className="sticky left-[56rem] z-40 w-28 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Estado
                  </th>
                  {visibleGroupedColumns.map((group) => (
                    <th
                      key={group.group}
                      colSpan={group.columns.length}
                      className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300"
                    >
                      {group.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {visibleGroupedColumns.flatMap((group) =>
                    group.columns.map((column) => (
                      <th
                        key={column.key}
                        className="min-w-[112px] px-2 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400"
                      >
                        <div className="space-y-1">
                          <p className="text-slate-200">{column.label}</p>
                          <p className="text-[10px] leading-3 text-slate-500">{column.group}</p>
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-900/35">
                {focusedRows.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-800/45">
                    <td className="sticky left-0 z-20 w-48 bg-slate-900/95 px-4 py-3 align-top">
                      <p className="font-semibold text-slate-100">{row.company?.rut || row.conductor.rut_proveedor || 'Sin RUT'}</p>
                      <p className="mt-1 text-xs text-slate-400">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                    </td>
                    <td className="sticky left-48 z-20 w-44 bg-slate-900/95 px-4 py-3 align-top">
                      <p className="font-semibold text-slate-100">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                      <p className="mt-1 text-xs text-slate-400">{row.company?.rut || 'Sin RUT'}</p>
                    </td>
                    <td className="sticky left-[23rem] z-20 w-44 bg-slate-900/95 px-4 py-3 align-top">
                      <p className="font-semibold text-slate-100">{getEntityLabel(row.conductor, 'Sin conductor')}</p>
                      <p className="mt-1 text-xs text-slate-400">{row.conductor.rut || 'Sin RUT'}</p>
                    </td>
                    <td className="sticky left-[34rem] z-20 w-40 bg-slate-900/95 px-4 py-3 align-top">
                      <p className="font-semibold text-slate-100">{row.conductor.ejecutivo_nombre || row.company?.ejecutivo_nombre || 'Sin asignar'}</p>
                      <p className="mt-1 text-xs text-slate-400">{row.stateLabel}</p>
                    </td>
                    <td className="sticky left-[44rem] z-20 w-52 bg-slate-900/95 px-4 py-3 align-top">
                      <div className="space-y-2">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className={`text-2xl font-bold ${getScoreTone(row.complianceScore)}`}>{row.complianceScore}%</p>
                            <p className="text-xs text-slate-400">cobertura documental</p>
                          </div>
                          <div className="text-right text-[11px] text-slate-400">
                            <div>{row.approvedCount} OK</div>
                            <div>{row.pendingCount} Pend.</div>
                            <div>{row.missingCount} Sin</div>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className={`h-full rounded-full bg-gradient-to-r ${getProgressTone(row.complianceScore)}`} style={{ width: `${row.complianceScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="sticky left-[56rem] z-20 w-28 bg-slate-900/95 px-4 py-3 align-top">
                      <div className="space-y-2">
                        <Badge className={`border ${getRowStateStyles(row.state)}`}>{row.stateLabel}</Badge>
                        <p className="text-xs text-slate-400">{row.rejectedCount + row.expiredCount} críticos</p>
                      </div>
                    </td>
                    {groupedColumns.flatMap((group) =>
                      group.columns.map((column) => {
                        const doc = row.cells.get(column.key)
                        return (
                          <td key={`${row.id}-${column.key}`} className="min-w-[112px] px-1 py-2 align-top">
                            {renderStatusCell(doc, column.label)}
                          </td>
                        )
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </details>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em]">Al dia media</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-100">{summary.averageScore}%</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em]">Filas estables</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-300">{statusCounts.ok}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em]">Filas en atención</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-amber-300">{statusCounts.attention}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <TriangleAlert className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em]">Filas en riesgo</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-rose-300">{statusCounts.risk}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            Leyenda
          </span>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200">1 = aprobado</Badge>
          <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-200">0 = pendiente, rechazado, vencido o sin cargar</Badge>
          <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">Periodo visible solo en aprobados</Badge>
          <span className="text-slate-500">Filtro activo: {statusFilter === 'ALL' ? 'todos los estados' : getRowStateLabel(statusFilter as RowState)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
