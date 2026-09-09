export type IntelligenceMode = 'fast_path' | 'operational_agent'

export type IntelligenceIntent =
  | 'entity_search'
  | 'company_documents'
  | 'company_compliance'
  | 'unsupported'

export type IntelligenceRoute = {
  mode: IntelligenceMode
  intent: IntelligenceIntent
  normalizedQuery: string
}

export type CompanyEvidenceDocument = {
  id: string
  status?: string | null
  is_current?: boolean | null
  uploaded_at?: string | null
  reviewed_at?: string | null
}

export type ObservedCompanyCompliance = {
  scope: 'observed_current_documents'
  status: 'attention_required' | 'review_pending' | 'no_observed_blocker' | 'no_evidence'
  counts: {
    total: number
    approved: number
    pending: number
    rejected: number
    other: number
  }
  coverageCertified: false
  canClaimOperationalClearance: false
  unknowns: string[]
}

const DOCUMENT_TERMS = [
  'documento',
  'documentos',
  'rechazado',
  'rechazados',
  'pendiente',
  'pendientes',
  'aprobado',
  'aprobados',
]

const COMPLIANCE_TERMS = [
  'compliance',
  'cumplimiento',
  'cumple',
  'cumplir',
  'operar',
  'operativo',
  'operativa',
  'bloqueado',
  'bloqueada',
  'riesgo',
]

const QUESTION_PREFIXES = [
  'que ',
  'qué ',
  'cual ',
  'cuál ',
  'como ',
  'cómo ',
  'por que ',
  'por qué ',
  'quien ',
  'quién ',
  'muestrame ',
  'muéstrame ',
  'dime ',
]

export function normalizeIntelligenceQuery(rawQuery: string): string {
  return rawQuery.trim().replace(/\s+/g, ' ').slice(0, 160)
}

export function normalizeCompanySearchTerm(rawQuery: string): string {
  return normalizeIntelligenceQuery(rawQuery).replace(/[%_]/g, '').trim()
}

function containsAny(query: string, terms: string[]): boolean {
  return terms.some((term) => query.includes(term))
}

export function classifyIntelligenceQuery(rawQuery: string): IntelligenceRoute {
  const normalizedQuery = normalizeIntelligenceQuery(rawQuery)
  const lower = normalizedQuery.toLowerCase()

  if (!normalizedQuery) {
    return { mode: 'fast_path', intent: 'unsupported', normalizedQuery }
  }

  if (containsAny(lower, COMPLIANCE_TERMS)) {
    return { mode: 'operational_agent', intent: 'company_compliance', normalizedQuery }
  }

  if (containsAny(lower, DOCUMENT_TERMS)) {
    return { mode: 'operational_agent', intent: 'company_documents', normalizedQuery }
  }

  const looksConversational = QUESTION_PREFIXES.some((prefix) => lower.startsWith(prefix))
  if (looksConversational) {
    return { mode: 'operational_agent', intent: 'unsupported', normalizedQuery }
  }

  return { mode: 'fast_path', intent: 'entity_search', normalizedQuery }
}

export function summarizeObservedCompanyCompliance(
  documents: CompanyEvidenceDocument[],
): ObservedCompanyCompliance {
  const current = documents.filter((document) => document.is_current !== false)

  const counts = current.reduce(
    (acc, document) => {
      const status = String(document.status || '').toLowerCase()
      acc.total += 1
      if (status === 'approved') acc.approved += 1
      else if (status === 'pending' || status === 'uploaded') acc.pending += 1
      else if (status === 'rejected') acc.rejected += 1
      else acc.other += 1
      return acc
    },
    { total: 0, approved: 0, pending: 0, rejected: 0, other: 0 },
  )

  let status: ObservedCompanyCompliance['status'] = 'no_observed_blocker'
  if (counts.total === 0) status = 'no_evidence'
  else if (counts.rejected > 0) status = 'attention_required'
  else if (counts.pending > 0) status = 'review_pending'

  return {
    scope: 'observed_current_documents',
    status,
    counts,
    coverageCertified: false,
    canClaimOperationalClearance: false,
    unknowns: [
      'La cobertura completa de requisitos no está certificada por esta señal.',
      'Este resumen no sustituye Operational Clearance ni autoriza a declarar APTO.',
    ],
  }
}
