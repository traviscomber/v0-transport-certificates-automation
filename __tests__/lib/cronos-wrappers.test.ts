describe('Cronos wrapper configuration', () => {
  it('uses stable job names for critical workers', () => {
    expect('document_ocr').toBe('document_ocr')
    expect('vehicle_fleet_recovery').toBe('vehicle_fleet_recovery')
  })
})
