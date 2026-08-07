describe('Cronos wrapper configuration', () => {
  it('uses stable job names for critical workers', () => {
    const jobNames = [
      'document_ocr',
      'vehicle_fleet_recovery',
      'document_text_extract',
      'compliance_events',
      'prt_inspect',
      'prt_profile',
      'prt_import',
      'prt_import_stream',
      'prt_discovery',
      'compliance_intelligence',
    ]

    expect(new Set(jobNames).size).toBe(jobNames.length)
    expect(jobNames).toContain('prt_discovery')
    expect(jobNames).toContain('compliance_intelligence')
  })
})
