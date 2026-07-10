'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Filter,
  FileText,
  Search,
  Shield,
  Sparkles,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  if (state === 'attention') return 'Atención'
  return 'Riesgo'
}

function getRowStateStyles(state: RowState) {
  if (state === 'ok') return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
  if (state === 'attention') return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
  return 'bg-rose-500/15 text-rose-200 border-rose-500/30'
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

    const sortedConductors = [...conductors].sort((a, b) => {
      const companyA = getRowCompanyLabel(a, transportistasByRut)
      const companyB = getRowCompanyLabel(b, transportistasByRut)
      if (companyA !== companyB) return companyA.localeCompare(companyB)
      return getEntityLabel(a).localeCompare(getEntityLabel(b))
    })

    return sortedConductors.map((conductor) => {
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
      }
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
      return matchesLetter && matchesState && matchesSearch(row)
    })
  }, [activeLetter, normalizedSearch, rows, statusFilter, transportistasByRut])

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

  const topRisks = useMemo(() => {
    return [...filteredRows]
      .sort((a, b) => a.complianceScore - b.complianceScore || b.pendingCount + b.rejectedCount + b.missingCount - (a.pendingCount + a.rejectedCount + a.missingCount))
      .slice(0, 3)
  }, [filteredRows])

  const hasActiveFilters = Boolean(searchTerm || activeLetter !== 'ALL' || statusFilter !== 'ALL')

  const clearFilters = () => {
    setSearchTerm('')
    setActiveLetter('ALL')
    setStatusFilter('ALL')
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
              Matriz ejecutiva
            </div>
            <div className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-2xl md:text-3xl">
                <Shield className="h-6 w-6 text-cyan-400" />
                Matriz de cumplimiento super pro
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm md:text-base text-slate-300">
                Vista tipo Excel con foco ejecutivo: búsqueda global, filtro por letra, filtro por estado y lectura rápida de riesgo por fila.
                Los documentos se consolidan desde la base real para que la matriz refleje el estado operativo actual.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{rows.length} filas</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{requirements.length} requisitos</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{documentTypes.length} tipos de documento</Badge>
              <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{summary.averageScore}% score medio</Badge>
            </div>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 xl:w-auto">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Cobertura</p>
              <p className="mt-2 text-3xl font-bold text-slate-100">{summary.coverage}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full bg-gradient-to-r ${getProgressTone(summary.coverage)}`} style={{ width: `${summary.coverage}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">En atención</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">{summary.rowsNeedingAttention}</p>
              <p className="mt-1 text-xs text-slate-400">filas con pendientes o faltantes</p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Riesgo</p>
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

        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="compliance-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por RUT, empresa, conductor o ejecutiva"
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/90 py-3 pl-9 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'Todos', count: rows.length, tone: 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800' },
                { key: 'ok', label: 'Estables', count: statusCounts.ok, tone: 'border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10' },
                { key: 'attention', label: 'Atención', count: statusCounts.attention, tone: 'border-amber-500/30 text-amber-200 hover:bg-amber-500/10' },
                { key: 'risk', label: 'Riesgo', count: statusCounts.risk, tone: 'border-rose-500/30 text-rose-200 hover:bg-rose-500/10' },
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
            </div>

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

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Filtrar por letra
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
                  <div className="max-w-[160px] text-right text-xs text-slate-400">
                    <div>{row.pendingCount} pendientes</div>
                    <div>{row.rejectedCount} rechazados</div>
                    <div>{row.missingCount} faltantes</div>
                  </div>
                </div>
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
            <Badge className="border-slate-700/60 bg-slate-900/70 text-slate-200">{summary.averageScore}% score medio</Badge>
          </div>
          <span className="text-slate-500">Las celdas muestran el periodo bajo el valor cuando existe aprobación.</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
            Cargando matriz documental...
          </div>
        ) : filteredRows.length === 0 || groupedColumns.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
            No hay datos suficientes para mostrar la matriz documental con ese filtro.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-950/40">
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
                    Cobertura
                  </th>
                  <th rowSpan={2} className="sticky left-[56rem] z-40 w-28 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Estado
                  </th>
                  {groupedColumns.map((group) => (
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
                  {groupedColumns.flatMap((group) =>
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
                {filteredRows.map((row) => (
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
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.2em]">Cobertura media</span>
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
