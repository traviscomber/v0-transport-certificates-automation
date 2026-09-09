import {
  classifyIntelligenceQuery,
  normalizeCompanySearchTerm,
  summarizeObservedCompanyCompliance,
} from '@/lib/intelligence-core'

describe('ChileFlota Intelligence Core v1', () => {
  test('keeps exact/company-like search on fast path', () => {
    expect(classifyIntelligenceQuery('76.123.456-7')).toMatchObject({
      mode: 'fast_path',
      intent: 'entity_search',
    })
  })

  test('routes document questions to operational agent', () => {
    expect(classifyIntelligenceQuery('documentos rechazados de Transportes Norte')).toMatchObject({
      mode: 'operational_agent',
      intent: 'company_documents',
    })
  })

  test('routes compliance questions to operational agent', () => {
    expect(classifyIntelligenceQuery('cumplimiento de Transportes Norte')).toMatchObject({
      mode: 'operational_agent',
      intent: 'company_compliance',
    })
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
