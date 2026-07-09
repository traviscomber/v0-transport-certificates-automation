'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

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

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  approved: { label: 'OK', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' },
  pending: { label: 'Pend', className: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
  rejected: { label: 'Rech', className: 'bg-rose-500/15 text-rose-200 border-rose-500/30' },
  expired: { label: 'Venc', className: 'bg-orange-500/15 text-orange-200 border-orange-500/30' },
  missing: { label: 'Sin', className: 'bg-rose-500/15 text-rose-200 border-rose-500/30' },
}

type MatrixColumn = {
  key: string
  group: 'Mensual' | 'Empresa' | 'Conductor' | 'Vehiculo' | 'Subcontratacion' | 'Seguridad'
  label: string
  codes: string[]
  hints?: string[]
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
        label: group === 'Vehiculo' ? 'Vehiculo' : group === 'Subcontratacion' ? 'Subcontratacion' : group,
        columns: MATRIX_COLUMNS.filter((column) => column.group === group),
      }))
      .filter((group) => group.columns.length > 0)
  }, [])

  const [activeLetter, setActiveLetter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const rows = useMemo(() => {
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
      }
    })
  }, [approved.conductorDocs, approved.subDocs, conductors, pending.conductorDocs, pending.subDocs, rejected.conductorDocs, rejected.subDocs, transportistasByRut])

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeAlphabetText(searchTerm)
    const matchesSearch = (row: { conductor: Entity; company?: Entity }) => {
      if (!normalizedSearch) return true
      return getRowSearchText(row).includes(normalizedSearch)
    }

    return rows.filter((row) => {
      const matchesLetter = activeLetter === 'ALL' || getRowAlphabetLetter(row.conductor, transportistasByRut) === activeLetter
      return matchesLetter && matchesSearch(row)
    })
  }, [activeLetter, rows, searchTerm, transportistasByRut])

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

  const summary = useMemo(() => {
    const totalCells = filteredRows.reduce((acc, row) => acc + row.totalRelevant, 0)
    const approvedCells = filteredRows.reduce((acc, row) => acc + row.approvedCount, 0)
    const pendingCells = filteredRows.reduce((acc, row) => acc + row.pendingCount, 0)
    const rejectedCells = filteredRows.reduce((acc, row) => acc + row.rejectedCount, 0)
    const missingCells = filteredRows.reduce((acc, row) => acc + row.missingCount, 0)
    const coverage = totalCells > 0 ? Math.round((approvedCells / totalCells) * 100) : 0

    return { totalCells, approvedCells, pendingCells, rejectedCells, missingCells, coverage }
  }, [filteredRows])

  const renderStatusCell = (doc?: MatrixDocument, requirementName?: string) => {
    if (!doc) {
      const style = STATUS_STYLES.missing
      return (
        <div className={`flex h-full min-h-[64px] flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-center ${style.className}`}>
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
        className={`flex h-full min-h-[64px] flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-center ${style.className}`}
      >
        <span className="text-sm font-bold leading-none">{value}</span>
        <span className="max-w-full truncate text-[10px] uppercase tracking-[0.16em] leading-none">{detail}</span>
      </div>
    )
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-blue-400" />
          Matriz de cumplimiento
        </CardTitle>
        <CardDescription>
          Vista tipo Excel con una fila por conductor y su empresa. Si una empresa tiene varios conductores, se repite la fila como en la matriz manual. Las celdas usan 1/0 y muestran el periodo debajo del valor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filas</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aprobados</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{summary.approvedCells}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-amber-300">{summary.pendingCells}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rechazados</p>
            <p className="mt-2 text-2xl font-bold text-rose-300">{summary.rejectedCells}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cobertura</p>
            <p className="mt-2 text-2xl font-bold text-slate-200">{summary.coverage}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">Leyenda</span>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200">1 = aprobado</Badge>
          <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-200">0 = pendiente, rechazado, vencido o sin cargar</Badge>
          <span className="text-slate-500">El periodo se muestra debajo del valor aprobado.</span>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400" htmlFor="compliance-search">
              Buscar
            </label>
            <input
              id="compliance-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="RUT, empresa, conductor o ejecutiva"
              className="min-w-[240px] flex-1 rounded-md border border-slate-700/70 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="rounded-md border border-slate-700/70 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Limpiar búsqueda
              </button>
            ) : null}
          </div>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
            <span className="sticky left-0 z-10 mr-1 shrink-0 bg-slate-950/50 pr-2 font-semibold uppercase tracking-[0.18em] text-slate-400">Filtro alfabético</span>
            <button
              type="button"
              onClick={() => setActiveLetter('ALL')}
              className={`h-9 shrink-0 rounded-md border px-3 text-sm font-medium transition ${
                activeLetter === 'ALL'
                  ? 'border-blue-400 bg-blue-500/15 text-blue-200'
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
                  className={`flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-blue-400 bg-blue-500/15 text-blue-200'
                      : isAvailable
                        ? 'border-slate-700/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                        : 'cursor-not-allowed border-slate-800/50 text-slate-600 opacity-40'
                  }`}
                >
                  <span>{label}</span>
                  <span className="rounded-full bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-300">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              {activeLetter === 'ALL'
                ? `Mostrando ${filteredRows.length} filas`
                : `Mostrando ${filteredRows.length} filas para ${activeLetter}`}
            </span>
            <button
              type="button"
              onClick={() => setActiveLetter('ALL')}
              className="rounded-md border border-slate-700/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
        {loading ? (
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 text-sm text-slate-400">
            Cargando matriz documental...
          </div>
        ) : filteredRows.length === 0 || groupedColumns.length === 0 ? (
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 text-sm text-slate-400">
            No hay datos suficientes para mostrar la matriz documental con ese filtro.
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto overflow-y-hidden rounded-xl border border-slate-700/50">
            <table className="w-max min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-950/80">
                <tr>
                  <th rowSpan={2} className="sticky left-0 z-20 w-48 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    RUT empresa
                  </th>
                  <th rowSpan={2} className="sticky left-48 z-20 w-44 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Empresa
                  </th>
                  <th rowSpan={2} className="sticky left-[23rem] z-20 w-44 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Conductor
                  </th>
                  <th rowSpan={2} className="sticky left-[34rem] z-20 w-40 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Ejecutiva
                  </th>
                  <th rowSpan={2} className="sticky left-[44rem] z-20 w-24 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Cobertura
                  </th>
                  <th rowSpan={2} className="sticky left-[50rem] z-20 w-24 bg-slate-950/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
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
                        className="min-w-[110px] px-2 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400"
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
              <tbody className="divide-y divide-slate-700/50 bg-slate-900/40">
                {filteredRows.map((row) => {
                  const state = row.rejectedCount > 0 || row.expiredCount > 0
                    ? 'Riesgo'
                    : row.pendingCount > 0 || row.missingCount > 0
                      ? 'Atencion'
                      : 'OK'
                  const stateClass =
                    state === 'OK'
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                      : state === 'Atencion'
                        ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-200 border-rose-500/30'

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/50">
                      <td className="sticky left-0 z-10 w-48 bg-slate-900/95 px-4 py-3 align-top">
                        <p className="font-medium text-slate-100">{row.company?.rut || row.conductor.rut_proveedor || 'Sin RUT'}</p>
                        <p className="text-xs text-slate-400">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                      </td>
                      <td className="sticky left-48 z-10 w-44 bg-slate-900/95 px-4 py-3 align-top">
                        <p className="font-medium text-slate-100">{getRowCompanyLabel(row.conductor, transportistasByRut)}</p>
                        <p className="text-xs text-slate-400">{row.company?.rut || 'Sin RUT'}</p>
                      </td>
                      <td className="sticky left-[23rem] z-10 w-44 bg-slate-900/95 px-4 py-3 align-top">
                        <p className="font-medium text-slate-100">{getEntityLabel(row.conductor, 'Sin conductor')}</p>
                        <p className="text-xs text-slate-400">{row.conductor.rut || 'Sin RUT'}</p>
                      </td>
                      <td className="sticky left-[34rem] z-10 w-40 bg-slate-900/95 px-4 py-3 align-top">
                        <p className="font-medium text-slate-100">{row.conductor.ejecutivo_nombre || row.company?.ejecutivo_nombre || 'Sin asignar'}</p>
                      </td>
                      <td className="sticky left-[44rem] z-10 w-24 bg-slate-900/95 px-4 py-3 align-top">
                        <p className="text-lg font-semibold text-slate-100">{row.complianceScore}%</p>
                      </td>
                      <td className="sticky left-[50rem] z-10 w-24 bg-slate-900/95 px-4 py-3 align-top">
                        <Badge className={stateClass}>{state}</Badge>
                      </td>
                      {groupedColumns.flatMap((group) =>
                        group.columns.map((column) => {
                          const doc = row.cells.get(column.key)
                          return (
                            <td key={`${row.id}-${column.key}`} className="min-w-[110px] px-1 py-2 align-top">
                              {renderStatusCell(doc, column.label)}
                            </td>
                          )
                        })
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
