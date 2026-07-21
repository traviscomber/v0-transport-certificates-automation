export interface DocumentPeriodFields {
  document_period_month?: number | string | null
  document_period_year?: number | string | null
  document_period_start?: string | null
  uploaded_at?: string | null
  created_at?: string | null
  reviewed_at?: string | null
  validated_at?: string | null
  approved_at?: string | null
  updated_at?: string | null
  submissionDate?: string | null
}

const MONTH_MIN = 1
const MONTH_MAX = 12
const YEAR_MIN = 2020
const YEAR_MAX = 2100

function toInt(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeDocumentPeriod(month: number | string | null | undefined, year: number | string | null | undefined) {
  const periodMonth = toInt(month)
  const periodYear = toInt(year)

  if (
    periodMonth === null ||
    periodYear === null ||
    periodMonth < MONTH_MIN ||
    periodMonth > MONTH_MAX ||
    periodYear < YEAR_MIN ||
    periodYear > YEAR_MAX
  ) {
    return null
  }

  return {
    document_period_month: periodMonth,
    document_period_year: periodYear,
    document_period_start: `${periodYear}-${String(periodMonth).padStart(2, '0')}-01`,
  }
}

export function getDefaultDocumentPeriod(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

export function getDocumentPeriodDate(doc: DocumentPeriodFields) {
  if (doc.document_period_start) return toLocalNoonDate(doc.document_period_start)

  const normalized = normalizeDocumentPeriod(doc.document_period_month, doc.document_period_year)
  if (normalized) return toLocalNoonDate(normalized.document_period_start)

  return doc.uploaded_at || doc.created_at || doc.submissionDate || ''
}

export function getDocumentWorkflowDate(doc: DocumentPeriodFields) {
  return doc.reviewed_at || doc.validated_at || doc.approved_at || doc.updated_at || doc.uploaded_at || doc.created_at || doc.submissionDate || ''
}

export function getDocumentPeriodLabel(doc: DocumentPeriodFields) {
  const dateValue = getDocumentPeriodDate(doc)
  if (!dateValue) return 'Sin periodo'
  const normalized = dateValue.endsWith('Z') || /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : `${dateValue}Z`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return 'Sin periodo'
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

export function getDocumentPeriodShortLabel(doc: DocumentPeriodFields) {
  const dateValue = getDocumentPeriodDate(doc)
  if (!dateValue) return 'Sin'
  const normalized = dateValue.endsWith('Z') || /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : `${dateValue}Z`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return 'Sin'
  return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
}

function toLocalNoonDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  return `${match[1]}-${match[2]}-${match[3]}T12:00:00`
}
