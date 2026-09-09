export type IntelligenceMode = 'fast_path' | 'operational_agent'

export type IntelligenceIntent =
  | 'entity_search'
  | 'company_documents'
  | 'company_compliance'
  | 'driver_documents'
  | 'driver_status'
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
  counts: { total: number; approved: number; pending: number; rejected: number; other: number }
  coverageCertified: false
  canClaimOperationalClearance: false
  unknowns: string[]
}

const DOCUMENT_TERMS = [
  'documento', 'documentos', 'rechazado', 'rechazados', 'pendiente', 'pendientes', 'aprobado', 'aprobados',
]

const COMPLIANCE_TERMS = [
  'compliance', 'cumplimiento', 'cumple', 'cumplir', 'operar', 'operativo', 'operativa', 'bloqueado', 'bloqueada', 'riesgo',
]

const DRIVER_TERMS = ['conductor', 'conductora', 'chofer', 'licencia']
const DRIVER_STATUS_TERMS = ['puede trabajar', 'puede operar', 'estado', 'bloqueado', 'bloqueada', 'riesgo', 'le falta', 'falta']

const QUESTION_PREFIXES = [
  'que ', 'qué ', 'cual ', 'cuál ', 'como ', 'cómo ', 'por que ', 'por qué ', 'quien ', 'quién ', 'muestrame ', 'muéstrame ', 'dime ',
]

export function normalizeIntelligenceQuery(rawQuery: string): string {
  return rawQuery.trim().replace(/\s+/g, ' ').slice(0, 160)
}

export function normalizeCompanySearchTerm(rawQuery: string): string {
  return normalizeIntelligenceQuery(rawQuery).replace(/[%_]/g, '').trim()
}

export function normalizeDriverSearchTerm(rawQuery: string): string {
  return normalizeIntelligenceQuery(rawQuery).replace(/[%_,()]/g, '').trim()
}

function containsAny(query: string, terms: string[]): boolean {
  return terms.some((term) => query.includes(term))
}

export function classifyIntelligenceQuery(rawQuery: string): IntelligenceRoute {
  const normalizedQuery = normalizeIntelligenceQuery(rawQuery)
  const lower = normalizedQuery.toLowerCase()

  if (!normalizedQuery) return { mode: 'fast_path', intent: 'unsupported', normalizedQuery }

  const driverQuery = containsAny(lower, DRIVER_TERMS)
  if (driverQuery && containsAny(lower, DRIVER_STATUS_TERMS)) {
    return { mode: 'operational_agent', intent: 'driver_status', normalizedQuery }
  }
  if (driverQuery && (containsAny(lower, DOCUMENT_TERMS) || lower.includes('licencia'))) {
    return { mode: 'operational_agent', intent: 'driver_documents', normalizedQuery }
  }
  if (containsAny(lower, COMPLIANCE_TERMS)) {
    return { mode: 'operational_agent', intent: 'company_compliance', normalizedQuery }
  }
  if (containsAny(lower, DOCUMENT_TERMS)) {
    return { mode: 'operational_agent', intent: 'company_documents', normalizedQuery }
  }
  if (QUESTION_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return { mode: 'operational_agent', intent: 'unsupported', normalizedQuery }
  }
  return { mode: 'fast_path', intent: 'entity_search', normalizedQuery }
}

export function extractCompanyQuery(route: IntelligenceRoute): string | null {
  const query = route.normalizedQuery
  if (route.intent === 'entity_search') return normalizeCompanySearchTerm(query) || null

  const patterns = route.intent === 'company_documents'
    ? [
        /^(?:que|qué|muestrame|muéstrame|dime)?\s*(?:documentos?|rechazados?|pendientes?|aprobados?)(?:\s+(?:rechazados?|pendientes?|aprobados?))*\s+(?:de|del|para)\s+(.+)$/i,
      ]
    : route.intent === 'company_compliance'
      ? [
          /^(?:que|qué|dime)?\s*(?:compliance|cumplimiento|estado\s+de\s+cumplimiento|riesgo)(?:\s+(?:de|del|para))?\s+(.+)$/i,
          /^(?:puede|puede\s+la\s+empresa)\s+(?:operar|trabajar)\s+(.+)$/i,
        ]
      : []

  for (const pattern of patterns) {
    const match = query.match(pattern)
    const candidate = normalizeCompanySearchTerm(match?.[1] || '')
    if (candidate.length >= 2) return candidate
  }
  return null
}

export function extractDriverQuery(route: IntelligenceRoute): string | null {
  if (route.intent !== 'driver_documents' && route.intent !== 'driver_status') return null

  const query = route.normalizedQuery
  const patterns = [
    /^(?:que|qué|muestrame|muéstrame|dime)?\s*(?:documentos?|licencia)(?:\s+(?:del|de la|de))?\s+(?:conductor|conductora|chofer)\s+(.+)$/i,
    /^(?:puede\s+(?:trabajar|operar)|estado\s+de|qué\s+le\s+falta|que\s+le\s+falta|riesgo\s+de)\s+(?:(?:al|a\s+la|a\s+el|el|la)\s+)?(?:conductor|conductora|chofer)\s+(.+)$/i,
    /^(?:conductor|conductora|chofer)\s+(.+?)(?:\s+puede\s+(?:trabajar|operar))?$/i,
  ]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    const candidate = normalizeDriverSearchTerm(match?.[1] || '')
    if (candidate.length >= 2) return candidate
  }
  return null
}

export function summarizeObservedCompanyCompliance(documents: CompanyEvidenceDocument[]): ObservedCompanyCompliance {
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
