import {
  classifyIntelligenceQuery,
  extractCompanyQuery,
  normalizeCompanySearchTerm,
  summarizeObservedCompanyCompliance,
} from '@/lib/intelligence-core'

describe('ChileFlota Intelligence Core v1', () => {
  test('keeps exact/company-like search on fast path', () => {
    const route = classifyIntelligenceQuery('76.123.456-7')
    expect(route).toMatchObject({ mode: 'fast_path', intent: 'entity_search' })
    expect(extractCompanyQuery(route)).toBe('76.123.456-7')
  })

  test('routes and extracts company from document questions', () => {
    const route = classifyIntelligenceQuery('documentos rechazados de Transportes Norte')
    expect(route).toMatchObject({ mode: 'operational_agent', intent: 'company_documents' })
    expect(extractCompanyQuery(route)).toBe('Transportes Norte')
  })

  test('routes and extracts company from compliance questions', () => {
    const route = classifyIntelligenceQuery('cumplimiento de Transportes Norte')
    expect(route).toMatchObject({ mode: 'operational_agent', intent: 'company_compliance' })
    expect(extractCompanyQuery(route)).toBe('Transportes Norte')
  })

  test('fails closed when operational entity cannot be safely extracted', () => {
    const route = classifyIntelligenceQuery('documentos pendientes')
    expect(route.intent).toBe('company_documents')
    expect(extractCompanyQuery(route)).toBeNull()
  })

  test('does not pretend unsupported conversational requests are implemented', () => {
    expect(classifyIntelligenceQuery('quien debe renovar mañana')).toMatchObject({
      mode: 'operational_agent',
      intent: 'unsupported',
    })
  })

  test('sanitizes wildcard characters from company search', () => {
    expect(normalizeCompanySearchTerm('  Transportes%_Norte  ')).toBe('TransportesNorte')
  })

  test('excludes stale legacy evidence from compliance summary', () => {
    const result = summarizeObservedCompanyCompliance([
      { id: 'legacy', status: 'rejected', is_current: false },
      { id: 'current', status: 'approved', is_current: true },
    ])
    expect(result.counts).toEqual({ total: 1, approved: 1, pending: 0, rejected: 0, other: 0 })
    expect(result.status).toBe('no_observed_blocker')
  })

  test('flags rejected current evidence without claiming clearance', () => {
    const result = summarizeObservedCompanyCompliance([
      { id: '1', status: 'approved', is_current: true },
      { id: '2', status: 'rejected', is_current: true },
    ])
    expect(result.status).toBe('attention_required')
    expect(result.coverageCertified).toBe(false)
    expect(result.canClaimOperationalClearance).toBe(false)
  })

  test('all approved still cannot be called APTO without certified coverage', () => {
    const result = summarizeObservedCompanyCompliance([
      { id: '1', status: 'approved', is_current: true },
      { id: '2', status: 'approved', is_current: true },
    ])
    expect(result.status).toBe('no_observed_blocker')
    expect(result.coverageCertified).toBe(false)
    expect(result.canClaimOperationalClearance).toBe(false)
  })
})
